import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ff007a',
    },
    background: {
      default: '#1c1c28',
      paper: '#21212b',
    },
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
  },
});
