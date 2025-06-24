import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  Button,
  Chip,
  Avatar,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import SportsMmaIcon from '@mui/icons-material/SportsMma';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import DescriptionIcon from '@mui/icons-material/Description';
import FlareIcon from '@mui/icons-material/Flare';
import PetsIcon from '@mui/icons-material/Pets';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { useGame, useChoices, useMakeChoice, useGameResults } from '../../hooks/useApi';
import { useSignalR } from '../../hooks/useSignalR';
import { signalRService } from '../../services/signalr';
import { useAppContext } from '../../contexts/AppContext';
import { keepPreviousData, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../hooks/useApi';
import type { Choice, Game as GameType, RoundCompletedEvent, GameCompletedEvent, MultiplayerResult, Player } from '../../types/api';

interface GameProps {
  gameId: string;
}

interface ChoiceButtonProps {
  choice: Choice;
  onSelect: (choiceId: number) => void;
  disabled: boolean;
  isSelected: boolean;
}

const ChoiceButton: React.FC<ChoiceButtonProps> = ({ choice, onSelect, disabled, isSelected }) => {  const getChoiceIcon = (choiceName: string) => {
    switch (choiceName.toLowerCase()) {
      case 'rock':
        return <SportsMmaIcon fontSize="large" />;
      case 'paper':
        return <DescriptionIcon fontSize="large" />;
      case 'scissors':
        return <ContentCutIcon fontSize="large" />;
      case 'spock':
        return <FlareIcon fontSize="large" />;
      case 'lizard':
        return <PetsIcon fontSize="large" />;
      default:
        return null;
    }
  };

  const getChoiceColor = (choiceName: string) => {
    switch (choiceName.toLowerCase()) {
      case 'rock':
        return '#8D6E63';
      case 'paper':
        return '#FFA726';
      case 'scissors':
        return '#E57373';
      case 'spock':
        return '#64B5F6';
      case 'lizard':
        return '#81C784';
      default:
        return '#9E9E9E';
    }
  };

  return (
    <Button
      variant={isSelected ? 'contained' : 'outlined'}
      size="large"
      onClick={() => onSelect(choice.id)}
      disabled={disabled}      sx={{
        minHeight: { xs: 80, sm: 100, md: 120 },
        flexDirection: 'column',
        gap: { xs: 0.5, sm: 0.75, md: 1 },
        borderColor: getChoiceColor(choice.name),
        color: isSelected ? 'white' : getChoiceColor(choice.name),
        backgroundColor: isSelected ? getChoiceColor(choice.name) : 'transparent',
        fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
        '&:hover': {
          backgroundColor: isSelected ? getChoiceColor(choice.name) : `${getChoiceColor(choice.name)}20`,
        },
      }}
    >      {getChoiceIcon(choice.name)}
      <Typography variant="h6" sx={{ fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' } }}>
        {choice.name}
      </Typography>
    </Button>
  );
};

interface GameCompletionDialogProps {
  open: boolean;
  gameCompleted: GameCompletedEvent | null;
  game: GameType | null; // Can be stale
  gameResultsData: {
    gameName: string;
    endedAt?: string;
    results: MultiplayerResult[];
    players: Player[];
    gameSummary: MultiplayerResult | null;
  } | null;
  onClose: () => void;
}

const GameCompletionDialog: React.FC<GameCompletionDialogProps> = ({
  open,
  gameCompleted,
  game,
  gameResultsData,
  onClose,
}) => {
  if (!gameCompleted && !gameResultsData) return null;

  // Use gameResultsData as the primary source of truth if available
  const summary = gameResultsData?.gameSummary;
  const players = gameResultsData?.players;
  const gameName = gameResultsData?.gameName || game?.name;
  const endedAt = gameResultsData?.endedAt || gameCompleted?.endedAt;

  // Determine the winner's name
  const winnerId = summary?.winnerId || gameCompleted?.winnerPlayerId;
  const winnerName = winnerId && players 
    ? players.find(p => p.id === winnerId)?.username
    : game?.players.find(p => p.playerId === winnerId)?.username;

  // Determine player scores
  const playerScores = summary 
    ? Object.entries(summary.playerValues)
    : game ? Object.entries(game.players.reduce((acc, p) => ({ ...acc, [p.playerId]: p.score }), {} as Record<string, number>)) : [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ textAlign: 'center', pb: 0 }}>
        🎉 Game Complete! 🎉
      </DialogTitle>
      <DialogContent sx={{ textAlign: 'center' }}>
        {gameName && <Typography variant="h6" color="text.secondary">{gameName}</Typography>}
        {winnerName ? (
          <Typography variant="h4" color="success.main" gutterBottom>
            🏆 {winnerName} Wins! 🏆
          </Typography>
        ) : (
          <Typography variant="h4" gutterBottom>
            It's a Tie!
          </Typography>
        )}
        
        {endedAt && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Finished: {new Date(endedAt).toLocaleString()}
          </Typography>
        )}
        
        <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
          <Typography variant="h6" gutterBottom>Final Scores</Typography>
          {playerScores
            .sort(([, scoreA], [, scoreB]) => scoreB - scoreA) // Sort by score descending
            .map(([playerId, score]) => {
              const playerName = players?.find(p => p.id === playerId)?.username || game?.players.find(p => p.playerId === playerId)?.username || 'Unknown';
              const isWinner = playerId === winnerId;
              return (
                <Box 
                  key={playerId} 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    py: 1, 
                    px: 2,
                    borderRadius: 1,
                    backgroundColor: isWinner ? 'success.light' : 'transparent',
                    fontWeight: isWinner ? 'bold' : 'normal',
                  }}
                >
                  <Typography fontWeight="inherit">{playerName}</Typography>
                  <Typography fontWeight="inherit">{score}</Typography>
                </Box>
              );
          })}
        </Paper>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', p: 2, pt: 0 }}>
        <Button onClick={onClose} variant="contained" size="large">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const Game: React.FC<GameProps> = ({ gameId }) => {
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [roundResults, setRoundResults] = useState<RoundCompletedEvent[]>([]);
  const [gameCompleted, setGameCompleted] = useState<GameCompletedEvent | null>(null);
  const [showGameComplete, setShowGameComplete] = useState(false);
  const { state } = useAppContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Control when the useGame query is active
  const isGameActive = !gameCompleted;
  
  const { data: game, isLoading: gameLoading, error: gameError } = useGame(gameId, { 
    enabled: isGameActive, 
    placeholderData: keepPreviousData 
  });
  const { data: choices = [] } = useChoices();
  const makeChoiceMutation = useMakeChoice();
  const { data: gameResultsData } = useGameResults(gameId, { enabled: !!gameCompleted });

  // Helper functions
  const getChoiceName = (choiceId: number) => {
    return choices.find(c => c.id === choiceId)?.name || 'Unknown';
  };

  const getPlayerName = (playerId: string) => {
    // Try to get from the main game object first, which is most up-to-date during the game
    const player = game?.players.find(p => p.playerId === playerId);
    if (player) return player.username;
    // Fallback to gameResultsData if the game is over
    const resultPlayer = gameResultsData?.players.find(p => p.id === playerId);
    return resultPlayer?.username || 'Unknown';
  };
  // SignalR event handlers
  const signalRHandlers = {
    onRoundCompleted: (event: RoundCompletedEvent) => {
      if (event.gameId === gameId) {
        setRoundResults(prev => [...prev, event]);
        setSelectedChoice(null); // Reset selection for next round
      }
    },
    onGameCompleted: (event: GameCompletedEvent) => {
      if (event.gameId === gameId) {
        setGameCompleted(event);
        setShowGameComplete(true);
        // Invalidate the specific game query to stop fetching it
        queryClient.invalidateQueries({ queryKey: queryKeys.game(gameId) });
      }
    },
  };

  useSignalR(gameId, signalRHandlers);
  const handleChoiceSelect = async (choiceId: number) => {
    if (!state.currentPlayer || selectedChoice !== null) return;

    setSelectedChoice(choiceId);
    
    try {
      await makeChoiceMutation.mutateAsync({
        gameId,
        playerId: state.currentPlayer.id,
        request: { choiceId },
      });
      
      // Notify other players via SignalR that this player made a choice
      signalRService.notifyPlayerMadeChoice(gameId, state.currentPlayer.id, state.currentPlayer.username);
    } catch (error) {
      console.error('Failed to make choice:', error);
      setSelectedChoice(null); // Reset on error
    }
  };
  const handleLeaveGame = () => {
    navigate('/');
  };  const handleGameCompleteClose = () => {
    setShowGameComplete(false);
    // Invalidate recent game results to refresh the home page
    queryClient.invalidateQueries({ queryKey: queryKeys.recentGameResults(state.currentPlayer?.id) });
    navigate('/');
  };
  const currentRound = game?.rounds[game.rounds.length - 1];
  const waitingForOthers = selectedChoice !== null && !currentRound?.completedAt;
  const isGameOver = !!gameCompleted;

  // The game object to use for rendering. It could be the live game data
  // or the stale data kept after the game finished.
  const displayGame = game;

  if (gameLoading && !displayGame) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (gameError && !displayGame) {
    return (
      <Alert severity="error">
        Failed to load game. It might be over. Check the home page for results.
      </Alert>
    );
  }

  // If game is finished and we have no data at all, show a simple message.
  if (isGameOver && !displayGame && !gameResultsData) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5">Game Over</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          The game has finished. You can view results on the home page.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/')}>Go Home</Button>
      </Box>
    );
  }

  // If the game is over but we still don't have the game object for some reason,
  // we show a loading state while we fetch the results.
  if (isGameOver && !displayGame && !gameResultsData) {
      return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
              <Typography variant="h5">Game Over</Typography>
              <Typography>Loading final results...</Typography>
              <CircularProgress />
          </Box>
      );
  }

  return (
    <Box sx={{ 
      p: { xs: 1, sm: 2, md: 3 },
      width: '100%',
      maxWidth: 'none',
      margin: 0
    }}>
      {/* Header with game name and leave button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          {displayGame?.name || gameResultsData?.gameName || 'Game'}
        </Typography>
        <Button
          variant="outlined"
          color="error"
          startIcon={<ExitToAppIcon />}
          onClick={handleLeaveGame}
        >
          Leave Game
        </Button>
      </Box>

      {/* Game Status */}
      {displayGame && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Round {displayGame.currentRoundNumber}
            </Typography>
            <Chip 
              label={isGameOver ? 'Finished' : displayGame.status}
              color={isGameOver ? 'default' : displayGame.status === 'InProgress' ? 'success' : 'default'}
            />
          </Box>        {/* Players */}
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { 
              xs: '1fr', 
              sm: 'repeat(2, 1fr)', 
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)'
            },
            gap: { xs: 1, sm: 1.5, md: 2 }
          }}>
            {displayGame.players.map((player) => (
              <Box key={player.playerId}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: { xs: 28, sm: 32 }, height: { xs: 28, sm: 32 } }}>
                    {player.username.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="body1" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                      {player.username}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      Score: {player.score}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>
      )}

      {/* Waiting indicator */}
      {waitingForOthers && !isGameOver && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Waiting for other players...
          </Typography>
          <LinearProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            You selected: {choices.find(c => c.id === selectedChoice)?.name}
          </Typography>
        </Paper>
      )}      {/* Choice Selection */}
      {!waitingForOthers && (
        <Paper sx={{ p: 3, opacity: isGameOver ? 0.6 : 1, transition: 'opacity 0.3s' }}>
          <Typography variant="h5" gutterBottom textAlign="center">
            {isGameOver ? 'Game Over' : 'Make Your Choice'}
          </Typography>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(3, 1fr)',
              md: 'repeat(5, 1fr)'
            },
            gap: { xs: 1, sm: 1.5, md: 2 },
            width: '100%',
            mx: 'auto'
          }}>
            {choices.map((choice) => (
              <ChoiceButton
                key={choice.id}
                choice={choice}
                onSelect={handleChoiceSelect}
                disabled={makeChoiceMutation.isPending || isGameOver}
                isSelected={selectedChoice === choice.id}
              />
            ))}</Box>
        </Paper>
      )}      {/* Round Results Log */}
      {roundResults.length > 0 && (
        <Paper sx={{ p: { xs: 2, sm: 2.5, md: 3 }, mt: 3 }}>
          <Typography variant="h5" gutterBottom textAlign="center" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
            Round Results
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 2, 
            maxHeight: { xs: 300, sm: 400, md: 500 }, 
            overflowY: 'auto' 
          }}>
            {roundResults.slice().reverse().map((result, index) => (
              <Box key={`${result.roundId}-${index}`} sx={{ p: { xs: 1.5, sm: 2 }, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}>
                  Round {result.roundNumber} Results:
                </Typography>
                
                <Box sx={{ 
                  display: 'grid',
                  gridTemplateColumns: { 
                    xs: '1fr', 
                    sm: 'repeat(2, 1fr)', 
                    md: 'repeat(3, 1fr)' 
                  },
                  gap: { xs: 1, sm: 1.5, md: 2 }, 
                  mb: 2 
                }}>
                  {Object.entries(result.playerChoices).map(([playerId, choiceId]) => (
                    <Card key={playerId} variant="outlined" sx={{ p: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {getPlayerName(playerId)}
                      </Typography>
                      <Typography variant="body1" color="primary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        {getChoiceName(choiceId as number)}
                      </Typography>
                    </Card>
                  ))}
                </Box>

                <Alert 
                  severity={result.winnerId ? 'success' : 'info'}
                  sx={{ mb: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  {result.resultDescription}
                </Alert>

                {result.winnerId && (
                  <Typography variant="body1" color="success.main" textAlign="center" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    🏆 {getPlayerName(result.winnerId)} wins this round!
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        </Paper>
      )}

      {/* Game Completion Dialog */}
      <GameCompletionDialog
        open={showGameComplete}
        gameCompleted={gameCompleted}
        game={displayGame || null}
        gameResultsData={gameResultsData || null}
        onClose={handleGameCompleteClose}
      />
    </Box>
  );
};
