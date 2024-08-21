import { AppProps } from 'next/app';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from '../theme';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
