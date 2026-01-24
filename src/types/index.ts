export type ParentingMethod = 'positive' | 'authoritative' | 'attachment' | 'montessori' | 'respectful';

export interface Child {
  id: string;
  name: string;
  age: number;
  gender?: 'male' | 'female';
  characteristics: string;
  notes?: string;
  parentingMethod?: ParentingMethod;
}

export type Location = 'home' | 'street' | 'car' | 'mall' | 'restaurant';
export type Presence = 'alone' | 'spouse' | 'other_adults' | 'strangers';
export type Physicality = 'private' | 'public';
export type EmotionalState = 'calm' | 'frustrated' | 'angry' | 'anxious';

export interface SessionContext {
  location: Location;
  presence: Presence;
  physicality: Physicality;
  emotionalState: EmotionalState;
}

export interface Clarification {
  question: string;
  answer: string;
}

export interface Session {
  childId: string;
  context: SessionContext;
  description: string;
  clarifications: Clarification[];
  conversationHistory?: ConversationTurn[];
}

export interface AIResponse {
  doNow: string;
  dontDo: string;
  sayThis: string;
}

export interface ConversationTurn {
  response: AIResponse;
  feedback?: 'helped' | 'not_helped';
  followUp?: string;
  timestamp: Date;
}

export interface AppState {
  children: Child[];
  currentSession: Partial<Session> | null;
}

export interface CompletedInteraction {
  id: string;
  timestamp: Date;
  childId: string;
  context: SessionContext;
  description: string;
  clarifications: Clarification[];
  responses: ConversationTurn[];
  resolved: boolean;
}

export interface DailyReportResponse {
  summary: string;
  patterns: string[];
  successHighlights: string;
  areasToWatch: string;
  tomorrowTips: string[];
}
