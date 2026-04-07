/**
 * Drizzle ORM schema for local SQLite database.
 *
 * Tables:
 * - entries: Journal entries with conversation + RBT reflection
 * - body_states: Body state check-in log
 *
 * Sync strategy:
 * - syncedAt = null means not yet synced to Supabase
 * - Sync triggers: on save, on reconnect, on app foreground
 * - Conflict resolution: last-write-wins by updatedAt (single user)
 */
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const entries = sqliteTable('entries', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title'),
  bodyState: text('body_state'),
  // JSON-serialized ChatMessage[] — conversation loaded/saved as a unit
  conversation: text('conversation').notNull().default('[]'),
  // JSON-serialized RBTItem or null
  rose: text('rose'),
  bud: text('bud'),
  thorn: text('thorn'),
  // JSON-serialized insights object or null
  insights: text('insights'),
  isDraft: integer('is_draft', { mode: 'boolean' }).notNull().default(true),
  isCrisis: integer('is_crisis', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
  syncedAt: text('synced_at'),
});

export const bodyStates = sqliteTable('body_states', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  state: text('state').notNull(),
  note: text('note'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  syncedAt: text('synced_at'),
});
