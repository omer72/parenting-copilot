import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../locales';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { generateDailyReportFromDescription } from '../services/aiService';
import type { DailyReportResponse } from '../types';

type DayQuality = 'great' | 'okay' | 'challenging';
type Communication = 'good' | 'average' | 'difficult';
type ChildMood = 'happy' | 'calm' | 'cranky' | 'emotional';
type SleepQuality = 'good' | 'poor';
type BehaviorHighlight = 'cooperation' | 'tantrums' | 'calm' | 'hyperactive';

interface QuickSelections {
  dayQuality?: DayQuality;
  communication?: Communication;
  childMood?: ChildMood[];
  sleepQuality?: SleepQuality;
  behaviorHighlights?: BehaviorHighlight[];
}

export function DailyReport() {
  const navigate = useNavigate();
  const { children } = useApp();
  const { t, isRTL } = useTranslation();
  const { isListening, transcript, isSupported, startListening, stopListening } = useSpeechRecognition();

  const [selectedChildId, setSelectedChildId] = useState<string>(
    children.length > 0 ? children[0].id : ''
  );
  const [dayDescription, setDayDescription] = useState('');
  const [quickSelections, setQuickSelections] = useState<QuickSelections>({});
  const [report, setReport] = useState<DailyReportResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // Update dayDescription when transcript changes
  useEffect(() => {
    if (transcript) {
      setDayDescription(prev => prev + (prev ? ' ' : '') + transcript);
    }
  }, [transcript]);

  const selectedChild = children.find(c => c.id === selectedChildId);

  // Build full description including quick selections
  const buildFullDescription = () => {
    const parts: string[] = [];

    if (quickSelections.dayQuality) {
      parts.push(t.dailyReport.quickOptions.dayQuality[quickSelections.dayQuality]);
    }
    if (quickSelections.communication) {
      parts.push(t.dailyReport.quickOptions.communication[quickSelections.communication]);
    }
    if (quickSelections.sleepQuality) {
      parts.push(t.dailyReport.quickOptions.sleep[quickSelections.sleepQuality]);
    }
    if (quickSelections.childMood && quickSelections.childMood.length > 0) {
      const moods = quickSelections.childMood.map(m => t.dailyReport.quickOptions.mood[m]).join(', ');
      parts.push(`${t.dailyReport.quickOptions.moodLabel}: ${moods}`);
    }
    if (quickSelections.behaviorHighlights && quickSelections.behaviorHighlights.length > 0) {
      const behaviors = quickSelections.behaviorHighlights.map(b => t.dailyReport.quickOptions.behavior[b]).join(', ');
      parts.push(`${t.dailyReport.quickOptions.behaviorLabel}: ${behaviors}`);
    }

    if (dayDescription.trim()) {
      parts.push(dayDescription.trim());
    }

    return parts.join('. ');
  };

  const handleGenerateReport = async () => {
    const fullDescription = buildFullDescription();
    if (!fullDescription || !selectedChild) return;
    setLoading(true);
    try {
      const result = await generateDailyReportFromDescription(fullDescription, selectedChild);
      setReport(result);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleArraySelection = <T extends string>(
    key: 'childMood' | 'behaviorHighlights',
    value: T
  ) => {
    setQuickSelections(prev => {
      const current = (prev[key] || []) as T[];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [key]: updated };
    });
  };

  const hasAnySelection = () => {
    return (
      quickSelections.dayQuality ||
      quickSelections.communication ||
      quickSelections.sleepQuality ||
      (quickSelections.childMood && quickSelections.childMood.length > 0) ||
      (quickSelections.behaviorHighlights && quickSelections.behaviorHighlights.length > 0) ||
      dayDescription.trim()
    );
  };

  const handleReset = () => {
    setReport(null);
    setDayDescription('');
    setQuickSelections({});
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => navigate('/home')}
          className="flex items-center text-purple-600 mb-4"
        >
          <svg
            className={`w-5 h-5 ${isRTL ? 'rotate-180 ml-1' : 'mr-1'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t.common.back}
        </button>

        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          {t.dailyReport.title}
        </h1>
        <p className="text-gray-600 mb-6">{t.dailyReport.subtitle}</p>

        {!report ? (
          <>
            {/* Child Selector */}
            {children.length > 0 && (
              <Card className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.dailyReport.selectChild}
                </label>
                <select
                  value={selectedChildId}
                  onChange={(e) => setSelectedChildId(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  dir={isRTL ? 'rtl' : 'ltr'}
                >
                  {children.map((child) => (
                    <option key={child.id} value={child.id}>
                      {child.name}
                    </option>
                  ))}
                </select>
              </Card>
            )}

            {/* Quick Options */}
            <Card className="mb-4">
              {/* Day Quality */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.dailyReport.quickOptions.dayQualityLabel}
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['great', 'okay', 'challenging'] as DayQuality[]).map((option) => (
                    <button
                      key={option}
                      onClick={() => setQuickSelections(prev => ({ ...prev, dayQuality: prev.dayQuality === option ? undefined : option }))}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        quickSelections.dayQuality === option
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {t.dailyReport.quickOptions.dayQuality[option]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Communication */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.dailyReport.quickOptions.communicationLabel}
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['good', 'average', 'difficult'] as Communication[]).map((option) => (
                    <button
                      key={option}
                      onClick={() => setQuickSelections(prev => ({ ...prev, communication: prev.communication === option ? undefined : option }))}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        quickSelections.communication === option
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {t.dailyReport.quickOptions.communication[option]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sleep Quality */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.dailyReport.quickOptions.sleepLabel}
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['good', 'poor'] as SleepQuality[]).map((option) => (
                    <button
                      key={option}
                      onClick={() => setQuickSelections(prev => ({ ...prev, sleepQuality: prev.sleepQuality === option ? undefined : option }))}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        quickSelections.sleepQuality === option
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {t.dailyReport.quickOptions.sleep[option]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Child Mood (multi-select) */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.dailyReport.quickOptions.moodLabel}
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['happy', 'calm', 'cranky', 'emotional'] as ChildMood[]).map((option) => (
                    <button
                      key={option}
                      onClick={() => toggleArraySelection('childMood', option)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        quickSelections.childMood?.includes(option)
                          ? 'bg-pink-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {t.dailyReport.quickOptions.mood[option]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Behavior Highlights (multi-select) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.dailyReport.quickOptions.behaviorLabel}
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['cooperation', 'tantrums', 'calm', 'hyperactive'] as BehaviorHighlight[]).map((option) => (
                    <button
                      key={option}
                      onClick={() => toggleArraySelection('behaviorHighlights', option)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        quickSelections.behaviorHighlights?.includes(option)
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {t.dailyReport.quickOptions.behavior[option]}
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Day Description with Voice Recording */}
            <Card className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.dailyReport.additionalDetails}
              </label>
              <div className="relative">
                <textarea
                  value={dayDescription}
                  onChange={(e) => setDayDescription(e.target.value)}
                  placeholder={t.dailyReport.describeDayPlaceholder}
                  className={`w-full p-3 ${isRTL ? 'pl-12' : 'pr-12'} border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px]`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
                {isSupported && (
                  <button
                    type="button"
                    onClick={isListening ? stopListening : startListening}
                    className={`absolute ${isRTL ? 'left-2' : 'right-2'} bottom-2 p-2 rounded-full transition-colors ${
                      isListening
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                    }`}
                    title={isListening ? t.describe.stopRecording : t.describe.voiceRecording}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5z"/>
                      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                    </svg>
                  </button>
                )}
              </div>
              {isListening && (
                <p className="text-sm text-red-500 mt-2 animate-pulse">
                  {t.describe.recording}
                </p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                {t.dailyReport.optionalDetails}
              </p>
            </Card>

            {/* Generate Report Button */}
            <Button
              onClick={handleGenerateReport}
              disabled={loading || !hasAnySelection() || !selectedChild}
              fullWidth
              className="mb-4"
            >
              {loading ? t.dailyReport.loading : t.dailyReport.generateReport}
            </Button>
          </>
        ) : (
          <>
            {/* Report Display */}
            <div className="space-y-4 mb-6">
              <Card className={`${isRTL ? 'border-r-4' : 'border-l-4'} border-purple-500`}>
                <h3 className="font-semibold text-purple-900 mb-2">{t.dailyReport.summary}</h3>
                <p className="text-gray-700">{report.summary}</p>
              </Card>

              {report.patterns.length > 0 && (
                <Card className={`${isRTL ? 'border-r-4' : 'border-l-4'} border-blue-500`}>
                  <h3 className="font-semibold text-blue-900 mb-2">{t.dailyReport.patterns}</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {report.patterns.map((pattern, idx) => (
                      <li key={idx}>{pattern}</li>
                    ))}
                  </ul>
                </Card>
              )}

              <Card className={`${isRTL ? 'border-r-4' : 'border-l-4'} border-green-500`}>
                <h3 className="font-semibold text-green-900 mb-2">{t.dailyReport.successHighlights}</h3>
                <p className="text-gray-700">{report.successHighlights}</p>
              </Card>

              <Card className={`${isRTL ? 'border-r-4' : 'border-l-4'} border-yellow-500`}>
                <h3 className="font-semibold text-yellow-900 mb-2">{t.dailyReport.areasToWatch}</h3>
                <p className="text-gray-700">{report.areasToWatch}</p>
              </Card>

              <Card className={`${isRTL ? 'border-r-4' : 'border-l-4'} border-pink-500`}>
                <h3 className="font-semibold text-pink-900 mb-2">{t.dailyReport.tomorrowTips}</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  {report.tomorrowTips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </Card>
            </div>

            <Button onClick={handleReset} fullWidth className="mb-4">
              {t.dailyReport.newReport}
            </Button>
          </>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center py-8">
            <div className="animate-spin w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full mb-3" />
            <p className="text-purple-600">{t.dailyReport.loading}</p>
          </div>
        )}

        <Button onClick={() => navigate('/home')} variant="outline" fullWidth>
          {t.common.back}
        </Button>

        <p className="text-center text-sm text-purple-400 mt-6 font-medium">
          {t.common.disclaimer}
        </p>
      </div>
    </div>
  );
}
