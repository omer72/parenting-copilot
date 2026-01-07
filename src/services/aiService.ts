import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import type { AIResponse, Session, Child } from '../types';
import { responseTemplates, defaultResponses, generateClarificationQuestions } from '../data/mockResponses';

// Lazy initialization of API clients
let anthropicClient: Anthropic | null = null;
let openaiClient: OpenAI | null = null;

function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({
      apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || 'dummy-key',
      dangerouslyAllowBrowser: true,
    });
  }
  return anthropicClient;
}

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'dummy-key',
      dangerouslyAllowBrowser: true,
    });
  }
  return openaiClient;
}

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

async function generateWithClaude(
  session: Session,
  child: Child
): Promise<AIResponse> {
  const prompt = `אתה יועץ הורות מקצועי ומנוסה. תפקידך לעזור להורים להתמודד עם סיטואציות מאתגרות עם ילדיהם.

מידע על הילד:
- שם: ${child.name}
- גיל: ${child.age}
${child.gender ? `- מין: ${child.gender === 'male' ? 'בן' : 'בת'}` : ''}
${child.characteristics ? `- מאפיינים: ${child.characteristics}` : ''}
${child.notes ? `- הערות: ${child.notes}` : ''}

הקשר הסיטואציה:
- מיקום: ${contextLabels.location[session.context.location]}
- נוכחות: ${contextLabels.presence[session.context.presence]}
- פרטיות: ${contextLabels.physicality[session.context.physicality]}
- מצב רוח ההורה: ${contextLabels.emotionalState[session.context.emotionalState]}

תיאור הסיטואציה:
${session.description}

${session.clarifications && session.clarifications.length > 0 ? `
הבהרות נוספות:
${session.clarifications.map(c => `- ${c.question}: ${c.answer}`).join('\n')}
` : ''}

אנא ספק תשובה מעשית ופרקטית בפורמט JSON הבא:
{
  "doNow": "מה לעשות עכשיו - הנחיות קצרות וברורות (2-3 משפטים)",
  "dontDo": "מה לא לעשות - התנהגויות שכדאי להימנע מהן (2-3 משפטים)",
  "sayThis": "משפט ספציפי אחד לומר לילד - מנוסח בעברית טבעית וחמה"
}

חשוב:
- התשובה צריכה להיות מותאמת לגיל הילד
- היה קצר ופרקטי
- התמקד בפעולות מיידיות
- התחשב בהקשר והמצב הרגשי של ההורה
- השתמש בשפה חמה ותומכת`;

  const anthropic = getAnthropicClient();
  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  try {
    // Try to extract JSON from the response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    
    const response: AIResponse = JSON.parse(jsonMatch[0]);
    return response;
  } catch (error) {
    console.error('Failed to parse Claude response:', error);
    console.log('Raw response:', content.text);
    // Fallback to mock response
    return findMatchingResponse(session.description);
  }
}

async function generateWithOpenAI(
  session: Session,
  child: Child
): Promise<AIResponse> {
  const prompt = `אתה יועץ הורות מקצועי ומנוסה. תפקידך לעזור להורים להתמודד עם סיטואציות מאתגרות עם ילדיהם.

מידע על הילד:
- שם: ${child.name}
- גיל: ${child.age}
${child.gender ? `- מין: ${child.gender === 'male' ? 'בן' : 'בת'}` : ''}
${child.characteristics ? `- מאפיינים: ${child.characteristics}` : ''}
${child.notes ? `- הערות: ${child.notes}` : ''}

הקשר הסיטואציה:
- מיקום: ${contextLabels.location[session.context.location]}
- נוכחות: ${contextLabels.presence[session.context.presence]}
- פרטיות: ${contextLabels.physicality[session.context.physicality]}
- מצב רוח ההורה: ${contextLabels.emotionalState[session.context.emotionalState]}

תיאור הסיטואציה:
${session.description}

${session.clarifications && session.clarifications.length > 0 ? `
הבהרות נוספות:
${session.clarifications.map(c => `- ${c.question}: ${c.answer}`).join('\n')}
` : ''}

אנא ספק תשובה מעשית ופרקטית בפורמט JSON הבא:
{
  "doNow": "מה לעשות עכשיו - הנחיות קצרות וברורות (2-3 משפטים)",
  "dontDo": "מה לא לעשות - התנהגויות שכדאי להימנע מהן (2-3 משפטים)",
  "sayThis": "משפט ספציפי אחד לומר לילד - מנוסח בעברית טבעית וחמה"
}

חשוב:
- התשובה צריכה להיות מותאמת לגיל הילד
- היה קצר ופרקטי
- התמקד בפעולות מיידיות
- התחשב בהקשר והמצב הרגשי של ההורה
- השתמש בשפה חמה ותומכת
- החזר רק את ה-JSON, ללא טקסט נוסף`;

  const openai = getOpenAIClient();
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 1024,
  });

  const content = completion.choices[0].message.content;
  if (!content) {
    throw new Error('No response from OpenAI');
  }

  try {
    const response: AIResponse = JSON.parse(content);
    return response;
  } catch (error) {
    console.error('Failed to parse OpenAI response:', error);
    console.log('Raw response:', content);
    // Fallback to mock response
    return findMatchingResponse(session.description);
  }
}

export async function generateResponse(
  session: Session,
  child: Child
): Promise<AIResponse> {
  const hasOpenAI = import.meta.env.VITE_OPENAI_API_KEY && 
                    import.meta.env.VITE_OPENAI_API_KEY !== 'your_openai_api_key_here';
  const hasClaude = import.meta.env.VITE_ANTHROPIC_API_KEY && 
                    import.meta.env.VITE_ANTHROPIC_API_KEY !== 'your_anthropic_api_key_here';

  // Prefer OpenAI if available, fallback to Claude, then mock
  if (!hasOpenAI && !hasClaude) {
    console.warn('No AI API key configured, using mock responses');
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    return findMatchingResponse(session.description);
  }

  try {
    if (hasOpenAI) {
      console.log('Using OpenAI for response generation');
      return await generateWithOpenAI(session, child);
    } else {
      console.log('Using Claude for response generation');
      return await generateWithClaude(session, child);
    }
  } catch (error) {
    console.error('Error calling AI API:', error);
    
    // Try fallback to the other provider
    try {
      if (hasOpenAI && hasClaude) {
        console.log('Falling back to alternative AI provider');
        return hasOpenAI 
          ? await generateWithClaude(session, child)
          : await generateWithOpenAI(session, child);
      }
    } catch (fallbackError) {
      console.error('Fallback AI provider also failed:', fallbackError);
    }
    
    // Final fallback to mock response
    await new Promise(resolve => setTimeout(resolve, 1000));
    return findMatchingResponse(session.description);
  }
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
