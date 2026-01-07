import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useApp } from '../context/AppContext';
import { generateResponse } from '../services/aiService';
import type { AIResponse, Session } from '../types';

export function Response() {
  const navigate = useNavigate();
  const { currentSession, getChildById, setCurrentSession } = useApp();

  const [response, setResponse] = useState<AIResponse | null>(null);
  const [loading, setLoading] = useState(true);

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

  const handleNewSituation = () => {
    setCurrentSession(null);
    navigate('/select-child');
  };

  const handleHome = () => {
    setCurrentSession(null);
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 flex flex-col items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mb-4" />
        <p className="text-gray-600">מעבד את הסיטואציה...</p>
        <p className="text-gray-400 text-sm mt-2">זה לוקח 5-10 שניות</p>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="min-h-screen p-4 flex flex-col items-center justify-center">
        <p className="text-gray-600 mb-4">משהו השתבש</p>
        <Button onClick={handleHome}>חזרה הביתה</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-md mx-auto">
        {child && (
          <p className="text-indigo-600 font-medium mb-2">{child.name}</p>
        )}

        <h1 className="text-2xl font-bold text-gray-900 mb-6">הנה מה לעשות</h1>

        <div className="space-y-4">
          <Card className="border-r-4 border-green-500">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🟢</span>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">מה לעשות עכשיו</h3>
                <p className="text-gray-700">{response.doNow}</p>
              </div>
            </div>
          </Card>

          <Card className="border-r-4 border-red-500">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔴</span>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">מה לא לעשות</h3>
                <p className="text-gray-700">{response.dontDo}</p>
              </div>
            </div>
          </Card>

          <Card className="border-r-4 border-blue-500">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔵</span>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">מה לומר</h3>
                <p className="text-gray-700 font-medium">"{response.sayThis}"</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-8 space-y-3">
          <Button onClick={handleNewSituation} fullWidth>
            סיטואציה חדשה
          </Button>
          <Button onClick={handleHome} variant="outline" fullWidth>
            חזרה הביתה
          </Button>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          לא מחליף ייעוץ מקצועי
        </p>
      </div>
    </div>
  );
}
