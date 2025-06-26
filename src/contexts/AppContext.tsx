import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { PaletteMode } from '@mui/material';
import type { Player, AppState, Choice } from '../types/api';
import { signalRService } from '../services/signalr';
import { HubConnectionState } from '@microsoft/signalr';

interface AppContextState extends AppState {
  theme: PaletteMode;
  signalRConnected: boolean;
}

type AppAction =
  | { type: 'SET_CURRENT_PLAYER'; payload: Player | undefined }
  | { type: 'SET_AUTHENTICATION'; payload: boolean }
  | { type: 'SET_CHOICES'; payload: Choice[] }
  | { type: 'SET_THEME'; payload: PaletteMode }
  | { type: 'SET_SIGNALR_CONNECTION'; payload: boolean }
  | { type: 'LOGOUT' };

interface AppContextType {
  state: AppContextState;
  dispatch: React.Dispatch<AppAction>;
  actions: {
    setCurrentPlayer: (player: Player | undefined) => void;
    setAuthentication: (authenticated: boolean) => void;
    setChoices: (choices: Choice[]) => void;
    toggleTheme: () => void;
    logout: () => void;
  };
}

const initialState: AppContextState = {
  currentPlayer: undefined,
  isAuthenticated: false,
  currentGame: undefined,
  availableGames: [],
  choices: [],
  theme: 'light',
  signalRConnected: false,
};

const appReducer = (state: AppContextState, action: AppAction): AppContextState => {
  switch (action.type) {
    case 'SET_CURRENT_PLAYER':
      return {
        ...state,
        currentPlayer: action.payload,
        isAuthenticated: !!action.payload,
      };
    case 'SET_AUTHENTICATION':
      return {
        ...state,
        isAuthenticated: action.payload,
        currentPlayer: action.payload ? state.currentPlayer : undefined,
      };
    case 'SET_CHOICES':
      return {
        ...state,
        choices: action.payload,
      };
    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload,
      };
    case 'SET_SIGNALR_CONNECTION':
      return {
        ...state,
        signalRConnected: action.payload,
      };
    case 'LOGOUT':
      return {
        ...initialState,
        theme: state.theme, // Preserve theme preference
        choices: state.choices, // Preserve choices
      };
    default:
      return state;
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load theme preference from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('rpssl-theme') as PaletteMode;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      dispatch({ type: 'SET_THEME', payload: savedTheme });
    }
  }, []);

  // Save theme preference to localStorage
  useEffect(() => {
    localStorage.setItem('rpssl-theme', state.theme);
  }, [state.theme]);

  // Load authentication state from localStorage
  useEffect(() => {
    const savedPlayer = localStorage.getItem('rpssl-current-player');
    if (savedPlayer) {
      try {
        const player = JSON.parse(savedPlayer);
        dispatch({ type: 'SET_CURRENT_PLAYER', payload: player });
      } catch (error) {
        console.error('Failed to load saved player:', error);
        localStorage.removeItem('rpssl-current-player');
      }
    }
  }, []);

  // Save current player to localStorage
  useEffect(() => {
    if (state.currentPlayer) {
      localStorage.setItem('rpssl-current-player', JSON.stringify(state.currentPlayer));
    } else {
      localStorage.removeItem('rpssl-current-player');
    }
  }, [state.currentPlayer]);  // Initialize SignalR connection
  useEffect(() => {
    if (state.isAuthenticated && !state.signalRConnected) {
      signalRService.setEventHandlers({        onConnectionStateChanged: (connectionState) => {
          const isConnected = connectionState === HubConnectionState.Connected;
          dispatch({ 
            type: 'SET_SIGNALR_CONNECTION', 
            payload: isConnected
          });
          
          // Register player presence when connected
          if (isConnected && state.currentPlayer) {
            signalRService.registerPlayerPresence(
              state.currentPlayer.id, 
              state.currentPlayer.username
            ).catch((error) => {
              console.error('Failed to register player presence:', error);
            });
          }
        },
        onError: (error) => {
          console.error('SignalR error:', error);
        },
      });

      signalRService.start().catch((error) => {
        console.error('Failed to start SignalR:', error);
      });
    } else if (!state.isAuthenticated && state.signalRConnected) {
      signalRService.stop().catch((error) => {
        console.error('Failed to stop SignalR:', error);
      });
    }

    return () => {
      if (state.signalRConnected) {
        signalRService.removeEventHandlers();
      }
    };
  }, [state.isAuthenticated, state.signalRConnected, state.currentPlayer]);

  const actions = {
    setCurrentPlayer: (player: Player | undefined) => {
      dispatch({ type: 'SET_CURRENT_PLAYER', payload: player });
    },
    setAuthentication: (authenticated: boolean) => {
      dispatch({ type: 'SET_AUTHENTICATION', payload: authenticated });
    },
    setChoices: (choices: Choice[]) => {
      dispatch({ type: 'SET_CHOICES', payload: choices });
    },
    toggleTheme: () => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      dispatch({ type: 'SET_THEME', payload: newTheme });
    },
    logout: () => {
      dispatch({ type: 'LOGOUT' });
    },
  };

  return (
    <AppContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </AppContext.Provider>  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
