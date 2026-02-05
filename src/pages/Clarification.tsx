import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Container, type Theme } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { Card } from '../components/ui/Card';
import { useApp } from '../context/AppContext';
import { getClarificationQuestions } from '../services/aiService';
import { useTranslation } from '../locales';

export function Clarification() {
  const navigate = useNavigate();
  const { currentSession, updateSession } = useApp();
  const { t, isRTL } = useTranslation();

  const questions = useMemo(() => {
    if (currentSession?.description && currentSession?.context) {
      return getClarificationQuestions(
        currentSession.description,
        {
          location: currentSession.context.location,
          presence: currentSession.context.presence,
        }
      );
    }
    return [];
  }, [currentSession]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ question: string; answer: string }[]>([]);

  useEffect(() => {
    // If no questions, skip to response
    if (questions.length === 0 && currentSession?.description) {
      navigate('/response');
    }
  }, [questions, currentSession, navigate]);

  const handleAnswer = (answer: string) => {
    const newAnswers = [
      ...answers,
      { question: questions[currentQuestionIndex], answer },
    ];
    setAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      updateSession({ clarifications: newAnswers });
      navigate('/response');
    }
  };

  const handleSkip = () => {
    updateSession({ clarifications: answers });
    navigate('/response');
  };

  if (questions.length === 0) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography color="text.secondary">{t.common.loading}</Typography>
      </Box>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  const quickAnswers = [
    t.clarification.yes,
    t.clarification.no,
    t.clarification.sometimes,
    t.clarification.notSure,
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

        {/* Progress indicator */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          {questions.map((_, index) => (
            <Box
              key={index}
              sx={{
                height: 8,
                flex: 1,
                borderRadius: 4,
                transition: 'all 0.3s',
                background: index <= currentQuestionIndex
                  ? 'var(--gradient-primary)'
                  : (theme: Theme) => theme.palette.primary.light + '40',
              }}
            />
          ))}
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
          {t.clarification.title}
        </Typography>

        <Card sx={{ mb: 3 }}>
          <Typography
            sx={{
              fontSize: '1.125rem',
              fontWeight: 600,
              color: 'primary.dark',
            }}
          >
            {currentQuestion}
          </Typography>
        </Card>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {quickAnswers.map(answer => (
              <Chip
                key={answer}
                label={answer}
                onClick={() => handleAnswer(answer)}
              />
            ))}
          </Box>

          <Button
            variant="outline"
            fullWidth
            onClick={handleSkip}
          >
            {t.clarification.skipAndContinue}
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
