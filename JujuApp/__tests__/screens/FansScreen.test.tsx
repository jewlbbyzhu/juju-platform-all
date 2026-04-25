import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import FansScreen from '../../src/screens/FansScreen';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

jest.mock('../../src/api/follow', () => ({
  followApi: {
    getFollowers: jest.fn(() => Promise.resolve({
      data: {
        code: 0,
        data: {
          list: [
            { id: '1', nickname: 'User 1', avatar: 'https://example.com/avatar1.jpg', bio: 'Bio 1' },
            { id: '2', nickname: 'User 2', avatar: 'https://example.com/avatar2.jpg', bio: 'Bio 2' },
          ],
        },
      },
    })),
    follow: jest.fn(() => Promise.resolve({ data: { code: 0 } })),
  },
}));

describe('FansScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', async () => {
    render(<FansScreen />);
    await waitFor(() => {
      expect(screen.getByText('我的粉丝')).toBeTruthy();
    });
  });

  it('displays fan list', async () => {
    render(<FansScreen />);
    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeTruthy();
      expect(screen.getByText('User 2')).toBeTruthy();
    });
  });
});
