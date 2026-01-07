import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { useApp } from '../context/AppContext';
import { contextLabels } from '../services/aiService';
import type { Location, Presence, Physicality, EmotionalState } from '../types';

export function Context() {
  const navigate = useNavigate();
  const { updateSession, getChildById, currentSession } = useApp();

  const child = currentSession?.childId ? getChildById(currentSession.childId) : null;

  const [location, setLocation] = useState<Location | null>(null);
  const [presence, setPresence] = useState<Presence | null>(null);
  const [physicality, setPhysicality] = useState<Physicality | null>(null);
  const [emotionalState, setEmotionalState] = useState<EmotionalState | null>(null);

  const isComplete = location && presence && physicality && emotionalState;

  const handleContinue = () => {
    if (!isComplete) return;

    updateSession({
      context: {
        location,
        presence,
        physicality,
        emotionalState,
      },
    });
    navigate('/describe');
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

        <h1 className="text-2xl font-bold text-gray-900 mb-6">מה ההקשר?</h1>

        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-gray-700 mb-2">מיקום</h3>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(contextLabels.location) as [Location, string][]).map(
                ([key, label]) => (
                  <Chip
                    key={key}
                    label={label}
                    selected={location === key}
                    onClick={() => setLocation(key)}
                  />
                )
              )}
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-700 mb-2">מי נוכח?</h3>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(contextLabels.presence) as [Presence, string][]).map(
                ([key, label]) => (
                  <Chip
                    key={key}
                    label={label}
                    selected={presence === key}
                    onClick={() => setPresence(key)}
                  />
                )
              )}
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-700 mb-2">פרטיות</h3>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(contextLabels.physicality) as [Physicality, string][]).map(
                ([key, label]) => (
                  <Chip
                    key={key}
                    label={label}
                    selected={physicality === key}
                    onClick={() => setPhysicality(key)}
                  />
                )
              )}
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-700 mb-2">מצב רוח שלך</h3>
            <div className="flex flex-wrap gap-2">
              {(
                Object.entries(contextLabels.emotionalState) as [EmotionalState, string][]
              ).map(([key, label]) => (
                <Chip
                  key={key}
                  label={label}
                  selected={emotionalState === key}
                  onClick={() => setEmotionalState(key)}
                />
              ))}
            </div>
          </div>
        </div>

        <Button
          onClick={handleContinue}
          fullWidth
          className="mt-8"
          disabled={!isComplete}
        >
          המשך
        </Button>
      </div>
    </div>
  );
}
