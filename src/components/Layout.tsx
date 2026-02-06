import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, IconButton } from '@mui/material';
import { SettingsButton } from './SettingsButton';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show logo on landing page or home page
  const showLogo = location.pathname !== '/' && location.pathname !== '/home';

  return (
    <Box sx={{ position: 'relative' }}>
      <Box
        style={{
          position: 'fixed',
          left: 16,
          right: 'auto',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          top: 'calc(env(safe-area-inset-top) + 16px)',
        }}
      >
        <SettingsButton />
        {showLogo && (
          <IconButton
            onClick={() => navigate('/home')}
            title="Home"
            sx={{
              width: 40,
              height: 40,
              p: 0,
              overflow: 'hidden',
              '&:hover': {
                opacity: 0.8,
              },
            }}
          >
            <Box
              component="img"
              src="/logo.png"
              alt="Home"
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '50%',
              }}
            />
          </IconButton>
        )}
      </Box>
      {children}
    </Box>
  );
}
