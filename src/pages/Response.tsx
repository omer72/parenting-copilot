import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Container, CircularProgress, TextField, type Theme } from '@mui/material';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useApp } from '../context/AppContext';
import { generateResponse, generateFollowUpResponse } from '../services/aiService';
import { useTranslation } from '../locales';
import type { AIResponse, Session, ConversationTurn } from '../types';

export function Response() {
  const navigate = useNavigate();
  const { currentSession, getChildById, setCurrentSession, saveInteraction } = useApp();
  const { t, isRTL } = useTranslation();

  const [response, setResponse] = useState<AIResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedbackState, setFeedbackState] = useState<'pending' | 'asking_followup' | 'loading_followup' | 'helped'>('pending');
  const [followUpText, setFollowUpText] = useState('');
  const [conversationHistory, setConversationHistory] = useState<ConversationTurn[]>([]);

  const child = currentSession?.childId ? getChildById(currentSession.childId) : null;

  useEffect(() => {
    async function fetchResponse() {
      if (!currentSession?.childId || !currentSession?.context || !currentSession?.description) {
        navigate('/home');
        return;
      }

      const childData = getChildById(currentSession.childId);
      if (!childData) {
        navigate('/home');
        return;
      }

      try {
        const aiResponse = await generateResponse(
          currentSession as Session,
          childData
        );
        setResponse(aiResponse);
      } catch (error) {
        console.error('Error generating response:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchResponse();
  }, [currentSession, getChildById, navigate]);

  const saveCurrentInteraction = (resolved: boolean) => {
    if (response && currentSession?.childId && currentSession?.context && currentSession?.description) {
      const finalHistory = feedbackState === 'pending'
        ? [...conversationHistory, { response, timestamp: new Date() }]
        : conversationHistory;

      saveInteraction({
        timestamp: new Date(),
        childId: currentSession.childId,
        context: currentSession.context,
        description: currentSession.description,
        clarifications: currentSession.clarifications || [],
        responses: finalHistory,
        resolved
      });
    }
  };

  const handleNewSituation = () => {
    if (feedbackState !== 'helped') {
      saveCurrentInteraction(false);
    }
    setCurrentSession(null);
    navigate('/select-child');
  };

  const handleHome = () => {
    if (feedbackState !== 'helped') {
      saveCurrentInteraction(false);
    }
    setCurrentSession(null);
    navigate('/home');
  };

  const handleHelped = () => {
    if (response) {
      const finalTurn: ConversationTurn = {
        response,
        feedback: 'helped',
        timestamp: new Date()
      };
      setConversationHistory(prev => [...prev, finalTurn]);

      // Save interaction for daily report
      if (currentSession?.childId && currentSession?.context && currentSession?.description) {
        saveInteraction({
          timestamp: new Date(),
          childId: currentSession.childId,
          context: currentSession.context,
          description: currentSession.description,
          clarifications: currentSession.clarifications || [],
          responses: [...conversationHistory, finalTurn],
          resolved: true
        });
      }
    }
    setFeedbackState('helped');
  };

  const handleNotHelped = () => {
    setFeedbackState('asking_followup');
  };

  const handleSubmitFollowUp = async () => {
    if (!followUpText.trim() || !response || !currentSession || !child) return;

    // Save current response to history
    const newTurn: ConversationTurn = {
      response,
      feedback: 'not_helped',
      followUp: followUpText,
      timestamp: new Date()
    };
    const updatedHistory = [...conversationHistory, newTurn];
    setConversationHistory(updatedHistory);

    // Reset for new response
    setFeedbackState('loading_followup');
    setFollowUpText('');

    try {
      const newResponse = await generateFollowUpResponse(
        currentSession as Session,
        child,
        updatedHistory,
        followUpText
      );
      setResponse(newResponse);
      setFeedbackState('pending');
    } catch (error) {
      console.error('Error generating follow-up:', error);
      setFeedbackState('pending');
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress size={48} sx={{ mb: 2, color: 'primary.main' }} />
        <Typography sx={{ color: 'primary.dark', fontWeight: 600 }}>
          {t.response.processing}
        </Typography>
        <Typography variant="body2" sx={{ color: 'primary.light', mt: 1, fontWeight: 500 }}>
          {t.response.processingTime}
        </Typography>
      </Box>
    );
  }

  if (!response) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography sx={{ color: 'text.secondary', mb: 2 }}>
          {t.response.error}
        </Typography>
        <Button onClick={handleHome}>{t.response.backHome}</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', p: 2 }}>
      <Container maxWidth="sm">
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
          {t.response.title}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Card
            sx={{
              ...(isRTL ? { borderRight: 4 } : { borderLeft: 4 }),
              borderColor: 'success.main',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <Typography sx={{ fontSize: '1.5rem' }}>🟢</Typography>
              <Box>
                <Typography sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                  {t.response.whatToDo}
                </Typography>
                <Typography color="text.secondary">{response.doNow}</Typography>
              </Box>
            </Box>
          </Card>

          <Card
            sx={{
              ...(isRTL ? { borderRight: 4 } : { borderLeft: 4 }),
              borderColor: 'error.main',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <Typography sx={{ fontSize: '1.5rem' }}>🔴</Typography>
              <Box>
                <Typography sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                  {t.response.whatNotToDo}
                </Typography>
                <Typography color="text.secondary">{response.dontDo}</Typography>
              </Box>
            </Box>
          </Card>

          <Card
            sx={{
              ...(isRTL ? { borderRight: 4 } : { borderLeft: 4 }),
              borderColor: 'info.main',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <Typography sx={{ fontSize: '1.5rem' }}>🔵</Typography>
              <Box>
                <Typography sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                  {t.response.whatToSay}
                </Typography>
                <Typography color="text.secondary" sx={{ fontWeight: 500 }}>
                  "{response.sayThis}"
                </Typography>
              </Box>
            </Box>
          </Card>
        </Box>

        {/* Feedback Section */}
        {feedbackState === 'pending' && (
          <Box sx={{ mt: 3 }}>
            <Typography sx={{ textAlign: 'center', color: 'text.secondary', mb: 1.5 }}>
              {t.response.didItHelp}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center' }}>
              <Button onClick={handleHelped} variant="outline" sx={{ flex: 1, maxWidth: 140 }}>
                {t.response.helped}
              </Button>
              <Button onClick={handleNotHelped} variant="outline" sx={{ flex: 1, maxWidth: 140 }}>
                {t.response.notHelped}
              </Button>
            </Box>
          </Box>
        )}

        {feedbackState === 'asking_followup' && (
          <Box sx={{ mt: 3 }}>
            <Card
              sx={{
                bgcolor: (theme: Theme) => theme.palette.primary.light + '20',
                borderColor: 'primary.light',
              }}
            >
              <Typography color="text.secondary" sx={{ mb: 1.5 }}>
                {t.response.followUpPrompt}
              </Typography>
              <TextField
                value={followUpText}
                onChange={(e) => setFollowUpText(e.target.value)}
                placeholder={t.response.followUpPlaceholder}
                multiline
                rows={3}
                fullWidth
                dir={isRTL ? 'rtl' : 'ltr'}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
              <Box sx={{ display: 'flex', gap: 1.5, mt: 1.5 }}>
                <Button onClick={handleSubmitFollowUp} disabled={!followUpText.trim()} sx={{ flex: 1 }}>
                  {t.common.send}
                </Button>
                <Button onClick={() => setFeedbackState('pending')} variant="outline">
                  {t.common.cancel}
                </Button>
              </Box>
            </Card>
          </Box>
        )}

        {feedbackState === 'loading_followup' && (
          <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CircularProgress size={32} sx={{ mb: 1, color: 'primary.main' }} />
            <Typography variant="body2" sx={{ color: 'primary.main' }}>
              {t.response.thinkingNewApproach}
            </Typography>
          </Box>
        )}

        {feedbackState === 'helped' && (
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography sx={{ color: 'success.main', fontWeight: 500 }}>
              {t.response.gladToHelp}
            </Typography>
          </Box>
        )}

        <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Button onClick={handleNewSituation} fullWidth>
            {t.response.newSituation}
          </Button>
          <Button onClick={handleHome} variant="outline" fullWidth>
            {t.response.backHome}
          </Button>
        </Box>

        <Typography
          variant="body2"
          sx={{
            textAlign: 'center',
            color: 'primary.light',
            mt: 3,
            fontWeight: 500,
          }}
        >
          {t.common.disclaimer}
        </Typography>
      </Container>
    </Box>
  );
}
