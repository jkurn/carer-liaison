/**
 * Tests for BodyStateSelector component.
 * Incident prevented: body state buttons don't render or selection callback doesn't fire.
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import BodyStateSelector from '../../components/BodyStateSelector';

describe('BodyStateSelector', () => {
  const mockSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders all 5 body states', () => {
    render(<BodyStateSelector selected={null} onSelect={mockSelect} />);

    expect(screen.getByText('😊')).toBeTruthy();
    expect(screen.getByText('😌')).toBeTruthy();
    expect(screen.getByText('😐')).toBeTruthy();
    expect(screen.getByText('😤')).toBeTruthy();
    expect(screen.getByText('😰')).toBeTruthy();
  });

  test('renders all 5 labels', () => {
    render(<BodyStateSelector selected={null} onSelect={mockSelect} />);

    expect(screen.getByText('Great')).toBeTruthy();
    expect(screen.getByText('Calm')).toBeTruthy();
    expect(screen.getByText('Neutral')).toBeTruthy();
    expect(screen.getByText('Resistant')).toBeTruthy();
    expect(screen.getByText('Difficult')).toBeTruthy();
  });

  test('calls onSelect with state key when a state is pressed', () => {
    render(<BodyStateSelector selected={null} onSelect={mockSelect} />);

    fireEvent.press(screen.getByLabelText('Calm body state'));
    expect(mockSelect).toHaveBeenCalledWith('calm');
  });

  test('calls onSelect with null when active state is pressed (toggle off)', () => {
    render(<BodyStateSelector selected="calm" onSelect={mockSelect} />);

    fireEvent.press(screen.getByLabelText('Calm body state'));
    expect(mockSelect).toHaveBeenCalledWith(null);
  });

  test('calls onSelect with new state when different state is pressed', () => {
    render(<BodyStateSelector selected="calm" onSelect={mockSelect} />);

    fireEvent.press(screen.getByLabelText('Difficult body state'));
    expect(mockSelect).toHaveBeenCalledWith('difficult');
  });

  test('has accessibility labels for all states', () => {
    render(<BodyStateSelector selected={null} onSelect={mockSelect} />);

    expect(screen.getByLabelText('Great body state')).toBeTruthy();
    expect(screen.getByLabelText('Calm body state')).toBeTruthy();
    expect(screen.getByLabelText('Neutral body state')).toBeTruthy();
    expect(screen.getByLabelText('Resistant body state')).toBeTruthy();
    expect(screen.getByLabelText('Difficult body state')).toBeTruthy();
  });
});
