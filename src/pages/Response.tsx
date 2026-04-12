import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import BlockIcon from '@mui/icons-material/Block';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import ForumIcon from '@mui/icons-material/Forum';
import { Button } from '../components/ui/Button';
import { useApp } from '../context/AppContext';
import { generateResponse, generateFollowUpResponse } from '../services/aiService';
import { useTranslation } from '../locales';
import type { AIResponse, Session, ConversationTurn } from '../types';

const PageContainer = styled(Box)({
  background: '#f7f5f8',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
});

const Header = styled(Box)({
  backdropFilter: 'blur(6px)',
  backgroundColor: 'rgba(255, 255, 255, 0.7)',
  border: '1px solid rgba(168, 85, 247, 0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 17px',
  position: 'sticky',
  top: 0,
  zIndex: 10,
});

const HeaderIconButton = styled(Box)({
  width: 40,
  height: 40,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  borderRadius: '50%',
  '&:hover': {
    backgroundColor: 'rgba(168, 85, 247, 0.05)',
  },
});

const HeroCard = styled(Box)({
  background: 'linear-gradient(152deg, #a855f7 0%, #6b21a8 100%)',
  borderRadius: 48,
  padding: 24,
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  minHeight: 192,
  display: 'flex',
  alignItems: 'flex-end',
});

const HeroBadge = styled(Box)({
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  borderRadius: 9999,
  padding: '3.5px 12px',
  display: 'inline-flex',
});

const GlassCard = styled(Box)({
  backdropFilter: 'blur(6px)',
  backgroundColor: 'rgba(255, 255, 255, 0.7)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: 48,
  padding: 17,
});

const ChecklistItem = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '12px 0',
});

const RedZoneItem = styled(Box)({
  backgroundColor: '#fef2f2',
  border: '1px solid #fee2e2',
  borderRadius: 32,
  padding: 13,
  display: 'flex',
  gap: 16,
  alignItems: 'flex-start',
});

const SpeechBubbleRight = styled(Box)({
  backgroundColor: '#3b82f6',
  borderRadius: '16px 16px 16px 0',
  padding: '16px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  maxWidth: '85%',
  alignSelf: 'flex-end',
});

const SectionHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '0 4px',
});

function splitIntoPoints(text: string): string[] {
  const lines = text
    .split(/[\n•\-–—]/)
    .map(line => line.replace(/^\d+[.)]\s*/, '').trim())
    .filter(line => line.length > 0);
  return lines.length > 0 ? lines : [text];
}

