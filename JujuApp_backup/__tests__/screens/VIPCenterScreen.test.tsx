import React from 'react';
import { render, screen } from '@testing-library/react-native';
import VIPCenterScreen from '../../src/screens/VIPCenterScreen';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

jest.mock('../../src/api/vip', () => ({
  vipApi: {
    getSubscriptionStatus: jest.fn().mockResolvedValue({ success: true, data: {} }),
    getVipPackages: jest.fn().mockResolvedValue({ success: true, data: { list: [] } }),
  },
}));

describe('VIPCenterScreen', () => {
  it('renders VIP center without crashing', () => {
    render(<VIPCenterScreen />);
    expect(screen).toBeTruthy();
  });
});
