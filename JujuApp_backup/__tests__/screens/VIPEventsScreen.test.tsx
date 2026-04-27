import React from 'react';
import { render, screen } from '@testing-library/react-native';
import VIPEventsScreen from '../../src/screens/VIPEventsScreen';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

jest.mock('../../src/api/vip', () => ({
  vipApi: {
    getVipEvents: jest.fn().mockResolvedValue({ success: true, data: { list: [] } }),
  },
}));

describe('VIPEventsScreen', () => {
  it('renders without crashing', () => {
    render(<VIPEventsScreen />);
    expect(screen).toBeTruthy();
  });
});
