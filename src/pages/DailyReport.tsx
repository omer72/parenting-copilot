import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  TextField,
  CircularProgress,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  type Theme,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MicIcon from '@mui/icons-material/Mic';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Chip } from '../components/ui/Chip';
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
  const { isListening, transcript, isSupported, isTranscribing, startListening, stopListening } = useSpeechRecognition();

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
    <Box sx={{ minHeight: '100vh', p: 2 }}>
      <Container maxWidth="sm">
        <Box
          component="button"
          onClick={() => navigate('/home')}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            color: 'primary.main',
            fontWeight: 500,
            mb: 2,
            cursor: 'pointer',
            background: 'none',
            border: 'none',
            transition: 'color 0.2s',
            '&:hover': { color: 'primary.dark' },
          }}
        >
          {isRTL ? <ArrowForwardIcon fontSize="small" /> : <ArrowBackIcon fontSize="small" />}
          <span>{t.common.back}</span>
        </Box>

        <Typography
          variant="h1"
          sx={{
            fontSize: '1.875rem',
            fontWeight: 700,
            background: 'var(--gradient-primary)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            mb: 1,
          }}
        >
          {t.dailyReport.title}
        </Typography>
        <Typography sx={{ color: 'text.secondary', mb: 3 }}>
          {t.dailyReport.subtitle}
        </Typography>

        {!report ? (
          <>
            {/* Child Selector */}
            {children.length > 0 && (
              <Card sx={{ mb: 2 }}>
                <FormControl fullWidth>
                  <InputLabel id="child-select-label">{t.dailyReport.selectChild}</InputLabel>
                  <Select
                    labelId="child-select-label"
                    value={selectedChildId}
                    label={t.dailyReport.selectChild}
                    onChange={(e) => setSelectedChildId(e.target.value)}
                    dir={isRTL ? 'rtl' : 'ltr'}
                    sx={{ borderRadius: 2 }}
                  >
                    {children.map((child) => (
                      <MenuItem key={child.id} value={child.id}>
                        {child.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Card>
            )}

            {/* Quick Options */}
            <Card sx={{ mb: 2 }}>
              {/* Day Quality */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary', mb: 1 }}>
                  {t.dailyReport.quickOptions.dayQualityLabel}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {(['great', 'okay', 'challenging'] as DayQuality[]).map((option) => (
                    <Chip
                      key={option}
                      label={t.dailyReport.quickOptions.dayQuality[option]}
                      selected={quickSelections.dayQuality === option}
                      onClick={() => setQuickSelections(prev => ({
                        ...prev,
                        dayQuality: prev.dayQuality === option ? undefined : option
                      }))}
                    />
                  ))}
                </Box>
              </Box>

              {/* Communication */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary', mb: 1 }}>
                  {t.dailyReport.quickOptions.communicationLabel}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {(['good', 'average', 'difficult'] as Communication[]).map((option) => (
                    <Chip
                      key={option}
                      label={t.dailyReport.quickOptions.communication[option]}
                      selected={quickSelections.communication === option}
                      onClick={() => setQuickSelections(prev => ({
                        ...prev,
                        communication: prev.communication === option ? undefined : option
                      }))}
                    />
                  ))}
                </Box>
              </Box>

              {/* Sleep Quality */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary', mb: 1 }}>
                  {t.dailyReport.quickOptions.sleepLabel}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {(['good', 'poor'] as SleepQuality[]).map((option) => (
                    <Chip
                      key={option}
                      label={t.dailyReport.quickOptions.sleep[option]}
                      selected={quickSelections.sleepQuality === option}
                      onClick={() => setQuickSelections(prev => ({
                        ...prev,
                        sleepQuality: prev.sleepQuality === option ? undefined : option
                      }))}
                    />
                  ))}
                </Box>
              </Box>

              {/* Child Mood (multi-select) */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary', mb: 1 }}>
                  {t.dailyReport.quickOptions.moodLabel}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {(['happy', 'calm', 'cranky', 'emotional'] as ChildMood[]).map((option) => (
                    <Chip
                      key={option}
                      label={t.dailyReport.quickOptions.mood[option]}
                      selected={quickSelections.childMood?.includes(option)}
                      onClick={() => toggleArraySelection('childMood', option)}
                    />
                  ))}
                </Box>
              </Box>

              {/* Behavior Highlights (multi-select) */}
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary', mb: 1 }}>
                  {t.dailyReport.quickOptions.behaviorLabel}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {(['cooperation', 'tantrums', 'calm', 'hyperactive'] as BehaviorHighlight[]).map((option) => (
                    <Chip
                      key={option}
                      label={t.dailyReport.quickOptions.behavior[option]}
                      selected={quickSelections.behaviorHighlights?.includes(option)}
                      onClick={() => toggleArraySelection('behaviorHighlights', option)}
                    />
                  ))}
                </Box>
              </Box>
            </Card>

            {/* Day Description with Voice Recording */}
            <Card sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary', mb: 1 }}>
                {t.dailyReport.additionalDetails}
              </Typography>
              <Box sx={{ position: 'relative' }}>
                <TextField
                  value={dayDescription}
                  onChange={(e) => setDayDescription(e.target.value)}
                  placeholder={t.dailyReport.describeDayPlaceholder}
                  multiline
                  rows={4}
                  fullWidth
                  dir={isRTL ? 'rtl' : 'ltr'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      ...(isRTL ? { pl: 6 } : { pr: 6 }),
                    },
                  }}
                />
                {isSupported && (
                  <IconButton
                    onClick={isListening ? stopListening : startListening}
                    disabled={isTranscribing}
                    sx={{
                      position: 'absolute',
                      ...(isRTL ? { left: 8 } : { right: 8 }),
                      bottom: 8,
                      p: 1,
                      transition: 'all 0.2s',
                      background: isTranscribing
                        ? 'info.main'
                        : isListening
                        ? 'error.main'
                        : (theme: Theme) => theme.palette.primary.light + '30',
                      color: isTranscribing || isListening ? 'white' : 'primary.main',
                      animation: (isTranscribing || isListening) ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
                      '@keyframes pulse': {
                        '0%, 100%': { opacity: 1 },
                        '50%': { opacity: 0.7 },
                      },
                      '&:hover': {
                        background: isTranscribing
                          ? 'info.dark'
                          : isListening
                          ? 'error.dark'
                          : (theme: Theme) => theme.palette.primary.light + '50',
                      },
                      '&:disabled': {
                        opacity: 0.75,
                      },
                    }}
                    title={isTranscribing ? t.describe.transcribing : isListening ? t.describe.stopRecording : t.describe.voiceRecording}
                  >
                    {isTranscribing ? (
                      <CircularProgress size={20} sx={{ color: 'white' }} />
                    ) : (
                      <MicIcon />
                    )}
                  </IconButton>
                )}
              </Box>
              {(isListening || isTranscribing) && (
                <Typography
                  variant="body2"
                  sx={{
                    mt: 1,
                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                    '@keyframes pulse': {
                      '0%, 100%': { opacity: 1 },
                      '50%': { opacity: 0.5 },
                    },
                    color: isTranscribing ? 'info.main' : 'error.main',
                  }}
                >
                  {isTranscribing ? t.describe.transcribing : t.describe.recording}
                </Typography>
              )}
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                {t.dailyReport.optionalDetails}
              </Typography>
            </Card>

            {/* Generate Report Button */}
            <Button
              onClick={handleGenerateReport}
              disabled={loading || !hasAnySelection() || !selectedChild}
              fullWidth
              sx={{ mb: 2 }}
            >
              {loading ? t.dailyReport.loading : t.dailyReport.generateReport}
            </Button>
          </>
        ) : (
          <>
            {/* Report Display */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
              <Card
                sx={{
                  ...(isRTL ? { borderRight: 4 } : { borderLeft: 4 }),
                  borderColor: 'primary.main',
                }}
              >
                <Typography sx={{ fontWeight: 600, color: 'primary.dark', mb: 1 }}>
                  {t.dailyReport.summary}
                </Typography>
                <Typography color="text.secondary">{report.summary}</Typography>
              </Card>

              {report.patterns.length > 0 && (
                <Card
                  sx={{
                    ...(isRTL ? { borderRight: 4 } : { borderLeft: 4 }),
                    borderColor: 'info.main',
                  }}
                >
                  <Typography sx={{ fontWeight: 600, color: 'info.dark', mb: 1 }}>
                    {t.dailyReport.patterns}
                  </Typography>
                  <Box component="ul" sx={{ listStyle: 'disc', listStylePosition: 'inside', color: 'text.secondary' }}>
                    {report.patterns.map((pattern, idx) => (
                      <li key={idx}>{pattern}</li>
                    ))}
                  </Box>
                </Card>
              )}

              <Card
                sx={{
                  ...(isRTL ? { borderRight: 4 } : { borderLeft: 4 }),
                  borderColor: 'success.main',
                }}
              >
                <Typography sx={{ fontWeight: 600, color: 'success.dark', mb: 1 }}>
                  {t.dailyReport.successHighlights}
                </Typography>
                <Typography color="text.secondary">{report.successHighlights}</Typography>
              </Card>

              <Card
                sx={{
                  ...(isRTL ? { borderRight: 4 } : { borderLeft: 4 }),
                  borderColor: 'warning.main',
                }}
              >
                <Typography sx={{ fontWeight: 600, color: 'warning.dark', mb: 1 }}>
                  {t.dailyReport.areasToWatch}
                </Typography>
                <Typography color="text.secondary">{report.areasToWatch}</Typography>
              </Card>

              <Card
                sx={{
                  ...(isRTL ? { borderRight: 4 } : { borderLeft: 4 }),
                  borderColor: 'secondary.main',
                }}
              >
                <Typography sx={{ fontWeight: 600, color: 'secondary.dark', mb: 1 }}>
                  {t.dailyReport.tomorrowTips}
                </Typography>
                <Box component="ul" sx={{ listStyle: 'disc', listStylePosition: 'inside', color: 'text.secondary' }}>
                  {report.tomorrowTips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </Box>
              </Card>
            </Box>

            <Button onClick={handleReset} fullWidth sx={{ mb: 2 }}>
              {t.dailyReport.newReport}
            </Button>
          </>
        )}

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
            <CircularProgress size={40} sx={{ mb: 1.5, color: 'primary.main' }} />
            <Typography sx={{ color: 'primary.main' }}>{t.dailyReport.loading}</Typography>
          </Box>
        )}

        <Button onClick={() => navigate('/home')} variant="outline" fullWidth>
          {t.common.back}
        </Button>

        <Typography
          variant="body2"
          sx={{
            textAlign: 'center',
            color: 'primary.light',
            mt: 3,
            fontWeight: 500,
          }}
        >
          {t.common.disclaimer}
        </Typography>
      </Container>
    </Box>
  );
}
