/**
 * Tests for journal-ai.ts — AI communication, RBT JSON parsing, and crisis detection.
 *
 * CRITICAL (risk score 5/5): This file IS the core loop.
 * - sendChat: carer talks to Lia
 * - extractReflection: carer gets RBT reflection cards
 * - detectCrisisInResponse: safety detection
 *
 * Testing approach: mock global fetch for sendChat/extractReflection.
 * Crisis detection is a pure function tested directly.
 */
import { detectCrisisInResponse, sendChat, extractReflection } from '../../lib/journal-ai';
import { createTestConversation, createTestReflectionJSON } from '../factories';
import { expectValidRBTItem } from '../helpers';

// ── Mock fetch globally ──────────────────────────────────────
const mockFetch = jest.fn();
global.fetch = mockFetch;

// ── Mock auth token retrieval ────────────────────────────────
const { supabase } = jest.requireMock('../../lib/supabase') as {
  supabase: { auth: { getSession: jest.Mock } };
};

beforeEach(() => {
  jest.clearAllMocks();
  // Default: authenticated user
  supabase.auth.getSession.mockResolvedValue({
    data: { session: { access_token: 'test-token-123' } },
  });
});

// ── Crisis Detection ────────────────────────────────────────

describe('detectCrisisInResponse', () => {
  it('detects Lifeline phone number', () => {
    const text = 'I hear you. Please reach out to Lifeline at 13 11 14 if you need support.';
    expect(detectCrisisInResponse(text)).toBe(true);
  });

  it('detects Beyond Blue mention', () => {
    const text = 'Beyond Blue offers support at 1300 22 4636.';
    expect(detectCrisisInResponse(text)).toBe(true);
  });

  it('detects the word "crisis" in AI response', () => {
    const text = 'What you are describing sounds like a crisis moment. Please reach out.';
    expect(detectCrisisInResponse(text)).toBe(true);
  });

  it('detects "lifeline" case-insensitively', () => {
    const text = 'You can contact LIFELINE anytime.';
    expect(detectCrisisInResponse(text)).toBe(true);
  });

  it('returns false for normal conversation', () => {
    const text = 'That sounds like a really tough day. How did Tom react at school?';
    expect(detectCrisisInResponse(text)).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(detectCrisisInResponse('')).toBe(false);
  });

  it('returns false for unrelated mention of numbers', () => {
    const text = 'Tom ate 13 grapes and played for 14 minutes.';
    expect(detectCrisisInResponse(text)).toBe(false);
  });
});

// ── RBT JSON Extraction ─────────────────────────────────────
// The extractReflection function calls the API, so we test the
// JSON parsing logic it uses inline.

describe('RBT JSON parsing', () => {
  function parseReflectionJSON(text: string) {
    let jsonStr = text.trim();
    jsonStr = jsonStr.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '');
    return JSON.parse(jsonStr);
  }

  it('parses clean JSON response', () => {
    const json = JSON.stringify({
      rose: { title: 'Small win', body: 'He ate dinner', quote: 'dinner was a win', tags: ['food'] },
      bud: { title: 'Growing', body: 'Routine forming', quote: 'sat through circle time', tags: ['school'] },
      thorn: { title: 'Hard day', body: 'OT cancelled', quote: 'cancelled last minute', tags: ['system'] },
      actions: [{ text: 'Call OT', category: 'admin' }],
      psychology: { concept: 'Caregiver Fatigue', explanation: 'Normal response', stat: '72%', source_hint: 'Carers Australia' },
      journey_context: 'Days like this are common.',
      people: ['Tom (son)'],
      emotions: ['exhausted', 'proud'],
      services: ['OT'],
      mood_score: 45,
      mood_label: 'Tired but holding on',
      energy_label: 'Stretched thin',
    });
    const result = parseReflectionJSON(json);
    expect(result.rose.title).toBe('Small win');
    expect(result.mood_score).toBe(45);
    expect(result.energy_label).toBe('Stretched thin');
  });

  it('strips markdown code fences', () => {
    const json = '```json\n{"rose":{"title":"Win","body":"x","quote":"y","tags":[]}}\n```';
    const result = parseReflectionJSON(json);
    expect(result.rose.title).toBe('Win');
  });

  it('strips code fence without json label', () => {
    const json = '```\n{"mood_score":80}\n```';
    const result = parseReflectionJSON(json);
    expect(result.mood_score).toBe(80);
  });

  it('throws on completely invalid JSON', () => {
    expect(() => parseReflectionJSON('not json at all')).toThrow();
  });

  it('throws on empty string', () => {
    expect(() => parseReflectionJSON('')).toThrow();
  });

  it('handles JSON with extra whitespace', () => {
    const json = '  \n  {"mood_score": 60}  \n  ';
    const result = parseReflectionJSON(json);
    expect(result.mood_score).toBe(60);
  });
});

