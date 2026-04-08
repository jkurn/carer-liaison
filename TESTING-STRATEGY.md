# Carer Liaison — Testing Strategy

**Can you deploy at 4:55 PM on Friday?** Not yet. The data layer has zero tests, the edge function is untested, and the mocks only cover success paths. This strategy gets us there.

Last updated: 2026-04-08. Produced using the A+ testing-strategy-coverage framework (12-step).

---

## 1. Current State (Baseline)

| Metric | Value |
|--------|-------|
| Total test suites | 4 (all passing) |
| Total tests | 42 |
| Skipped tests | 0 |
| Run time | 1.2 seconds |
| Random order | ✅ Passes (seed 1913271670) — no isolation issues |
| Test runner | Jest 29.7.0 + jest-expo |
| RNTL installed | v13.3.3 (unused) |

### Per-File Coverage (from `jest --coverage`)

| File | % Stmts | % Branch | % Funcs | % Lines | Uncovered |
|------|---------|----------|---------|---------|-----------|
| journal-ai.ts | 12.1% | 22.2% | 12.5% | 12.9% | Lines 125-208 (sendChat, extractReflection) |
| store.ts | 90.0% | 66.7% | 88.9% | 87.5% | Line 45 (session edge case) |
| theme.ts | 100% | 100% | 100% | 100% | — |
| types.ts | 100% | 100% | 100% | 100% | — |
| **database.ts** | **0%** | **0%** | **0%** | **0%** | **Entire file** |
| **sync.ts** | **0%** | **0%** | **0%** | **0%** | **Entire file** |
| **supabase.ts** | **0%** | **0%** | **0%** | **0%** | **Entire file** |
| **Components (5)** | **0%** | **0%** | **0%** | **0%** | **All files** |
| **Screens (11)** | **0%** | **0%** | **0%** | **0%** | **All files** |
| **Edge fn (1)** | **0%** | **0%** | **0%** | **0%** | **Entire file** |

---

## 2. Test Quality Audit

### Assertion Quality Breakdown

| Quality Level | Count | Tests |
|---------------|-------|-------|
| Garbage (`.toBeDefined()` only) | 3 | theme: "has all surface colors", "has all 5 body state colors", "has all RBT semantic colors" |
| Weak (`.toBeTruthy()` only) | 1 | types: "each state has key, emoji, and label" |
| Adequate (`.toBe()` / `.toEqual()`) | 18 | Most crisis detection, store state checks, single-field validations |
| Strong (multi-assertion, edge cases) | 17 | Store mutations, conversation ordering, body state values |
| Excellent | 3 | BODY_STATES order, spacing multiples-of-4, Inter font exclusion |

### Happy Path vs Error Path Ratio

| Path Type | Count | % |
|-----------|-------|---|
| Happy path | 31 | 74% |
| Edge case | 9 | 21% |
| Error path | 2 | 5% |

**Problem:** Only 2 error path tests in the entire suite. Both are for JSON parsing (throws on invalid/empty). Zero error path tests for: auth failure, network errors, database errors, sync failures, AI provider failures.

### Mock Fidelity Audit

| Mock | Mocks Success? | Mocks Failure? | Fidelity Grade |
|------|---------------|----------------|----------------|
| expo-secure-store | ✅ | ❌ Never fails | D |
| expo-sqlite | ✅ | ❌ Never fails | D |
| supabase.auth.getSession | ✅ Returns null session | ❌ Never throws | C |
| supabase.auth.signInWithPassword | ⚠️ No return configured | ❌ | F |
| supabase.from().upsert() | ✅ Returns `{ error: null }` | ❌ Never returns error | D |
| supabase.from().select() | ✅ Returns `{ data: null }` | ❌ Never returns error | D |

**Critical gap:** Every mock only returns success. Zero tests can exercise error handling because the mocks don't support failure modes.

### Test Smell Detection

