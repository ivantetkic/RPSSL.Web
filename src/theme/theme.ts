import { createTheme } from '@mui/material/styles';
import type { ThemeOptions, PaletteMode } from '@mui/material';

declare module '@mui/material/styles' {
  interface Theme {
    game: {
      choices: {
        rock: string;
        paper: string;
        scissors: string;
        spock: string;
        lizard: string;
      };
      status: {
        waiting: string;
        inProgress: string;
        completed: string;
        cancelled: string;
      };
    };
  }

  interface ThemeOptions {
    game?: {
      choices?: {
        rock?: string;
        paper?: string;
        scissors?: string;
        spock?: string;
        lizard?: string;
      };
      status?: {
        waiting?: string;
        inProgress?: string;
        completed?: string;
        cancelled?: string;
      };
    };
  }
}

const getDesignTokens = (mode: PaletteMode): ThemeOptions => ({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  palette: {
    mode,
    primary: {
      main: mode === 'light' ? '#1976d2' : '#90caf9',
    },
    secondary: {
      main: mode === 'light' ? '#dc004e' : '#f48fb1',
    },
    background: {
      default: mode === 'light' ? '#f5f5f5' : '#121212',
      paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
    },
    text: {
      primary: mode === 'light' ? '#000000' : '#ffffff',
      secondary: mode === 'light' ? '#666666' : '#aaaaaa',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      '@media (max-width:600px)': {
        fontSize: '2rem',
      },
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      '@media (max-width:600px)': {
        fontSize: '1.75rem',
      },
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
      '@media (max-width:600px)': {
        fontSize: '1.375rem',
      },
    },
    h4: {
      fontWeight: 500,
      fontSize: '1.25rem',
      '@media (max-width:600px)': {
        fontSize: '1.125rem',
      },
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.1rem',
      '@media (max-width:600px)': {
        fontSize: '1rem',
      },
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
      '@media (max-width:600px)': {
        fontSize: '0.9rem',
      },
    },
    body1: {
      fontSize: '1rem',
      '@media (max-width:600px)': {
        fontSize: '0.875rem',
      },
    },
    body2: {
      fontSize: '0.875rem',
      '@media (max-width:600px)': {
        fontSize: '0.75rem',
      },
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          width: '100vw',
          maxWidth: '100vw',
          margin: 0,
          padding: 0,
          overflowX: 'hidden',
        },
        html: {
          width: '100%',
          margin: 0,
          padding: 0,
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          maxWidth: 'none !important',
          width: '100vw !important',
          paddingLeft: '0 !important',
          paddingRight: '0 !important',
        },
      },
      defaultProps: {
        maxWidth: false,
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          width: '100vw',
          maxWidth: '100vw',
          left: 0,
          right: 0,
          boxShadow: mode === 'light' 
            ? '0 2px 4px rgba(0,0,0,0.1)' 
            : '0 2px 4px rgba(0,0,0,0.3)',
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          width: '100%',
          maxWidth: 'none',
          paddingLeft: '8px',
          paddingRight: '8px',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: mode === 'light' 
            ? '0 2px 8px rgba(0,0,0,0.1)' 
            : '0 2px 8px rgba(0,0,0,0.3)',
        },
      },
    },
    MuiGrid: {
      styleOverrides: {
        root: {
          width: '100%',
          maxWidth: '100%',
        },
      },
    },
  },
  game: {
    choices: {
      rock: '#8D6E63',
      paper: '#FFA726',
      scissors: '#E57373',
      spock: '#64B5F6',
      lizard: '#81C784',
    },
    status: {
      waiting: '#FF9800',
      inProgress: '#4CAF50',
      completed: '#2196F3',
      cancelled: '#F44336',
    },
  },
});

export const createAppTheme = (mode: PaletteMode) => {
  return createTheme(getDesignTokens(mode));
};

export const lightTheme = createAppTheme('light');
export const darkTheme = createAppTheme('dark');
