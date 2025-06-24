import { useEffect, useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { signalRService } from '../services/signalr';
import type { SignalREventHandlers } from '../services/signalr';
import { queryKeys } from './useApi';
import { useAppContext } from '../contexts/AppContext';

export const useSignalR = (gameId?: string, customHandlers?: Partial<SignalREventHandlers>) => {
  const queryClient = useQueryClient();
  const { state } = useAppContext();
  const invalidateGameQueries = useCallback(() => {
    console.log('🔄 Invalidating game queries...');
    
    // Invalidate all games queries regardless of parameters
    queryClient.invalidateQueries({ 
      queryKey: ['games'],
      exact: false // This will invalidate all queries that start with ['games']
    });
    
    // Also force refetch immediately
    queryClient.refetchQueries({ 
      queryKey: ['games'],
      exact: false
    });
    
    if (gameId) {
      queryClient.invalidateQueries({ queryKey: queryKeys.game(gameId) });
    }
  }, [queryClient, gameId]);

  const defaultHandlers = useMemo((): SignalREventHandlers => ({    onGameCreated: (event) => {
      console.log('🎯 Game created:', event);
      invalidateGameQueries();
      // Also trigger available game refresh since a new game was created
      console.log('🎯 Game created - also refreshing available games list');
    },
    
    onGameUpdated: (event) => {
      console.log('Game updated:', event);
      invalidateGameQueries();
    },
    
    onPlayerJoined: (event) => {
      console.log('Player joined:', event);
      if (event.gameId === gameId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.game(event.gameId) });
      }
      invalidateGameQueries();
    },
    
    onPlayerLeft: (event) => {
      console.log('Player left:', event);
      if (event.gameId === gameId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.game(event.gameId) });
      }
      invalidateGameQueries();
    },
    
    onGameStarted: (event) => {
      console.log('Game started:', event);
      if (event.gameId === gameId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.game(event.gameId) });
      }
      invalidateGameQueries();
    },
    
    onRoundCompleted: (event) => {
      console.log('Round completed:', event);
      if (event.gameId === gameId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.game(event.gameId) });
      }
    },
      onGameCompleted: (event) => {
      console.log('Game completed:', event);
      if (event.gameId === gameId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.game(event.gameId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.gameResults(event.gameId) });
      }
      invalidateGameQueries();
    },
    
    onRoundCreated: (event) => {
      console.log('Round created:', event);
      if (event.gameId === gameId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.game(event.gameId) });
      }
    },
    
    onPlayerChoiceMade: (event) => {
      console.log('Player made choice:', event);
      if (event.gameId === gameId) {
        // Optional: Show toast notification or update UI
      }
    },
    
    onPlayerReady: (event) => {
      console.log('Player ready:', event);
      if (event.gameId === gameId) {
        // Optional: Update player ready status in UI
      }
    },
      onPlayerTyping: (event) => {
      console.log('Player typing:', event);
      if (event.gameId === gameId) {
        // Optional: Show typing indicator
      }
    },
      onAvailableGame: (event) => {
      console.log('🎯 Available game update received:', event);
      console.log('🎯 About to invalidate games queries...');
      // Invalidate games list when available games change
      invalidateGameQueries();
      console.log('🎯 Games queries invalidated');
    },
      onError: (error) => {
      console.error('SignalR error:', error);
    },
  }), [invalidateGameQueries, gameId, queryClient]);

  // Join game group when gameId changes
  useEffect(() => {
    if (state.signalRConnected && gameId) {
      signalRService.joinGameGroup(gameId).catch((error) => {
        console.error('Failed to join game group:', error);
      });

      return () => {
        signalRService.leaveGameGroup(gameId).catch((error) => {
          console.error('Failed to leave game group:', error);
        });
      };
    }
  }, [state.signalRConnected, gameId]);

  // Set up event handlers
  useEffect(() => {
    if (state.signalRConnected) {
      const handlers = { ...defaultHandlers, ...customHandlers };
      signalRService.setEventHandlers(handlers);

      return () => {
        signalRService.removeEventHandlers();
      };
    }
  }, [state.signalRConnected, customHandlers, defaultHandlers]);

  return {
    isConnected: state.signalRConnected,
    connectionState: signalRService.getConnectionState(),
  };
};
