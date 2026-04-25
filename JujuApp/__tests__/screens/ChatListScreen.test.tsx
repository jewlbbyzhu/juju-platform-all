import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import ChatListScreen from '../../src/screens/ChatListScreen';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

jest.mock('../../src/api/chat', () => ({
  chatApi: {
    getChatList: jest.fn(),
  },
}));

import { chatApi } from '../../src/api/chat';

describe('ChatListScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (chatApi.getChatList as jest.Mock).mockResolvedValue({
      code: 0,
      data: {
        list: [
          {
            id: 1,
            type: 'private',
            name: '张三',
            avatar: 'https://example.com/avatar1.jpg',
            lastMessage: '你好',
            lastTime: '2025-04-01T10:00:00Z',
            unreadCount: 2,
          },
        ],
      },
    });
  });

  it('renders chat list without crashing', () => {
    render(<ChatListScreen />);
    expect(screen).toBeTruthy();
  });

  it('displays message title', async () => {
    render(<ChatListScreen />);
    await waitFor(() => {
      expect(screen.getByText('消息')).toBeTruthy();
    });
  });
});
