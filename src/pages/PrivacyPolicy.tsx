import { useNavigate } from 'react-router-dom';
import { Box, Typography, Container, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useTranslation } from '../locales';

export function PrivacyPolicy() {
  const navigate = useNavigate();
  const { t, isRTL } = useTranslation();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        p: 3,
        pb: 4,
        overflow: 'auto',
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBackIcon sx={{ transform: isRTL ? 'scaleX(-1)' : 'none' }} />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {t.privacyPolicy.title}
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t.privacyPolicy.lastUpdated}
        </Typography>

        <Typography variant="body1" sx={{ mb: 3 }}>
          {t.privacyPolicy.intro}
        </Typography>

        {t.privacyPolicy.sections.map((section, index) => (
          <Box key={index} sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              {section.title}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {section.content}
            </Typography>
          </Box>
        ))}
      </Container>
    </Box>
  );
}
