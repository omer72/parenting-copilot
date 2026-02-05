import { createTheme, type ThemeOptions } from '@mui/material/styles';

const baseThemeOptions: ThemeOptions = {
  palette: {
    primary: {
      main: '#8b5cf6',      // purple-500
      light: '#a78bfa',     // purple-400
      dark: '#7c3aed',      // purple-600
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ec4899',      // pink-500
      light: '#f472b6',     // pink-400
      dark: '#db2777',      // pink-600
      contrastText: '#ffffff',
    },
    error: {
      main: '#ef4444',      // red-500
      light: '#f87171',     // red-400
      dark: '#dc2626',      // red-600
    },
    warning: {
      main: '#f59e0b',      // amber-500
      light: '#fbbf24',     // amber-400
      dark: '#d97706',      // amber-600
    },
    success: {
      main: '#10b981',      // green-500
      light: '#34d399',     // green-400
      dark: '#059669',      // green-600
    },
    info: {
      main: '#3b82f6',      // blue-500
      light: '#60a5fa',     // blue-400
      dark: '#2563eb',      // blue-600
    },
    background: {
      default: 'transparent',
      paper: 'rgba(255, 255, 255, 0.9)',
    },
    text: {
      primary: '#1f2937',   // gray-800
      secondary: '#6b7280', // gray-500
    },
  },
  typography: {
    fontFamily: "'Heebo', system-ui, -apple-system, sans-serif",
    h1: {
      fontSize: '2.25rem',  // 4xl
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '1.875rem', // 3xl
      fontWeight: 700,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.5rem',   // 2xl
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.25rem',  // xl
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.125rem', // lg
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 16, // rounded-2xl base
  },
  shadows: [
    'none',
    '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)', // shadow-xl equivalent
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 35px 60px -15px rgba(0, 0, 0, 0.3)', // shadow-2xl equivalent
    '0 35px 60px -15px rgba(0, 0, 0, 0.3)',
    '0 35px 60px -15px rgba(0, 0, 0, 0.3)',
    '0 35px 60px -15px rgba(0, 0, 0, 0.3)',
    '0 35px 60px -15px rgba(0, 0, 0, 0.3)',
    '0 35px 60px -15px rgba(0, 0, 0, 0.3)',
    '0 35px 60px -15px rgba(0, 0, 0, 0.3)',
    '0 35px 60px -15px rgba(0, 0, 0, 0.3)',
    '0 35px 60px -15px rgba(0, 0, 0, 0.3)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          padding: '12px 24px',
          fontWeight: 600,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
          },
          '&:active': {
            transform: 'scale(0.95)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          backdropFilter: 'blur(4px)',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 9999,
          fontWeight: 600,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.05)',
          },
          '&:active': {
            transform: 'scale(0.95)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 16,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            '& fieldset': {
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
};

export const theme = createTheme(baseThemeOptions);

export const rtlTheme = createTheme({
  ...baseThemeOptions,
  direction: 'rtl',
});
