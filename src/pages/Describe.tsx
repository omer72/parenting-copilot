import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Input';
import { useApp } from '../context/AppContext';

export function Describe() {
  const navigate = useNavigate();
  const { updateSession, getChildById, currentSession } = useApp();

  const child = currentSession?.childId ? getChildById(currentSession.childId) : null;

  const [description, setDescription] = useState('');

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
    <div className="min-h-screen p-4">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="text-purple-500 hover:text-purple-700 mb-4 flex items-center gap-1 font-medium transition-colors"
        >
          <span>→</span>
          <span>חזרה</span>
        </button>

        {child && (
          <p className="text-purple-600 font-bold mb-2 text-lg">{child.name}</p>
        )}

        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">מה קורה?</h1>
        <p className="text-purple-700 mb-6 font-medium">תאר בקצרה את הסיטואציה</p>

        <Textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="למשל: הילד לא רוצה להתלבש לגן ומתחיל לצרוח..."
          rows={6}
          className="text-lg"
        />

        <p className="text-sm text-purple-400 mt-2 font-medium">
          {description.length} תווים (מינימום 10)
        </p>

        <Button
          onClick={handleContinue}
          fullWidth
          className="mt-6"
          disabled={!canContinue}
        >
          המשך
        </Button>
      </div>
    </div>
  );
}
