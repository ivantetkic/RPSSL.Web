import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,  Fab,  Chip,  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PeopleIcon from '@mui/icons-material/People';
import PlayIcon from '@mui/icons-material/PlayArrow';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { useGames, useCreateGame, useJoinGame, useAddComputerPlayer, useRecentGameResults } from '../../hooks/useApi';
import { useSignalR } from '../../hooks/useSignalR';
import { useAppContext } from '../../contexts/AppContext';
import { apiService } from '../../services/api';
import type { GameListItem, MultiplayerResult } from '../../types/api';

interface CreateGameDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (gameId?: string) => void;
}

const CreateGameDialog: React.FC<CreateGameDialogProps> = ({ open, onClose, onSuccess }) => {
  const [gameName, setGameName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [error, setError] = useState<string | null>(null);
  
  const { state } = useAppContext();
  const createGameMutation = useCreateGame();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!gameName.trim()) {
      setError('Game name is required');
      return;
    }

    if (!state.currentPlayer) {
      setError('You must be logged in to create a game');
      return;
    }    try {
      const result = await createGameMutation.mutateAsync({
        playerId: state.currentPlayer.id,
        request: {
          name: gameName.trim(),
          maxPlayers,
        },
      });

      setGameName('');
      setMaxPlayers(2);
      onSuccess(result.id); // Pass the created game ID
      onClose();} catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create game';
      setError(errorMessage);
    }
  };

  const handleClose = () => {
    setGameName('');
    setMaxPlayers(2);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Game</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            fullWidth
            label="Game Name"
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            margin="normal"
            disabled={createGameMutation.isPending}
            autoFocus
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Max Players</InputLabel>
            <Select
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(e.target.value as number)}
              disabled={createGameMutation.isPending}
              label="Max Players"
            >
              {[2, 3, 4, 5, 6].map((num) => (
                <MenuItem key={num} value={num}>
                  {num} Players
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose} disabled={createGameMutation.isPending}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={createGameMutation.isPending}
          startIcon={createGameMutation.isPending ? <CircularProgress size={16} /> : undefined}
        >
          {createGameMutation.isPending ? 'Creating...' : 'Create Game'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

interface GameCardProps {
  game: GameListItem;
  canJoin: boolean;
  onJoin: (gameId: string) => void;
  isJoining: boolean;
  onAddComputer: (gameId: string) => void;
  isAddingComputer: boolean;
  canAddComputer: boolean;
  isPlayerInGame: boolean;
}

const GameCard: React.FC<GameCardProps> = ({ 
  game, 
  canJoin, 
  onJoin, 
  isJoining, 
  onAddComputer, 
  isAddingComputer, 
  canAddComputer, 
  isPlayerInGame
}) => {  const { state } = useAppContext();
  const isCreator = state.currentPlayer && game.creatorId === state.currentPlayer.id;
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Waiting':
        return 'warning';
      case 'InProgress':
        return 'success';
      case 'Completed':
        return 'info';
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Waiting':
        return 'Waiting for Players';
      case 'InProgress':
        return 'In Progress';
      case 'Completed':
        return 'Completed';
      case 'Cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  return (
    <Card elevation={2}>
      <CardContent>
        <Typography variant="h6" component="h3" gutterBottom>
          {game.name}
        </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <PersonIcon fontSize="small" />          
            <Typography variant="body2" color="text.secondary">
                {isCreator ? 'Your Game' : `Created by ${game.creatorName}`}
            </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <PeopleIcon fontSize="small" />
          <Typography variant="body2">
            {game.playerCount} / {game.maxPlayers} players
          </Typography>
        </Box>          <Chip
          label={getStatusText(game.status)}
          color={getStatusColor(game.status) as 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'}
          size="small"
        />
        
      </CardContent>      
      <CardActions sx={{ gap: 1, flexDirection: 'column', alignItems: 'stretch' }}>
        {/* Action for users who can join */}
        {canJoin && (
          <Button
            size="small"
            variant="contained"
            startIcon={isJoining ? <CircularProgress size={16} /> : <PlayIcon />}
            onClick={() => onJoin(game.id)}
            disabled={isJoining}
          >
            {isJoining ? 'Joining...' : 'Join Game'}
          </Button>
        )}

        {/* Actions for the game creator */}
        {isCreator && game.status === 'Waiting' && (
          <>
            {canAddComputer && (
              <Button
                size="small"
                variant="contained"
                color="secondary"
                startIcon={isAddingComputer ? <CircularProgress size={16} /> : <SmartToyIcon />}
                onClick={() => onAddComputer(game.id)}
                disabled={isAddingComputer}
              >
                {isAddingComputer ? 'Adding...' : 'Add Computer Player'}
              </Button>
            )}
            {!canAddComputer && (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 1 }}>
                Waiting for players to join...
              </Typography>
            )}
          </>
        )}

        {/* Message for players who have already joined */}
        {!isCreator && isPlayerInGame && game.status === 'Waiting' && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 1 }}>
            Waiting for game to start...
          </Typography>
        )}
      </CardActions>
    </Card>
  );
};

