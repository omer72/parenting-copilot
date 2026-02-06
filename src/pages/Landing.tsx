import { useNavigate } from 'react-router-dom';
import { Box, Typography, Container } from '@mui/material';
import { Button } from '../components/ui/Button';
import { useTranslation } from '../locales';

export function Landing() {
  const navigate = useNavigate();
  const { t, isRTL } = useTranslation();

  const handleEnter = () => {
    navigate('/home');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        p: 3,
        pb: 4,
        overflow: 'auto',
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          textAlign: 'center',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {/* Logo */}
        <Box sx={{ mb: 3 }}>
          <Box
            component="img"
            src="/logo.png"
            alt="Kidsit.ai"
            sx={{
              width: 192,
              height: 192,
              mx: 'auto',
              objectFit: 'contain',
            }}
          />
        </Box>

        {/* Title */}
        <Typography
          variant="h1"
          sx={{
            fontSize: '2.25rem',
            fontWeight: 700,
            background: 'var(--gradient-primary)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            mb: 2,
          }}
        >
          {t.landing.title}
        </Typography>

        {/* Subtitle */}
        <Typography
          variant="h5"
          sx={{
            color: 'text.secondary',
            mb: 4,
            fontWeight: 400,
          }}
        >
          {t.landing.subtitle}
        </Typography>

        {/* Features */}
        <Box
          sx={{
            textAlign: isRTL ? 'right' : 'left',
            mb: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {t.landing.features.map((feature, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                flexDirection: isRTL ? 'row-reverse' : 'row',
                alignItems: 'flex-start',
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.75rem',
                  flexShrink: 0,
                }}
              >
                {feature.icon}
              </Box>
              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 600, color: 'text.primary' }}
                >
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>

        {/* CTA Button */}
        <Button
          onClick={handleEnter}
          fullWidth
          sx={{ fontSize: '1.125rem', py: 2 }}
        >
          {t.landing.enterButton}
        </Button>

        {/* Disclaimer */}
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            mt: 3,
            opacity: 0.7,
          }}
        >
          {t.common.disclaimer}
        </Typography>
      </Container>
    </Box>
  );
}