| Smell | Count | Instances |
|-------|-------|-----------|
| **The Liar** | 4 | theme.test.ts: 3 tests use `.toBeDefined()` that pass even if values are wrong; types.test.ts: `.toBeTruthy()` passes for any truthy value |
| **The Survivor** | 5 | store: "sets body state", "clears body state", "defaults to online"; theme: "cards use 12px radius", "buttons use 8px radius" — these pass even if the function was deleted |
| **The Inspector** | 3 | journal-ai: "strips markdown code fences" and "strips code fence without json label" and "handles JSON with extra whitespace" — single-field assertion doesn't prove full parsing |
| **The Mockery** | 0 | Mock setup is lean (good) but doesn't mock failures (bad) |
| **The Happy Path Addict** | Suite-wide | 74% happy paths, 5% error paths |

### Test Isolation

✅ Passes `jest --randomize` (seed 1913271670). Store tests use `beforeEach` reset via `useStore.setState()`. No shared file/network state. **No isolation issues.**

---

## 3. Risk-Scored File Assessment

### Scoring: 5 dimensions, 1-5 each. Risk = max(dimensions).

| File | Data | Security | Core Loop | Complexity | Blast Radius | **Risk** | **Tier** | Has Tests? |
|------|------|----------|-----------|------------|-------------|----------|----------|------------|
| `lib/database.ts` | **5** | 2 | 4 | 4 | **5** | **5** | CRITICAL | ❌ |
| `lib/journal-ai.ts` | 3 | 3 | **5** | 4 | 3 | **5** | CRITICAL | ⚠️ Partial (12.9%) |
| `supabase/functions/journal-ai/index.ts` | 2 | **5** | **5** | 4 | 3 | **5** | CRITICAL | ❌ |
| `lib/sync.ts` | **5** | 2 | 3 | 3 | 2 | **5** | CRITICAL | ❌ |
| `lib/store.ts` | 2 | 2 | 3 | 3 | **5** | **5** | CRITICAL | ✅ (87.5%) |
| `lib/supabase.ts` | 1 | 3 | 2 | 3 | **5** | **5** | CRITICAL | ❌ |
| `app/journal/chat.tsx` | 3 | 1 | **5** | **5** | 2 | **5** | CRITICAL | ❌ |
| `components/CrisisBanner.tsx` | 1 | 1 | 1 | 1 | 1 | **1** | LOW | ❌ |
| `components/RBTCard.tsx` | 1 | 1 | 3 | 2 | 2 | **3** | MEDIUM | ❌ |
| `components/ChatBubble.tsx` | 1 | 1 | 2 | 1 | 2 | **2** | LOW | ❌ |
| `components/EntryCard.tsx` | 1 | 1 | 2 | 2 | 2 | **2** | LOW | ❌ |
| `components/BodyStateSelector.tsx` | 1 | 1 | 2 | 1 | 2 | **2** | LOW | ❌ |
| `app/journal/[id].tsx` | 1 | 1 | 3 | 2 | 1 | **3** | MEDIUM | ❌ |
| `app/(tabs)/index.tsx` | 2 | 1 | 3 | 3 | 1 | **3** | MEDIUM | ❌ |
| `app/(tabs)/history.tsx` | 1 | 1 | 2 | 2 | 1 | **2** | LOW | ❌ |
| `app/auth/login.tsx` | 1 | 3 | 2 | 2 | 1 | **3** | MEDIUM | ❌ |
| `app/auth/signup.tsx` | 1 | 3 | 2 | 2 | 1 | **3** | MEDIUM | ❌ |
| `lib/theme.ts` | 1 | 1 | 1 | 1 | 4 | **4** | HIGH | ✅ (100%) |
| `lib/types.ts` | 1 | 1 | 1 | 1 | 4 | **4** | HIGH | ✅ (100%) |
| `lib/schema.ts` | 1 | 1 | 1 | 1 | 2 | **2** | CONFIG | N/A |

**Summary: 7 CRITICAL files, only 2 have meaningful tests (store.ts and journal-ai.ts partial). database.ts, sync.ts, supabase.ts, edge function, and chat.tsx are CRITICAL with zero coverage.**