// ── sendChat ─────────────────────────────────────────────────
// Incident prevented: Chat fails → carer types into void, never gets response

describe('sendChat', () => {
  const conversation = createTestConversation(2);

  test('returns AI text response on success', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ text: 'Sounds like the day wore on you.' }),
    });

    const result = await sendChat(conversation);

    expect(result).toBe('Sounds like the day wore on you.');
  });

  test('sends correct request format with auth header', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ text: 'response' }),
    });

    await sendChat(conversation);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('journal-ai');
    expect(options.method).toBe('POST');
    expect(options.headers['Authorization']).toBe('Bearer test-token-123');
    expect(options.headers['Content-Type']).toBe('application/json');

    const body = JSON.parse(options.body);
    expect(body.mode).toBe('chat');
    expect(body.system).toContain('Lia');
    expect(body.messages).toHaveLength(2);
  });

  test('throws on 401 Unauthorized', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      text: () => Promise.resolve('Unauthorized'),
    });

    await expect(sendChat(conversation)).rejects.toThrow('401');
  });

  test('throws on 502 AI service unavailable', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 502,
      text: () => Promise.resolve('AI service unavailable'),
    });

    await expect(sendChat(conversation)).rejects.toThrow('502');
  });

  test('throws on network error', async () => {
    mockFetch.mockRejectedValue(new Error('Network request failed'));

    await expect(sendChat(conversation)).rejects.toThrow('Network request failed');
  });

  test('throws on empty response text', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ text: '' }),
    });

    await expect(sendChat(conversation)).rejects.toThrow('Empty response');
  });

  test('throws when not authenticated (no session)', async () => {
    supabase.auth.getSession.mockResolvedValue({
      data: { session: null },
    });

    await expect(sendChat(conversation)).rejects.toThrow('Not authenticated');
  });
});

// ── extractReflection ────────────────────────────────────────
// Incident prevented: Reflection fails → carer never sees RBT cards

describe('extractReflection', () => {
  const conversation = createTestConversation();

  test('returns parsed RBTReflection on valid LLM response', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ text: createTestReflectionJSON() }),
    });

    const result = await extractReflection(conversation);

    expectValidRBTItem(result.rose);
    expectValidRBTItem(result.bud);
    expectValidRBTItem(result.thorn);
    expect(result.mood_score).toBe(35);
    expect(result.energy_label).toBe('Running on fumes');
    expect(result.emotions).toContain('exhaustion');
  });

  test('strips markdown code fences from LLM response', async () => {
    const wrappedJSON = '```json\n' + createTestReflectionJSON() + '\n```';
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ text: wrappedJSON }),
    });

    const result = await extractReflection(conversation);

    expectValidRBTItem(result.rose);
    expect(result.rose.title).toBe('Small win');
  });

  test('strips code fences without json label', async () => {
    const wrappedJSON = '```\n' + createTestReflectionJSON() + '\n```';
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ text: wrappedJSON }),
    });

    const result = await extractReflection(conversation);

    expect(result.mood_score).toBe(35);
  });

  test('throws on completely invalid JSON from LLM', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ text: 'I could not generate a reflection for this entry.' }),
    });

    await expect(extractReflection(conversation)).rejects.toThrow();
  });

  test('throws on empty response from LLM', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ text: '' }),
    });

    await expect(extractReflection(conversation)).rejects.toThrow();
  });

  test('throws on 502 AI service unavailable', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 502,
      text: () => Promise.resolve(''),
    });

    await expect(extractReflection(conversation)).rejects.toThrow('502');
  });

  test('formats conversation as Carer/Lia labels in request', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ text: createTestReflectionJSON() }),
    });

    await extractReflection(conversation);

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.mode).toBe('reflect');
    // The conversation is formatted as text with Carer/Lia labels
    const userMessage = body.messages[0].content;
    expect(userMessage).toContain('Carer:');
    expect(userMessage).toContain('Lia:');
  });
});
