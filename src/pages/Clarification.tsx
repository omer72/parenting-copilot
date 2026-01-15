import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { Card } from '../components/ui/Card';
import { useApp } from '../context/AppContext';
import { getClarificationQuestions } from '../services/aiService';

export function Clarification() {
  const navigate = useNavigate();
  const { currentSession, updateSession } = useApp();

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
      <div className="min-h-screen p-4 flex items-center justify-center">
        <p className="text-gray-500">טוען...</p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  const quickAnswers = [
    'כן',
    'לא',
    'לפעמים',
    'לא בטוח',
  ];

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="text-purple-500 hover:text-purple-700 mb-4 flex items-center gap-1 font-medium transition-colors"
        >
          <span>→</span>
          <span>חזרה</span>
        </button>

        <div className="flex items-center gap-2 mb-6">
          {questions.map((_, index) => (
            <div
              key={index}
              className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                index <= currentQuestionIndex ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-purple-100'
              }`}
            />
          ))}
        </div>

        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
          שאלת הבהרה
        </h1>

        <Card className="mb-6">
          <p className="text-lg font-semibold text-purple-900">{currentQuestion}</p>
        </Card>

        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {quickAnswers.map(answer => (
              <Chip
                key={answer}
                label={answer}
                onClick={() => handleAnswer(answer)}
              />
            ))}
          </div>

          <Button
            variant="outline"
            fullWidth
            onClick={handleSkip}
          >
            דלג והמשך
          </Button>
        </div>
      </div>
    </div>
  );
}
