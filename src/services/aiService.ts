import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import type { AIResponse, Session, Child, ConversationTurn } from '../types';
import type { Language } from '../locales';
import { he } from '../locales/he';
import { en } from '../locales/en';

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

function getCurrentLanguage(): Language {
  const saved = localStorage.getItem('parenting-copilot-language');
  return (saved === 'en' || saved === 'he') ? saved : 'he';
}

function getTranslations() {
  return getCurrentLanguage() === 'he' ? he : en;
}

function findMatchingResponse(description: string): AIResponse {
  const t = getTranslations();
  const lowerDescription = description.toLowerCase();

  // Keywords for matching (Hebrew keywords work for both since description is usually in Hebrew)
  const keywordMap: { keywords: string[]; responseKey: keyof typeof t.mockResponses }[] = [
    { keywords: ['התקף זעם', 'זעם', 'צורח', 'צועק', 'היסטריה', 'tantrum', 'screaming', 'yelling'], responseKey: 'tantrums' },
    { keywords: ['לא רוצה', 'מסרב', 'סירוב', 'עקשן', 'refuse', 'won\'t', 'stubborn'], responseKey: 'refusal' },
    { keywords: ['מכה', 'בועט', 'אלימות', 'אלים', 'hit', 'kick', 'violent'], responseKey: 'violence' },
    { keywords: ['פחד', 'מפחד', 'פוחד', 'חושך', 'fear', 'afraid', 'scared', 'dark'], responseKey: 'fear' },
    { keywords: ['שיעורים', 'שיעורי בית', 'לימודים', 'homework', 'school', 'study'], responseKey: 'homework' },
    { keywords: ['אוכל', 'לא אוכל', 'לא רעב', 'ארוחה', 'food', 'eat', 'hungry', 'meal'], responseKey: 'food' },
    { keywords: ['שינה', 'לא רוצה לישון', 'לישון', 'עייף', 'sleep', 'tired', 'bed'], responseKey: 'sleep' },
    { keywords: ['ריב', 'אחים', 'אחיות', 'מתקוטטים', 'sibling', 'fight', 'brother', 'sister'], responseKey: 'siblings' },
  ];

  for (const { keywords, responseKey } of keywordMap) {
    const hasMatch = keywords.some(keyword => lowerDescription.includes(keyword));
    if (hasMatch) {
      const responses = t.mockResponses[responseKey] as AIResponse[];
      if (responses && responses.length > 0) {
        const randomIndex = Math.floor(Math.random() * responses.length);
        return responses[randomIndex];
      }
    }
  }

  const defaultResponses = t.mockResponses.default as AIResponse[];
  const randomIndex = Math.floor(Math.random() * defaultResponses.length);
  return defaultResponses[randomIndex];
}

