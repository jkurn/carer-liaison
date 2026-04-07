/**
 * Sync engine — pushes unsynced entries from SQLite to Supabase.
 *
 * Triggers:
 * - On entry save (if online)
 * - On network reconnect (offline → online)
 * - On app foreground (resume)
 *
 * Conflict resolution: last-write-wins by updatedAt (single user).
 */
import { supabase } from './supabase';
import { getUnsyncedEntries, markSynced } from './database';

export async function syncEntries(): Promise<{ pushed: number; errors: number }> {
  const unsynced = getUnsyncedEntries();
  if (unsynced.length === 0) return { pushed: 0, errors: 0 };

  let pushed = 0;
  let errors = 0;

  for (const entry of unsynced) {
    try {
      const { error } = await supabase.from('entries').upsert(
        {
          id: entry.id,
          user_id: entry.userId,
          title: entry.title,
          body_state: entry.bodyState,
          conversation: entry.conversation, // already JSON string
          rose: entry.rose,
          bud: entry.bud,
          thorn: entry.thorn,
          insights: entry.insights,
          is_draft: entry.isDraft,
          is_crisis: entry.isCrisis,
          created_at: entry.createdAt,
          updated_at: entry.updatedAt,
        },
        { onConflict: 'id' },
      );

      if (error) {
        console.error(`Sync failed for entry ${entry.id}:`, error.message);
        errors++;
      } else {
        markSynced(entry.id);
        pushed++;
      }
    } catch (err) {
      console.error(`Sync error for entry ${entry.id}:`, err);
      errors++;
    }
  }

  return { pushed, errors };
}

/**
 * Call this on app foreground or network reconnect.
 */
export async function trySyncIfOnline(): Promise<void> {
  try {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return; // Not logged in, skip

    const result = await syncEntries();
    if (result.pushed > 0) {
      console.log(`Synced ${result.pushed} entries`);
    }
    if (result.errors > 0) {
      console.warn(`${result.errors} entries failed to sync`);
    }
  } catch (err) {
    // Silent fail — sync will retry on next trigger
    console.warn('Sync attempt failed:', err);
  }
}