---

## 4. Test Layers — The Testing Trophy

This is a React Native + Supabase Edge Function app. Per Kent C. Dodds' Testing Trophy, most value is in integration tests for frontend, with unit tests for pure logic and edge function tests for backend.

```
          /  E2E  \            ← 1-2 manual tests on real device (pilot validation)
         / Integr. \           ← Component + screen interaction tests (RNTL)
        /   Unit    \          ← Pure logic: database.ts, sync.ts, journal-ai.ts
       / Static (TS) \        ← TypeScript strict mode (already enabled)
      / Edge Fn Tests  \      ← Deno tests for journal-ai edge function
```

| Layer | Speed Budget | Files | Tools |
|-------|-------------|-------|-------|
| Static | Compile time | All .ts/.tsx | TypeScript strict (enabled) |
| Unit (pure logic) | < 1ms each | database.ts, sync.ts, journal-ai.ts | Jest + mocks |
| Unit (store) | < 5ms each | store.ts | Jest + Zustand |
| Edge function | < 100ms each | journal-ai/index.ts | Deno test + mock fetch |
| Component | < 50ms each | 5 components | RNTL v13 |
| Integration | < 200ms each | chat.tsx, [id].tsx, login.tsx | RNTL + mocked store/db |
| E2E | Manual | Full journal flow | Real device during pilot |

**Anti-pattern check:** Current suite is unit-only (no integration, no component, no E2E). This is an inverted trophy — missing the most valuable middle layer entirely.

---

## 5. Specific Tests to Write

### database.ts — CRITICAL (data integrity + blast radius)

```
Function: parseJSON<T>(raw: string | null): T | null
Location: lib/database.ts:72
Risk: CRITICAL (data integrity)
Incident prevented: Malformed JSON in SQLite → app crash on entry detail

Tests needed:
  HAPPY PATH:
  - Valid JSON string → returns parsed object
  - Valid JSON with nested objects (RBT items) → preserves nesting
  - null input → returns null (not throw)

  ERROR PATHS:
  - Malformed JSON string → returns null (not throw)
  - Empty string → returns null

  EDGE CASES:
  - JSON with unicode characters (emoji in journal text) → parses correctly
  - JSON with very long strings (2000-char journal entry) → handles without truncation

  BOUNDARY:
  - Empty object {} → returns {}
  - Empty array [] → returns []
```

```
Function: rowToEntry(row: Record<string, unknown>): JournalEntry
Location: lib/database.ts:82
Risk: CRITICAL (data integrity)
Incident prevented: Entry detail screen shows wrong/missing data or crashes

Tests needed:
  HAPPY PATH:
  - Complete row with all fields → correctly maps all properties
  - Row with valid JSON in conversation, rose, bud, thorn, insights → parses all nested JSON

  ERROR PATHS:
  - Row with null rose/bud/thorn → returns null for those fields (not crash)
  - Row with malformed JSON in conversation → handles gracefully
  - Row with missing fields → fills defaults

  EDGE CASES:
  - Row with empty conversation ("[]") → returns empty array
  - Row with insights containing unknown keys → ignores extra keys
```

```
Function: updateEntry(id: string, updates: Partial<...>)
Location: lib/database.ts:108
Risk: CRITICAL (data integrity)
Incident prevented: Entry update silently drops fields, losing journal data

Tests needed:
  HAPPY PATH:
  - Update single field (title) → only that field changes
  - Update multiple fields → all change
  - Update with isDraft=false → marks entry as completed

  ERROR PATHS:
  - Update with null conversation → sets to null (not crash)
  - Update with undefined fields → ignores undefined (doesn't overwrite with undefined)

  EDGE CASES:
  - Update rose/bud/thorn with full RBT objects → serializes to JSON correctly
  - Update with empty updates object → no-op (doesn't corrupt entry)

  BOUNDARY:
  - Update isDraft from true to false → triggers (this is the "finish entry" path)
```

