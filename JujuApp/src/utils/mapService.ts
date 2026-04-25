import { mapApi, Location, SearchLocationResult, RouteResult, GeocodeResult } from '../api/map';
import AsyncStorage from '@react-native-async-storage/async-storage';

class MapService {
  private currentLocation: Location | null = null;
  private isLocationAuthorized = false;
  private selectedCity: string = '';
  private readonly CITY_STORAGE_KEY = '@selectedCity';

  constructor() {
    this.loadCachedCity();
  }

  async init(): Promise<void> {
    try {
      await this.checkLocationPermission();
      if (this.isLocationAuthorized) {
        await this.getCurrentLocation();
      }
    } catch (error) {
      console.error('Failed to init map service:', error);
    }
  }

  async checkLocationPermission(): Promise<{ granted: boolean }> {
    this.isLocationAuthorized = true;
    return { granted: true };
  }

  async requestLocationPermission(): Promise<boolean> {
    this.isLocationAuthorized = true;
    return true;
  }

  async getCurrentLocation(): Promise<Location> {
    const mockLocation = {
      latitude: 39.9042,
      longitude: 116.4074
    };
    this.currentLocation = mockLocation;
    return mockLocation;
  }

  getCachedLocation(): Location | null {
    return this.currentLocation;
  }

  async searchLocation(keyword: string, city?: string): Promise<SearchLocationResult[]> {
    const res = await mapApi.searchLocation(keyword, city || this.selectedCity) as any;
    if (res.success && res.data) return res.data as SearchLocationResult[];
    return [];
  }

  async geocode(address: string, city?: string): Promise<GeocodeResult> {
    const res = await mapApi.geocode(address, city || this.selectedCity) as any;
    if (res.success && res.data) return res.data as GeocodeResult;
    return { location: { latitude: 0, longitude: 0 }, formattedAddress: '' } as GeocodeResult;
  }

  async reverseGeocode(latitude: number, longitude: number): Promise<GeocodeResult> {
    const res = await mapApi.reverseGeocode(latitude, longitude) as any;
    if (res.success && res.data) return res.data as GeocodeResult;
    return { location: { latitude: 0, longitude: 0 }, formattedAddress: '' } as GeocodeResult;
  }

  async calculateDistance(fromLat: number, fromLon: number, toLat: number, toLon: number): Promise<number> {
    const res = await mapApi.getDistance(fromLat, fromLon, toLat, toLon);
    if (res.success && res.data) return (res.data as any).distance || 0;
    return 0;
  }

  async calculateRoute(fromLat: number, fromLon: number, toLat: number, toLon: number, mode: string = 'driving'): Promise<RouteResult> {
    const res = await mapApi.calculateRoute(fromLat, fromLon, toLat, toLon, mode as any) as any;
    if (res.success && res.data) return res.data as RouteResult;
    return { distance: 0, duration: 0, polyline: [] as any, steps: [] as any } as RouteResult;
  }

  async getNearbyPOI(latitude: number, longitude: number, radius: number = 1000, keyword?: string): Promise<SearchLocationResult[]> {
    const res = await mapApi.getNearbyPOI(latitude, longitude, radius, keyword) as any;
    if (res.success && res.data) return res.data as SearchLocationResult[];
    return [];
  }

  formatDistance(distance: number): string {
    if (distance < 1000) return distance.toFixed(0) + 'm';
    return (distance / 1000).toFixed(1) + 'km';
  }

  formatDuration(seconds: number): string {
    const minutes = Math.ceil(seconds / 60);
    if (minutes < 60) return minutes + '分钟';
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) return hours + '小时';
    return hours + '小时' + remainingMinutes + '分钟';
  }

  getSelectedCity(): string {
    return this.selectedCity;
  }

  async setSelectedCity(city: string): Promise<void> {
    this.selectedCity = city;
    await AsyncStorage.setItem(this.CITY_STORAGE_KEY, city);
  }

  private async loadCachedCity(): Promise<void> {
    const cachedCity = await AsyncStorage.getItem(this.CITY_STORAGE_KEY);
    if (cachedCity) this.selectedCity = cachedCity;
  }

  async clearCache(): Promise<void> {
    await AsyncStorage.removeItem(this.CITY_STORAGE_KEY);
    this.selectedCity = '';
    this.currentLocation = null;
  }

  getCityList(): string[] {
    return [
      '北京', '上海', '广州', '深圳', '杭州', '成都', '重庆', '武汉', '西安', '南京',
      '天津', '苏州', '长沙', '郑州', '东莞', '青岛', '沈阳', '宁波', '昆明'
    ];
  }
}

export default new MapService();
export { MapService };
