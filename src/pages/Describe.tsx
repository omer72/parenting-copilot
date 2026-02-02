import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Input';
import { useApp } from '../context/AppContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useTranslation } from '../locales';

export function Describe() {
  const navigate = useNavigate();
  const { updateSession, getChildById, currentSession } = useApp();
  const { t, isRTL } = useTranslation();

  const child = currentSession?.childId ? getChildById(currentSession.childId) : null;

  const [description, setDescription] = useState('');
  const {
    isListening,
    transcript,
    isSupported,
    isTranscribing,
    startListening,
    stopListening
  } = useSpeechRecognition();

  // Update description when transcript changes from speech recognition
  useEffect(() => {
    if (transcript) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing external speech input to state
      setDescription(prev => (prev + ' ' + transcript).trim());
    }
  }, [transcript]);

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
          <span>{isRTL ? '→' : '←'}</span>
          <span>{t.common.back}</span>
        </button>

        {child && (
          <p className="text-purple-600 font-bold mb-2 text-lg">{child.name}</p>
        )}

        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          {t.describe.title}
        </h1>
        <p className="text-purple-700 mb-6 font-medium">{t.describe.subtitle}</p>

        <div className="relative">
          <Textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder={t.describe.placeholder}
            rows={6}
            className="text-lg"
          />

          {isSupported && (
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              disabled={isTranscribing}
              className={`absolute ltr:right-3 rtl:left-3 bottom-3 p-3 rounded-full transition-all duration-300 shadow-lg ${
                isTranscribing
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse'
                  : isListening
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 animate-pulse'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-xl'
              } text-white disabled:opacity-75`}
              title={isTranscribing ? t.describe.transcribing : isListening ? t.describe.stopRecording : t.describe.voiceRecording}
            >
              {isTranscribing ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
              ) : isListening ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <rect x="7" y="5" width="6" height="10" rx="1" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z"/>
                  <path d="M5.5 9.643a.75.75 0 011.5 0V10c0 1.657 1.343 3 3 3s3-1.343 3-3v-.357a.75.75 0 011.5 0V10a4.5 4.5 0 01-4 4.472V16.5h2a.75.75 0 010 1.5h-5a.75.75 0 010-1.5h2v-2.028A4.5 4.5 0 015.5 10v-.357z"/>
                </svg>
              )}
            </button>
          )}
        </div>

        {(isListening || isTranscribing) && (
          <p className={`text-sm mt-2 font-medium animate-pulse ${isTranscribing ? 'text-blue-500' : 'text-red-500'}`}>
            {isTranscribing ? t.describe.transcribing : t.describe.recording}
          </p>
        )}

        <p className="text-sm text-purple-400 mt-2 font-medium">
          {t.describe.characters.replace('{count}', String(description.length))}
        </p>

        <Button
          onClick={handleContinue}
          fullWidth
          className="mt-6"
          disabled={!canContinue}
        >
          {t.common.continue}
        </Button>
      </div>
    </div>
  );
}
