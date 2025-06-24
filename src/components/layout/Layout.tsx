import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Chip,
  Avatar,
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LogoutIcon from '@mui/icons-material/Logout';
import SignalCellular3BarIcon from '@mui/icons-material/SignalCellular3Bar';
import SignalCellularOffIcon from '@mui/icons-material/SignalCellularOff';
import { useAppContext } from '../../contexts/AppContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { state, actions } = useAppContext();

  const handleLogout = () => {
    actions.logout();
  };  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      width: '100vw',
      maxWidth: '100vw',
      margin: 0,
      padding: 0
    }}>      <AppBar position="static" elevation={1} sx={{ width: '100%', maxWidth: 'none' }}>
        <Toolbar sx={{ 
          minHeight: { xs: 56, sm: 64 },
          width: '100%',
          maxWidth: 'none',
          px: { xs: 1, sm: 2, md: 3 }
        }}>
          <Typography variant="h6" component="h1" sx={{ 
            flexGrow: 1,
            fontSize: { xs: '1rem', sm: '1.25rem' }
          }}>
            RPSSL Multiplayer
          </Typography>

          {state.currentPlayer && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: { xs: 1, sm: 2 }, 
              mr: { xs: 1, sm: 2 }
            }}>
              <Chip
                icon={state.signalRConnected ? <SignalCellular3BarIcon /> : <SignalCellularOffIcon />}
                label={state.signalRConnected ? 'Connected' : 'Disconnected'}
                color={state.signalRConnected ? 'success' : 'error'}
                size="small"
                sx={{ 
                  display: { xs: 'none', sm: 'flex' },
                  '& .MuiChip-label': { fontSize: { sm: '0.75rem' } }
                }}
              />
              
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: { xs: 0.5, sm: 1 }
              }}>
                <Avatar sx={{ 
                  width: { xs: 28, sm: 32 }, 
                  height: { xs: 28, sm: 32 }, 
                  bgcolor: 'secondary.main' 
                }}>
                  {state.currentPlayer.username.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="body2" sx={{ 
                  display: { xs: 'none', sm: 'block' },
                  fontSize: { sm: '0.875rem' }
                }}>
                  {state.currentPlayer.username}
                </Typography>
              </Box>
            </Box>
          )}

          <IconButton
            color="inherit"
            onClick={actions.toggleTheme}
            title={`Switch to ${state.theme === 'light' ? 'dark' : 'light'} mode`}
            size={window.innerWidth < 600 ? 'small' : 'medium'}
          >
            {state.theme === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
          </IconButton>

          {state.currentPlayer && (
            <IconButton
              color="inherit"
              onClick={handleLogout}
              title="Logout"
              sx={{ ml: { xs: 0.5, sm: 1 } }}
              size={window.innerWidth < 600 ? 'small' : 'medium'}
            >
              <LogoutIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>      <Box component="main" sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column',
        width: '100vw',
        maxWidth: '100vw',
        margin: 0,
        padding: 0
      }}>
        {children}
      </Box>
    </Box>
  );
};
