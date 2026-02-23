import type { CompletedInteraction } from '../types';
import type { Language } from '../locales';

function getInteractionsForChild(
  childId: string,
  allInteractions: CompletedInteraction[]
): CompletedInteraction[] {
  return allInteractions
    .filter(i => i.childId === childId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

function scoreInteraction(
  interaction: CompletedInteraction,
  currentDescription: string
): number {
  let score = 0;

  // Recency score (0-40)
  const daysSince = (Date.now() - new Date(interaction.timestamp).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSince < 1) score += 40;
  else if (daysSince < 2) score += 35;
  else if (daysSince < 7) score += 25;
  else if (daysSince < 14) score += 15;
  else if (daysSince < 30) score += 8;
  else score += 3;

  // Feedback signal score (0-30)
  const hasFeedback = interaction.responses.some(r => r.feedback);
  const hasNotHelped = interaction.responses.some(r => r.feedback === 'not_helped');
  if (hasNotHelped) score += 30;
  else if (hasFeedback) score += 20;

  // Keyword overlap score (0-30)
  const getWords = (text: string) =>
    text.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const currentWords = new Set(getWords(currentDescription));
  const interactionWords = new Set(getWords(interaction.description));
  if (currentWords.size > 0 && interactionWords.size > 0) {
    const intersection = [...currentWords].filter(w => interactionWords.has(w)).length;
    const union = new Set([...currentWords, ...interactionWords]).size;
    score += Math.round((intersection / union) * 30);
  }

  return score;
}

function selectTopInteractions(
  interactions: CompletedInteraction[],
  currentDescription: string,
  maxCount = 5
): CompletedInteraction[] {
  return interactions
    .map(i => ({ interaction: i, score: scoreInteraction(i, currentDescription) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, maxCount)
    .sort((a, b) => new Date(a.interaction.timestamp).getTime() - new Date(b.interaction.timestamp).getTime())
    .map(item => item.interaction);
}

function formatInteractionForPrompt(
  interaction: CompletedInteraction,
  lang: Language
): string {
  const date = new Date(interaction.timestamp).toISOString().split('T')[0];
  const desc = interaction.description.length > 80
    ? interaction.description.slice(0, 80) + '...'
    : interaction.description;

  const lastResponse = interaction.responses[interaction.responses.length - 1];
  if (!lastResponse) return '';

  const advice = lastResponse.response.doNow;
  const sayThis = lastResponse.response.sayThis;

  let feedbackText: string;
  if (lastResponse.feedback === 'helped') {
    feedbackText = lang === 'he' ? 'עזר ✓' : 'HELPED ✓';
  } else if (lastResponse.feedback === 'not_helped') {
    feedbackText = lang === 'he' ? 'לא עזר ✗' : 'NOT HELPED ✗';
    if (lastResponse.followUp) {
      const followUp = lastResponse.followUp.length > 60
        ? lastResponse.followUp.slice(0, 60) + '...'
        : lastResponse.followUp;
      feedbackText += ` (${lang === 'he' ? 'המשוב' : 'feedback'}: "${followUp}")`;
    }
  } else {
    feedbackText = lang === 'he' ? 'ללא משוב' : 'NO FEEDBACK';
  }

  if (lang === 'he') {
    return `- [${date}] ${desc}
  עצה: ${advice}. לומר: "${sayThis}"
  תוצאה: ${feedbackText}`;
  }

  return `- [${date}] ${desc}
  Advice: ${advice}. Say: "${sayThis}"
  Result: ${feedbackText}`;
}

export function buildHistorySection(
  childId: string,
  allInteractions: CompletedInteraction[],
  currentDescription: string,
  lang: Language
): string {
  const childInteractions = getInteractionsForChild(childId, allInteractions);
  if (childInteractions.length === 0) return '';

  const top = selectTopInteractions(childInteractions, currentDescription);
  const formatted = top.map(i => formatInteractionForPrompt(i, lang)).filter(Boolean);
  if (formatted.length === 0) return '';

  if (lang === 'he') {
    return `
## היסטוריית אינטראקציות קודמות עם הילד:
${formatted.join('\n')}

שים לב: השתמש בהיסטוריה כדי לזהות דפוסים חוזרים, להימנע מהצעות שלא עבדו בעבר, ולבנות על מה שכן עזר.`;
  }

  return `
## Previous interaction history with this child:
${formatted.join('\n')}

Note: Use this history to identify recurring patterns, avoid suggestions that didn't work before, and build on what helped.`;
}
