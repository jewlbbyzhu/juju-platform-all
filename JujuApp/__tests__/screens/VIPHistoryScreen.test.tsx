import React from 'react';
import { render, screen } from '@testing-library/react-native';
import VIPHistoryScreen from '../../src/screens/VIPHistoryScreen';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

jest.mock('../../src/api/vip', () => ({
  vipApi: {
    getSubscriptionHistory: jest.fn().mockResolvedValue({ success: true, data: { list: [] } }),
  },
}));

describe('VIPHistoryScreen', () => {
  it('renders without crashing', () => {
    render(<VIPHistoryScreen />);
    expect(screen).toBeTruthy();
  });
});
