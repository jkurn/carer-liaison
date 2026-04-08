/**
 * Local SQLite database layer.
 *
 * Data flow:
 * ┌─────────────┐    write     ┌──────────────┐    sync     ┌──────────┐
 * │  App UI     │ ───────────▶ │  SQLite      │ ──────────▶ │ Supabase │
 * │  (Zustand)  │ ◀─────────── │  (Drizzle)   │             │  Cloud   │
 * └─────────────┘    read      └──────────────┘             └──────────┘
 *
 * SQLite is the source of truth. Supabase is the sync target.
 */
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import { eq, desc, isNull } from 'drizzle-orm';
import * as schema from './schema';
import type { JournalEntry, BodyState, ChatMessage, RBTItem } from './types';

const expo = openDatabaseSync('carer-liaison.db');
export const db = drizzle(expo, { schema });

// ── Migrations ──────────────────────────────────────────────
export async function runMigrations() {
  expo.execSync(`
    CREATE TABLE IF NOT EXISTS entries (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT,
      body_state TEXT,
      conversation TEXT NOT NULL DEFAULT '[]',
      rose TEXT,
      bud TEXT,
      thorn TEXT,
      insights TEXT,
      is_draft INTEGER NOT NULL DEFAULT 1,
      is_crisis INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      synced_at TEXT
    );

    CREATE TABLE IF NOT EXISTS body_states (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      state TEXT NOT NULL,
      note TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      synced_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_entries_user ON entries(user_id);
    CREATE INDEX IF NOT EXISTS idx_entries_draft ON entries(is_draft);
    CREATE INDEX IF NOT EXISTS idx_entries_synced ON entries(synced_at);
    CREATE INDEX IF NOT EXISTS idx_body_states_user ON body_states(user_id);
  `);
}

// ── Entry CRUD ──────────────────────────────────────────────
function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** @internal Exported for testing. */
export function parseJSON<T>(json: string | null): T | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

/** @internal Exported for testing. */
export function rowToEntry(row: typeof schema.entries.$inferSelect): JournalEntry {
  return {
    id: row.id,
    userId: row.userId,
    title: row.title,
    bodyState: row.bodyState as BodyState | null,
    conversation: parseJSON<ChatMessage[]>(row.conversation) ?? [],
    rose: parseJSON<RBTItem>(row.rose),
    bud: parseJSON<RBTItem>(row.bud),
    thorn: parseJSON<RBTItem>(row.thorn),
    insights: parseJSON(row.insights),
    isDraft: row.isDraft,
    isCrisis: row.isCrisis,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    syncedAt: row.syncedAt,
  };
}

export function createEntry(userId: string): JournalEntry {
  const id = generateId();
  const now = new Date().toISOString();
  db.insert(schema.entries)
    .values({
      id,
      userId,
      conversation: '[]',
      isDraft: true,
      isCrisis: false,
      createdAt: now,
      updatedAt: now,
    })
    .run();
  return {
    id,
    userId,
    title: null,
    bodyState: null,
    conversation: [],
    rose: null,
    bud: null,
    thorn: null,
    insights: null,
    isDraft: true,
    isCrisis: false,
    createdAt: now,
    updatedAt: now,
    syncedAt: null,
  };
}

export function updateEntry(
  id: string,
  updates: Partial<
    Pick<JournalEntry, 'title' | 'bodyState' | 'conversation' | 'rose' | 'bud' | 'thorn' | 'insights' | 'isDraft' | 'isCrisis'>
  >,
) {
  const now = new Date().toISOString();
  const values: Record<string, unknown> = { updatedAt: now, syncedAt: null };
  if (updates.title !== undefined) values.title = updates.title;
  if (updates.bodyState !== undefined) values.bodyState = updates.bodyState;
  if (updates.conversation !== undefined) values.conversation = JSON.stringify(updates.conversation);
  if (updates.rose !== undefined) values.rose = updates.rose ? JSON.stringify(updates.rose) : null;
  if (updates.bud !== undefined) values.bud = updates.bud ? JSON.stringify(updates.bud) : null;
  if (updates.thorn !== undefined) values.thorn = updates.thorn ? JSON.stringify(updates.thorn) : null;
  if (updates.insights !== undefined) values.insights = updates.insights ? JSON.stringify(updates.insights) : null;
  if (updates.isDraft !== undefined) values.isDraft = updates.isDraft;
  if (updates.isCrisis !== undefined) values.isCrisis = updates.isCrisis;

  db.update(schema.entries).set(values).where(eq(schema.entries.id, id)).run();
}

export function getEntry(id: string): JournalEntry | null {
  const row = db.select().from(schema.entries).where(eq(schema.entries.id, id)).get();
  return row ? rowToEntry(row) : null;
}

export function getEntries(userId: string, limit = 20, offset = 0): JournalEntry[] {
  const rows = db
    .select()
    .from(schema.entries)
    .where(eq(schema.entries.userId, userId))
    .orderBy(desc(schema.entries.createdAt))
    .limit(limit)
    .offset(offset)
    .all();
  return rows.map(rowToEntry);
}

export function getDraftEntry(userId: string): JournalEntry | null {
  const row = db
    .select()
    .from(schema.entries)
    .where(eq(schema.entries.userId, userId))
    .orderBy(desc(schema.entries.createdAt))
    .limit(1)
    .get();
  return row && row.isDraft ? rowToEntry(row) : null;
}

export function getUnsyncedEntries(): typeof schema.entries.$inferSelect[] {
  return db.select().from(schema.entries).where(isNull(schema.entries.syncedAt)).all();
}

export function markSynced(id: string) {
  db.update(schema.entries)
    .set({ syncedAt: new Date().toISOString() })
    .where(eq(schema.entries.id, id))
    .run();
}

// ── Body State CRUD ─────────────────────────────────────────
export function createBodyState(userId: string, state: BodyState, note?: string) {
  const id = generateId();
  db.insert(schema.bodyStates)
    .values({ id, userId, state, note: note ?? null })
    .run();
  return id;
}

export function getRecentBodyStates(userId: string, limit = 7) {
  return db
    .select()
    .from(schema.bodyStates)
    .where(eq(schema.bodyStates.userId, userId))
    .orderBy(desc(schema.bodyStates.createdAt))
    .limit(limit)
    .all();
}
