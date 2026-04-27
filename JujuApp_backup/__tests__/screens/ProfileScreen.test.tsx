import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import ProfileScreen from '../../src/screens/ProfileScreen';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('../../src/api/profile', () => ({
  profileApi: {
    getUserProfile: jest.fn(),
    getUserStatistics: jest.fn(),
  },
}));

import { profileApi } from '../../src/api/profile';

describe('ProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (profileApi.getUserProfile as jest.Mock).mockResolvedValue({
      success: true,
      code: 0,
      data: {
        id: 1,
        nickname: '测试用户',
        avatar: 'https://example.com/avatar.jpg',
        phone: '13800138000',
      },
    });
    (profileApi.getUserStatistics as jest.Mock).mockResolvedValue({
      success: true,
      code: 0,
      data: {
        partyCount: 5,
        orderCount: 10,
        followingCount: 20,
        followerCount: 30,
      },
    });
  });

  it('renders profile screen without crashing', () => {
    render(<ProfileScreen />);
    expect(screen).toBeTruthy();
  });

  it('displays user nickname', async () => {
    render(<ProfileScreen />);
    await waitFor(() => {
      expect(screen.getByText('测试用户')).toBeTruthy();
    });
  });
});