```
Function: createEntry(userId: string): JournalEntry
Location: lib/database.ts:95
Risk: HIGH (core loop entry point)
Incident prevented: New entry created with wrong defaults → downstream failures

Tests needed:
  HAPPY PATH:
  - Creates entry with given userId
  - Sets isDraft=true by default
  - Generates unique ID (not empty, not null)
  - Sets createdAt and updatedAt to current time

  EDGE CASES:
  - Two calls produce different IDs
```

```
Function: getDraftEntry(userId: string): JournalEntry | null
Location: lib/database.ts:135
Risk: HIGH (draft recovery)
Incident prevented: Draft recovery fails → user loses mid-entry journal content

Tests needed:
  HAPPY PATH:
  - Returns most recent draft for user
  - Returns null when no drafts exist

  ERROR PATHS:
  - Returns null when only completed (non-draft) entries exist
  - Returns null for wrong userId (user isolation)
```

### sync.ts — CRITICAL (data integrity)

```
Function: syncEntries(): Promise<{ pushed: number; errors: number }>
Location: lib/sync.ts:12
Risk: CRITICAL (data integrity)
Incident prevented: Journal entries never reach Supabase → data loss if device is lost

Tests needed:
  HAPPY PATH:
  - No unsynced entries → returns { pushed: 0, errors: 0 }
  - 3 unsynced entries, all succeed → returns { pushed: 3, errors: 0 }, markSynced called 3x

  ERROR PATHS:
  - Supabase upsert returns error → counts as error, does NOT call markSynced
  - Supabase upsert throws exception → catches, counts as error, continues to next
  - Mixed: 2 succeed, 1 fails → returns { pushed: 2, errors: 1 }

  CRITICAL INVARIANT:
  - markSynced is ONLY called on success (test with spy)
```

```
Function: trySyncIfOnline(): Promise<void>
Location: lib/sync.ts:50
Risk: HIGH (sync gateway)
Incident prevented: Sync runs without auth → silent 401 errors flooding logs

Tests needed:
  HAPPY PATH:
  - Session exists → calls syncEntries
  - No session → skips sync (doesn't throw)

  ERROR PATHS:
  - syncEntries throws → catches silently (doesn't crash app)
```

### journal-ai.ts — CRITICAL (core loop)

```
Function: sendChat(conversation: ChatMessage[]): Promise<string>
Location: lib/journal-ai.ts:69
Risk: CRITICAL (core loop — this IS the journal experience)
Incident prevented: Chat fails silently → carer types into void, never gets response

Tests needed:
  HAPPY PATH:
  - Valid conversation → returns AI text response
  - Request includes correct Authorization header
  - Request body has mode: "chat", system prompt, messages

  ERROR PATHS:
  - 401 response → throws with status in message
  - 502 response → throws with status in message
  - Network error → throws
  - Empty response text → throws "Empty response from AI"

  EDGE CASES:
  - Auth token retrieval fails → throws "Not authenticated"
```

```
Function: extractReflection(conversation: ChatMessage[]): Promise<RBTReflection>
Location: lib/journal-ai.ts:106
Risk: CRITICAL (core loop payoff)
Incident prevented: Reflection fails → carer never sees RBT cards, core loop breaks

Tests needed:
  HAPPY PATH:
  - Valid LLM response with clean JSON → returns parsed RBTReflection
  - Response with markdown fences → strips fences, parses JSON
  - Conversation formatted as "Carer: ... / Lia: ..." in request

  ERROR PATHS:
  - LLM returns non-JSON text → throws
  - LLM returns partial JSON (missing fields) → throws or handles gracefully
  - 502 response → throws

  EDGE CASES:
  - Response with ```json fence → strips correctly
  - Response with ``` fence (no json label) → strips correctly
  - Response with extra whitespace → parses correctly
```

### Edge Function: journal-ai/index.ts — CRITICAL (security + core loop)

