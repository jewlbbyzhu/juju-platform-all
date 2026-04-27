import React from 'react';
import { render, screen } from '@testing-library/react-native';
import VIPStatsScreen from '../../src/screens/VIPStatsScreen';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

jest.mock('../../src/api/vipStats', () => ({
  vipStatsApi: {
    getVipStats: jest.fn().mockResolvedValue({ success: true, data: {} }),
  },
}));

describe('VIPStatsScreen', () => {
  it('renders without crashing', () => {
    render(<VIPStatsScreen />);
    expect(screen).toBeTruthy();
  });
});
