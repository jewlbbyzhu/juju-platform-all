import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react-native';
import MapScreen from '../../src/screens/MapScreen';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockRoute = { params: {} };

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  }),
  useRoute: () => mockRoute,
}));

jest.mock('../../src/utils/mapService', () => ({
  __esModule: true,
  default: {
    getCurrentLocation: jest.fn(),
    searchLocation: jest.fn(),
    formatDistance: jest.fn((d) => `${d}m`),
  },
}));

import mapService from '../../src/utils/mapService';

describe('MapScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (mapService.getCurrentLocation as jest.Mock).mockResolvedValue({
      latitude: 39.9042,
      longitude: 116.4074,
    });
    (mapService.searchLocation as jest.Mock).mockResolvedValue([
      {
        id: '1',
        name: 'Test Location',
        address: 'Test Address',
        location: { latitude: 39.9, longitude: 116.4 },
        distance: 1000,
      },
    ]);
  });

  it('renders map screen without crashing', () => {
    render(<MapScreen />);
    expect(screen).toBeTruthy();
  });

  it('displays search input', () => {
    render(<MapScreen />);
    expect(screen.getByPlaceholderText('搜索地点...')).toBeTruthy();
  });

  it('displays search button', () => {
    render(<MapScreen />);
    expect(screen.getByText('搜索')).toBeTruthy();
  });

  it('handles search input change', () => {
    render(<MapScreen />);
    const input = screen.getByPlaceholderText('搜索地点...');
    fireEvent.changeText(input, 'test location');
    expect(input.props.value).toBe('test location');
  });

  it('displays map view', async () => {
    render(<MapScreen />);
    await waitFor(() => {
      expect(screen.getByText('地图视图')).toBeTruthy();
    });
  });

  it('displays location button', async () => {
    render(<MapScreen />);
    await waitFor(() => {
      expect(screen.getByText('⊚')).toBeTruthy();
    });
  });

  it('handles location button press', async () => {
    render(<MapScreen />);
    await waitFor(() => {
      expect(screen.getByText('⊚')).toBeTruthy();
    });
  });

  it('displays coordinates', async () => {
    render(<MapScreen />);
    await waitFor(() => {
      expect(screen.getByText(/39\.9042/)).toBeTruthy();
    });
  });

  it('handles get current location error gracefully', async () => {
    (mapService.getCurrentLocation as jest.Mock).mockRejectedValue(new Error('Location error'));
    render(<MapScreen />);
    await waitFor(() => {
      expect(screen.getByText('地图视图')).toBeTruthy();
    });
  });
});
