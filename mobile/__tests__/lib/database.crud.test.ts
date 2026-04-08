/**
 * Tests for CRUD functions in lib/database.ts.
 *
 * Strategy: mock drizzle-orm/expo-sqlite with factory-internal definitions.
 * Mock references are exposed via __test* exports on the mock module
 * and accessed via jest.requireMock (avoids TDZ issues with const variables
 * referenced in jest.mock factory — babel hoists require() calls before
 * local const declarations).
 *
 * Incident prevented: entry created with wrong shape, updateEntry silently
 * skips fields, getUnsyncedEntries returns wrong rows.
 */

jest.mock('drizzle-orm/expo-sqlite', () => {
  // All mock definitions live inside the factory — no TDZ issues
  const run = jest.fn();
  const get = jest.fn();
  const all = jest.fn();

  const chain = {
    values: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    run,
    get,
    all,
  };

  const dbInsert = jest.fn().mockReturnValue(chain);
  const dbUpdate = jest.fn().mockReturnValue(chain);
  const dbSelect = jest.fn().mockReturnValue(chain);
  const db = { insert: dbInsert, update: dbUpdate, select: dbSelect };

  return {
    drizzle: jest.fn().mockReturnValue(db),
    // Exposed for tests — access via jest.requireMock
    __chain: chain,
    __db: db,
    __run: run,
    __get: get,
    __all: all,
  };
});

import {
  createEntry,
  updateEntry,
  getEntry,
  getDraftEntry,
  getUnsyncedEntries,
  markSynced,
} from '../../lib/database';
import { createTestRow, createUnsyncedRow } from '../factories';

// Access mock refs — module is already loaded by the import above
const drizzleMock = jest.requireMock('drizzle-orm/expo-sqlite') as {
  __chain: {
    values: jest.Mock; set: jest.Mock; where: jest.Mock;
    orderBy: jest.Mock; limit: jest.Mock; offset: jest.Mock;
    from: jest.Mock; run: jest.Mock; get: jest.Mock; all: jest.Mock;
  };
  __db: { insert: jest.Mock; update: jest.Mock; select: jest.Mock };
  __run: jest.Mock;
  __get: jest.Mock;
  __all: jest.Mock;
};

const mockChain = drizzleMock.__chain;
const mockDb = drizzleMock.__db;
const mockRun = drizzleMock.__run;
const mockGet = drizzleMock.__get;
const mockAll = drizzleMock.__all;

// ── createEntry ───────────────────────────────────────────────
// Incident prevented: new entry saved with wrong shape → crash on entry detail

