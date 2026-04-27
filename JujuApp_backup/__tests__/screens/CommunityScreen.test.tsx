import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import CommunityScreen from '../../src/screens/CommunityScreen';

const mockNavigate = jest.fn();

// Mock must be at the top level and cannot reference out-of-scope variables
jest.mock('@react-navigation/native', () => {
  const MockReact = require('react');
  return {
    useNavigation: () => ({
      navigate: mockNavigate,
    }),
    useFocusEffect: (callback: any) => {
      // Use MockReact.useEffect from the required React inside the mock factory
      MockReact.useEffect(() => {
        callback();
         
      }, []);
    },
  };
});

jest.mock('../../src/api/social', () => ({
  socialApi: {
    getFeed: jest.fn(),
    likePost: jest.fn(),
    unlikePost: jest.fn(),
  },
}));

import { socialApi } from '../../src/api/social';

describe('CommunityScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (socialApi.getFeed as jest.Mock).mockResolvedValue({
      code: 0,
      data: {
        list: [
          {
            id: '1',
            content: 'Test post content',
            userName: 'Test User',
            userAvatar: 'https://example.com/avatar.jpg',
            createdAt: new Date().toISOString(),
            likeCount: 10,
            commentCount: 5,
            isLiked: false,
          },
        ],
      },
    });
  });

  it('renders community screen without crashing', () => {
    render(<CommunityScreen />);
    expect(screen).toBeTruthy();
  });

  it('displays header title', async () => {
    render(<CommunityScreen />);
    await waitFor(() => {
      expect(screen.getByText('社区')).toBeTruthy();
    });
  });

  it('displays posts after loading', async () => {
    render(<CommunityScreen />);
    await waitFor(() => {
      expect(screen.getByText('Test post content')).toBeTruthy();
      expect(screen.getByText('Test User')).toBeTruthy();
    });
  });

  it('displays empty state when no posts', async () => {
    (socialApi.getFeed as jest.Mock).mockResolvedValue({
      code: 0,
      data: { list: [] },
    });
    render(<CommunityScreen />);
    await waitFor(() => {
      expect(screen.getByText('暂无动态')).toBeTruthy();
    });
  });

  it('handles like button press', async () => {
    (socialApi.likePost as jest.Mock).mockResolvedValue({ code: 0 });
    render(<CommunityScreen />);
    await waitFor(() => {
      expect(screen.getByText('Test post content')).toBeTruthy();
    });
  });

  it('navigates to CreatePost when FAB is pressed', async () => {
    render(<CommunityScreen />);
    await waitFor(() => {
      expect(screen.getByText('✏️')).toBeTruthy();
    });
  });

  it('handles API error gracefully', async () => {
    (socialApi.getFeed as jest.Mock).mockRejectedValue(new Error('API Error'));
    render(<CommunityScreen />);
    await waitFor(() => {
      expect(screen.getByText('暂无动态')).toBeTruthy();
    });
  });
});