interface RecentGameResultsProps {
  results: MultiplayerResult[];
  loading: boolean;
}

const RecentGameResults: React.FC<RecentGameResultsProps> = ({ results, loading }) => {

    console.log('RecentGameResults', { results, loading });
  if (loading) {
    return (
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Recent Game Results
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={24} />
        </Box>
      </Paper>
    );
  }

  if (results.length === 0) {
    return (
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Recent Game Results
        </Typography>
        <Typography color="text.secondary">
          No recent game results found.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Recent Game Results
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 300, overflowY: 'auto' }}>
        {results.map((result, index) => (
          <Card key={`${result.id}-${index}`} variant="outlined" sx={{ p: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  {result.winnerUsername ? `🏆 ${result.winnerUsername} won` : 'Tie game'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(result.createdAt).toLocaleDateString()} {new Date(result.createdAt).toLocaleTimeString()}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body2">
                  {result.resultDescription}
                </Typography>
              </Box>
            </Box>
          </Card>
        ))}
      </Box>
    </Paper>
  );
};

export const GameLobby: React.FC = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [userGameIds, setUserGameIds] = useState<Set<string>>(new Set()); // Track games user is involved in
  const [recentlyJoinedGames, setRecentlyJoinedGames] = useState<Set<string>>(new Set()); // Track recently joined games
  
  // Use refs to avoid stale closures in SignalR event handlers
  const userGameIdsRef = React.useRef(userGameIds);
  const recentlyJoinedGamesRef = React.useRef(recentlyJoinedGames);
  const gamesDataRef = React.useRef<GameListItem[]>([]);
  
  React.useEffect(() => {
    userGameIdsRef.current = userGameIds;
  }, [userGameIds]);
  React.useEffect(() => {
    recentlyJoinedGamesRef.current = recentlyJoinedGames;
  }, [recentlyJoinedGames]);
  
  const { state } = useAppContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const gamesQueryParams = React.useMemo(() => ({ status: 'Waiting' }), []);
  const gameQuery = useGames(gamesQueryParams);
  
  const { data, isLoading: gamesLoading, error, refetch } = gameQuery;
  // Fallback data structure in case of API issues
  const gamesData = React.useMemo(() => {
    let result: GameListItem[];
    if (data?.games) {
      result = data.games;
    } else if (!data && !error) {
      // Return empty array if no data but no error (initial state)
      result = [];
    } else {
      // Return empty array if there's an error
      result = [];
    }
    
    // Update ref for SignalR event handlers
    gamesDataRef.current = result;
    return result;
  }, [data, error]);

 
  const { data: recentResults = [], isLoading: resultsLoading } = useRecentGameResults(10, state.currentPlayer?.id);
  const joinGameMutation = useJoinGame();
  const addComputerMutation = useAddComputerPlayer();  // Track games the user is involved in (created or joined)

  // Function to verify if user is actually in a game via API
  const verifyUserInGame = React.useCallback(async (gameId: string): Promise<boolean> => {
    if (!state.currentPlayer) return false;
    
    try {
      const game = await apiService.getGame(gameId);
      const userInGame = game.players.some(player => player.playerId === state.currentPlayer!.id);
      console.log('🎮 API verification - user in game:', gameId, userInGame);
      return userInGame;
    } catch (error) {
      console.warn('🎮 Failed to verify user in game:', error);
      return false;
    }
  }, [state.currentPlayer]);

  // Set up SignalR for lobby updates
  useSignalR(undefined, {
    onGameStarted: async (event) => {
      // Navigate if the user is involved in this game
      console.log('🎮 Game started via SignalR:', event);
      console.log('🎮 Current player:', state.currentPlayer?.id);
      console.log('🎮 Current userGameIds:', userGameIdsRef.current);
      console.log('🎮 Current recentlyJoinedGames:', recentlyJoinedGamesRef.current);
      
      if (state.currentPlayer) {
        const gameId = event.gameId;
        
        // Check if user is involved in this game - multiple approaches
        const isLocallyTracked = userGameIdsRef.current.has(gameId) || recentlyJoinedGamesRef.current.has(gameId);

        if (isLocallyTracked) {
          console.log('🎮 Navigating to game (user in userGameIds or recently joined):', gameId);
          if (!userGameIdsRef.current.has(gameId)) {
            setUserGameIds(prev => new Set([...prev, gameId]));
          }
          navigate(`/game/${gameId}`);
        } else {
          // Fallback for joiners who might not have updated local state in time
          console.log('🤔 Local state check failed, verifying with API...');
          const isActuallyInGame = await verifyUserInGame(gameId);
          if (isActuallyInGame) {
            console.log('✅ API verification successful, navigating to game:', gameId);
            // Ensure local state is updated for future checks
            setUserGameIds(prev => new Set([...prev, gameId]));
            navigate(`/game/${gameId}`);
          } else {
            console.log('🤷 User not in game according to API, not navigating.');
          }
        }
      }
    },
    onGameCreated: (event) => {
      console.log('🎮 New game created via SignalR:', event);
      
      // If this is the current player who created the game, track it
      if (state.currentPlayer && event.creatorId === state.currentPlayer.id) {
        console.log('🎮 Current player created game, tracking:', event.gameId);
        setUserGameIds(prev => {
          const newSet = new Set([...prev, event.gameId]);
          console.log('🎮 Updated userGameIds for game creator:', newSet);
          return newSet;
        });
      }
      
      // Refetch games to show the new game in the lobby
      console.log('🎮 Triggering refetch due to game created');
      refetch();
      // Invalidate all games queries to ensure fresh data
      queryClient.invalidateQueries({ 
        queryKey: ['games'], 
        exact: false // This will invalidate all queries that start with ['games']
      });    },onGameUpdated: async (event) => {
      console.log('🎮 Game updated via SignalR:', event);
      console.log('🎮 Current player:', state.currentPlayer?.id);
      console.log('🎮 Current userGameIds:', userGameIdsRef.current);
      console.log('🎮 Current recentlyJoinedGames:', recentlyJoinedGamesRef.current);

      // If a game just started and the user is involved, navigate to it
      if (event.status === 'InProgress' && state.currentPlayer) {
        const gameId = event.id; // Assuming event has 'id' and 'status'
        
        const isLocallyTracked = userGameIdsRef.current.has(gameId) || recentlyJoinedGamesRef.current.has(gameId);

        if (isLocallyTracked) {
          console.log('🎮 Navigating to game from onGameUpdated:', gameId);
          // Ensure the gameId is tracked before navigating
          if (!userGameIdsRef.current.has(gameId)) {
            setUserGameIds(prev => new Set([...prev, gameId]));
          }
          navigate(`/game/${gameId}`);
        } else {
          // Fallback for joiners who might not have updated local state in time
          console.log('🤔 Local state check failed for onGameUpdated, verifying with API...');
          const isActuallyInGame = await verifyUserInGame(gameId);
          if (isActuallyInGame) {
            console.log('✅ API verification successful for onGameUpdated, navigating to game:', gameId);
            // Ensure local state is updated for future checks
            setUserGameIds(prev => new Set([...prev, gameId]));
            navigate(`/game/${gameId}`);
          } else {
            console.log('🤷 User not in game according to API, not navigating (onGameUpdated).');
          }
        }
      }

      // Always refetch games to update the lobby
      console.log('🎮 Triggering refetch due to game updated');
      refetch();
      // Invalidate all games queries to ensure fresh data
      queryClient.invalidateQueries({ 
        queryKey: ['games'], 
        exact: false // This will invalidate all queries that start with ['games']
      });
    },
    onAvailableGame: (event) => {
      
      // Try multiple approaches to ensure the data updates
      console.log('🎮 Triggering refetch due to available game', event);
      
      // 1. Force refetch of the current query
      refetch().then((result) => {
        console.log('🎮 Refetch completed:', result);
        console.log('🎮 New games after refetch:', result.data);
        
      }).catch((error) => {
        console.error('🎮 Refetch failed:', error);
      });
      
      // 2. Invalidate and refetch all games queries
      queryClient.invalidateQueries({ 
        queryKey: ['games'], 
        exact: false,
        refetchType: 'active' // Only refetch active queries
      });
      
      // 3. As a fallback, remove the specific query from cache and refetch
      setTimeout(() => {
        queryClient.removeQueries({ 
          queryKey: ['games', { status: 'Waiting' }], 
          exact: true 
        });
        refetch();
      }, 100);
    },    onPlayerJoined: (event) => {
      console.log('🎮 Player joined via SignalR:', event);
      // If this is the current player joining a game, track it
      if (state.currentPlayer && event.playerId === state.currentPlayer.id) {
        console.log('🎮 Current player joined game:', event.gameId);
        setUserGameIds(prev => {
          const newSet = new Set([...prev, event.gameId]);
          userGameIdsRef.current = newSet; // Immediately update ref
          console.log('🎮 Updated userGameIds via SignalR:', newSet);
          return newSet;
        });
        setRecentlyJoinedGames(prev => {
          const newSet = new Set([...prev, event.gameId]);
          recentlyJoinedGamesRef.current = newSet; // Immediately update ref
          console.log('🎮 Updated recentlyJoinedGames via SignalR:', newSet);
          return newSet;
        });
      }
      
      // Refetch games to update player counts
      console.log('🎮 Triggering refetch due to player joined');
      refetch();
      // Invalidate all games queries to ensure fresh data
      queryClient.invalidateQueries({ 
        queryKey: ['games'], 
        exact: false // This will invalidate all queries that start with ['games']
      });
    },
  });
  const handleJoinGame = async (gameId: string) => {
    if (!state.currentPlayer) return;

    try {
      const result = await joinGameMutation.mutateAsync({
        gameId,
        playerId: state.currentPlayer.id,
      });
      
      console.log('🎮 Join game result:', result);
      
      // Track that this user is now involved in this game
      setUserGameIds(prev => {
        const newSet = new Set([...prev, gameId]);
        userGameIdsRef.current = newSet; // Immediately update ref
        console.log('🎮 Updated userGameIds after join:', newSet);
        return newSet;
      });
      
      // Also track in recently joined games for fallback
      setRecentlyJoinedGames(prev => {
        const newSet = new Set([...prev, gameId]);
        recentlyJoinedGamesRef.current = newSet; // Immediately update ref
        console.log('🎮 Updated recentlyJoinedGames after join:', newSet);
        return newSet;
      });
      
      // Navigate to the game if it started or if we successfully joined
      if (result.gameStarted) {
        console.log('🎮 Game started immediately after join, navigating to:', gameId);
        navigate(`/game/${gameId}`);
      } else {
        console.log('🎮 Game not started yet, user will be navigated when game starts via SignalR');
      }
    } catch (err) {
      console.error('Failed to join game:', err);
    }
  };
  
  const handleAddComputer = async (gameId: string) => {
    if (!state.currentPlayer) return;
      try {
      await addComputerMutation.mutateAsync({
        gameId,
        request: {
          playerId: state.currentPlayer.id,
        },
      });
      // Refetch games to update the UI
      refetch();
    } catch (err) {
      console.error('Failed to add computer player:', err);
    }
  };
  
  const canJoinGame = (game: GameListItem) => {
    // User cannot join if they are not logged in or are already in the game (as creator or player)
    if (!state.currentPlayer || userGameIds.has(game.id)) {
      return false;
    }
    
    return (
      game.status === 'Waiting' &&
      game.playerCount < game.maxPlayers &&
      game.creatorId !== state.currentPlayer.id
    );
  };

  const canAddComputer = (game: GameListItem) => {
    if (!state.currentPlayer) return false;
      return (
      game.creatorId === state.currentPlayer.id && // Only creator can add computers
      game.status === 'Waiting' && // Game must be waiting for players
      game.playerCount < game.maxPlayers // Must have available slots
    );
  };  
  
  // Connection status for development
  const [connectionStatus, setConnectionStatus] = React.useState<'checking' | 'connected' | 'disconnected'>('checking');
  
  // Check backend connection status
  React.useEffect(() => {
    const checkConnection = async () => {
      try {
        setConnectionStatus('checking');
        await apiService.getGames({ status: 'Waiting' });
        setConnectionStatus('connected');
      } catch (error) {
        console.warn('Backend connection failed:', error);
        setConnectionStatus('disconnected');
      }
    };
    
    // Check on mount
    checkConnection();
    
    // Check periodically
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  
  return (    
  <Box sx={{ 
      p: { xs: 1, sm: 2, md: 3 },
      width: '100%',
      maxWidth: 'none',
      margin: 0
    }}>
      <Typography variant="h4" component="h2" gutterBottom>
        Game Lobby
      </Typography>
      
      {/* Connection Status Indicator */}
      {connectionStatus === 'disconnected' && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Backend server is unavailable. Using mock data for development.
        </Alert>
      )}
      {connectionStatus === 'checking' && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Checking backend connection...
        </Alert>
      )}
        
      
      {/* Authentication Check */}
      {!state.currentPlayer && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Please register or select a player to create and join games.
        </Alert>
      )}
      
        {/* Current Games Section */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 2 
        }}>
          <Typography variant="h6">
            Available Games
          </Typography>          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            disabled={!state.currentPlayer}
            sx={{ minWidth: 140 }}
          >
            Create Game
          </Button>
        </Box>        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={() => refetch()}
                disabled={gamesLoading}
              >
                Retry
              </Button>
            }
          >
            Failed to load games: {error instanceof Error ? error.message : 'Please try again.'}
          </Alert>
        )}
         {gamesLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : gamesData.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No games available right now
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Be the first to start a game!
            </Typography>            <Button
              variant="outlined"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
              disabled={!state.currentPlayer}
              sx={{ mt: 2 }}
            >
              Create New Game
            </Button>
          </Box>
        ) : (
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { 
              xs: '1fr', 
              sm: 'repeat(2, 1fr)', 
              lg: 'repeat(3, 1fr)' 
            },
            gap: { xs: 2, sm: 2.5, md: 3 }
          }}>
            {gamesData.map((game: GameListItem) => (
              <GameCard
                key={game.id}
                game={game}
                canJoin={!!canJoinGame(game)}
                onJoin={handleJoinGame}
                isJoining={joinGameMutation.isPending}
                onAddComputer={handleAddComputer}
                isAddingComputer={addComputerMutation.isPending}
                canAddComputer={!!canAddComputer(game)}
                isPlayerInGame={userGameIds.has(game.id)}
              />
            ))}
          </Box>
        )}
      </Paper>      <Fab
        color="primary"
        aria-label="create game"
        disabled={!state.currentPlayer}
        sx={{ 
          position: 'fixed', 
          bottom: { xs: 16, sm: 20, md: 24 }, 
          right: { xs: 16, sm: 20, md: 24 },
          zIndex: 1000
        }}
        onClick={() => setCreateDialogOpen(true)}
      >
        <AddIcon />
      </Fab>      <CreateGameDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={(gameId) => {
          // Track the created game for the creator
          if (gameId && state.currentPlayer) {
            console.log('🎮 Game created, tracking for creator:', gameId);
            setUserGameIds(prev => {
              const newSet = new Set([...prev, gameId]);
              console.log('🎮 Updated userGameIds after game creation:', newSet);
              return newSet;
            });
          }
          
          // Manually refetch to ensure UI updates immediately
          refetch();
          // Also invalidate queries as backup
          queryClient.invalidateQueries({ queryKey: ['games'], exact: false });
        }}
      />

      <RecentGameResults results={recentResults} loading={resultsLoading} />
    </Box>
  );
};
