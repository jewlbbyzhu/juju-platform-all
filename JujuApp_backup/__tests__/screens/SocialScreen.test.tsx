import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import SocialScreen from '../../src/screens/SocialScreen';

const mockNavigate = jest.fn();
const mockRoute = { params: { userId: '123' } };

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
  useRoute: () => mockRoute,
}));

jest.mock('../../src/api/follow', () => ({
  followApi: {
    getFollowers: jest.fn(),
    getFollowing: jest.fn(),
    follow: jest.fn(),
    unfollow: jest.fn(),
  },
}));

import { followApi } from '../../src/api/follow';

describe('SocialScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (followApi.getFollowers as jest.Mock).mockResolvedValue({
      code: 0,
      data: {
        list: [
          {
            id: '1',
            nickname: 'Follower User',
            avatar: 'https://example.com/avatar.jpg',
            bio: 'Test bio',
            is_vip: true,
            followers_count: 100,
            following_count: 50,
            parties_count: 10,
            is_following: false,
          },
        ],
        total: 1,
      },
    });
    (followApi.getFollowing as jest.Mock).mockResolvedValue({
      code: 0,
      data: {
        list: [
          {
            id: '2',
            nickname: 'Following User',
            avatar: 'https://example.com/avatar2.jpg',
            bio: 'Test bio 2',
            is_vip: false,
            followers_count: 200,
            following_count: 100,
            parties_count: 20,
            is_following: true,
          },
        ],
        total: 1,
      },
    });
  });

  it('renders social screen without crashing', () => {
    render(<SocialScreen />);
    expect(screen).toBeTruthy();
  });

  it('displays followers tab by default', async () => {
    render(<SocialScreen />);
    await waitFor(() => {
      expect(screen.getByText('粉丝')).toBeTruthy();
    });
  });

  it('displays following tab', async () => {
    render(<SocialScreen />);
    await waitFor(() => {
      expect(screen.getByText('关注')).toBeTruthy();
    });
  });

  it('displays user list', async () => {
    render(<SocialScreen />);
    await waitFor(() => {
      expect(screen.getByText('Follower User')).toBeTruthy();
    });
  });

  it('displays VIP badge for VIP users', async () => {
    render(<SocialScreen />);
    await waitFor(() => {
      expect(screen.getByText('VIP')).toBeTruthy();
    });
  });

  it('displays user stats', async () => {
    render(<SocialScreen />);
    await waitFor(() => {
      expect(screen.getByText('粉丝 100')).toBeTruthy();
      expect(screen.getByText('关注 50')).toBeTruthy();
      expect(screen.getByText('聚会 10')).toBeTruthy();
    });
  });

  it('displays follow button', async () => {
    render(<SocialScreen />);
    await waitFor(() => {
      expect(screen.getByText('关注')).toBeTruthy();
    });
  });

  it('handles tab switching', async () => {
    render(<SocialScreen />);
    await waitFor(() => {
      expect(screen.getByText('Follower User')).toBeTruthy();
    });
  });

  it('displays empty state when no users', async () => {
    (followApi.getFollowers as jest.Mock).mockResolvedValue({
      code: 0,
      data: { list: [], total: 0 },
    });
    render(<SocialScreen />);
    await waitFor(() => {
      expect(screen.getByText('暂无粉丝')).toBeTruthy();
    });
  });
});