function getPromptForLanguage(session: Session, child: Child): string {
  const lang = getCurrentLanguage();
  const t = getTranslations();

  if (lang === 'he') {
    return `אתה יועץ הורות מקצועי ומנוסה. תפקידך לעזור להורים להתמודד עם סיטואציות מאתגרות עם ילדיהם.

מידע על הילד:
- שם: ${child.name}
- גיל: ${child.age}
${child.gender ? `- מין: ${child.gender === 'male' ? 'בן' : 'בת'}` : ''}
${child.characteristics ? `- מאפיינים: ${child.characteristics}` : ''}
${child.notes ? `- הערות: ${child.notes}` : ''}

הקשר הסיטואציה:
- מיקום: ${t.context.locations[session.context.location]}
- נוכחות: ${t.context.presence[session.context.presence]}
- פרטיות: ${t.context.physicality[session.context.physicality]}
- מצב רוח ההורה: ${t.context.emotionalState[session.context.emotionalState]}

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
  } else {
    return `You are a professional and experienced parenting consultant. Your role is to help parents deal with challenging situations with their children.

Information about the child:
- Name: ${child.name}
- Age: ${child.age}
${child.gender ? `- Gender: ${child.gender === 'male' ? 'Boy' : 'Girl'}` : ''}
${child.characteristics ? `- Characteristics: ${child.characteristics}` : ''}
${child.notes ? `- Notes: ${child.notes}` : ''}

Situation context:
- Location: ${t.context.locations[session.context.location]}
- Presence: ${t.context.presence[session.context.presence]}
- Privacy: ${t.context.physicality[session.context.physicality]}
- Parent's emotional state: ${t.context.emotionalState[session.context.emotionalState]}

Description of the situation:
${session.description}

${session.clarifications && session.clarifications.length > 0 ? `
Additional clarifications:
${session.clarifications.map(c => `- ${c.question}: ${c.answer}`).join('\n')}
` : ''}

Please provide a practical and actionable response in the following JSON format:
{
  "doNow": "What to do now - short and clear instructions (2-3 sentences)",
  "dontDo": "What not to do - behaviors to avoid (2-3 sentences)",
  "sayThis": "One specific phrase to say to the child - warm and natural"
}

Important:
- The response should be age-appropriate
- Be brief and practical
- Focus on immediate actions
- Consider the context and parent's emotional state
- Use warm and supportive language
- Return only the JSON, no additional text`;
  }
}

function getFollowUpPromptForLanguage(
  session: Session,
  child: Child,
  conversationHistory: ConversationTurn[],
  feedback: string
): string {
  const lang = getCurrentLanguage();
  const t = getTranslations();

  if (lang === 'he') {
    const historyText = conversationHistory.map((turn, i) => `
עצה ${i + 1}:
- מה לעשות: ${turn.response.doNow}
- מה לא לעשות: ${turn.response.dontDo}
- מה לומר: ${turn.response.sayThis}
${turn.followUp ? `משוב ההורה: ${turn.followUp}` : ''}
`).join('\n');

    return `אתה יועץ הורות מקצועי ומנוסה. ההורה קיבל עצה אבל היא לא עזרה, והוא מבקש עזרה נוספת.

מידע על הילד:
- שם: ${child.name}
- גיל: ${child.age}
${child.gender ? `- מין: ${child.gender === 'male' ? 'בן' : 'בת'}` : ''}
${child.characteristics ? `- מאפיינים: ${child.characteristics}` : ''}

הקשר הסיטואציה:
- מיקום: ${t.context.locations[session.context.location]}
- נוכחות: ${t.context.presence[session.context.presence]}
- מצב רוח ההורה: ${t.context.emotionalState[session.context.emotionalState]}

תיאור הסיטואציה המקורי:
${session.description}

היסטוריית העצות הקודמות:
${historyText}

משוב חדש מההורה:
${feedback}

אנא ספק עצה חדשה ושונה, שלוקחת בחשבון שהעצה הקודמת לא עבדה.
נסה גישה אחרת!

פורמט JSON:
{
  "doNow": "מה לעשות עכשיו - גישה חדשה ושונה (2-3 משפטים)",
  "dontDo": "מה לא לעשות (2-3 משפטים)",
  "sayThis": "משפט ספציפי אחד לומר לילד - שונה מהקודם"
}`;
  } else {
    const historyText = conversationHistory.map((turn, i) => `
Advice ${i + 1}:
- What to do: ${turn.response.doNow}
- What not to do: ${turn.response.dontDo}
- What to say: ${turn.response.sayThis}
${turn.followUp ? `Parent feedback: ${turn.followUp}` : ''}
`).join('\n');

    return `You are a professional and experienced parenting consultant. The parent received advice but it didn't help, and they're asking for additional help.

Information about the child:
- Name: ${child.name}
- Age: ${child.age}
${child.gender ? `- Gender: ${child.gender === 'male' ? 'Boy' : 'Girl'}` : ''}
${child.characteristics ? `- Characteristics: ${child.characteristics}` : ''}

Situation context:
- Location: ${t.context.locations[session.context.location]}
- Presence: ${t.context.presence[session.context.presence]}
- Parent's emotional state: ${t.context.emotionalState[session.context.emotionalState]}

Original situation description:
${session.description}

History of previous advice:
${historyText}

New feedback from the parent:
${feedback}

Please provide new and different advice, considering that the previous advice didn't work.
Try a different approach!

JSON format:
{
  "doNow": "What to do now - new and different approach (2-3 sentences)",
  "dontDo": "What not to do (2-3 sentences)",
  "sayThis": "One specific phrase to say to the child - different from before"
}`;
  }
}

async function generateWithClaude(
  session: Session,
  child: Child
): Promise<AIResponse> {
  const prompt = getPromptForLanguage(session, child);

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
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const response: AIResponse = JSON.parse(jsonMatch[0]);
    return response;
  } catch (error) {
    console.error('Failed to parse Claude response:', error);
    console.log('Raw response:', content.text);
    return findMatchingResponse(session.description);
  }
}

async function generateWithOpenAI(
  session: Session,
  child: Child
): Promise<AIResponse> {
  const prompt = getPromptForLanguage(session, child);

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

  if (!hasOpenAI && !hasClaude) {
    console.warn('No AI API key configured, using mock responses');
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

    await new Promise(resolve => setTimeout(resolve, 1000));
    return findMatchingResponse(session.description);
  }
}

export async function generateFollowUpResponse(
  session: Session,
  child: Child,
  conversationHistory: ConversationTurn[],
  feedback: string
): Promise<AIResponse> {
  const hasOpenAI = import.meta.env.VITE_OPENAI_API_KEY &&
                    import.meta.env.VITE_OPENAI_API_KEY !== 'your_openai_api_key_here';
  const hasClaude = import.meta.env.VITE_ANTHROPIC_API_KEY &&
                    import.meta.env.VITE_ANTHROPIC_API_KEY !== 'your_anthropic_api_key_here';

  if (!hasOpenAI && !hasClaude) {
    console.warn('No AI API key configured, using mock responses for follow-up');
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    return findMatchingResponse(feedback);
  }

  const followUpPrompt = getFollowUpPromptForLanguage(session, child, conversationHistory, feedback);

  try {
    if (hasOpenAI) {
      const openai = getOpenAIClient();
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: followUpPrompt }],
        response_format: { type: 'json_object' },
        max_tokens: 1024,
      });
      const content = completion.choices[0].message.content;
      if (content) {
        return JSON.parse(content);
      }
    } else if (hasClaude) {
      const anthropic = getAnthropicClient();
      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [{ role: 'user', content: followUpPrompt }],
      });
      const textContent = message.content[0];
      if (textContent.type === 'text') {
        const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }
    }
  } catch (error) {
    console.error('Error generating follow-up response:', error);
  }

  return findMatchingResponse(feedback);
}

export function getClarificationQuestions(
  description: string,
  context: { location: string; presence: string }
): string[] {
  const t = getTranslations();
  const questions: string[] = [];

  if (description.length < 30) {
    questions.push(t.clarification.questions.tellMore);
  }

  if (context.presence === 'public' || context.presence === 'strangers') {
    questions.push(t.clarification.questions.externalPressure);
  }

  if (description.includes('פעם ראשונה') || description.includes('חדש') ||
      description.includes('first time') || description.includes('new')) {
    questions.push(t.clarification.questions.frequency);
  }

  return questions.slice(0, 3);
}

// Keep for backwards compatibility but Context.tsx now uses translations directly
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