```
Function: verifyJWT(req: Request): Promise<string | null>
Location: supabase/functions/journal-ai/index.ts:24
Risk: CRITICAL (security)
Incident prevented: Auth bypass → unauthorized access to AI endpoint

Tests needed:
  HAPPY PATH:
  - Valid Bearer token → returns userId
  - Missing Authorization header → returns null
  - Malformed header (no "Bearer ") → returns null

  ERROR PATHS:
  - Invalid/expired token → returns null
  - Supabase getUser error → returns null
```

```
Function: callLLM(req, provider): Promise<Response>
Location: supabase/functions/journal-ai/index.ts:42
Risk: CRITICAL (core loop)
Incident prevented: AI provider fails → no response to carer

Tests needed:
  HAPPY PATH:
  - Groq call succeeds → returns response with text
  - Request includes correct model, system prompt, messages, max_tokens

  ERROR PATHS:
  - Groq fails → falls back to OpenRouter
  - Both providers fail → returns 502 with "AI service unavailable"
  - Missing API key → throws with provider name

  EDGE CASES:
  - Mode "reflect" uses higher max_tokens (2000) vs "chat" (800)
  - CORS preflight (OPTIONS) → returns 200 with correct headers
  - Response always returns { text: "..." } shape
```

---

## 6. Test Infrastructure Requirements

### Current Infrastructure Status

| Requirement | Status | Action Needed |
|-------------|--------|---------------|
| Test runner (Jest) | ✅ Configured | — |
| Setup file | ✅ `__tests__/setup.ts` | Expand with failure mode mocks |
| Mocks for Supabase | ⚠️ Success only | Add error returns, throws, timeouts |
| Mocks for expo-sqlite | ⚠️ Success only | Add query error simulation |
| Mocks for expo-secure-store | ⚠️ Success only | Add getItem failure |
| Test data factories | ❌ None | Create `__tests__/factories.ts` |
| Shared assertion helpers | ❌ None | Create `__tests__/helpers.ts` |
| CI pipeline | ❌ None | GitHub Actions: `npm test` on push |
| Coverage reporting | ✅ Jest built-in | Add to CI output |
| Pre-commit hook | ❌ None | Husky + lint-staged (P2) |
| Edge function test runner | ❌ None | Deno test setup needed |

### Mock Inventory

| Dependency | Mock Strategy | Exists? | Failure Mocked? | Action |
|-----------|--------------|---------|-----------------|--------|
| Supabase auth | Mock client in setup.ts | ✅ | ❌ | Add: `signInWithPassword` reject, `getUser` error, expired token |
| Supabase database | Mock from/select/upsert | ✅ | ❌ | Add: `upsert({ error: { message: '...' } })`, RLS violation |
| expo-sqlite | Mock openDatabaseSync | ✅ | ❌ | Add: query throw, constraint violation |
| expo-secure-store | Mock get/set/delete | ✅ | ❌ | Add: getItemAsync returns null (no token) |
| fetch (AI calls) | Not mocked | ❌ | — | Add: jest.fn() for fetch in journal-ai tests |
| Groq API | Not mocked | ❌ | — | Mock via fetch: success response, 500, timeout |
| OpenRouter API | Not mocked | ❌ | — | Mock via fetch: success response, 500 |

### Test Data Factories (to create in `__tests__/factories.ts`)

