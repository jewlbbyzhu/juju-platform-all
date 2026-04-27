import React from 'react';
import { render, screen } from '@testing-library/react-native';
import PartyDetailScreen from '../../src/screens/PartyDetailScreen';

const mockNavigate = jest.fn();
const mockRoute = { params: { partyId: 1 } };

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
  useRoute: () => mockRoute,
}));

jest.mock('../../src/api/party', () => ({
  partyApi: {
    getPartyDetail: jest.fn().mockResolvedValue({ code: 0, data: {} }),
  },
}));

describe('PartyDetailScreen', () => {
  it('renders without crashing', () => {
    render(<PartyDetailScreen />);
    expect(screen).toBeTruthy();
  });
});
