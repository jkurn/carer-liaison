/**
 * Tests for types.ts — constants and type guards.
 */
import { BODY_STATES, JOURNAL_SUGGESTIONS } from '../../lib/types';

describe('BODY_STATES', () => {
  it('has exactly 5 states', () => {
    expect(BODY_STATES).toHaveLength(5);
  });

  it('has the correct order: great → calm → neutral → resistant → difficult', () => {
    expect(BODY_STATES.map((s) => s.key)).toEqual([
      'great',
      'calm',
      'neutral',
      'resistant',
      'difficult',
    ]);
  });

  it('each state has key, emoji, and label', () => {
    for (const state of BODY_STATES) {
      expect(state.key).toBeTruthy();
      expect(state.emoji).toBeTruthy();
      expect(state.label).toBeTruthy();
    }
  });
});

describe('JOURNAL_SUGGESTIONS', () => {
  it('has exactly 5 suggestions', () => {
    expect(JOURNAL_SUGGESTIONS).toHaveLength(5);
  });

  it('includes "Go deeper" style prompts', () => {
    expect(JOURNAL_SUGGESTIONS).toContain('Suggest some ideas');
    expect(JOURNAL_SUGGESTIONS).toContain('Help me think through this');
    expect(JOURNAL_SUGGESTIONS).toContain('Offer different perspective');
  });
});
