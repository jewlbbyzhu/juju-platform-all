import React from 'react';
import { render, screen } from '@testing-library/react-native';
import PaymentScreen from '../../src/screens/PaymentScreen';

const mockNavigate = jest.fn();
const mockRoute = { params: { order: { id: 1, amount: 100 } } };

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
  useRoute: () => mockRoute,
}));

describe('PaymentScreen', () => {
  it('renders without crashing', () => {
    render(<PaymentScreen />);
    expect(screen).toBeTruthy();
  });
});
