import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ff5c00',
    },
    secondary: {
      main: '#ffbb33',
    },
    background: {
      default: '#121212',
      paper: '#1a1a1a',
    },
    text: {
      primary: '#ffffff',
      secondary: '#ffbb33',
    },
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    body1: {
      fontWeight: 400,
      fontSize: '1rem',
    },
  },
});
