/**
 * Tests for Zustand store — UI state management.
 *
 * Critical flows:
 * - Journal conversation state (add message, streaming, reset)
 * - Auth state transitions
 * - Body state selection
 */
import { useStore } from '../../lib/store';

// Reset store between tests
beforeEach(() => {
  useStore.setState({
    session: null,
    user: null,
    authLoading: true,
    activeEntryId: null,
    conversation: [],
    isStreaming: false,
    streamingText: '',
    bodyState: null,
    isOnline: true,
  });
});

describe('auth state', () => {
  it('starts with authLoading true and no session', () => {
    const state = useStore.getState();
    expect(state.authLoading).toBe(true);
    expect(state.session).toBeNull();
    expect(state.user).toBeNull();
  });

  it('sets session and extracts user', () => {
    const mockSession = {
      user: { id: 'user-123', email: 'test@example.com' },
      access_token: 'token',
    } as any;

    useStore.getState().setSession(mockSession);
    const state = useStore.getState();

    expect(state.session).toBe(mockSession);
    expect(state.user?.id).toBe('user-123');
  });

  it('clears user when session is null', () => {
    useStore.getState().setSession({ user: { id: '1' } } as any);
    useStore.getState().setSession(null);

    expect(useStore.getState().user).toBeNull();
  });
});

describe('journal conversation state', () => {
  it('sets active entry with conversation', () => {
    const messages = [
      { role: 'assistant' as const, content: 'Hello', timestamp: '2026-04-07T00:00:00Z' },
    ];
    useStore.getState().setActiveEntry('entry-1', messages);
    const state = useStore.getState();

    expect(state.activeEntryId).toBe('entry-1');
    expect(state.conversation).toHaveLength(1);
    expect(state.conversation[0].content).toBe('Hello');
  });

  it('adds messages to conversation', () => {
    useStore.getState().setActiveEntry('entry-1', []);
    useStore.getState().addMessage({
      role: 'user',
      content: 'Had a tough day',
      timestamp: '2026-04-07T00:00:00Z',
    });
    useStore.getState().addMessage({
      role: 'assistant',
      content: 'Tell me more',
      timestamp: '2026-04-07T00:00:01Z',
    });

    expect(useStore.getState().conversation).toHaveLength(2);
    expect(useStore.getState().conversation[0].role).toBe('user');
    expect(useStore.getState().conversation[1].role).toBe('assistant');
  });

  it('manages streaming text', () => {
    useStore.getState().setStreaming(true);
    useStore.getState().setStreamingText('');
    useStore.getState().appendStreamingText('Hello');
    useStore.getState().appendStreamingText(' world');

    expect(useStore.getState().isStreaming).toBe(true);
    expect(useStore.getState().streamingText).toBe('Hello world');
  });

  it('resets journal state completely', () => {
    useStore.getState().setActiveEntry('entry-1', [
      { role: 'user', content: 'Hi', timestamp: '2026-04-07T00:00:00Z' },
    ]);
    useStore.getState().setStreaming(true);
    useStore.getState().setStreamingText('partial');
    useStore.getState().setBodyState('calm');

    useStore.getState().resetJournal();
    const state = useStore.getState();

    expect(state.activeEntryId).toBeNull();
    expect(state.conversation).toHaveLength(0);
    expect(state.isStreaming).toBe(false);
    expect(state.streamingText).toBe('');
    expect(state.bodyState).toBeNull();
  });
});

describe('body state', () => {
  it('sets body state', () => {
    useStore.getState().setBodyState('great');
    expect(useStore.getState().bodyState).toBe('great');
  });

  it('clears body state with null', () => {
    useStore.getState().setBodyState('calm');
    useStore.getState().setBodyState(null);
    expect(useStore.getState().bodyState).toBeNull();
  });
});

describe('network state', () => {
  it('defaults to online', () => {
    expect(useStore.getState().isOnline).toBe(true);
  });

  it('tracks offline/online transitions', () => {
    useStore.getState().setOnline(false);
    expect(useStore.getState().isOnline).toBe(false);

    useStore.getState().setOnline(true);
    expect(useStore.getState().isOnline).toBe(true);
  });
});
