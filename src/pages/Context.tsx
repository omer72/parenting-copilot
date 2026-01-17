import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../locales';
import type { Location, Presence, Physicality, EmotionalState } from '../types';

export function Context() {
  const navigate = useNavigate();
  const { updateSession, getChildById, currentSession } = useApp();
  const { t, isRTL } = useTranslation();

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

  const locationOptions: { key: Location; label: string }[] = [
    { key: 'home', label: t.context.locations.home },
    { key: 'street', label: t.context.locations.street },
    { key: 'car', label: t.context.locations.car },
    { key: 'mall', label: t.context.locations.mall },
    { key: 'restaurant', label: t.context.locations.restaurant },
  ];

  const presenceOptions: { key: Presence; label: string }[] = [
    { key: 'alone', label: t.context.presence.alone },
    { key: 'spouse', label: t.context.presence.spouse },
    { key: 'other_adults', label: t.context.presence.other_adults },
    { key: 'strangers', label: t.context.presence.strangers },
  ];

  const physicalityOptions: { key: Physicality; label: string }[] = [
    { key: 'private', label: t.context.physicality.private },
    { key: 'public', label: t.context.physicality.public },
  ];

  const emotionalStateOptions: { key: EmotionalState; label: string }[] = [
    { key: 'calm', label: t.context.emotionalState.calm },
    { key: 'frustrated', label: t.context.emotionalState.frustrated },
    { key: 'angry', label: t.context.emotionalState.angry },
    { key: 'anxious', label: t.context.emotionalState.anxious },
  ];

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="text-purple-500 hover:text-purple-700 mb-4 flex items-center gap-1 font-medium transition-colors"
        >
          <span>{isRTL ? '→' : '←'}</span>
          <span>{t.common.back}</span>
        </button>

        {child && (
          <p className="text-purple-600 font-bold mb-2 text-lg">{child.name}</p>
        )}

        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
          {t.context.title}
        </h1>

        <div className="space-y-6">
          <div>
            <h3 className="font-bold text-purple-900 mb-3">{t.context.location}</h3>
            <div className="flex flex-wrap gap-2">
              {locationOptions.map(({ key, label }) => (
                <Chip
                  key={key}
                  label={label}
                  selected={location === key}
                  onClick={() => setLocation(key)}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-purple-900 mb-3">{t.context.whoPresent}</h3>
            <div className="flex flex-wrap gap-2">
              {presenceOptions.map(({ key, label }) => (
                <Chip
                  key={key}
                  label={label}
                  selected={presence === key}
                  onClick={() => setPresence(key)}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-purple-900 mb-3">{t.context.privacy}</h3>
            <div className="flex flex-wrap gap-2">
              {physicalityOptions.map(({ key, label }) => (
                <Chip
                  key={key}
                  label={label}
                  selected={physicality === key}
                  onClick={() => setPhysicality(key)}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-purple-900 mb-3">{t.context.yourMood}</h3>
            <div className="flex flex-wrap gap-2">
              {emotionalStateOptions.map(({ key, label }) => (
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
          {t.common.continue}
        </Button>
      </div>
    </div>
  );
}
