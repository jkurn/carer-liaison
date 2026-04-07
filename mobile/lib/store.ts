/**
 * Zustand store — UI state only.
 *
 * What lives HERE (in-memory, temporary):
 * - Current conversation draft
 * - Loading/error states
 * - Network connectivity
 * - Auth session (mirrored from SecureStore)
 *
 * What lives in SQLite (persisted, source of truth):
 * - Saved entries, body states, user profile
 */
import { create } from 'zustand';
import type { ChatMessage, BodyState } from './types';
import type { Session, User } from '@supabase/supabase-js';

interface AppState {
  // Auth
  session: Session | null;
  user: User | null;
  authLoading: boolean;
  setSession: (session: Session | null) => void;
  setAuthLoading: (loading: boolean) => void;

  // Journal chat (current draft in progress)
  activeEntryId: string | null;
  conversation: ChatMessage[];
  isStreaming: boolean;
  streamingText: string;
  bodyState: BodyState | null;
  setActiveEntry: (id: string | null, conversation?: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  setStreaming: (streaming: boolean) => void;
  setStreamingText: (text: string) => void;
  appendStreamingText: (chunk: string) => void;
  setBodyState: (state: BodyState | null) => void;
  resetJournal: () => void;

  // Network
  isOnline: boolean;
  setOnline: (online: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  // Auth
  session: null,
  user: null,
  authLoading: true,
  setSession: (session) =>
    set({ session, user: session?.user ?? null }),
  setAuthLoading: (authLoading) => set({ authLoading }),

  // Journal
  activeEntryId: null,
  conversation: [],
  isStreaming: false,
  streamingText: '',
  bodyState: null,
  setActiveEntry: (id, conversation = []) =>
    set({ activeEntryId: id, conversation }),
  addMessage: (message) =>
    set((s) => ({ conversation: [...s.conversation, message] })),
  setStreaming: (isStreaming) => set({ isStreaming }),
  setStreamingText: (streamingText) => set({ streamingText }),
  appendStreamingText: (chunk) =>
    set((s) => ({ streamingText: s.streamingText + chunk })),
  setBodyState: (bodyState) => set({ bodyState }),
  resetJournal: () =>
    set({
      activeEntryId: null,
      conversation: [],
      isStreaming: false,
      streamingText: '',
      bodyState: null,
    }),

  // Network
  isOnline: true,
  setOnline: (isOnline) => set({ isOnline }),
}));
