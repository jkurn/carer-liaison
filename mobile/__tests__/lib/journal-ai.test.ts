/**
 * Tests for journal-ai.ts — RBT JSON parsing and crisis detection.
 *
 * These are the highest-priority tests:
 * - Malformed JSON must not crash the app
 * - Crisis keywords must be detected reliably
 * - False positives are acceptable (over-detect > under-detect)
 */
import { detectCrisisInResponse } from '../../lib/journal-ai';

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