describe('createEntry', () => {
  beforeEach(() => jest.clearAllMocks());

  test('calls db.insert and .run()', () => {
    createEntry('user-001');
    expect(mockDb.insert).toHaveBeenCalled();
    expect(mockRun).toHaveBeenCalled();
  });

  test('returns JournalEntry with correct userId', () => {
    expect(createEntry('user-abc').userId).toBe('user-abc');
  });

  test('returns entry with isDraft = true', () => {
    expect(createEntry('user-001').isDraft).toBe(true);
  });

  test('returns entry with isCrisis = false', () => {
    expect(createEntry('user-001').isCrisis).toBe(false);
  });

  test('returns entry with empty conversation array', () => {
    expect(createEntry('user-001').conversation).toEqual([]);
  });

  test('returns entry with null rose, bud, thorn', () => {
    const entry = createEntry('user-001');
    expect(entry.rose).toBeNull();
    expect(entry.bud).toBeNull();
    expect(entry.thorn).toBeNull();
  });

  test('returns entry with null title, bodyState, insights, syncedAt', () => {
    const entry = createEntry('user-001');
    expect(entry.title).toBeNull();
    expect(entry.bodyState).toBeNull();
    expect(entry.insights).toBeNull();
    expect(entry.syncedAt).toBeNull();
  });

  test('returns a UUID v4 format id', () => {
    const { id } = createEntry('user-001');
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  test('returns entry with valid ISO createdAt and updatedAt', () => {
    const entry = createEntry('user-001');
    expect(Number.isNaN(new Date(entry.createdAt).getTime())).toBe(false);
    expect(Number.isNaN(new Date(entry.updatedAt).getTime())).toBe(false);
  });

  test('each call returns a different id', () => {
    expect(createEntry('user-001').id).not.toBe(createEntry('user-001').id);
  });
});

// ── getEntry ─────────────────────────────────────────────────
// Incident prevented: entry detail screen crashes or shows stale/null data

describe('getEntry', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns null when no row found', () => {
    mockGet.mockReturnValueOnce(undefined);
    expect(getEntry('not-exist')).toBeNull();
  });

  test('returns mapped JournalEntry when row exists', () => {
    mockGet.mockReturnValueOnce(createTestRow());
    const result = getEntry('entry-test-001');
    expect(result).not.toBeNull();
    expect(result!.id).toBe('entry-test-001');
    expect(result!.userId).toBe('user-test-001');
  });

  test('parses conversation JSON array from row', () => {
    mockGet.mockReturnValueOnce(createTestRow());
    const result = getEntry('entry-test-001');
    expect(Array.isArray(result!.conversation)).toBe(true);
    expect(result!.conversation.length).toBeGreaterThan(0);
  });

  test('parses rose/bud/thorn JSON from row', () => {
    mockGet.mockReturnValueOnce(createTestRow());
    const result = getEntry('entry-test-001');
    expect(result!.rose).not.toBeNull();
    expect(result!.bud).not.toBeNull();
    expect(result!.thorn).not.toBeNull();
  });

  test('returns null rose when row has null rose', () => {
    mockGet.mockReturnValueOnce(createTestRow({ rose: null }));
    expect(getEntry('entry-test-001')!.rose).toBeNull();
  });

  test('returns empty conversation when row has malformed JSON', () => {
    mockGet.mockReturnValueOnce(createTestRow({ conversation: '{bad json' }));
    expect(getEntry('entry-test-001')!.conversation).toEqual([]);
  });

  test('calls db.select chain with a where clause', () => {
    mockGet.mockReturnValueOnce(createTestRow());
    getEntry('entry-test-001');
    expect(mockDb.select).toHaveBeenCalled();
    expect(mockChain.where).toHaveBeenCalled();
  });
});

// ── getDraftEntry ─────────────────────────────────────────────
// Incident prevented: user always gets blank entry instead of resuming draft

describe('getDraftEntry', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns null when no row found', () => {
    mockGet.mockReturnValueOnce(undefined);
    expect(getDraftEntry('user-001')).toBeNull();
  });

  test('returns null when most recent entry is not a draft', () => {
    mockGet.mockReturnValueOnce(createTestRow({ isDraft: false }));
    expect(getDraftEntry('user-001')).toBeNull();
  });

  test('returns mapped entry when most recent row is a draft', () => {
    mockGet.mockReturnValueOnce(createTestRow({ isDraft: true }));
    const result = getDraftEntry('user-001');
    expect(result).not.toBeNull();
    expect(result!.isDraft).toBe(true);
  });

  test('queries only the most recent entry (limit 1)', () => {
    mockGet.mockReturnValueOnce(undefined);
    getDraftEntry('user-001');
    expect(mockChain.limit).toHaveBeenCalledWith(1);
  });
});

// ── updateEntry ───────────────────────────────────────────────
// Incident prevented: JSON stored as "[object Object]", syncedAt not reset

