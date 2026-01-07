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
          className="text-gray-500 mb-4 flex items-center gap-1"
        >
          <span>→</span>
          <span>חזרה</span>
        </button>

        {child && (
          <p className="text-indigo-600 font-medium mb-2">{child.name}</p>
        )}

        <h1 className="text-2xl font-bold text-gray-900 mb-2">מה קורה?</h1>
        <p className="text-gray-600 mb-6">תאר בקצרה את הסיטואציה</p>

        <Textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="למשל: הילד לא רוצה להתלבש לגן ומתחיל לצרוח..."
          rows={6}
          className="text-lg"
        />

        <p className="text-sm text-gray-400 mt-2">
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
