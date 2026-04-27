import React, { useEffect, useState, useCallback } from 'react';
import {

  ScrollView,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Animated, { FadeIn } from 'react-native-reanimated';
import mapService from '../utils/mapService';
import { SearchLocationResult } from '../api/map';
import { useTheme, spacing, BorderRadius, Shadows, animation } from '../theme';
import {
  MapHeader,
  SearchBar,
  LocationItem,
  MapView,
  SelectedLocationCard,
} from '../components/mapScreen';

interface Location {
  latitude: number;
  longitude: number;
}

interface MapScreenParams {
  initialLocation?: Location;
  mode?: 'view' | 'select';
  onLocationSelect?: (location: SearchLocationResult) => void;
}

interface Marker {
  id: string;
  coordinate: Location;
  title?: string;
  description?: string;
}

const DEFAULT_REGION = {
  latitude: 39.9042,
  longitude: 116.4074,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export default function MapScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const params = (route.params as MapScreenParams) || {};
  const { initialLocation, mode = 'view', onLocationSelect } = params;
  const { colors } = useTheme();

  const [region, setRegion] = useState({
    latitude: initialLocation?.latitude || DEFAULT_REGION.latitude,
    longitude: initialLocation?.longitude || DEFAULT_REGION.longitude,
    latitudeDelta: DEFAULT_REGION.latitudeDelta,
    longitudeDelta: DEFAULT_REGION.longitudeDelta,
  });

  const [markers, setMarkers] = useState<Marker[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<SearchLocationResult[]>(
    [],
  );
  const [selectedLocation, setSelectedLocation] =
    useState<SearchLocationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const initLocation = useCallback(async () => {
    try {
      setLoading(true);
      const location = await mapService.getCurrentLocation();
      if (!initialLocation) {
        setRegion(prev => ({
          ...prev,
          latitude: location.latitude,
          longitude: location.longitude,
        }));
        setMarkers([
          {
            id: 'current',
            coordinate: location,
            title: '当前位置',
            description: '您在这里',
          },
        ]);
      }
    } catch (error) {
      console.error('Failed to get location:', error);
    } finally {
      setLoading(false);
    }
  }, [initialLocation]);

  useEffect(() => {
    initLocation();
  }, [initLocation]);

  const handleSearch = useCallback(async () => {
    if (!searchKeyword.trim()) {
      return;
    }
    try {
      setLoading(true);
      const results = await mapService.searchLocation(searchKeyword);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  }, [searchKeyword]);

  const selectSearchResult = useCallback((result: SearchLocationResult) => {
    setSelectedLocation(result);
    setRegion(prev => ({
      ...prev,
      latitude: result.location.latitude,
      longitude: result.location.longitude,
    }));
    setMarkers([
      {
        id: result.id,
        coordinate: result.location,
        title: result.name,
        description: result.address,
      },
    ]);
    setSearchResults([]);
    setSearchKeyword(result.name);
  }, []);

  const handleConfirmLocation = useCallback(() => {
    if (selectedLocation && onLocationSelect) {
      onLocationSelect(selectedLocation);
      navigation.goBack();
    }
  }, [selectedLocation, onLocationSelect, navigation]);

  const handleGetCurrentLocation = useCallback(async () => {
    try {
      setLoading(true);
      const location = await mapService.getCurrentLocation();
      setRegion(prev => ({
        ...prev,
        latitude: location.latitude,
        longitude: location.longitude,
      }));
      setMarkers(prev => [
        ...prev.filter(m => m.id !== 'current'),
        {
          id: 'current',
          coordinate: location,
          title: '当前位置',
          description: '您在这里',
        },
      ]);
    } catch (error) {
      console.error('Failed to get location:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 命名样式对象替代 useMemo
  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background.secondary,
  };

  const searchResultsStyle: ViewStyle = {
    maxHeight: 220,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.background.card,
    borderRadius: BorderRadius.lg,
    ...Shadows.large,
  };

  const renderSearchResults = useCallback(() => {
    if (searchResults.length === 0) return null;

    return (
      <Animated.View entering={FadeIn.duration(animation.duration.normal)}>
        <ScrollView
          style={searchResultsStyle}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {searchResults.map((result, index) => (
            <LocationItem
              key={result.id}
              result={result}
              index={index}
              onPress={selectSearchResult}
            />
          ))}
        </ScrollView>
      </Animated.View>
    );
  }, [searchResults, selectSearchResult, searchResultsStyle]);

  return (
    <SafeAreaView style={containerStyle} edges={['bottom']}>
      <MapHeader />

      <SearchBar
        value={searchKeyword}
        onChangeText={setSearchKeyword}
        onSearch={handleSearch}
      />

      {renderSearchResults()}

      <MapView
        region={region}
        markers={markers}
        loading={loading}
        onLocationPress={handleGetCurrentLocation}
      />

      {selectedLocation && (
        <SelectedLocationCard
          selectedLocation={selectedLocation}
          mode={mode}
          onConfirm={handleConfirmLocation}
        />
      )}
    </SafeAreaView>
  );
}
