/**
 * Test data factories — single source of truth for test fixtures.
 * Every test uses factories instead of inline object construction.
 * Override only what the test cares about; everything else is a safe default.
 */
import type { ChatMessage, JournalEntry, RBTItem, BodyState } from '../../lib/types';

// ── Chat Messages ────────────────────────────────────────────

export const createTestMessage = (overrides: Partial<ChatMessage> = {}): ChatMessage => ({
  role: 'user',
  content: 'Today was really hard. He had a meltdown at the shops.',
  timestamp: '2026-04-08T10:00:00Z',
  ...overrides,
});

export const createTestConversation = (length = 4): ChatMessage[] =>
  [
    createTestMessage({ role: 'assistant', content: "Hey. What's sitting with you right now?" }),
    createTestMessage({ role: 'user', content: 'Today was really hard.' }),
    createTestMessage({ role: 'assistant', content: 'Sounds like the day wore on you.' }),
    createTestMessage({ role: 'user', content: 'Yeah. He had a meltdown at the shops and I froze.' }),
  ].slice(0, length);

// ── RBT Items ────────────────────────────────────────────────

export const createTestRBTItem = (overrides: Partial<RBTItem> = {}): RBTItem => ({
  title: 'Small win',
  body: 'You noticed the calm moment even in a hard day.',
  quote: 'he smiled at the park',
  tags: ['resilience'],
  ...overrides,
});

// ── Full Reflection JSON (as LLM would return) ──────────────

export const createTestReflectionJSON = (overrides: Record<string, unknown> = {}): string =>
  JSON.stringify({
    rose: createTestRBTItem(),
    bud: createTestRBTItem({ title: 'Growing', body: 'Something is shifting.', tags: ['growth'] }),
    thorn: createTestRBTItem({ title: 'Hard moment', body: 'The meltdown was overwhelming.', tags: ['exhaustion'] }),
    actions: [{ text: 'Take 5 minutes for yourself tonight', category: 'self-care' }],
    psychology: {
      concept: 'Caregiver Hypervigilance',
      explanation: 'Constant alertness that builds over time.',
      stat: '72% of carers report this',
      source_hint: 'Carers Australia 2023',
    },
    journey_context: 'Today was one of those days where the weight showed up.',
    people: ['Brother (participant)'],
    emotions: ['exhaustion', 'love', 'frustration'],
    services: [],
    mood_score: 35,
    mood_label: 'Stretched thin',
    energy_label: 'Running on fumes',
    ...overrides,
  });

// ── Journal Entries ──────────────────────────────────────────

export const createTestEntry = (overrides: Partial<JournalEntry> = {}): JournalEntry => ({
  id: 'entry-test-001',
  userId: 'user-test-001',
  title: 'Stretched thin',
  bodyState: 'difficult' as BodyState,
  conversation: createTestConversation(),
  rose: createTestRBTItem(),
  bud: createTestRBTItem({ title: 'Growing', tags: ['growth'] }),
  thorn: createTestRBTItem({ title: 'Hard moment', tags: ['exhaustion'] }),
  insights: {
    actions: [{ text: 'Take 5 minutes for yourself tonight', category: 'self-care' }],
    psychology: {
      concept: 'Caregiver Hypervigilance',
      explanation: 'Constant alertness.',
      stat: '72%',
      source_hint: 'Carers Australia 2023',
    },
    journey_context: 'Today was one of those days.',
    people: ['Brother (participant)'],
    emotions: ['exhaustion', 'love'],
    services: [],
    mood_score: 35,
    mood_label: 'Stretched thin',
    energy_label: 'Running on fumes',
  },
  isDraft: false,
  isCrisis: false,
  createdAt: '2026-04-08T10:00:00Z',
  updatedAt: '2026-04-08T10:15:00Z',
  syncedAt: null,
  ...overrides,
});

// ── Database Rows (raw SQLite shape, before rowToEntry) ──────

export const createTestRow = (overrides: Record<string, unknown> = {}) => ({
  id: 'entry-test-001',
  userId: 'user-test-001',
  title: 'Stretched thin',
  bodyState: 'difficult',
  conversation: JSON.stringify(createTestConversation()),
  rose: JSON.stringify(createTestRBTItem()),
  bud: JSON.stringify(createTestRBTItem({ title: 'Growing' })),
  thorn: JSON.stringify(createTestRBTItem({ title: 'Hard moment' })),
  insights: JSON.stringify({
    actions: [],
    psychology: { concept: 'Test', explanation: '...', stat: '50%', source_hint: 'Test' },
    journey_context: 'Test.',
    people: [],
    emotions: ['tired'],
    services: [],
    mood_score: 40,
    mood_label: 'Heavy',
    energy_label: 'Stretched thin',
  }),
  isDraft: false,
  isCrisis: false,
  createdAt: '2026-04-08T10:00:00Z',
  updatedAt: '2026-04-08T10:15:00Z',
  syncedAt: null,
  ...overrides,
});

// ── Supabase unsynced entry (raw row shape from getUnsyncedEntries) ──

export const createUnsyncedRow = (overrides: Record<string, unknown> = {}) => ({
  id: 'entry-unsynced-001',
  userId: 'user-test-001',
  title: null,
  bodyState: null,
  conversation: '[]',
  rose: null,
  bud: null,
  thorn: null,
  insights: null,
  isDraft: true,
  isCrisis: false,
  createdAt: '2026-04-08T10:00:00Z',
  updatedAt: '2026-04-08T10:00:00Z',
  syncedAt: null,
  ...overrides,
});
