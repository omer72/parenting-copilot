import type { AIResponse, Session, Child } from '../types';
import { responseTemplates, defaultResponses, generateClarificationQuestions } from '../data/mockResponses';

function findMatchingResponse(description: string): AIResponse {
  const lowerDescription = description.toLowerCase();

  for (const template of responseTemplates) {
    const hasMatch = template.keywords.some(keyword =>
      lowerDescription.includes(keyword)
    );

    if (hasMatch && template.responses.length > 0) {
      const randomIndex = Math.floor(Math.random() * template.responses.length);
      return template.responses[randomIndex];
    }
  }

  const randomIndex = Math.floor(Math.random() * defaultResponses.length);
  return defaultResponses[randomIndex];
}

export async function generateResponse(
  session: Session,
  _child: Child
): Promise<AIResponse> {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

  return findMatchingResponse(session.description);
}

export function getClarificationQuestions(
  description: string,
  context: { location: string; presence: string }
): string[] {
  return generateClarificationQuestions(description, context);
}

export const contextLabels = {
  location: {
    home: 'בית',
    street: 'רחוב',
    car: 'רכב',
    mall: 'קניון',
    restaurant: 'מסעדה',
  },
  presence: {
    alone: 'לבד',
    spouse: 'בן/בת זוג',
    other_adults: 'מבוגרים אחרים',
    strangers: 'זרים',
  },
  physicality: {
    private: 'פרטי',
    public: 'ציבורי',
  },
  emotionalState: {
    calm: 'רגוע',
    frustrated: 'מתוסכל',
    angry: 'כועס',
    anxious: 'חרד',
  },
};
