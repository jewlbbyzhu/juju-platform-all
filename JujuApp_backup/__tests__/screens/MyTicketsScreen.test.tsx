import React from 'react';
import { render, screen } from '@testing-library/react-native';
import MyTicketsScreen from '../../src/screens/MyTicketsScreen';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
  useFocusEffect: () => {},
}));

jest.mock('../../src/api/ticket', () => ({
  ticketApi: {
    getMyTickets: jest.fn().mockResolvedValue({ code: 0, data: { list: [] } }),
  },
}));

describe('MyTicketsScreen', () => {
  it('renders without crashing', () => {
    render(<MyTicketsScreen />);
    expect(screen).toBeTruthy();
  });
});