```typescript
import type { ChatMessage, JournalEntry, RBTItem, BodyState } from '../../lib/types';

export const createTestMessage = (overrides: Partial<ChatMessage> = {}): ChatMessage => ({
  role: 'user',
  content: 'Today was really hard. He had a meltdown at the shops.',
  timestamp: '2026-04-08T10:00:00Z',
  ...overrides,
});

export const createTestConversation = (length = 3): ChatMessage[] => [
  createTestMessage({ role: 'assistant', content: "Hey. What's sitting with you right now?" }),
  createTestMessage({ role: 'user', content: 'Today was really hard.' }),
  createTestMessage({ role: 'assistant', content: 'Sounds like the day wore on you.' }),
].slice(0, length);

export const createTestRBTItem = (overrides: Partial<RBTItem> = {}): RBTItem => ({
  title: 'Small win',
  body: 'You noticed the calm moment even in a hard day.',
  quote: 'he smiled at the park',
  tags: ['resilience'],
  ...overrides,
});

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
    psychology: { concept: 'Caregiver Hypervigilance', explanation: '...', stat: '72%', source_hint: 'Carers Australia 2023' },
    journey_context: 'Today was one of those days where the weight showed up.',
    people: ['Brother (participant)'],
    emotions: ['exhaustion', 'love', 'frustration'],
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

export const createTestReflectionJSON = (overrides = {}): string =>
  JSON.stringify({
    rose: createTestRBTItem(),
    bud: createTestRBTItem({ title: 'Growing' }),
    thorn: createTestRBTItem({ title: 'Hard moment' }),
    actions: [{ text: 'Rest', category: 'self-care' }],
    psychology: { concept: 'Test', explanation: '...', stat: '50%', source_hint: 'Test' },
    journey_context: 'Today was hard.',
    people: [],
    emotions: ['tired'],
    services: [],
    mood_score: 40,
    mood_label: 'Heavy',
    energy_label: 'Stretched thin',
    ...overrides,
  });
```

### Shared Assertion Helpers (to create in `__tests__/helpers.ts`)

```typescript
import type { RBTItem, JournalEntry } from '../../lib/types';

export function expectValidRBTItem(item: unknown): void {
  expect(item).toHaveProperty('title');
  expect(item).toHaveProperty('body');
  expect(item).toHaveProperty('quote');
  expect(item).toHaveProperty('tags');
  const rbt = item as RBTItem;
  expect(typeof rbt.title).toBe('string');
  expect(rbt.title.length).toBeGreaterThan(0);
  expect(typeof rbt.body).toBe('string');
  expect(Array.isArray(rbt.tags)).toBe(true);
}

export function expectValidEntry(entry: unknown): void {
  const e = entry as JournalEntry;
  expect(e.id).toBeTruthy();
  expect(typeof e.userId).toBe('string');
  expect(Array.isArray(e.conversation)).toBe(true);
  expect(typeof e.isDraft).toBe('boolean');
  expect(e.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
}
```

---

## 7. Non-Deterministic Code Strategy (AI/LLM)

The app calls LLMs via Groq and OpenRouter. LLM outputs are non-deterministic.

### What We Test Deterministically (in CI)

| What | How | File |
|------|-----|------|
| System prompt is included in request | Assert request body contains CHAT_SYSTEM_PROMPT | journal-ai.test.ts |
| Request format (mode, messages shape) | Assert fetch called with correct body | journal-ai.test.ts |
| Response parsing (valid JSON → RBTReflection) | Mock fetch → canned response → assert parsed structure | journal-ai.test.ts |
| Malformed response handling | Mock fetch → broken JSON → assert throws | journal-ai.test.ts |
| Provider fallback (Groq fails → OpenRouter) | Mock Groq 500 → mock OpenRouter success | edge function tests |
| Error responses (401, 502, network) | Mock various failures → assert error messages | journal-ai.test.ts |
| Crisis detection in response text | Pass known strings → assert boolean | journal-ai.test.ts (existing, good) |

### What We Do NOT Test in CI (human eval)

| What | Why | How to Evaluate |
|------|-----|----------------|
| Lia's empathy / warmth | Non-deterministic, subjective | Manual: read 5 sample conversations during pilot |
| RBT reflection quality | Depends on LLM output | Manual: review reflections with pilot carers |
| System prompt effectiveness | Requires real interaction | Prompt eval pipeline (separate from CI) |
| MI reflective listening compliance | Requires qualitative judgment | Spot-check during pilot |

### LLM Eval Pipeline (Phase 2, not CI)

When prompt changes are made (like the MI + Clean Language rewrite), evaluate:
1. Create 5 representative carer journal inputs (range of emotions, lengths)
2. Run through real LLM with new prompt
3. Score each output on a rubric: validation (0-5), specificity (0-5), no-fixing (0-5)
4. Compare against previous prompt version
5. Track scores over time in `planning/prompt-eval-log.md`

