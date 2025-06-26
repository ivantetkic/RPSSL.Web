import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useCreatePlayer } from '../../hooks/useApi';
import { useAppContext } from '../../contexts/AppContext';

interface AuthFormProps {
  onSuccess?: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { actions } = useAppContext();
  
  const createPlayerMutation = useCreatePlayer();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }

    if (username.length > 20) {
      setError('Username must be less than 20 characters long');
      return;
    }

    try {
      const response = await createPlayerMutation.mutateAsync({ username: username.trim() });
      
      // Convert response to Player type for context
      const player = {
        id: response.id,
        username: response.username,
        type: 'Human',
        status: 'Online',
        registeredAt: response.registeredAt,
        gamesPlayed: 0,
        gamesWon: 0,
        winRate: 0,
      };

      actions.setCurrentPlayer(player);
      onSuccess?.();    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create player. Please try again.';
      setError(errorMessage);
    }
  };
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      p={2}
      sx={{
        width: '100vw',
        maxWidth: '100vw',
        margin: 0,
        padding: { xs: 1, sm: 2 }
      }}
    ><Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: { xs: '95%', sm: '500px', md: '600px' },
          width: '100%',
          textAlign: 'center',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom color="primary">
          RPSSL Game
        </Typography>
        
        <Typography variant="h6" component="h2" gutterBottom sx={{ mb: 3 }}>
          Rock Paper Scissors Spock Lizard
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            variant="outlined"
            margin="normal"
            disabled={createPlayerMutation.isPending}
            autoFocus
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={createPlayerMutation.isPending}
            startIcon={
              createPlayerMutation.isPending ? (
                <CircularProgress size={20} />
              ) : (
                <PersonAddIcon />
              )
            }
          >
            {createPlayerMutation.isPending ? 'Creating Player...' : 'Join'}
          </Button>
        </Box>

        <Box mt={3}>
          <Typography variant="body2" color="text.secondary">
            Enter a unique username to start playing multiplayer RPSSL!
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};
