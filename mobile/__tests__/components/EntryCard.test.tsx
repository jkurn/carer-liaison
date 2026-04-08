/**
 * Tests for EntryCard component.
 * Incident prevented: entry cards show wrong title, missing preview, or broken draft badge.
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import EntryCard from '../../components/EntryCard';
import { createTestEntry, createTestMessage } from '../factories';

describe('EntryCard', () => {
  const mockPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders entry title', () => {
    const entry = createTestEntry({ title: 'Stretched thin' });
    render(<EntryCard entry={entry} onPress={mockPress} />);
    expect(screen.getByText('Stretched thin')).toBeTruthy();
  });

  test('renders first user message as preview', () => {
    const entry = createTestEntry({
      conversation: [
        createTestMessage({ role: 'assistant', content: 'Hey.' }),
        createTestMessage({ role: 'user', content: 'It was a long day today.' }),
      ],
    });
    render(<EntryCard entry={entry} onPress={mockPress} />);
    expect(screen.getByText('It was a long day today.')).toBeTruthy();
  });

  test('shows draft badge for draft entries', () => {
    const entry = createTestEntry({ isDraft: true });
    render(<EntryCard entry={entry} onPress={mockPress} />);
    expect(screen.getByText('Draft')).toBeTruthy();
  });

  test('does not show draft badge for completed entries', () => {
    const entry = createTestEntry({ isDraft: false });
    render(<EntryCard entry={entry} onPress={mockPress} />);
    expect(screen.queryByText('Draft')).toBeNull();
  });

  test('shows body state emoji when present', () => {
    const entry = createTestEntry({ bodyState: 'difficult' });
    render(<EntryCard entry={entry} onPress={mockPress} />);
    expect(screen.getByText('😰')).toBeTruthy();
  });

  test('calls onPress when card is pressed', () => {
    const entry = createTestEntry();
    render(<EntryCard entry={entry} onPress={mockPress} />);
    fireEvent.press(screen.getByText('Stretched thin'));
    expect(mockPress).toHaveBeenCalledTimes(1);
  });

  test('falls back to "Draft entry" when title is null and isDraft', () => {
    const entry = createTestEntry({ title: null, isDraft: true, insights: null });
    render(<EntryCard entry={entry} onPress={mockPress} />);
    expect(screen.getByText('Draft entry')).toBeTruthy();
  });

  test('falls back to mood_label when title is null', () => {
    const entry = createTestEntry({ title: null });
    render(<EntryCard entry={entry} onPress={mockPress} />);
    expect(screen.getByText('Stretched thin')).toBeTruthy(); // from insights.mood_label
  });
});