---

## 8. Coverage Targets (Per-File)

| File | Risk Tier | Line Target | Branch Target | What Must Be Tested |
|------|-----------|-------------|--------------|-------------------|
| `database.ts` | CRITICAL | >= 95% | >= 90% | Every branch in updateEntry, every JSON parse path, every error path |
| `sync.ts` | CRITICAL | >= 95% | >= 90% | markSynced only on success (invariant), mixed success/failure, auth gate |
| `journal-ai.ts` | CRITICAL | >= 85% | >= 80% | sendChat + extractReflection (lines 125-208, currently 0%), error responses |
| `store.ts` | CRITICAL | >= 90% | >= 80% | Already at 87.5% — fill line 45 gap |
| `journal-ai/index.ts` | CRITICAL | >= 85% | >= 80% | JWT verification, fallback chain, CORS, response format |
| `supabase.ts` | CRITICAL | >= 70% | >= 60% | Platform branching (web vs native), SecureStore adapter |
| `chat.tsx` | CRITICAL | Smoke | N/A | Greeting renders, send adds to conversation, finish navigates |
| `RBTCard.tsx` | MEDIUM | >= 70% | >= 60% | All 3 variants render, handles missing fields |
| `[id].tsx` | MEDIUM | Smoke | N/A | Reflection above conversation, handles missing reflection |
| `login.tsx` | MEDIUM | Smoke | N/A | Email validation, error display, loading state |
| `theme.ts` | HIGH | 100% ✅ | 100% ✅ | Done |
| `types.ts` | HIGH | 100% ✅ | 100% ✅ | Done |
| `schema.ts` | CONFIG | 0% OK | N/A | No logic to test |

---

## 9. Prioritised Backlog

### Batch 1: Data Layer (CRITICAL — do first)
**Effort:** 3-4 hours
**Files:** database.ts, sync.ts
**Tests to write:** ~25
**Prerequisite:** Create `__tests__/factories.ts` and `__tests__/helpers.ts`

Acceptance criteria:
- [ ] All tests pass
- [ ] database.ts >= 95% line coverage
- [ ] sync.ts >= 95% line coverage
- [ ] markSynced-only-on-success invariant has a dedicated test
- [ ] No test uses `.toBeDefined()` as sole assertion
- [ ] Factory pattern used for all test data

### Batch 2: AI Communication (CRITICAL)
**Effort:** 2-3 hours
**Files:** journal-ai.ts (expand existing)
**Tests to write:** ~15
**Prerequisite:** Mock `fetch` in test setup

Acceptance criteria:
- [ ] sendChat and extractReflection tested (lines 125-208 covered)
- [ ] journal-ai.ts >= 85% line coverage
- [ ] Error paths tested: 401, 502, network error, empty response, malformed JSON
- [ ] Auth token failure tested

### Batch 3: Edge Function (CRITICAL)
**Effort:** 2-3 hours
**Files:** supabase/functions/journal-ai/index.ts
**Tests to write:** ~12
**Prerequisite:** Deno test setup with mock fetch

Acceptance criteria:
- [ ] JWT verification: valid/invalid/missing tokens tested
- [ ] Fallback chain: Groq fail → OpenRouter success tested
- [ ] Both fail → 502 tested
- [ ] CORS preflight tested
- [ ] Response shape always `{ text: "..." }`

### Batch 4: Fix Existing Test Quality
**Effort:** 1-2 hours
**Files:** All existing test files
**Tests to fix:** ~12

Acceptance criteria:
- [ ] Replace 3 `.toBeDefined()` assertions in theme.test.ts with value assertions
- [ ] Replace `.toBeTruthy()` in types.test.ts with string-type assertion
- [ ] Add failure-mode mock capabilities to setup.ts
- [ ] Fix 5 Survivor-smell tests with before/after assertions
- [ ] Expand 3 Inspector-smell tests in journal-ai.test.ts with multi-field assertions

### Batch 5: Components (MEDIUM)
**Effort:** 2-3 hours
**Files:** 5 components
**Tests to write:** ~15

