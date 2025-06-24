import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import type {
  CreatePlayerRequest,
  CreateGameRequest,
  MakeChoiceRequest,
  AddComputerPlayerRequest,
  UpdatePlayerStatusRequest,
  GameListItem,
} from '../types/api';

// Query Keys
export const queryKeys = {
  players: ['players'] as const,
  player: (id: string) => ['players', id] as const,
  choices: ['choices'] as const,
  games: (params?: Record<string, unknown>) => ['games', params] as const,
  game: (id: string) => ['games', id] as const,
  gameResults: (id: string) => ['games', id, 'results'] as const,
  recentGameResults: (playerId?: string) => ['games', 'results', 'recent', playerId] as const,
};

// Player hooks
export const useCreatePlayer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: CreatePlayerRequest) => apiService.createPlayer(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.players });
    },
  });
};

export const usePlayers = () => {
  return useQuery({
    queryKey: queryKeys.players,
    queryFn: () => apiService.getPlayers(),
    staleTime: 30000, // 30 seconds
  });
};

export const usePlayer = (playerId: string) => {
  return useQuery({
    queryKey: queryKeys.player(playerId),
    queryFn: () => apiService.getPlayerById(playerId),
    enabled: !!playerId,
    staleTime: 60000, // 1 minute
  });
};

export const useUpdatePlayerStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ playerId, request }: { playerId: string; request: UpdatePlayerStatusRequest }) =>
      apiService.updatePlayerStatus(playerId, request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.player(variables.playerId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.players });
    },
  });
};

// Choice hooks
export const useChoices = () => {
  return useQuery({
    queryKey: queryKeys.choices,
    queryFn: () => apiService.getChoices(),
    staleTime: Infinity, // Choices rarely change
  });
};

export const useRandomChoice = () => {
  return useMutation({
    mutationFn: () => apiService.getRandomChoice(),
  });
};

// Game hooks
export const useGames = (params?: {
  status?: string;
  creatorId?: string;
  playerId?: string;
  hasAvailableSlots?: boolean;
}) => {
  return useQuery({
    queryKey: queryKeys.games(params),
    queryFn: () => apiService.getGames(params),
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchInterval: 30000, // Refetch every 30 seconds (reduced from 10 seconds since we have SignalR)
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnReconnect: true, // Refetch when network reconnects
    retry: (failureCount, error) => {
      // Don't retry on specific errors that won't resolve
      if (error instanceof Error && error.message.includes('Unable to connect to server')) {
        return failureCount < 3;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
};

export const useGame = (gameId: string, options: { enabled?: boolean } = {}) => {
  const { enabled = true } = options;
  return useQuery({
    queryKey: queryKeys.game(gameId),
    queryFn: () => apiService.getGame(gameId),
    enabled: !!gameId && enabled,
    staleTime: 5000, // 5 seconds
    // Only refetch if the game is active and the query is enabled
    refetchInterval: (query) => (enabled && query.state.data?.status === 'InProgress' ? 10000 : false),
  });
};

export const useCreateGame = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ playerId, request }: { playerId: string; request: CreateGameRequest }) =>
      apiService.createGame(playerId, request),
    onMutate: async ({ playerId, request }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: queryKeys.games() });
      
      // Snapshot the previous value
      const previousGames = queryClient.getQueryData(queryKeys.games());
        // Optimistically update to the new value
      const currentPlayer = queryClient.getQueryData(queryKeys.player(playerId)) as { username?: string } | undefined;      const optimisticGame = {
        id: `temp-${Date.now()}`, // Temporary ID
        name: request.name,
        creatorName: currentPlayer?.username || 'You',
        creatorId: playerId,
        status: 'Waiting',
        playerCount: 1,
        maxPlayers: request.maxPlayers,
        createdAt: new Date().toISOString(),
        hasAvailableSlots: true,
      };
        queryClient.setQueryData(queryKeys.games(), (old: GameListItem[] | undefined) => 
        old ? [optimisticGame, ...old] : [optimisticGame]
      );
      
      // Return a context object with the snapshotted value
      return { previousGames, optimisticGame };
    },    onError: (_, __, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousGames) {
        queryClient.setQueryData(queryKeys.games(), context.previousGames);
      }
    },
    onSuccess: (data, _, context) => {      // Replace the optimistic update with the real data
      queryClient.setQueryData(queryKeys.games(), (old: GameListItem[] | undefined) => {
        if (!old || !context?.optimisticGame) return old;
          // Replace the optimistic game with the real one
        return old.map((game: GameListItem) => 
          game.id === context.optimisticGame.id ? {
            id: data.id,
            name: data.name,
            creatorName: context.optimisticGame.creatorName,
            creatorId: context.optimisticGame.creatorId,
            status: data.status,
            playerCount: 1,
            maxPlayers: data.maxPlayers,
            createdAt: data.createdAt,
            hasAvailableSlots: true,
          } : game
        );
      });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: queryKeys.games() });
    },
  });
};

export const useJoinGame = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ gameId, playerId }: { gameId: string; playerId: string }) =>
      apiService.joinGame(gameId, playerId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.game(variables.gameId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.games() });
    },
  });
};

export const useStartGame = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (gameId: string) => apiService.startGame(gameId),
    onSuccess: (_, gameId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.game(gameId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.games() });
    },
  });
};

export const useMakeChoice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ gameId, playerId, request }: { 
      gameId: string; 
      playerId: string; 
      request: MakeChoiceRequest;
    }) => apiService.makeChoice(gameId, playerId, request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.game(variables.gameId) });
    },
  });
};

export const useAddComputerPlayer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ gameId, request }: { gameId: string; request: AddComputerPlayerRequest }) =>
      apiService.addComputerPlayer(gameId, request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.game(variables.gameId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.games() });
    },
  });
};

export const useCancelGame = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (gameId: string) => apiService.cancelGame(gameId),
    onSuccess: (_, gameId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.game(gameId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.games() });
    },
  });
};

export const useGameResults = (gameId: string) => {
  return useQuery({
    queryKey: queryKeys.gameResults(gameId),
    queryFn: () => apiService.getGameResults(gameId),
    enabled: !!gameId,
    staleTime: 30000, // 30 seconds
  });
};

export const useRecentGameResults = (limit: number = 10, playerId?: string) => {
  return useQuery({
    queryKey: queryKeys.recentGameResults(playerId),
    queryFn: () => apiService.getRecentGameResults(limit, playerId),
    staleTime: 60000, // 1 minute
    retry: (failureCount, error) => {
      // More lenient retry for game results since they're not critical
      if (error instanceof Error && error.message.includes('Unable to connect to server')) {
        return failureCount < 2;
      }
      return failureCount < 2;
    },
    retryDelay: 2000, // 2 second delay between retries
  });
};
