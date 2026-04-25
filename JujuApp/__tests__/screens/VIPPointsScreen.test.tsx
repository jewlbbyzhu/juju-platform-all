import React from 'react';
import { render, screen } from '@testing-library/react-native';
import VIPPointsScreen from '../../src/screens/VIPPointsScreen';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

jest.mock('../../src/api/vip', () => ({
  vipApi: {
    getVipPoints: jest.fn().mockResolvedValue({ success: true, data: {} }),
    getVipPointsHistory: jest.fn().mockResolvedValue({ success: true, data: { list: [] } }),
  },
}));

describe('VIPPointsScreen', () => {
  it('renders without crashing', () => {
    render(<VIPPointsScreen />);
    expect(screen).toBeTruthy();
  });
});
