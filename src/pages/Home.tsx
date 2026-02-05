import { useNavigate } from 'react-router-dom';
import { Box, Typography, Container, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../locales';

export function Home() {
  const navigate = useNavigate();
  const { children, setCurrentSession } = useApp();
  const { t } = useTranslation();

  const handleNewSituation = () => {
    setCurrentSession(null);
    if (children.length === 0) {
      navigate('/child');
    } else {
      navigate('/select-child');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 4,
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Box
            component="img"
            src="/logo.png"
            alt="kidsit.ai"
            sx={{
              width: 288,
              height: 288,
              mx: 'auto',
              objectFit: 'contain',
            }}
          />
        </Box>

        <Button
          onClick={handleNewSituation}
          fullWidth
          sx={{ fontSize: '1.125rem', py: 2 }}
        >
          {t.home.situationButton}
        </Button>

        {children.length > 0 && (
          <Card sx={{ width: '100%' }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: 'primary.dark',
                mb: 2,
              }}
            >
              {t.home.myChildren}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {children.map((child) => (
                <Box
                  key={child.id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 1.5,
                    background: 'linear-gradient(to right, rgba(139, 92, 246, 0.05), rgba(236, 72, 153, 0.05))',
                    borderRadius: 4,
                    border: '1px solid',
                    borderColor: 'primary.light',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      sx={{ fontWeight: 600, color: 'primary.dark' }}
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
                  <IconButton
                    onClick={() => navigate(`/child/${child.id}`)}
                    title={t.editChild.title}
                    size="small"
                    sx={{
                      color: 'primary.light',
                      '&:hover': {
                        color: 'primary.main',
                      },
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
            <Button
              variant="outline"
              fullWidth
              onClick={() => navigate('/child')}
              sx={{ mt: 1.5 }}
            >
              {t.home.addChild}
            </Button>
          </Card>
        )}

        {children.length > 0 && (
          <Button
            variant="outline"
            fullWidth
            onClick={() => navigate('/daily-report')}
          >
            {t.home.dailyReport}
          </Button>
        )}
      </Container>

      <Typography
        variant="body2"
        sx={{
          textAlign: 'center',
          color: 'primary.light',
          mt: 4,
          fontWeight: 500,
        }}
      >
        {t.common.disclaimer}
      </Typography>
    </Box>
  );
}
