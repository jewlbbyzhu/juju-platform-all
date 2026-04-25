import React from 'react';
import { render, screen } from '@testing-library/react-native';
import HomeScreen from '../../src/screens/HomeScreen';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

jest.mock('../../src/api/party', () => ({
  partyApi: {
    getPartyList: jest.fn(),
    getCategories: jest.fn(),
  },
}));

import { partyApi } from '../../src/api/party';

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (partyApi.getPartyList as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        list: [
          {
            id: 1,
            title: '周末聚会',
            cover_image: 'https://example.com/party1.jpg',
            location: '北京市',
            start_time: '2025-04-10T14:00:00Z',
            price: 100,
            participant_count: 10,
          },
        ],
        total: 1,
      },
    });
    (partyApi.getCategories as jest.Mock).mockResolvedValue({
      success: true,
      data: [
        { id: 1, name: '全部', icon: '🎉' },
        { id: 2, name: '户外', icon: '🏕️' },
      ],
    });
  });

  it('renders home screen without crashing', () => {
    render(<HomeScreen />);
    expect(screen).toBeTruthy();
  });

  it('displays search placeholder', () => {
    render(<HomeScreen />);
    expect(screen.getByPlaceholderText('搜索感兴趣的聚会...')).toBeTruthy();
  });
});
