/**
 * Tests for lib/sync.ts — pushes unsynced entries to Supabase.
 *
 * This file is CRITICAL (risk score 5/5): if sync logic is wrong,
 * entries never reach Supabase. Data loss.
 *
 * Testing approach: mock database module (getUnsyncedEntries, markSynced)
 * and supabase client (from().upsert()). Test sync logic in isolation.
 *
 * CRITICAL INVARIANT: markSynced must ONLY be called on successful upsert.
 * If this invariant breaks, entries are marked synced but never actually pushed.
 */
import { syncEntries, trySyncIfOnline } from '../../lib/sync';
import { createUnsyncedRow } from '../factories';

// ── Get mock references from setup.ts ─────────────────────────
const { supabase } = jest.requireMock('../../lib/supabase') as {
  supabase: {
    auth: { getSession: jest.Mock };
    from: jest.Mock;
  };
};

// ── Mock database functions ───────────────────────────────────
const mockGetUnsyncedEntries = jest.fn();
const mockMarkSynced = jest.fn();

jest.mock('../../lib/database', () => ({
  getUnsyncedEntries: (...args: unknown[]) => mockGetUnsyncedEntries(...args),
  markSynced: (...args: unknown[]) => mockMarkSynced(...args),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

// ── syncEntries ──────────────────────────────────────────────
// Incident prevented: Journal entries never reach Supabase → data loss

describe('syncEntries', () => {
  describe('happy paths', () => {
    test('returns { pushed: 0, errors: 0 } when no unsynced entries exist', async () => {
      mockGetUnsyncedEntries.mockReturnValue([]);

      const result = await syncEntries();

      expect(result).toEqual({ pushed: 0, errors: 0 });
      expect(supabase.from).not.toHaveBeenCalled();
      expect(mockMarkSynced).not.toHaveBeenCalled();
    });

    test('pushes all unsynced entries and marks each as synced', async () => {
      const entries = [
        createUnsyncedRow({ id: 'e1' }),
        createUnsyncedRow({ id: 'e2' }),
        createUnsyncedRow({ id: 'e3' }),
      ];
      mockGetUnsyncedEntries.mockReturnValue(entries);

      const mockUpsert = jest.fn().mockResolvedValue({ error: null });
      supabase.from.mockReturnValue({ upsert: mockUpsert });

      const result = await syncEntries();

      expect(result).toEqual({ pushed: 3, errors: 0 });
      expect(mockUpsert).toHaveBeenCalledTimes(3);
      expect(mockMarkSynced).toHaveBeenCalledTimes(3);
      expect(mockMarkSynced).toHaveBeenCalledWith('e1');
      expect(mockMarkSynced).toHaveBeenCalledWith('e2');
      expect(mockMarkSynced).toHaveBeenCalledWith('e3');
    });
  });

  describe('error paths', () => {
    test('counts Supabase error as error and does NOT call markSynced', async () => {
      mockGetUnsyncedEntries.mockReturnValue([createUnsyncedRow({ id: 'e1' })]);

      const mockUpsert = jest.fn().mockResolvedValue({
        error: { message: 'RLS violation' },
      });
      supabase.from.mockReturnValue({ upsert: mockUpsert });

      const result = await syncEntries();

      expect(result).toEqual({ pushed: 0, errors: 1 });
      expect(mockMarkSynced).not.toHaveBeenCalled(); // CRITICAL INVARIANT
    });

    test('catches thrown exception and counts as error', async () => {
      mockGetUnsyncedEntries.mockReturnValue([createUnsyncedRow({ id: 'e1' })]);

      const mockUpsert = jest.fn().mockRejectedValue(new Error('Network timeout'));
      supabase.from.mockReturnValue({ upsert: mockUpsert });

      const result = await syncEntries();

      expect(result).toEqual({ pushed: 0, errors: 1 });
      expect(mockMarkSynced).not.toHaveBeenCalled(); // CRITICAL INVARIANT
    });

    test('handles mixed success and failure correctly', async () => {
      const entries = [
        createUnsyncedRow({ id: 'e1' }),
        createUnsyncedRow({ id: 'e2' }),
        createUnsyncedRow({ id: 'e3' }),
      ];
      mockGetUnsyncedEntries.mockReturnValue(entries);

      const mockUpsert = jest.fn()
        .mockResolvedValueOnce({ error: null })           // e1: success
        .mockResolvedValueOnce({ error: { message: 'fail' } }) // e2: error
        .mockResolvedValueOnce({ error: null });           // e3: success
      supabase.from.mockReturnValue({ upsert: mockUpsert });

      const result = await syncEntries();

      expect(result).toEqual({ pushed: 2, errors: 1 });
      expect(mockMarkSynced).toHaveBeenCalledTimes(2);
      expect(mockMarkSynced).toHaveBeenCalledWith('e1');
      expect(mockMarkSynced).not.toHaveBeenCalledWith('e2'); // Failed entry not marked
      expect(mockMarkSynced).toHaveBeenCalledWith('e3');
    });

    test('continues processing remaining entries after one fails', async () => {
      const entries = [
        createUnsyncedRow({ id: 'e1' }),
        createUnsyncedRow({ id: 'e2' }),
      ];
      mockGetUnsyncedEntries.mockReturnValue(entries);

      const mockUpsert = jest.fn()
        .mockRejectedValueOnce(new Error('Crash'))  // e1: throws
        .mockResolvedValueOnce({ error: null });     // e2: succeeds
      supabase.from.mockReturnValue({ upsert: mockUpsert });

      const result = await syncEntries();

      expect(result).toEqual({ pushed: 1, errors: 1 });
      expect(mockMarkSynced).toHaveBeenCalledWith('e2');
      expect(mockMarkSynced).not.toHaveBeenCalledWith('e1');
    });
  });

  describe('request format', () => {
    test('upserts with correct Supabase column names (snake_case)', async () => {
      const entry = createUnsyncedRow({
        id: 'e1',
        userId: 'user-1',
        title: 'Test',
        bodyState: 'calm',
      });
      mockGetUnsyncedEntries.mockReturnValue([entry]);

      const mockUpsert = jest.fn().mockResolvedValue({ error: null });
      supabase.from.mockReturnValue({ upsert: mockUpsert });

      await syncEntries();

      expect(supabase.from).toHaveBeenCalledWith('entries');
      const upsertArg = mockUpsert.mock.calls[0][0];
      expect(upsertArg.id).toBe('e1');
      expect(upsertArg.user_id).toBe('user-1');
      expect(upsertArg.body_state).toBe('calm');
      expect(upsertArg.is_draft).toBe(true);
    });
  });
});

// ── trySyncIfOnline ──────────────────────────────────────────
// Incident prevented: Sync runs without auth → 401 errors

describe('trySyncIfOnline', () => {
  test('skips sync when no session exists', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: null } });

    await trySyncIfOnline();

    expect(mockGetUnsyncedEntries).not.toHaveBeenCalled();
  });

  test('calls syncEntries when session exists', async () => {
    supabase.auth.getSession.mockResolvedValue({
      data: { session: { access_token: 'valid-token' } },
    });
    mockGetUnsyncedEntries.mockReturnValue([]);

    await trySyncIfOnline();

    expect(mockGetUnsyncedEntries).toHaveBeenCalled();
  });

  test('does not throw when syncEntries throws', async () => {
    supabase.auth.getSession.mockResolvedValue({
      data: { session: { access_token: 'valid-token' } },
    });
    mockGetUnsyncedEntries.mockImplementation(() => {
      throw new Error('DB crash');
    });

    // Should not throw — catches silently
    await expect(trySyncIfOnline()).resolves.toBeUndefined();
  });
});
