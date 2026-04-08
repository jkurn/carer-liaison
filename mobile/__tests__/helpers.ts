/**
 * Shared assertion helpers for domain-specific validations.
 * Reuse these instead of repeating structure checks across test files.
 */
import type { RBTItem, JournalEntry, ChatMessage } from '../../lib/types';

/** Assert an object is a valid RBTItem with all required fields and correct types. */
export function expectValidRBTItem(item: unknown): void {
  expect(item).not.toBeNull();
  const rbt = item as RBTItem;
  expect(typeof rbt.title).toBe('string');
  expect(rbt.title.length).toBeGreaterThan(0);
  expect(typeof rbt.body).toBe('string');
  expect(rbt.body.length).toBeGreaterThan(0);
  expect(typeof rbt.quote).toBe('string');
  expect(Array.isArray(rbt.tags)).toBe(true);
}

/** Assert an object is a valid JournalEntry with correct shape. */
export function expectValidEntry(entry: unknown): void {
  expect(entry).not.toBeNull();
  const e = entry as JournalEntry;
  expect(typeof e.id).toBe('string');
  expect(e.id.length).toBeGreaterThan(0);
  expect(typeof e.userId).toBe('string');
  expect(Array.isArray(e.conversation)).toBe(true);
  expect(typeof e.isDraft).toBe('boolean');
  expect(typeof e.isCrisis).toBe('boolean');
  expect(e.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  expect(e.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
}

/** Assert a ChatMessage has the correct shape. */
export function expectValidChatMessage(msg: unknown): void {
  const m = msg as ChatMessage;
  expect(['user', 'assistant', 'system']).toContain(m.role);
  expect(typeof m.content).toBe('string');
  expect(typeof m.timestamp).toBe('string');
}

/** Assert a string is a valid hex color code. */
export function expectHexColor(value: unknown): void {
  expect(typeof value).toBe('string');
  expect(value).toMatch(/^#[0-9A-Fa-f]{6}$/);
}