Acceptance criteria:
- [ ] Each component renders without crashing
- [ ] RBTCard renders all 3 variants with correct styling
- [ ] CrisisBanner shows phone numbers and dismiss works
- [ ] EntryCard shows draft badge for draft entries
- [ ] BodyStateSelector fires onSelect callback

### Batch 6: Screen Smoke Tests (LOW priority)
**Effort:** 2 hours
**Files:** chat.tsx, [id].tsx, login.tsx
**Tests to write:** ~8

Acceptance criteria:
- [ ] Chat: greeting appears, can type and send
- [ ] Entry detail: reflection cards render above conversation
- [ ] Login: shows error on invalid credentials

### Batch 7: CI Pipeline
**Effort:** 30 min

Acceptance criteria:
- [ ] GitHub Actions runs `npm test` on push to main
- [ ] Coverage report output in CI logs
- [ ] Build fails on test failure

---

## 10. Known Gaps and Accepted Risks

These are things we are consciously NOT testing and why.

| Gap | Why We Accept It | When to Revisit |
|-----|-----------------|-----------------|
| **No E2E automated tests** | App is pre-pilot with 5 users. Manual testing on real device is sufficient. | When user count exceeds 20 or when CI deploys to TestFlight automatically |
| **No visual regression tests** | Design is still evolving. Pixel-perfect testing would break on every iteration. | When design system is locked for V2 |
| **No load/performance tests** | Single-user app with 5-person pilot. No scale concerns. | When concurrent users exceed 50 |
| **No accessibility tests** | Should exist but blocking pilot on them is wrong priority. | Before public launch (P1 Phase 2) |
| **Schema migrations untested** | runMigrations() is DDL only, called once on app init. | When schema evolves (add columns, alter tables) |
| **LLM prompt quality untested in CI** | Non-deterministic. Manual eval during pilot. | Build eval pipeline in Phase 2 if prompt changes frequently |
| **Supabase RLS policies untested** | RLS doesn't exist yet (P0 blocker). When implemented, add cross-user access tests. | Immediately after RLS implementation |
| **theme.ts and types.ts at 100% but tests are weak** | Being fixed in Batch 4. Accepted temporarily. | Batch 4 |

---

## 11. Regression Test Log

| Date | Bug | Test Added | File |
|------|-----|-----------|------|
| 2026-04-08 | RBT extraction failed when LLM wrapped JSON in markdown fences | `strips markdown code fences` | journal-ai.test.ts |
| 2026-04-08 | OpenRouter fallback model name was invalid (`qwen3.6-plus:free`) | Edge function tests needed (Batch 3) | Not yet tested |
| 2026-04-08 | `data?.content?.[0]?.text` was dead code from old API format | Removed dead code, no test needed | journal-ai.ts |

---

## The Litmus Test

**Can you deploy at 4:55 PM on Friday?**

No. Here's what's missing:

1. **database.ts has zero tests** — the file that handles ALL data persistence. A bug here = silent data corruption for every user. Cannot deploy with confidence.
2. **sync.ts has zero tests** — if sync logic is wrong, entries never reach Supabase. Data loss.
3. **Edge function untested** — auth bypass possible. Fallback chain unverified.
4. **Mocks only cover success** — we've never tested what happens when things go wrong.
5. **No CI** — tests only run when a developer remembers to run them.

**After completing Batches 1-3 and 7** (estimated 10-12 hours of eng work), the answer changes to: **Yes, with caveats** (no component tests, no E2E, but data integrity and auth are proven).

---

## Running Tests

```bash
# Run all tests
cd mobile && npm test

# Run with coverage
cd mobile && npx jest --coverage

# Run specific file
cd mobile && npx jest __tests__/lib/database.test.ts

# Run in random order (isolation check)
cd mobile && npx jest --randomize

# Run tests related to a changed source file
cd mobile && npx jest --findRelatedTests lib/database.ts

# Watch mode
cd mobile && npm run test:watch
```
