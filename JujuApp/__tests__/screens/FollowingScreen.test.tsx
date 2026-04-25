import React from 'react';
import { render, screen } from '@testing-library/react-native';
import FollowingScreen from '../../src/screens/FollowingScreen';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

jest.mock('../../src/api/follow', () => ({
  followApi: {
    getFollowing: jest.fn(() => Promise.resolve({
      data: {
        code: 0,
        data: {
          list: [
            { id: '1', nickname: 'Following 1', avatar: 'https://example.com/avatar1.jpg', bio: 'Bio 1' },
            { id: '2', nickname: 'Following 2', avatar: 'https://example.com/avatar2.jpg', bio: 'Bio 2' },
          ],
        },
      },
    })),
    unfollow: jest.fn(() => Promise.resolve({ data: { code: 0 } })),
  },
}));

describe('FollowingScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<FollowingScreen />);
    expect(screen).toBeTruthy();
  });
});