/**
 * Tests for lib/database.ts — the data persistence layer.
 *
 * This file is CRITICAL (risk score 5/5): it handles all data parsing,
 * transformation, and persistence. A bug here = silent data corruption.
 *
 * Testing approach: parseJSON and rowToEntry are exported for testing.
 * CRUD functions are tested via mocked Drizzle db chain.
 */
import { parseJSON, rowToEntry } from '../../lib/database';
import { createTestRow, createTestRBTItem, createTestConversation } from '../factories';
import { expectValidRBTItem, expectValidEntry, expectValidChatMessage } from '../helpers';

// ── parseJSON ─────────────────────────────────────────────────
// Incident prevented: Malformed JSON in SQLite → app crash on entry detail screen

describe('parseJSON', () => {
  describe('happy paths', () => {
    test('parses valid JSON string into object', () => {
      const result = parseJSON<{ name: string }>('{"name": "test"}');
      expect(result).toEqual({ name: 'test' });
    });

    test('parses valid JSON with nested objects', () => {
      const nested = { a: { b: { c: 'deep' } } };
      const result = parseJSON<typeof nested>(JSON.stringify(nested));
      expect(result).toEqual(nested);
    });

    test('parses valid JSON array', () => {
      const arr = [1, 2, 3];
      const result = parseJSON<number[]>(JSON.stringify(arr));
      expect(result).toEqual(arr);
    });

    test('parses conversation JSON with ChatMessage objects', () => {
      const conversation = createTestConversation(2);
      const result = parseJSON<typeof conversation>(JSON.stringify(conversation));
      expect(result).toHaveLength(2);
      expect(result![0].role).toBe('assistant');
      expect(result![1].role).toBe('user');
    });

    test('parses RBT item JSON', () => {
      const rbt = createTestRBTItem();
      const result = parseJSON<typeof rbt>(JSON.stringify(rbt));
      expectValidRBTItem(result);
      expect(result!.title).toBe('Small win');
    });
  });

  describe('error paths', () => {
    test('returns null for malformed JSON (not throw)', () => {
      const result = parseJSON('this is not json {{{');
      expect(result).toBeNull();
    });

    test('returns null for empty string', () => {
      const result = parseJSON('');
      expect(result).toBeNull();
    });

    test('returns null for null input', () => {
      const result = parseJSON(null);
      expect(result).toBeNull();
    });
  });

  describe('edge cases', () => {
    test('parses JSON with unicode characters (emoji in journal text)', () => {
      const result = parseJSON<{ text: string }>('{"text": "He smiled today 😊"}');
      expect(result).toEqual({ text: 'He smiled today 😊' });
    });

    test('parses JSON with special characters in strings', () => {
      const result = parseJSON<{ text: string }>('{"text": "She said \\"hello\\""}');
      expect(result).toEqual({ text: 'She said "hello"' });
    });

    test('parses empty object', () => {
      const result = parseJSON<Record<string, unknown>>('{}');
      expect(result).toEqual({});
    });

    test('parses empty array', () => {
      const result = parseJSON<unknown[]>('[]');
      expect(result).toEqual([]);
    });

    test('handles JSON with extra whitespace', () => {
      const result = parseJSON<{ a: number }>('  { "a" : 1 }  ');
      expect(result).toEqual({ a: 1 });
    });
  });
});

// ── rowToEntry ────────────────────────────────────────────────
// Incident prevented: Entry detail screen shows wrong/missing data or crashes

describe('rowToEntry', () => {
  describe('happy paths', () => {
    test('maps complete row to JournalEntry with all fields', () => {
      const row = createTestRow();
      const entry = rowToEntry(row as any);

      expectValidEntry(entry);
      expect(entry.id).toBe('entry-test-001');
      expect(entry.userId).toBe('user-test-001');
      expect(entry.title).toBe('Stretched thin');
      expect(entry.bodyState).toBe('difficult');
      expect(entry.isDraft).toBe(false);
      expect(entry.isCrisis).toBe(false);
    });

    test('parses conversation JSON into ChatMessage array', () => {
      const row = createTestRow();
      const entry = rowToEntry(row as any);

      expect(Array.isArray(entry.conversation)).toBe(true);
      expect(entry.conversation.length).toBeGreaterThan(0);
      expectValidChatMessage(entry.conversation[0]);
    });

    test('parses rose, bud, thorn JSON into RBTItem objects', () => {
      const row = createTestRow();
      const entry = rowToEntry(row as any);

      expectValidRBTItem(entry.rose);
      expectValidRBTItem(entry.bud);
      expectValidRBTItem(entry.thorn);
      expect(entry.rose!.title).toBe('Small win');
    });

    test('parses insights JSON into structured object', () => {
      const row = createTestRow();
      const entry = rowToEntry(row as any);

      expect(entry.insights).not.toBeNull();
      expect(entry.insights!.mood_score).toBe(40);
      expect(entry.insights!.mood_label).toBe('Heavy');
      expect(Array.isArray(entry.insights!.emotions)).toBe(true);
    });
  });

  describe('null field handling', () => {
    test('returns null rose/bud/thorn when row has null JSON', () => {
      const row = createTestRow({ rose: null, bud: null, thorn: null });
      const entry = rowToEntry(row as any);

      expect(entry.rose).toBeNull();
      expect(entry.bud).toBeNull();
      expect(entry.thorn).toBeNull();
    });

    test('returns null insights when row has null insights', () => {
      const row = createTestRow({ insights: null });
      const entry = rowToEntry(row as any);

      expect(entry.insights).toBeNull();
    });

    test('returns empty conversation array when row has empty JSON array', () => {
      const row = createTestRow({ conversation: '[]' });
      const entry = rowToEntry(row as any);

      expect(entry.conversation).toEqual([]);
    });

    test('returns null title when row has null title', () => {
      const row = createTestRow({ title: null });
      const entry = rowToEntry(row as any);

      expect(entry.title).toBeNull();
    });
  });

  describe('malformed JSON handling', () => {
    test('returns empty conversation array when conversation JSON is malformed', () => {
      const row = createTestRow({ conversation: 'not json' });
      const entry = rowToEntry(row as any);

      // parseJSON returns null, ?? [] provides fallback
      expect(entry.conversation).toEqual([]);
    });

    test('returns null rose when rose JSON is malformed', () => {
      const row = createTestRow({ rose: '{broken json' });
      const entry = rowToEntry(row as any);

      expect(entry.rose).toBeNull();
    });
  });
});
