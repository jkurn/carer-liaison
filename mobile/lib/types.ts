/**
 * Core types for Carer Liaison mobile app.
 */

// ── Body State ──────────────────────────────────────────────
export type BodyState = 'great' | 'calm' | 'neutral' | 'resistant' | 'difficult';

export const BODY_STATES: { key: BodyState; emoji: string; label: string }[] = [
  { key: 'great', emoji: '😊', label: 'Great' },
  { key: 'calm', emoji: '😌', label: 'Calm' },
  { key: 'neutral', emoji: '😐', label: 'Neutral' },
  { key: 'resistant', emoji: '😤', label: 'Resistant' },
  { key: 'difficult', emoji: '😰', label: 'Difficult' },
];

// ── Chat Messages ───────────────────────────────────────────
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string; // ISO 8601
}

// ── RBT Reflection ──────────────────────────────────────────
export interface RBTItem {
  title: string;
  body: string;
  quote: string;
  tags: string[];
}

export interface RBTReflection {
  rose: RBTItem;
  bud: RBTItem;
  thorn: RBTItem;
  actions: { text: string; category: string }[];
  psychology: {
    concept: string;
    explanation: string;
    stat: string;
    source_hint: string;
  };
  journey_context: string;
  people: string[];
  emotions: string[];
  services: string[];
  mood_score: number;
  mood_label: string;
  energy_label: string;
}

// ── Journal Entry ───────────────────────────────────────────
export interface JournalEntry {
  id: string;
  userId: string;
  title: string | null;
  bodyState: BodyState | null;
  conversation: ChatMessage[];
  rose: RBTItem | null;
  bud: RBTItem | null;
  thorn: RBTItem | null;
  insights: Omit<RBTReflection, 'rose' | 'bud' | 'thorn'> | null;
  isDraft: boolean;
  isCrisis: boolean;
  createdAt: string;
  updatedAt: string;
  syncedAt: string | null;
}

// ── Body State Log ──────────────────────────────────────────
export interface BodyStateLog {
  id: string;
  userId: string;
  state: BodyState;
  note: string | null;
  createdAt: string;
  syncedAt: string | null;
}

// ── AI Chat Modes ───────────────────────────────────────────
export type AIChatMode = 'chat' | 'reflect';

// ── Suggestion Buttons ──────────────────────────────────────
export const JOURNAL_SUGGESTIONS = [
  'Suggest some ideas',
  'Help me think through this',
  'Offer different perspective',
  'Suggest next steps',
  'Analyze further',
] as const;

export type JournalSuggestion = typeof JOURNAL_SUGGESTIONS[number];
