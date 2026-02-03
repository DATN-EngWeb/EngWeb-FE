import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#532822',
      light: '#7a3f37',
      dark: '#3d1e19',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FF854B',
      light: '#FFA875',
      dark: '#E6652B',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#43A574',
      light: '#6BB58F',
      dark: '#2E7D52',
      pastel: '#E8F5E9',
      highlight: '#33E4D3',
      greenLight: '#D9F6A3',
      green_dark: '#0F655D',
      main_dark: '#51740F',
    },
    warning: {
      main: '#FFC83D',
      light: '#FFDC7A',
      dark: '#E6B84A',
      pastel: '#FFF8E1',
    },
    info: {
      main: '#89C0FF',
      light: '#A8D2FF',
      dark: '#6A9EE6',
      pastel: '#E3F2FD',
    },
    error: {
      main: '#FF939A',
      light: '#FFB3B8',
      dark: '#E6737A',
      pastel: '#FFEBEE',
    },
    purple: {
      main: '#A569BD',
      light: '#C288D6',
      dark: '#884EA0',
      pastel: '#F3E5F5',
    },
    background: {
      default: '#FFF4E9',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#383838',
      secondary: '#383838',
    },
    natural: {
      main: '#FFF4E9',
    },
    darkGrey: {
      main: '#383838',
      light: '#6e7575ff',
    },
    orange: {
      main: '#FF854B',
    },
    yellow: {
      main: '#FFD25A',
    },
    green: {
      main: '#43A574',
    },
    blue: {
      main: '#89C0FF',
    },
    pink: {
      main: '#FF939A',
    },
  },
  typography: {
    fontFamily:
      'Poppins, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, sans-serif',
    h1: {
      fontSize: '3rem',
      fontWeight: 'bold',
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '2rem',
      fontWeight: 'bold',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
    },
    body1: {
      fontSize: '1.1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          fontFamily:
            'Poppins, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, sans-serif',
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          fontFamily:
            'Poppins, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, sans-serif',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 600,
          fontFamily:
            'Poppins, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, sans-serif',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          fontFamily:
            'Poppins, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, sans-serif',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

export default theme;
