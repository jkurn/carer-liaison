/**
 * Tests for ChatBubble component.
 * Incident prevented: user/assistant messages rendered with wrong styling or missing content.
 */
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import ChatBubble from '../../components/ChatBubble';

describe('ChatBubble', () => {
  test('renders message content', () => {
    render(<ChatBubble role="user" content="Today was really hard." />);
    expect(screen.getByText('Today was really hard.')).toBeTruthy();
  });

  test('renders assistant avatar with L', () => {
    render(<ChatBubble role="assistant" content="Sounds like the day wore on you." />);
    expect(screen.getByText('L')).toBeTruthy();
    expect(screen.getByText('Sounds like the day wore on you.')).toBeTruthy();
  });

  test('does not render avatar for user messages', () => {
    render(<ChatBubble role="user" content="Hello" />);
    expect(screen.queryByText('L')).toBeNull();
  });

  test('renders streaming cursor when isStreaming is true', () => {
    render(<ChatBubble role="assistant" content="Thinking" isStreaming={true} />);
    expect(screen.getByText('|')).toBeTruthy();
  });

  test('does not render cursor when isStreaming is false', () => {
    render(<ChatBubble role="assistant" content="Done" isStreaming={false} />);
    expect(screen.queryByText('|')).toBeNull();
  });

  test('handles empty content string', () => {
    render(<ChatBubble role="user" content="" />);
    // Should render without crashing
    expect(screen.toJSON()).not.toBeNull();
  });

  test('handles long content without crashing', () => {
    const longText = 'A'.repeat(2000);
    render(<ChatBubble role="user" content={longText} />);
    expect(screen.getByText(longText)).toBeTruthy();
  });
});
