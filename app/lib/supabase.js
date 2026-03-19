/* ═══════════════════════════════════════════════════════════════
   Supabase Client + Auth Helpers

   Data flow:
   ┌──────────┐   import    ┌──────────────┐   query    ┌──────────┐
   │  View    │ ──────────▶ │  supabase.js │ ──────────▶│ Supabase │
   │  module  │             │  (this file) │            │  Cloud   │
   └──────────┘             └──────┬───────┘            └──────────┘
                                   │
                            exports:
                             • supabase (client)
                             • getUser()
                             • getProfile()
                             • requireAuth()
                             • signOut()

   Auth guard flow:
   requireAuth() ─── session? ─── yes ──▶ return user
                         │
                         no
                         │
                    redirect #/login
   ═══════════════════════════════════════════════════════════════ */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://tozcptfyxigqvsomzkmp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvemNwdGZ5eGlncXZzb216a21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4NDU4MzksImV4cCI6MjA4ODQyMTgzOX0.F1yUtwcLFbCxg3AUX0xsoEFwt55Wzc9E5VhoxT4xt1k';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Cache for current session user
let _cachedUser = null;

/**
 * Get the currently authenticated user, or null.
 * Uses cached value if available; refreshes on auth state change.
 */
export async function getUser() {
  if (_cachedUser) return _cachedUser;
  const { data: { user } } = await supabase.auth.getUser();
  _cachedUser = user;
  return user;
}

/**
 * Get the profile row for the current user, or null.
 */
export async function getProfile() {
  const user = await getUser();
  if (!user) return null;
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  return data;
}

/**
 * Require authentication. Redirects to #/login if no session.
 * Returns the user object if authenticated.
 */
export async function requireAuth() {
  const user = await getUser();
  if (!user) {
    location.hash = '#/login';
    return null;
  }
  return user;
}

/**
 * Sign out and redirect to login.
 */
export async function signOut() {
  await supabase.auth.signOut();
  _cachedUser = null;
  location.hash = '#/login';
}

// Listen for auth state changes to keep cache fresh
supabase.auth.onAuthStateChange((_event, session) => {
  _cachedUser = session?.user || null;
});
