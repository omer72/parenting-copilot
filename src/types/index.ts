export type KnownChallenge = 'tantrums' | 'separation' | 'food_refusal' | 'sleep_issues' | 'sibling_fights' | 'social_difficulties';

export interface Child {
  id: string;
  name: string;
  age: number;
  gender?: 'male' | 'female';
  characteristics: string;
  notes?: string;
  siblings?: string;
  knownChallenges?: KnownChallenge[];
}

export type Location = 'home' | 'street' | 'car' | 'mall' | 'restaurant';
export type Presence = 'alone' | 'spouse' | 'other_adults' | 'strangers';
export type EmotionalState = 'calm' | 'frustrated' | 'angry' | 'anxious';
export type ChildPhysicalState = 'hungry' | 'tired' | 'sick' | 'fine';
export type Frequency = 'first_time' | 'sometimes' | 'often';

export interface SessionContext {
  location: Location;
  presence: Presence;
  emotionalState: EmotionalState;
  childPhysicalState: ChildPhysicalState;
  frequency: Frequency;
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
