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
          className="text-purple-500 hover:text-purple-700 mb-4 flex items-center gap-1 font-medium transition-colors"
        >
          <span>→</span>
          <span>חזרה</span>
        </button>

        {child && (
          <p className="text-purple-600 font-bold mb-2 text-lg">{child.name}</p>
        )}

        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">מה ההקשר?</h1>

        <div className="space-y-6">
          <div>
            <h3 className="font-bold text-purple-900 mb-3">מיקום</h3>
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
            <h3 className="font-bold text-purple-900 mb-3">מי נוכח?</h3>
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
            <h3 className="font-bold text-purple-900 mb-3">פרטיות</h3>
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
            <h3 className="font-bold text-purple-900 mb-3">מצב רוח שלך</h3>
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
