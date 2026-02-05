import { useNavigate } from 'react-router-dom';
import { Box, Typography, Container } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../locales';

export function SelectChild() {
  const navigate = useNavigate();
  const { children, updateSession } = useApp();
  const { t, isRTL } = useTranslation();

  const handleSelectChild = (childId: string) => {
    updateSession({ childId });
    navigate('/context');
  };

  return (
    <Box sx={{ minHeight: '100vh', p: 2 }}>
      <Container maxWidth="sm">
        <Box
          component="button"
          onClick={() => navigate('/home')}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            color: 'primary.main',
            fontWeight: 500,
            mb: 2,
            cursor: 'pointer',
            background: 'none',
            border: 'none',
            transition: 'color 0.2s',
            '&:hover': { color: 'primary.dark' },
          }}
        >
          {isRTL ? <ArrowForwardIcon fontSize="small" /> : <ArrowBackIcon fontSize="small" />}
          <span>{t.common.back}</span>
        </Box>

        <Typography
          variant="h1"
          sx={{
            fontSize: '1.875rem',
            fontWeight: 700,
            background: 'var(--gradient-primary)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            mb: 3,
          }}
        >
          {t.selectChild.title}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {children.map((child) => (
            <Card key={child.id} onClick={() => handleSelectChild(child.id)}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: 'primary.dark' }}
                  >
                    {child.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: 'primary.main', fontWeight: 500 }}
                  >
                    {t.common.ageValue.replace('{age}', String(child.age))}
                  </Typography>
                </Box>
                <Typography
                  sx={{ fontSize: '1.5rem', color: 'primary.main' }}
                >
                  {isRTL ? '←' : '→'}
                </Typography>
              </Box>
            </Card>
          ))}
        </Box>

        <Button
          variant="outline"
          fullWidth
          onClick={() => navigate('/child')}
          sx={{ mt: 3 }}
        >
          {t.selectChild.addNewChild}
        </Button>
      </Container>
    </Box>
  );
}
