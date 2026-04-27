import api from './index';
import { ApiResponse } from '../types/api';

export interface Location {
  latitude: number;
  longitude: number;
}

export interface SearchLocationResult {
  id: string;
  name: string;
  address: string;
  location: Location;
  distance?: number;
}

export interface RouteResult {
  distance: number;
  duration: number;
  polyline: Location[];
  steps: RouteStep[];
}

export interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
  startLocation: Location;
  endLocation: Location;
}

export interface GeocodeResult {
  location: Location;
  formattedAddress: string;
}

export const mapApi = {
  searchLocation: (keyword: string, city?: string) =>
    api.get<ApiResponse<SearchLocationResult[]>>('/map/search', { params: { keyword, city } }),

  geocode: (address: string, city?: string) =>
    api.get<ApiResponse<GeocodeResult>>('/map/geocode', { params: { address, city } }),

  reverseGeocode: (latitude: number, longitude: number) =>
    api.get<ApiResponse<GeocodeResult>>('/map/reverse-geocode', { params: { latitude, longitude } }),

  getDistance: (fromLat: number, fromLon: number, toLat: number, toLon: number) =>
    api.get<ApiResponse<{ distance: number; duration?: number }>>('/map/distance', { params: { fromLat, fromLon, toLat, toLon } }),

  calculateRoute: (
    fromLat: number,
    fromLon: number,
    toLat: number,
    toLon: number,
    mode: 'driving' | 'walking' | 'cycling' | 'transit' = 'driving'
  ) =>
    api.get<ApiResponse<RouteResult>>('/map/route', { params: { fromLat, fromLon, toLat, toLon, mode } }),

  getNearbyPOI: (latitude: number, longitude: number, radius: number = 1000, keyword?: string) =>
    api.get<ApiResponse<SearchLocationResult[]>>('/map/nearby', { params: { latitude, longitude, radius, keyword } }),
};

export default mapApi;
