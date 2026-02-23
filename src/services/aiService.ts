import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import type { AIResponse, Session, Child, ConversationTurn, DailyReportResponse, CompletedInteraction } from '../types';
import type { Language } from '../locales';
import { he } from '../locales/he';
import { en } from '../locales/en';
import { buildHistorySection } from './historyService';

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
    // Use proxy in development to avoid CORS issues
    const isDev = import.meta.env.DEV;
    openaiClient = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'dummy-key',
      dangerouslyAllowBrowser: true,
      ...(isDev && { baseURL: `${window.location.origin}/api/openai/v1` }),
    });
  }
  return openaiClient;
}

// For production web, use Netlify function to avoid CORS
async function callOpenAIViaProxy(messages: { role: string; content: string }[], jsonMode = false): Promise<string> {
  const response = await fetch('/.netlify/functions/openai-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages,
      max_tokens: 1024,
      ...(jsonMode && { response_format: { type: 'json_object' } }),
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'OpenAI proxy request failed');
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

function shouldUseProxy(): boolean {
  // Use proxy in production web (not native Capacitor)
  const isProd = !import.meta.env.DEV;
  // Check if running as native app using Capacitor's isNativePlatform
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  const isNative = cap?.isNativePlatform?.() ?? false;
  return isProd && !isNative;
}

// Check if OpenAI is available (via proxy in prod, or via API key in dev/native)
function hasOpenAIAccess(): boolean {
  if (shouldUseProxy()) {
    // In production web, we use the Netlify proxy - API key is server-side
    return true;
  }
  // In dev or native, we need the client-side API key
  const key = import.meta.env.VITE_OPENAI_API_KEY;
  return !!key && key !== 'your_openai_api_key_here';
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

function getMethodologyPromptHe(): string {
  return `אתה יועץ הורות מקצועי ומנוסה.

## הגישה שלך מבוססת על העקרונות הבאים:

### טכניקת אפר"ת (הכלי המרכזי)
אירוע → פרשנות → רגש → תגובה.
לא האירוע גורם לרגש, אלא הפרשנות שלנו. כשמשנים פרשנות - משתנה הרגש והתגובה.
תמיד הנח כוונה טובה אצל הילד: הוא לא עושה דברים "נגד" ההורה, אלא "בשביל" עצמו.
עזור להורה לזהות את הפרשנות השלילית שלו ולהציע פרשנות אמפתית חלופית.

### אמפתיה - 7 צעדים
1. שתוק ונשום
2. גלה מבט משתתף
3. שקף: "אני רואה שאת/ה עצוב/כועס"
4. שתוק וחכה לתגובה
5. התחבר לרגש, לא לסיבה
6. תקף: "אני מבין, זה באמת מכעיס/עצוב"
7. שאל אם רוצה חיבוק

### התקפי זעם
בזמן ההתקף: לא מדברים, לא מסבירים, לא מטיפים. פשוט להיות נוכחים, רגועים, לתת לגיטימציה לרגש.
אחרי ההתקף: למצוא זמן רגוע לשיחה, לשאול שאלות בסקרנות, לאפשר שתיקות.
משחק בפנטזיה (בהשראת חיים גינוט): "הלוואי שהיה לי שרביט קסמים..." - מאפשר לילד להרגיש מובן בלי שנכנעים.

### עידוד מול שבח
לעודד מאמץ ותהליך, לא תכונות או תוצאות.
לא: "איזה חכם אתה" (יוצר פחד מכישלון)
כן: "ראיתי כמה התאמצת, זה משתלם" (בונה חוסן)

### מיתוס השליטה
שליטה בילד היא אשליה. אפשר רק להשפיע, דרך קשר ודוגמה אישית.
ככל שלוחצים יותר - הילד מתנגד יותר (מוטיבציית הדווקא).
להתמקד במה שכן בשליטתנו: ההתנהגות והתגובות שלנו.

### חלופות לאיומים ועונשים
תוצאות טבעיות במקום עונשים: אם לא לוקח מעיל - יהיה קר.
להציע בחירות: "אתה רוצה להתלבש לפני או אחרי ארוחת הבוקר?"
לתאר את הבעיה בלי להאשים: "אני רואה מגבת רטובה על הרצפה."

### מריבות אחים
לא להתערב, לא לשפוט מי התחיל. להביע אמון: "אני סומך עליכם שתפתרו בעצמכם."
לשים את כולם באותה סירה. לתת תשומת לב כשמשתפים פעולה.
להתערב רק בסכנה פיזית - ואז רק להפריד, בלי לחקור.

### מיינדפולנס - 3 שאלות לפני כל תגובה
1. האם זה הכרחי?
2. האם זה מלמד בצורה חיובית?
3. האם זה נאמר בחסד?

### חינוך עקיף
תשומת לב = דשן. להתמקד בהתנהגויות שרוצים לחזק ולהתעלם ממה שרוצים להחליש.
דוגמה אישית היא הכלי החזק ביותר. ילדים לומדים ממה שאנחנו עושים, לא ממה שאנחנו אומרים.

### התפתחות מוחית
המוח הקדם-מצחי מתפתח עד גיל 25. ילדים לא יכולים לווסת רגשות כמו מבוגרים - זו ביולוגיה, לא "רצון רע".
להתאים ציפיות לגיל. לפני פיענוח פסיכולוגי - לשלול רעב ועייפות.

## כללי תגובה:
- תמיד תן פרשנות אמפתית להתנהגות הילד (אפר"ת)
- הצע משפט ספציפי שההורה יכול לומר לילד - חם, מכבד, מותאם לגיל
- אל תציע איומים, עונשים, שוחד, או השפלה
- אל תציע "לדבר על זה" בזמן משבר - רק אחרי
- עודד מאמץ ותהליך, לא תכונות
- היה קצר ופרקטי - ההורה במצב לחוץ ברגע הזה`;
}

function getMethodologyPromptEn(): string {
  return `You are a professional and experienced parenting consultant.

## Your approach is based on these principles:

### EFRAT Technique (Core Tool)
Event → Interpretation → Emotion → Response.
It's not the event that causes the emotion, but our interpretation. Change the interpretation - change the emotion and response.
Always assume good intent from the child: they don't act "against" the parent, but "for" themselves.
Help the parent identify their negative interpretation and suggest an empathic alternative.

### Empathy - 7 Steps
1. Be quiet and breathe
2. Show a caring look
3. Reflect: "I can see you're sad/angry"
4. Be quiet and wait for their response
5. Connect to the emotion, not the reason
6. Validate: "I understand, that really is frustrating/sad"
7. Ask if they want a hug

### Tantrums
During: Don't talk, explain, or lecture. Just be present, calm, validate the emotion.
After: Find a calm moment to talk, ask questions with curiosity, allow silences.
Fantasy play (inspired by Haim Ginott): "I wish I had a magic wand..." - lets the child feel understood without giving in.

### Encouragement vs. Praise
Encourage effort and process, not traits or outcomes.
Don't: "You're so smart" (creates fear of failure)
Do: "I can see how hard you worked, it pays off" (builds resilience)

### The Control Myth
Control over children is an illusion. You can only influence, through connection and personal example.
The more you push - the more the child resists ("spite motivation").
Focus on what you can control: your own behavior and reactions.

### Alternatives to Threats and Punishments
Natural consequences instead of punishments: no coat = feeling cold.
Offer choices: "Do you want to get dressed before or after breakfast?"
Describe the problem without blame: "I see a wet towel on the floor."

### Sibling Fights
Don't intervene, don't judge who started it. Express trust: "I trust you to work it out."
Put everyone in the same boat. Give attention when they cooperate.
Intervene only when physically dangerous - then just separate, don't investigate.

### Mindfulness - 3 Questions Before Every Response
1. Is it necessary?
2. Does it teach in a positive way?
3. Is it said with kindness?

### Indirect Education
Attention = fertilizer. Focus on behaviors you want to strengthen, ignore what you want to weaken.
Personal example is the most powerful tool. Children learn from what we do, not what we say.

### Brain Development
The prefrontal cortex develops until age 25. Children cannot regulate emotions like adults - it's biology, not "bad will".
Adjust expectations to age. Before psychological analysis - rule out hunger and tiredness.

## Response Rules:
- Always provide an empathic interpretation of the child's behavior (EFRAT)
- Suggest a specific phrase the parent can say - warm, respectful, age-appropriate
- Never suggest threats, punishments, bribes, or humiliation
- Never suggest "talking about it" during a crisis - only after
- Encourage effort and process, not traits
- Be brief and practical - the parent is stressed right now`;
}

function getPromptForLanguage(session: Session, child: Child, history: string): string {
  const lang = getCurrentLanguage();
  const t = getTranslations();

  if (lang === 'he') {
    return `${getMethodologyPromptHe()}

מידע על הילד:
- שם: ${child.name}
- גיל: ${child.age}
${child.gender ? `- מין: ${child.gender === 'male' ? 'בן' : 'בת'}` : ''}
${child.characteristics ? `- מאפיינים: ${child.characteristics}` : ''}
${child.notes ? `- הערות: ${child.notes}` : ''}
${history}
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
  "doNow": "מה לעשות עכשיו - הנחיות קצרות וברורות לפי הגישה (2-3 משפטים)",
  "dontDo": "מה לא לעשות - התנהגויות שכדאי להימנע מהן לפי הגישה (2-3 משפטים)",
  "sayThis": "משפט ספציפי אחד לומר לילד - מנוסח בעברית טבעית וחמה, מבוסס על אמפתיה ושיקוף"
}

חשוב:
- התשובה צריכה להיות מותאמת לגיל הילד ולהתפתחות המוחית שלו
- היה קצר ופרקטי
- התמקד בפעולות מיידיות
- התחשב בהקשר והמצב הרגשי של ההורה
- השתמש בשפה חמה ותומכת
- בשדה sayThis - הצע משפט שמשקף את הרגש של הילד ומתקף אותו
- החזר רק את ה-JSON, ללא טקסט נוסף`;
  } else {
    return `${getMethodologyPromptEn()}

Information about the child:
- Name: ${child.name}
- Age: ${child.age}
${child.gender ? `- Gender: ${child.gender === 'male' ? 'Boy' : 'Girl'}` : ''}
${child.characteristics ? `- Characteristics: ${child.characteristics}` : ''}
${child.notes ? `- Notes: ${child.notes}` : ''}
${history}
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
  "doNow": "What to do now - short and clear instructions based on the methodology (2-3 sentences)",
  "dontDo": "What not to do - behaviors to avoid based on the methodology (2-3 sentences)",
  "sayThis": "One specific phrase to say to the child - warm, natural, based on empathy and reflection"
}

Important:
- The response should be age-appropriate considering brain development stage
- Be brief and practical
- Focus on immediate actions
- Consider the context and parent's emotional state
- Use warm and supportive language
- In sayThis - suggest a phrase that reflects and validates the child's emotion
- Return only the JSON, no additional text`;
  }
}

function getFollowUpPromptForLanguage(
  session: Session,
  child: Child,
  conversationHistory: ConversationTurn[],
  feedback: string,
  history: string
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

    return `${getMethodologyPromptHe()}

ההורה קיבל עצה אבל היא לא עזרה, והוא מבקש עזרה נוספת.

מידע על הילד:
- שם: ${child.name}
- גיל: ${child.age}
${child.gender ? `- מין: ${child.gender === 'male' ? 'בן' : 'בת'}` : ''}
${child.characteristics ? `- מאפיינים: ${child.characteristics}` : ''}
${history}
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

העצה הקודמת לא עבדה. נסה כלי אחר מתוך הגישה:
- אם ניסית אמפתיה ישירה, נסה משחק בפנטזיה ("הלוואי ש...")
- אם ניסית שיקוף, נסה שתיקה ונוכחות פיזית
- אם ניסית לדבר, נסה לתת מרחב ולהתעלם (אם אין סכנה)
- אם המצב מתגבר, הצע להורה לקחת נשימה ולשאול את 3 השאלות: הכרחי? חיובי? בחסד?
- שקול אם יש צורך בתוצאה טבעית במקום התערבות

פורמט JSON:
{
  "doNow": "מה לעשות עכשיו - גישה חדשה ושונה מתוך הכלים של הגישה (2-3 משפטים)",
  "dontDo": "מה לא לעשות (2-3 משפטים)",
  "sayThis": "משפט ספציפי אחד לומר לילד - שונה מהקודם, מבוסס על כלי אחר מהגישה"
}`;
  } else {
    const historyText = conversationHistory.map((turn, i) => `
Advice ${i + 1}:
- What to do: ${turn.response.doNow}
- What not to do: ${turn.response.dontDo}
- What to say: ${turn.response.sayThis}
${turn.followUp ? `Parent feedback: ${turn.followUp}` : ''}
`).join('\n');

    return `${getMethodologyPromptEn()}

The parent received advice but it didn't help, and they're asking for additional help.

Information about the child:
- Name: ${child.name}
- Age: ${child.age}
${child.gender ? `- Gender: ${child.gender === 'male' ? 'Boy' : 'Girl'}` : ''}
${child.characteristics ? `- Characteristics: ${child.characteristics}` : ''}
${history}
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

The previous advice didn't work. Try a different tool from the methodology:
- If direct empathy was tried, try fantasy play ("I wish I had a magic wand...")
- If reflection was tried, try silence and physical presence
- If talking was tried, try giving space and ignoring (if safe)
- If the situation is escalating, suggest the parent breathe and ask the 3 questions: Necessary? Positive? Kind?
- Consider whether a natural consequence would work better than intervention

JSON format:
{
  "doNow": "What to do now - new and different approach using a different tool from the methodology (2-3 sentences)",
  "dontDo": "What not to do (2-3 sentences)",
  "sayThis": "One specific phrase to say to the child - different from before, based on a different tool from the methodology"
}`;
  }
}

async function generateWithClaude(
  session: Session,
  child: Child,
  history: string
): Promise<AIResponse> {
  const prompt = getPromptForLanguage(session, child, history);

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
  child: Child,
  history: string
): Promise<AIResponse> {
  const prompt = getPromptForLanguage(session, child, history);

  let content: string | null;

  if (shouldUseProxy()) {
    content = await callOpenAIViaProxy([{ role: 'user', content: prompt }], true);
  } else {
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 1024,
    });
    content = completion.choices[0].message.content;
  }

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
  child: Child,
  completedInteractions: CompletedInteraction[] = []
): Promise<AIResponse> {
  const hasOpenAI = hasOpenAIAccess();
  const hasClaude = import.meta.env.VITE_ANTHROPIC_API_KEY &&
                    import.meta.env.VITE_ANTHROPIC_API_KEY !== 'your_anthropic_api_key_here';

  const lang = getCurrentLanguage();
  const history = buildHistorySection(child.id, completedInteractions, session.description, lang);

  if (!hasOpenAI && !hasClaude) {
    console.warn('No AI API key configured, using mock responses');
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    return findMatchingResponse(session.description);
  }

  try {
    if (hasOpenAI) {
      console.log('Using OpenAI for response generation');
      return await generateWithOpenAI(session, child, history);
    } else {
      console.log('Using Claude for response generation');
      return await generateWithClaude(session, child, history);
    }
  } catch (error) {
    console.error('Error calling AI API:', error);

    try {
      if (hasOpenAI && hasClaude) {
        console.log('Falling back to alternative AI provider');
        return hasOpenAI
          ? await generateWithClaude(session, child, history)
          : await generateWithOpenAI(session, child, history);
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
  feedback: string,
  completedInteractions: CompletedInteraction[] = []
): Promise<AIResponse> {
  const hasOpenAI = hasOpenAIAccess();
  const hasClaude = import.meta.env.VITE_ANTHROPIC_API_KEY &&
                    import.meta.env.VITE_ANTHROPIC_API_KEY !== 'your_anthropic_api_key_here';

  if (!hasOpenAI && !hasClaude) {
    console.warn('No AI API key configured, using mock responses for follow-up');
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    return findMatchingResponse(feedback);
  }

  const lang = getCurrentLanguage();
  const history = buildHistorySection(child.id, completedInteractions, session.description, lang);
  const followUpPrompt = getFollowUpPromptForLanguage(session, child, conversationHistory, feedback, history);

  try {
    if (hasOpenAI) {
      let content: string | null;
      if (shouldUseProxy()) {
        content = await callOpenAIViaProxy([{ role: 'user', content: followUpPrompt }], true);
      } else {
        const openai = getOpenAIClient();
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: followUpPrompt }],
          response_format: { type: 'json_object' },
          max_tokens: 1024,
        });
        content = completion.choices[0].message.content;
      }
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

function getDailyReportFromDescriptionPrompt(
  description: string,
  child: Child
): string {
  const lang = getCurrentLanguage();

  if (lang === 'he') {
    return `${getMethodologyPromptHe()}

## משימה: דוח יומי

הורה מספר לך על היום שלו עם הילד. נתח את היום לפי עקרונות הגישה.

מידע על הילד:
- שם: ${child.name}
- גיל: ${child.age}
${child.gender ? `- מין: ${child.gender === 'male' ? 'בן' : 'בת'}` : ''}
${child.characteristics ? `- מאפיינים: ${child.characteristics}` : ''}

תיאור היום מההורה:
${description}

אנא נתח את היום ותן תובנות בפורמט JSON הבא:
{
  "summary": "סיכום קצר של היום מנקודת מבט הגישה - זהה רגעי אמפתיה, שליטה, או הדבקה רגשית (2-3 משפטים)",
  "patterns": ["דפוס שזיהית לפי אפר\"ת - איזו פרשנות הובילה לאיזו תגובה", "דפוס נוסף אם רלוונטי"],
  "successHighlights": "רגעים שבהם ההורה הגיב בהתאם לגישה - עודד מאמץ, גילה אמפתיה, שחרר שליטה, נשם לפני תגובה (2-3 משפטים)",
  "areasToWatch": "נקודה אחת לשים לב אליה - הצע פרשנות חלופית (אפר\"ת) או כלי ספציפי מהגישה (2-3 משפטים)",
  "tomorrowTips": ["טיפ מעשי מבוסס על הגישה 1", "טיפ מעשי 2", "טיפ מעשי 3"]
}

חשוב:
- עודד מאמץ, לא תכונות! ("השקעת היום" ולא "את אמא מדהימה")
- התמקד ברגעים שההורה הגיב נכון לפי הגישה
- הטיפים צריכים להיות מבוססים על כלים ספציפיים מהגישה
- התאם את התובנות לגיל הילד ולהתפתחות המוחית שלו
- החזר רק את ה-JSON, ללא טקסט נוסף`;
  } else {
    return `${getMethodologyPromptEn()}

## Task: Daily Report

A parent is telling you about their day with their child. Analyze the day according to the methodology's principles.

Information about the child:
- Name: ${child.name}
- Age: ${child.age}
${child.gender ? `- Gender: ${child.gender === 'male' ? 'Boy' : 'Girl'}` : ''}
${child.characteristics ? `- Characteristics: ${child.characteristics}` : ''}

Parent's description of the day:
${description}

Please analyze the day and provide insights in the following JSON format:
{
  "summary": "Brief summary from the methodology's perspective - identify moments of empathy, control, or emotional contagion (2-3 sentences)",
  "patterns": ["Pattern identified using EFRAT - which interpretation led to which response", "Another pattern if relevant"],
  "successHighlights": "Moments where the parent responded according to the methodology - encouraged effort, showed empathy, released control, breathed before reacting (2-3 sentences)",
  "areasToWatch": "One area to improve - suggest an alternative interpretation (EFRAT) or a specific tool from the methodology (2-3 sentences)",
  "tomorrowTips": ["Practical tip based on the methodology 1", "Practical tip 2", "Practical tip 3"]
}

Important:
- Encourage effort, not traits! ("You invested today" not "You're an amazing parent")
- Focus on moments where the parent responded well according to the methodology
- Tips should be based on specific tools from the methodology
- Tailor insights to the child's age and brain development stage
- Return only the JSON, no additional text`;
  }
}

function getMockDailyReport(interactionCount: number): DailyReportResponse {
  const t = getTranslations();
  const mockReports = t.mockResponses.dailyReport as {
    noInteractions: DailyReportResponse;
    fewInteractions: DailyReportResponse;
    manyInteractions: DailyReportResponse;
  };

  if (interactionCount === 0) {
    return mockReports.noInteractions;
  } else if (interactionCount <= 3) {
    return mockReports.fewInteractions;
  } else {
    return mockReports.manyInteractions;
  }
}

export async function generateDailyReportFromDescription(
  description: string,
  child: Child
): Promise<DailyReportResponse> {
  const hasOpenAI = hasOpenAIAccess();
  const hasClaude = import.meta.env.VITE_ANTHROPIC_API_KEY &&
                    import.meta.env.VITE_ANTHROPIC_API_KEY !== 'your_anthropic_api_key_here';

  if (!hasOpenAI && !hasClaude) {
    console.warn('No AI API key configured, using mock daily report');
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    return getMockDailyReport(description.length > 200 ? 5 : 2);
  }

  const prompt = getDailyReportFromDescriptionPrompt(description, child);

  try {
    if (hasOpenAI) {
      let content: string | null;
      if (shouldUseProxy()) {
        content = await callOpenAIViaProxy([{ role: 'user', content: prompt }], true);
      } else {
        const openai = getOpenAIClient();
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
          max_tokens: 1024,
        });
        content = completion.choices[0].message.content;
      }
      if (content) {
        return JSON.parse(content);
      }
    } else if (hasClaude) {
      const anthropic = getAnthropicClient();
      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
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
    console.error('Error generating daily report:', error);
  }

  return getMockDailyReport(description.length > 200 ? 5 : 2);
}
