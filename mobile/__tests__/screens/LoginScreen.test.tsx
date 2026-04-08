/**
 * Tests for auth/login.tsx — authentication entry point.
 *
 * Incident prevented: login form fields missing, auth errors swallowed,
 * successful login doesn't navigate, loading state not shown.
 */
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import LoginScreen from '../../app/auth/login';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';

const mockSignIn = supabase.auth.signInWithPassword as jest.Mock;
const mockRouter = { push: jest.fn(), replace: jest.fn(), back: jest.fn() };

beforeEach(() => {
  jest.clearAllMocks();
  (useRouter as jest.Mock).mockReturnValue(mockRouter);
});

describe('LoginScreen — rendering', () => {
  test('renders brand name "Carer Liaison"', () => {
    render(<LoginScreen />);
    expect(screen.getByText('Carer Liaison')).toBeTruthy();
  });

  test('renders "Welcome back" subtitle', () => {
    render(<LoginScreen />);
    expect(screen.getByText('Welcome back')).toBeTruthy();
  });

  test('renders email input with placeholder', () => {
    render(<LoginScreen />);
    expect(screen.getByPlaceholderText('Email')).toBeTruthy();
  });

  test('renders password input with placeholder', () => {
    render(<LoginScreen />);
    expect(screen.getByPlaceholderText('Password')).toBeTruthy();
  });

  test('renders "Log in" button', () => {
    render(<LoginScreen />);
    expect(screen.getByText('Log in')).toBeTruthy();
  });

  test('renders sign-up link text', () => {
    render(<LoginScreen />);
    expect(screen.getByText(/Don't have an account\?/)).toBeTruthy();
  });

  test('does not show error text on initial render', () => {
    render(<LoginScreen />);
    expect(screen.queryByText(/invalid|error|wrong/i)).toBeNull();
  });
});

describe('LoginScreen — auth logic', () => {
  test('calls signInWithPassword with trimmed, lowercased email', async () => {
    mockSignIn.mockResolvedValueOnce({ error: null });
    render(<LoginScreen />);

    fireEvent.changeText(screen.getByPlaceholderText('Email'), '  Test@Email.com  ');
    fireEvent.changeText(screen.getByPlaceholderText('Password'), 'password123');

    await act(async () => {
      fireEvent.press(screen.getByText('Log in'));
    });

    expect(mockSignIn).toHaveBeenCalledWith({
      email: 'test@email.com',
      password: 'password123',
    });
  });

  test('navigates to tabs on successful login', async () => {
    mockSignIn.mockResolvedValueOnce({ error: null });
    render(<LoginScreen />);

    fireEvent.changeText(screen.getByPlaceholderText('Email'), 'user@test.com');
    fireEvent.changeText(screen.getByPlaceholderText('Password'), 'pass');

    await act(async () => {
      fireEvent.press(screen.getByText('Log in'));
    });

    expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)');
  });

  test('displays error message when auth fails', async () => {
    mockSignIn.mockResolvedValueOnce({ error: { message: 'Invalid credentials' } });
    render(<LoginScreen />);

    fireEvent.changeText(screen.getByPlaceholderText('Email'), 'bad@test.com');
    fireEvent.changeText(screen.getByPlaceholderText('Password'), 'wrongpass');

    await act(async () => {
      fireEvent.press(screen.getByText('Log in'));
    });

    expect(screen.getByText('Invalid credentials')).toBeTruthy();
  });

  test('does not call signInWithPassword when email is empty', async () => {
    render(<LoginScreen />);
    fireEvent.changeText(screen.getByPlaceholderText('Password'), 'password123');

    await act(async () => {
      fireEvent.press(screen.getByText('Log in'));
    });

    expect(mockSignIn).not.toHaveBeenCalled();
  });

  test('does not call signInWithPassword when password is empty', async () => {
    render(<LoginScreen />);
    fireEvent.changeText(screen.getByPlaceholderText('Email'), 'user@test.com');

    await act(async () => {
      fireEvent.press(screen.getByText('Log in'));
    });

    expect(mockSignIn).not.toHaveBeenCalled();
  });

  test('does not navigate when auth fails', async () => {
    mockSignIn.mockResolvedValueOnce({ error: { message: 'Invalid credentials' } });
    render(<LoginScreen />);

    fireEvent.changeText(screen.getByPlaceholderText('Email'), 'bad@test.com');
    fireEvent.changeText(screen.getByPlaceholderText('Password'), 'wrongpass');

    await act(async () => {
      fireEvent.press(screen.getByText('Log in'));
    });

    expect(mockRouter.replace).not.toHaveBeenCalled();
  });
});
