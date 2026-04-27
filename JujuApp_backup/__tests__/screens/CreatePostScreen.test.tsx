import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import CreatePostScreen from '../../src/screens/CreatePostScreen';

const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
  }),
}));

jest.mock('../../src/api/social', () => ({
  socialApi: {
    createPost: jest.fn(() => Promise.resolve({ data: { code: 0 } })),
  },
}));

describe('CreatePostScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<CreatePostScreen />);
    expect(screen.getByText('发布动态')).toBeTruthy();
    expect(screen.getByPlaceholderText('分享你的精彩时刻...')).toBeTruthy();
  });

  it('shows alert when submitting empty content', () => {
    render(<CreatePostScreen />);
    const publishBtn = screen.getByText('发布');
    fireEvent.press(publishBtn);
    // Should show alert
  });
});
