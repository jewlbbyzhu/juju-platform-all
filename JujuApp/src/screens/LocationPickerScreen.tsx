import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import mapService from '../utils/mapService';
import { SearchLocationResult } from '../api/map';
import { useTheme, spacing, typography, BorderRadius } from '../theme';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import LinearGradient from 'react-native-linear-gradient';

export default function LocationPickerScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { onLocationSelect, initialLocation } = (route.params as any) || {};
  const { colors } = useTheme();

  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<SearchLocationResult[]>(
    [],
  );
  const [selectedLocation, setSelectedLocation] =
    useState<SearchLocationResult | null>(initialLocation || null);
  const [loading, setLoading] = useState(false);
  const [cityList] = useState(mapService.getCityList());
  const [selectedCity, setSelectedCity] = useState(
    mapService.getSelectedCity() || '北京',
  );

  useEffect(() => {
    mapService.init();
  }, []);

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      Alert.alert('提示', '请输入搜索关键词');
      return;
    }
    try {
      setLoading(true);
      const results = await mapService.searchLocation(
        searchKeyword,
        selectedCity,
      );
      setSearchResults(results);
    } catch (error) {
      Alert.alert(
        '搜索失败',
        error instanceof Error ? error.message : '请稍后重试',
      );
    } finally {
      setLoading(false);
    }
  };

  const selectLocation = (location: SearchLocationResult) => {
    setSelectedLocation(location);
    setSearchResults([]);
  };

  const handleConfirm = () => {
    if (selectedLocation && onLocationSelect) {
      onLocationSelect(selectedLocation);
    }
    navigation.goBack();
  };

  // 使用设计系统替代 useMemo 样式
  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background.secondary,
  };

  const headerStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  };

  const headerBtnStyle: ViewStyle = {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  };

  const backButtonStyle: TextStyle = {
    color: colors.text.secondary,
    fontSize: typography.size.body,
  };

  const titleStyle: TextStyle = {
    color: colors.text.primary,
    fontSize: typography.size.h3,
    fontWeight: typography.weight.bold,
  };

  const confirmButtonStyle: TextStyle = {
    color: colors.primary.main,
    fontSize: typography.size.body,
    fontWeight: typography.weight.semibold,
  };

  const disabledButtonStyle: TextStyle = {
    color: colors.text.disabled,
  };

  const cityListWrapStyle: ViewStyle = {
    maxHeight: 56,
  };

  const cityListStyle: ViewStyle = {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  };

  const cityItemBaseStyle: ViewStyle = {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.xs,
    backgroundColor: `${colors.text.primary}99`,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: `${colors.text.primary}0D`,
  };

  const cityItemActiveStyle: ViewStyle = {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  };

  const cityTextStyle: TextStyle = {
    color: colors.text.secondary,
    fontSize: typography.size.body2,
    fontWeight: typography.weight.medium,
  };

  const cityTextActiveStyle: TextStyle = {
    color: colors.text.inverse,
    fontWeight: typography.weight.bold,
  };

  const searchCardStyle: ViewStyle = {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
  };

  const searchBarStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  };

  const searchInputStyle: TextStyle = {
    flex: 1,
    backgroundColor: `${colors.text.primary}80`,
    borderRadius: BorderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: colors.text.primary,
    fontSize: typography.size.body,
    borderWidth: 1,
    borderColor: `${colors.primary.main}1A`,
  };

  const loadingStyle: ViewStyle = {
    marginTop: spacing.xl,
  };

  const resultsCardStyle: ViewStyle = {
    flex: 1,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  };

  const resultsListStyle: ViewStyle = {
    maxHeight: 360,
  };

  const resultItemStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: `${colors.text.primary}66`,
    borderRadius: BorderRadius.lg,
    marginBottom: spacing.sm,
  };

  const resultIconStyle: ViewStyle = {
    width: 44,
    height: 44,
    backgroundColor: `${colors.primary.main}1A`,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  };

  const resultIconTextStyle: TextStyle = {
    fontSize: typography.size.h3,
  };

  // resultContentStyle removed - was unused

  // resultTitleStyle removed - was unused

  // resultSubtitleStyle removed - was unused

  // checkIconContainerStyle removed - was unused

  // checkIconTextStyle removed - was unused

  const selectedInfoStyle: ViewStyle = {
    margin: spacing.lg,
    padding: spacing.xl,
    borderRadius: BorderRadius.xl,
  };

  const selectedLabelStyle: TextStyle = {
    color: `${colors.text.primary}CC`,
    fontSize: typography.size.caption,
    marginBottom: spacing.sm,
  };

  const selectedNameStyle: TextStyle = {
    color: colors.text.inverse,
    fontSize: typography.size.h3,
    fontWeight: typography.weight.bold,
    marginBottom: spacing.xs,
  };

  const selectedAddressStyle: TextStyle = {
    color: `${colors.text.primary}E6`,
    fontSize: typography.size.body2,
  };

  return (
    <SafeAreaView style={containerStyle} edges={['bottom']}>
      <View style={headerStyle}>
        <GlassButton
          title="取消"
          onPress={() => navigation.goBack()}
          variant="ghost"
          size="small"
          style={headerBtnStyle}
          textStyle={backButtonStyle}
        />
        <Text style={titleStyle}>选择位置</Text>
        <GlassButton
          title="确定"
          onPress={handleConfirm}
          variant="ghost"
          size="small"
          style={headerBtnStyle}
          disabled={!selectedLocation}
          textStyle={
            !selectedLocation
              ? [confirmButtonStyle, disabledButtonStyle]
              : confirmButtonStyle
          }
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={cityListWrapStyle}
        contentContainerStyle={cityListStyle}
      >
        {cityList.map(city => (
          <GlassButton
            key={city}
            title={city}
            onPress={() => setSelectedCity(city)}
            variant={selectedCity === city ? 'primary' : 'ghost'}
            size="small"
            style={[
              cityItemBaseStyle,
              selectedCity === city && cityItemActiveStyle,
            ]}
            textStyle={
              selectedCity === city
                ? cityTextActiveStyle
                : cityTextStyle
            }
          />
        ))}
      </ScrollView>

      <GlassCard style={searchCardStyle} intensity="medium">
        <View style={searchBarStyle}>
          <TextInput
            style={searchInputStyle}
            placeholder="搜索地点..."
            placeholderTextColor={colors.text.tertiary}
            value={searchKeyword}
            onChangeText={setSearchKeyword}
            onSubmitEditing={handleSearch}
          />
          <GlassButton
            title="搜索"
            onPress={handleSearch}
            size="small"
            variant="primary"
          />
        </View>
      </GlassCard>

      {loading && (
        <ActivityIndicator
          size="large"
          color={colors.primary.main}
          style={loadingStyle}
        />
      )}

      {searchResults.length > 0 && (
        <GlassCard style={resultsCardStyle} intensity="light">
          <ScrollView
            style={resultsListStyle}
            showsVerticalScrollIndicator={false}
          >
            {searchResults.map(result => (
              <GlassButton
                key={result.id}
                title={`${result.name} - ${result.address}`}
                onPress={() => selectLocation(result)}
                variant="ghost"
                size="small"
                style={resultItemStyle}
                icon={
                  <View style={resultIconStyle}>
                    <Text style={resultIconTextStyle}>📍</Text>
                  </View>
                }
              />
            ))}
          </ScrollView>
        </GlassCard>
      )}

      {selectedLocation && (
        <LinearGradient
          colors={colors.primary.gradient as [string, string]}
          style={selectedInfoStyle}
        >
          <Text style={selectedLabelStyle}>已选择位置</Text>
          <Text style={selectedNameStyle}>{selectedLocation.name}</Text>
          <Text style={selectedAddressStyle}>{selectedLocation.address}</Text>
        </LinearGradient>
      )}
    </SafeAreaView>
  );
}
