/**
 * Supabase client for Carer Liaison mobile app.
 *
 * Uses expo-secure-store for token persistence (Keychain on iOS, Keystore on Android).
 * The anon key is safe to include — RLS policies are the security boundary.
 */
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const SUPABASE_URL = 'https://tozcptfyxigqvsomzkmp.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvemNwdGZ5eGlncXZzb216a21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4NDU4MzksImV4cCI6MjA4ODQyMTgzOX0.F1yUtwcLFbCxg3AUX0xsoEFwt55Wzc9E5VhoxT4xt1k';

export const JOURNAL_AI_URL = `${SUPABASE_URL}/functions/v1/journal-ai`;

// Secure token storage adapter for native, localStorage for web
const secureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: secureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
