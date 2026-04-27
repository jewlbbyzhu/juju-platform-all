import React from 'react';
import { render, screen } from '@testing-library/react-native';
import LoginScreen from '../../src/screens/LoginScreen';

const mockNavigate = jest.fn();
const mockReset = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    reset: mockReset,
  }),
}));

jest.mock('../../src/api/auth', () => ({
  authApi: {
    login: jest.fn(),
  },
}));

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form', () => {
    render(<LoginScreen />);
    // Login screen renders without crashing
    expect(screen).toBeTruthy();
  });

  it('has login button', () => {
    render(<LoginScreen />);
    const loginButton = screen.getByText('立即登录');
    expect(loginButton).toBeTruthy();
  });
});
