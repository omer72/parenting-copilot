import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
        navigate('/');
        return;
      }

      const childData = getChildById(currentSession.childId);
      if (!childData) {
        navigate('/');
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
    navigate('/');
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
      <div className="min-h-screen p-4 flex flex-col items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mb-4" />
        <p className="text-purple-700 font-semibold">{t.response.processing}</p>
        <p className="text-purple-400 text-sm mt-2 font-medium">{t.response.processingTime}</p>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="min-h-screen p-4 flex flex-col items-center justify-center">
        <p className="text-gray-600 mb-4">{t.response.error}</p>
        <Button onClick={handleHome}>{t.response.backHome}</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-md mx-auto">
        {child && (
          <p className="text-purple-600 font-bold mb-2 text-lg">{child.name}</p>
        )}

        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
          {t.response.title}
        </h1>

        <div className="space-y-4">
          <Card className={`${isRTL ? 'border-r-4' : 'border-l-4'} border-green-500`}>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🟢</span>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{t.response.whatToDo}</h3>
                <p className="text-gray-700">{response.doNow}</p>
              </div>
            </div>
          </Card>

          <Card className={`${isRTL ? 'border-r-4' : 'border-l-4'} border-red-500`}>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔴</span>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{t.response.whatNotToDo}</h3>
                <p className="text-gray-700">{response.dontDo}</p>
              </div>
            </div>
          </Card>

          <Card className={`${isRTL ? 'border-r-4' : 'border-l-4'} border-blue-500`}>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔵</span>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{t.response.whatToSay}</h3>
                <p className="text-gray-700 font-medium">"{response.sayThis}"</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Feedback Section */}
        {feedbackState === 'pending' && (
          <div className="mt-6">
            <p className="text-center text-gray-600 mb-3">{t.response.didItHelp}</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={handleHelped} variant="outline" className="flex-1 max-w-[140px]">
                {t.response.helped}
              </Button>
              <Button onClick={handleNotHelped} variant="outline" className="flex-1 max-w-[140px]">
                {t.response.notHelped}
              </Button>
            </div>
          </div>
        )}

        {feedbackState === 'asking_followup' && (
          <div className="mt-6">
            <Card className="bg-purple-50 border-purple-200">
              <p className="text-gray-700 mb-3">{t.response.followUpPrompt}</p>
              <textarea
                value={followUpText}
                onChange={(e) => setFollowUpText(e.target.value)}
                placeholder={t.response.followUpPlaceholder}
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={3}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
              <div className="flex gap-3 mt-3">
                <Button onClick={handleSubmitFollowUp} disabled={!followUpText.trim()} className="flex-1">
                  {t.common.send}
                </Button>
                <Button onClick={() => setFeedbackState('pending')} variant="outline">
                  {t.common.cancel}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {feedbackState === 'loading_followup' && (
          <div className="mt-6 flex flex-col items-center">
            <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mb-2" />
            <p className="text-purple-600 text-sm">{t.response.thinkingNewApproach}</p>
          </div>
        )}

        {feedbackState === 'helped' && (
          <div className="mt-6 text-center">
            <p className="text-green-600 font-medium">{t.response.gladToHelp}</p>
          </div>
        )}

        <div className="mt-8 space-y-3">
          <Button onClick={handleNewSituation} fullWidth>
            {t.response.newSituation}
          </Button>
          <Button onClick={handleHome} variant="outline" fullWidth>
            {t.response.backHome}
          </Button>
        </div>

        <p className="text-center text-sm text-purple-400 mt-6 font-medium">
          {t.common.disclaimer}
        </p>
      </div>
    </div>
  );
}
