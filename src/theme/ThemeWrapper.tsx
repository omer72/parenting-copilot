import { useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';
import { prefixer } from 'stylis';
import { useLanguage } from '../locales';
import { theme, rtlTheme } from './muiTheme';

interface ThemeWrapperProps {
  children: React.ReactNode;
}

export function ThemeWrapper({ children }: ThemeWrapperProps) {
  const { isRTL } = useLanguage();

  const cache = useMemo(() => {
    if (isRTL) {
      return createCache({
        key: 'muirtl',
        stylisPlugins: [prefixer, rtlPlugin],
      });
    }
    return createCache({
      key: 'mui',
    });
  }, [isRTL]);

  const currentTheme = isRTL ? rtlTheme : theme;

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={currentTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
