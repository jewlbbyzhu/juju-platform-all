import React from 'react';
import { render, screen } from '@testing-library/react-native';
import VIPLevelsScreen from '../../src/screens/VIPLevelsScreen';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

jest.mock('../../src/api/vip', () => ({
  vipApi: {
    getVipLevels: jest.fn().mockResolvedValue({ success: true, data: [] }),
    getVipPoints: jest.fn().mockResolvedValue({ success: true, data: {} }),
  },
}));

describe('VIPLevelsScreen', () => {
  it('renders VIP levels without crashing', () => {
    render(<VIPLevelsScreen />);
    expect(screen).toBeTruthy();
  });
});
