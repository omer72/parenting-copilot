import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Container, IconButton, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Input';
import { useApp } from '../context/AppContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useTranslation } from '../locales';

export function Describe() {
  const navigate = useNavigate();
  const { updateSession, getChildById, currentSession } = useApp();
  const { t, isRTL } = useTranslation();

  const child = currentSession?.childId ? getChildById(currentSession.childId) : null;

  const [description, setDescription] = useState('');
  const {
    isListening,
    transcript,
    isSupported,
    isTranscribing,
    startListening,
    stopListening
  } = useSpeechRecognition();

  // Update description when transcript changes from speech recognition
  useEffect(() => {
    if (transcript) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing external speech input to state
      setDescription(prev => (prev + ' ' + transcript).trim());
    }
  }, [transcript]);

  const canContinue = description.trim().length >= 10;

  const handleContinue = () => {
    if (!canContinue) return;

    updateSession({
      description: description.trim(),
      clarifications: [],
    });

    navigate('/clarification');
  };

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
            mb: 1,
          }}
        >
          {t.describe.title}
        </Typography>
        <Typography
          sx={{
            color: 'primary.dark',
            mb: 3,
            fontWeight: 500,
          }}
        >
          {t.describe.subtitle}
        </Typography>

        <Box sx={{ position: 'relative' }}>
          <Textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder={t.describe.placeholder}
            rows={6}
            sx={{ fontSize: '1.125rem' }}
          />

          {isSupported && (
            <IconButton
              onClick={isListening ? stopListening : startListening}
              disabled={isTranscribing}
              sx={{
                position: 'absolute',
                ...(isRTL ? { left: 12 } : { right: 12 }),
                bottom: 12,
                p: 1.5,
                boxShadow: 3,
                transition: 'all 0.3s',
                background: isTranscribing
                  ? 'linear-gradient(to right, #3b82f6, #8b5cf6)'
                  : isListening
                  ? 'linear-gradient(to right, #ef4444, #ec4899)'
                  : 'var(--gradient-primary)',
                color: 'white',
                animation: (isTranscribing || isListening) ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.7 },
                },
                '&:hover': {
                  boxShadow: 6,
                  background: isTranscribing
                    ? 'linear-gradient(to right, #2563eb, #7c3aed)'
                    : isListening
                    ? 'linear-gradient(to right, #dc2626, #db2777)'
                    : 'var(--gradient-primary-hover)',
                },
                '&:disabled': {
                  opacity: 0.75,
                  color: 'white',
                },
              }}
              title={isTranscribing ? t.describe.transcribing : isListening ? t.describe.stopRecording : t.describe.voiceRecording}
            >
              {isTranscribing ? (
                <CircularProgress size={20} sx={{ color: 'white' }} />
              ) : isListening ? (
                <StopIcon />
              ) : (
                <MicIcon />
              )}
            </IconButton>
          )}
        </Box>

        {(isListening || isTranscribing) && (
          <Typography
            variant="body2"
            sx={{
              mt: 1,
              fontWeight: 500,
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.5 },
              },
              color: isTranscribing ? 'info.main' : 'error.main',
            }}
          >
            {isTranscribing ? t.describe.transcribing : t.describe.recording}
          </Typography>
        )}

        <Typography
          variant="body2"
          sx={{ color: 'primary.light', mt: 1, fontWeight: 500 }}
        >
          {t.describe.characters.replace('{count}', String(description.length))}
        </Typography>

        <Button
          onClick={handleContinue}
          fullWidth
          disabled={!canContinue}
          sx={{ mt: 3 }}
        >
          {t.common.continue}
        </Button>
      </Container>
    </Box>
  );
}
