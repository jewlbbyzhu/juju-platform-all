import React from 'react';
import { render, screen } from '@testing-library/react-native';
import UserProfileScreen from '../../src/screens/UserProfileScreen';

const mockNavigate = jest.fn();
const mockRoute = { params: { userId: 1 } };

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
  useRoute: () => mockRoute,
}));

jest.mock('../../src/api/user', () => ({
  userApi: {
    getUserProfile: jest.fn().mockResolvedValue({ code: 0, data: {} }),
    getUserPosts: jest.fn().mockResolvedValue({ code: 0, data: { list: [] } }),
  },
}));

describe('UserProfileScreen', () => {
  it('renders without crashing', () => {
    render(<UserProfileScreen />);
    expect(screen).toBeTruthy();
  });
});