export function Response() {
  const navigate = useNavigate();
  const { currentSession, getChildById, setCurrentSession, saveInteraction, completedInteractions } = useApp();
  const { t, isRTL } = useTranslation();

  const [response, setResponse] = useState<AIResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedbackState, setFeedbackState] = useState<'pending' | 'asking_followup' | 'loading_followup' | 'helped'>('pending');
  const [followUpText, setFollowUpText] = useState('');
  const [conversationHistory, setConversationHistory] = useState<ConversationTurn[]>([]);
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

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
          childData,
          completedInteractions
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

    const newTurn: ConversationTurn = {
      response,
      feedback: 'not_helped',
      followUp: followUpText,
      timestamp: new Date()
    };
    const updatedHistory = [...conversationHistory, newTurn];
    setConversationHistory(updatedHistory);

    setFeedbackState('loading_followup');
    setFollowUpText('');

    try {
      const newResponse = await generateFollowUpResponse(
        currentSession as Session,
        child,
        updatedHistory,
        followUpText,
        completedInteractions
      );
      setResponse(newResponse);
      setCheckedItems(new Set());
      setFeedbackState('pending');
    } catch (error) {
      console.error('Error generating follow-up:', error);
      setFeedbackState('pending');
    }
  };

  const toggleCheckItem = (index: number) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const BackArrow = isRTL ? ArrowForwardIcon : ArrowBackIcon;
  const redZoneIcons = [BlockIcon, VolumeOffIcon, PauseCircleOutlineIcon];

  if (loading) {
    return (
      <PageContainer sx={{ alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={48} sx={{ mb: 2, color: '#a855f7' }} />
        <Typography sx={{ color: '#7c3aed', fontWeight: 600 }}>
          {t.response.processing}
        </Typography>
        <Typography variant="body2" sx={{ color: '#a78bfa', mt: 1, fontWeight: 500 }}>
          {t.response.processingTime}
        </Typography>
      </PageContainer>
    );
  }

  if (!response) {
    return (
      <PageContainer sx={{ alignItems: 'center', justifyContent: 'center', p: 2 }}>
        <Typography sx={{ color: 'text.secondary', mb: 2 }}>
          {t.response.error}
        </Typography>
        <Button onClick={handleHome}>{t.response.backHome}</Button>
      </PageContainer>
    );
  }

  const doNowPoints = splitIntoPoints(response.doNow);
  const dontDoPoints = splitIntoPoints(response.dontDo);

  return (
    <PageContainer>
      {/* Header */}
      <Header>
        <HeaderIconButton onClick={handleHome}>
          <BackArrow sx={{ fontSize: 20, color: '#0f172a' }} />
        </HeaderIconButton>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: 18,
            color: '#0f172a',
            letterSpacing: '-0.45px',
            textAlign: 'center',
            flex: 1,
          }}
        >
          {t.response.title}
        </Typography>
        <HeaderIconButton>
          <InfoOutlinedIcon sx={{ fontSize: 20, color: '#a855f7' }} />
        </HeaderIconButton>
      </Header>

      {/* Main Content */}
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 672, mx: 'auto', width: '100%', pb: 12 }}>
        {/* Hero Card */}
        <HeroCard>
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <HeroBadge sx={{ mb: 1 }}>
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'white',
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                }}
              >
                {isRTL ? 'מדריך מומחה' : 'Expert Guide'}
              </Typography>
            </HeroBadge>
            <Typography
              sx={{
                fontSize: 24,
                fontWeight: 700,
                color: 'white',
                lineHeight: '32px',
                mb: 0.5,
              }}
            >
              {child?.name || (isRTL ? 'הילד שלך' : 'Your Child')}
            </Typography>
            <Typography
              sx={{
                fontSize: 14,
                color: 'rgba(255, 255, 255, 0.8)',
                lineHeight: '20px',
              }}
            >
              {currentSession?.description
                ? currentSession.description.length > 60
                  ? currentSession.description.substring(0, 60) + '...'
                  : currentSession.description
                : ''}
            </Typography>
          </Box>
          {/* Decorative circle */}
          <Box
            sx={{
              position: 'absolute',
              top: -20,
              right: isRTL ? 'auto' : -10,
              left: isRTL ? -10 : 'auto',
              width: 140,
              height: 140,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.08)',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: 20,
              right: isRTL ? 'auto' : 20,
              left: isRTL ? 20 : 'auto',
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.05)',
            }}
          />
        </HeroCard>

        {/* Green Zone: Action Items */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <SectionHeader>
            <CheckCircleIcon sx={{ color: '#10b981', fontSize: 22 }} />
            <Typography sx={{ fontWeight: 700, fontSize: 20, color: '#0f172a', letterSpacing: '-0.5px' }}>
              {t.response.whatToDo}
            </Typography>
          </SectionHeader>
          <GlassCard>
            {doNowPoints.map((point, index) => (
              <ChecklistItem
                key={index}
                onClick={() => toggleCheckItem(index)}
                sx={{
                  cursor: 'pointer',
                  borderBottom: index < doNowPoints.length - 1 ? '1px solid rgba(168, 85, 247, 0.05)' : 'none',
                  '&:hover': { backgroundColor: 'rgba(168, 85, 247, 0.02)' },
                }}
              >
                {checkedItems.has(index) ? (
                  <CheckCircleIcon sx={{ color: '#a855f7', fontSize: 24, flexShrink: 0 }} />
                ) : (
                  <RadioButtonUncheckedIcon sx={{ color: 'rgba(168, 85, 247, 0.3)', fontSize: 24, flexShrink: 0 }} />
                )}
                <Typography
                  sx={{
                    fontSize: 16,
                    color: '#334155',
                    lineHeight: '24px',
                    textDecoration: checkedItems.has(index) ? 'line-through' : 'none',
                    opacity: checkedItems.has(index) ? 0.6 : 1,
                  }}
                >
                  {point}
                </Typography>
              </ChecklistItem>
            ))}
          </GlassCard>
        </Box>

        {/* Red Zone: Things to Avoid */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <SectionHeader>
            <WarningAmberIcon sx={{ color: '#ef4444', fontSize: 22 }} />
            <Typography sx={{ fontWeight: 700, fontSize: 20, color: '#0f172a', letterSpacing: '-0.5px' }}>
              {t.response.whatNotToDo}
            </Typography>
          </SectionHeader>
          <GlassCard sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {dontDoPoints.map((point, index) => {
              const IconComponent = redZoneIcons[index % redZoneIcons.length];
              return (
                <RedZoneItem key={index}>
                  <IconComponent sx={{ color: '#991b1b', fontSize: 20, flexShrink: 0, mt: 0.25 }} />
                  <Typography sx={{ fontSize: 14, color: '#991b1b', lineHeight: '20px' }}>
                    {point}
                  </Typography>
                </RedZoneItem>
              );
            })}
          </GlassCard>
        </Box>

        {/* Blue Zone: Scripts */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <SectionHeader>
            <ForumIcon sx={{ color: '#3b82f6', fontSize: 22 }} />
            <Typography sx={{ fontWeight: 700, fontSize: 20, color: '#0f172a', letterSpacing: '-0.5px' }}>
              {t.response.whatToSay}
            </Typography>
          </SectionHeader>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: isRTL ? 'flex-start' : 'flex-end' }}>
              <SpeechBubbleRight sx={{ borderRadius: isRTL ? '16px 16px 0 16px' : '16px 16px 16px 0' }}>
                <Typography sx={{ fontSize: 14, fontWeight: 500, color: 'white', lineHeight: '20px' }}>
                  "{response.sayThis}"
                </Typography>
              </SpeechBubbleRight>
              <Typography
                sx={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  mt: 0.5,
                  px: 1,
                }}
              >
                {isRTL ? 'תסריט לשימוש' : 'Script to use'}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Feedback Section */}
        {feedbackState === 'pending' && (
          <Box sx={{ mt: 1 }}>
            <Typography sx={{ textAlign: 'center', color: '#64748b', mb: 1.5, fontSize: 15 }}>
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
          <GlassCard sx={{ borderRadius: 6 }}>
            <Typography sx={{ color: '#64748b', mb: 1.5, fontSize: 14 }}>
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
                  backgroundColor: 'rgba(255, 255, 255, 0.5)',
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
          </GlassCard>
        )}

        {feedbackState === 'loading_followup' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
            <CircularProgress size={32} sx={{ mb: 1, color: '#a855f7' }} />
            <Typography variant="body2" sx={{ color: '#a855f7' }}>
              {t.response.thinkingNewApproach}
            </Typography>
          </Box>
        )}

        {feedbackState === 'helped' && (
          <Box sx={{ textAlign: 'center', py: 1 }}>
            <Typography sx={{ color: '#10b981', fontWeight: 500 }}>
              {t.response.gladToHelp}
            </Typography>
          </Box>
        )}

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
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
            color: '#a78bfa',
            fontWeight: 500,
            pb: 2,
          }}
        >
          {t.common.disclaimer}
        </Typography>
      </Box>
    </PageContainer>
  );
}
