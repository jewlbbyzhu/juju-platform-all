import React from 'react';
import { render, screen } from '@testing-library/react-native';
import NotificationsScreen from '../../src/screens/NotificationsScreen';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

jest.mock('../../src/api/notification', () => ({
  notificationApi: {
    getNotifications: jest.fn().mockResolvedValue({ code: 0, data: { list: [] } }),
    markAsRead: jest.fn().mockResolvedValue({ code: 0 }),
  },
}));

describe('NotificationsScreen', () => {
  it('renders without crashing', () => {
    render(<NotificationsScreen />);
    expect(screen).toBeTruthy();
  });
});