describe('updateEntry', () => {
  beforeEach(() => jest.clearAllMocks());

  test('calls db.update and .run()', () => {
    updateEntry('entry-001', { title: 'Test' });
    expect(mockDb.update).toHaveBeenCalled();
    expect(mockRun).toHaveBeenCalled();
  });

  test('always resets syncedAt to null (marks entry dirty for sync)', () => {
    updateEntry('entry-001', { title: 'Test' });
    expect(mockChain.set.mock.calls[0][0].syncedAt).toBeNull();
  });

  test('always sets updatedAt to a valid ISO timestamp', () => {
    updateEntry('entry-001', { title: 'Test' });
    const { updatedAt } = mockChain.set.mock.calls[0][0];
    expect(typeof updatedAt).toBe('string');
    expect(Number.isNaN(new Date(updatedAt).getTime())).toBe(false);
  });

  test('sets title when provided', () => {
    updateEntry('entry-001', { title: 'New title' });
    expect(mockChain.set.mock.calls[0][0]).toMatchObject({ title: 'New title' });
  });

  test('omits title from set() when not provided', () => {
    updateEntry('entry-001', { isDraft: false });
    expect(mockChain.set.mock.calls[0][0]).not.toHaveProperty('title');
  });

  test('serializes conversation array to JSON string', () => {
    const convo = [{ role: 'user', content: 'Hi', timestamp: '2026-04-08T10:00:00Z' }];
    updateEntry('entry-001', { conversation: convo as any });
    expect(mockChain.set.mock.calls[0][0].conversation).toBe(JSON.stringify(convo));
  });

  test('serializes rose to JSON string when provided', () => {
    const rose = { title: 'Win', body: 'Body', quote: 'Q', tags: ['hope'] };
    updateEntry('entry-001', { rose });
    expect(mockChain.set.mock.calls[0][0].rose).toBe(JSON.stringify(rose));
  });

  test('sets rose to null when null passed', () => {
    updateEntry('entry-001', { rose: null });
    expect(mockChain.set.mock.calls[0][0].rose).toBeNull();
  });

  test('sets isDraft = false when provided', () => {
    updateEntry('entry-001', { isDraft: false });
    expect(mockChain.set.mock.calls[0][0].isDraft).toBe(false);
  });

  test('sets isCrisis = true when provided', () => {
    updateEntry('entry-001', { isCrisis: true });
    expect(mockChain.set.mock.calls[0][0].isCrisis).toBe(true);
  });
});

// ── getUnsyncedEntries ────────────────────────────────────────
// Incident prevented: sync skips entries or crashes on empty table

describe('getUnsyncedEntries', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns empty array when no unsynced entries', () => {
    mockAll.mockReturnValueOnce([]);
    expect(getUnsyncedEntries()).toEqual([]);
  });

  test('returns raw rows (not mapped JournalEntries)', () => {
    const row = createUnsyncedRow();
    mockAll.mockReturnValueOnce([row]);
    const result = getUnsyncedEntries();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('entry-unsynced-001');
    // Raw row — conversation is still a string, not a parsed array
    expect(typeof result[0].conversation).toBe('string');
  });

  test('returns multiple rows', () => {
    mockAll.mockReturnValueOnce([
      createUnsyncedRow(),
      createUnsyncedRow({ id: 'entry-unsynced-002' }),
    ]);
    expect(getUnsyncedEntries()).toHaveLength(2);
  });
});

// ── markSynced ────────────────────────────────────────────────
// Incident prevented: entries remain unsynced after successful push

describe('markSynced', () => {
  beforeEach(() => jest.clearAllMocks());

  test('calls db.update and .run()', () => {
    markSynced('entry-001');
    expect(mockDb.update).toHaveBeenCalled();
    expect(mockRun).toHaveBeenCalled();
  });

  test('sets syncedAt to a non-null ISO date string', () => {
    markSynced('entry-001');
    const { syncedAt } = mockChain.set.mock.calls[0][0];
    expect(syncedAt).not.toBeNull();
    expect(Number.isNaN(new Date(syncedAt).getTime())).toBe(false);
  });

  test('passes a where clause (targets the correct entry)', () => {
    markSynced('entry-001');
    expect(mockChain.where).toHaveBeenCalled();
  });
});
