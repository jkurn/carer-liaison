/**
 * Tests for CrisisBanner component — safety-critical.
 * Incident prevented: crisis resources not visible or dismiss doesn't work.
 */
import React from 'react';
import { Linking } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import CrisisBanner from '../../components/CrisisBanner';

describe('CrisisBanner', () => {
  const mockDismiss = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Linking, 'openURL').mockImplementation(() => Promise.resolve(true));
  });

  test('displays Lifeline phone number', () => {
    render(<CrisisBanner onDismiss={mockDismiss} />);
    expect(screen.getByText('Lifeline 13 11 14')).toBeTruthy();
  });

  test('displays Beyond Blue and Emergency numbers', () => {
    render(<CrisisBanner onDismiss={mockDismiss} />);
    expect(screen.getByText(/Beyond Blue.*1300 22 4636/)).toBeTruthy();
    expect(screen.getByText(/Emergency.*000/)).toBeTruthy();
  });

  test('displays support heading', () => {
    render(<CrisisBanner onDismiss={mockDismiss} />);
    expect(screen.getByText('Need support right now?')).toBeTruthy();
  });

  test('calls onDismiss when dismiss button is pressed', () => {
    render(<CrisisBanner onDismiss={mockDismiss} />);
    const dismissButton = screen.getByLabelText('Dismiss crisis banner');
    fireEvent.press(dismissButton);
    expect(mockDismiss).toHaveBeenCalledTimes(1);
  });

  test('opens Lifeline tel: link when call button is pressed', () => {
    render(<CrisisBanner onDismiss={mockDismiss} />);
    const callButton = screen.getByLabelText('Call Lifeline');
    fireEvent.press(callButton);
    expect(Linking.openURL).toHaveBeenCalledWith('tel:131114');
  });
});
