import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Container } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../locales';
import type { Location, Presence, EmotionalState, ChildPhysicalState, Frequency } from '../types';

export function Context() {
  const navigate = useNavigate();
  const { updateSession, getChildById, currentSession } = useApp();
  const { t, isRTL } = useTranslation();

  const child = currentSession?.childId ? getChildById(currentSession.childId) : null;

  const [location, setLocation] = useState<Location | null>(null);
  const [presence, setPresence] = useState<Presence | null>(null);
  const [emotionalState, setEmotionalState] = useState<EmotionalState | null>(null);
  const [childPhysicalState, setChildPhysicalState] = useState<ChildPhysicalState | null>(null);
  const [frequency, setFrequency] = useState<Frequency | null>(null);

  const isComplete = location && presence && emotionalState && childPhysicalState && frequency;

  const handleContinue = () => {
    if (!isComplete) return;

    updateSession({
      context: {
        location,
        presence,
        emotionalState,
        childPhysicalState,
        frequency,
      },
    });
    navigate('/describe');
  };

  const locationOptions: { key: Location; label: string }[] = [
    { key: 'home', label: t.context.locations.home },
    { key: 'street', label: t.context.locations.street },
    { key: 'car', label: t.context.locations.car },
    { key: 'mall', label: t.context.locations.mall },
    { key: 'restaurant', label: t.context.locations.restaurant },
  ];

  const presenceOptions: { key: Presence; label: string }[] = [
    { key: 'alone', label: t.context.presence.alone },
    { key: 'spouse', label: t.context.presence.spouse },
    { key: 'other_adults', label: t.context.presence.other_adults },
    { key: 'strangers', label: t.context.presence.strangers },
  ];

  const emotionalStateOptions: { key: EmotionalState; label: string }[] = [
    { key: 'calm', label: t.context.emotionalState.calm },
    { key: 'frustrated', label: t.context.emotionalState.frustrated },
    { key: 'angry', label: t.context.emotionalState.angry },
    { key: 'anxious', label: t.context.emotionalState.anxious },
  ];

  const childPhysicalStateOptions: { key: ChildPhysicalState; label: string }[] = [
    { key: 'fine', label: t.context.childPhysicalState.fine },
    { key: 'hungry', label: t.context.childPhysicalState.hungry },
    { key: 'tired', label: t.context.childPhysicalState.tired },
    { key: 'sick', label: t.context.childPhysicalState.sick },
  ];

  const frequencyOptions: { key: Frequency; label: string }[] = [
    { key: 'first_time', label: t.context.frequency.first_time },
    { key: 'sometimes', label: t.context.frequency.sometimes },
    { key: 'often', label: t.context.frequency.often },
  ];

  return (
    <Box sx={{ minHeight: '100vh', p: 2 }}>
      <Container maxWidth="sm">
        <Box
          component="button"
          onClick={() => navigate(-1)}
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

        {child && (
          <Typography
            sx={{
              color: 'primary.main',
              fontWeight: 700,
              mb: 1,
              fontSize: '1.125rem',
            }}
          >
            {child.name}
          </Typography>
        )}

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
          {t.context.title}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, color: 'primary.dark', mb: 1.5 }}
            >
              {t.context.location}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {locationOptions.map(({ key, label }) => (
                <Chip
                  key={key}
                  label={label}
                  selected={location === key}
                  onClick={() => setLocation(key)}
                />
              ))}
            </Box>
          </Box>

          <Box>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, color: 'primary.dark', mb: 1.5 }}
            >
              {t.context.whoPresent}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {presenceOptions.map(({ key, label }) => (
                <Chip
                  key={key}
                  label={label}
                  selected={presence === key}
                  onClick={() => setPresence(key)}
                />
              ))}
            </Box>
          </Box>

          <Box>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, color: 'primary.dark', mb: 1.5 }}
            >
              {t.context.yourMood}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {emotionalStateOptions.map(({ key, label }) => (
                <Chip
                  key={key}
                  label={label}
                  selected={emotionalState === key}
                  onClick={() => setEmotionalState(key)}
                />
              ))}
            </Box>
          </Box>

          <Box>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, color: 'primary.dark', mb: 1.5 }}
            >
              {t.context.childState}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {childPhysicalStateOptions.map(({ key, label }) => (
                <Chip
                  key={key}
                  label={label}
                  selected={childPhysicalState === key}
                  onClick={() => setChildPhysicalState(key)}
                />
              ))}
            </Box>
          </Box>

          <Box>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, color: 'primary.dark', mb: 1.5 }}
            >
              {t.context.frequencyLabel}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {frequencyOptions.map(({ key, label }) => (
                <Chip
                  key={key}
                  label={label}
                  selected={frequency === key}
                  onClick={() => setFrequency(key)}
                />
              ))}
            </Box>
          </Box>
        </Box>

        <Button
          onClick={handleContinue}
          fullWidth
          disabled={!isComplete}
          sx={{ mt: 4 }}
        >
          {t.common.continue}
        </Button>
      </Container>
    </Box>
  );
}
