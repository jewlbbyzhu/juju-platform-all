import React, { useMemo } from 'react';
import { View, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TouchableOpacity } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { GlassCard } from '../GlassCard';
import { gradients, spacing, BorderRadius, animation, typography } from '../../theme';
import { colors } from '../../theme/colors';

interface MapViewProps {
  region: {
    latitude: number;
    longitude: number;
  };
  markers: Array<{
    id: string;
    title?: string;
    description?: string;
  }>;
  loading: boolean;
  onLocationPress: () => void;
}

export const MapView: React.FC<MapViewProps> = React.memo(
  ({ region, markers, loading, onLocationPress }) => {
    // 使用设计系统替代 StyleSheet.create
    const containerStyle = useMemo(
      (): ViewStyle => ({
        flex: 1,
        position: 'relative',
        marginHorizontal: spacing.md,
        marginBottom: spacing.sm,
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
      }),
      [],
    );

    const mockMapStyle = useMemo(
      (): ViewStyle => ({
        flex: 1,
        backgroundColor: colors.background.tertiary,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: BorderRadius.xl,
      }),
      [colors.background.tertiary],
    );

    const mockMapContentStyle = useMemo(
      (): ViewStyle => ({
        alignItems: 'center',
        padding: spacing.lg,
      }),
      [],
    );

    const mapPinStyle = useMemo(
      (): ViewStyle => ({
        width: 64,
        height: 64,
        borderRadius: BorderRadius.full,
        backgroundColor: colors.primary.main + '26',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
      }),
      [colors.primary.main],
    );

    const mapPinTextStyle = useMemo(
      (): TextStyle => ({
        fontSize: typography.size.display,
      }),
      [],
    );

    const mockMapTextStyle = useMemo(
      (): TextStyle => ({
        fontSize: typography.size.h2,
        fontWeight: typography.weight.bold,
        color: colors.text.primary,
        marginBottom: spacing.xs,
      }),
      [colors.text.primary],
    );

    const mockMapCoordsStyle = useMemo(
      (): TextStyle => ({
        color: colors.text.secondary,
        fontSize: typography.size.body2,
      }),
      [colors.text.secondary],
    );

    const markerCardStyle = useMemo(
      (): ViewStyle => ({
        marginTop: spacing.md,
        padding: spacing.sm + 4,
        minWidth: 180,
        alignItems: 'center',
      }),
      [],
    );

    const markerTitleStyle = useMemo(
      (): TextStyle => ({
        fontSize: typography.size.body2,
        fontWeight: typography.weight.semibold,
        color: colors.text.primary,
        marginBottom: spacing.xs,
      }),
      [colors.text.primary],
    );

    const markerDescStyle = useMemo(
      (): TextStyle => ({
        fontSize: typography.size.caption,
        color: colors.text.secondary,
      }),
      [colors.text.secondary],
    );

    const locationButtonStyle = useMemo(
      (): ViewStyle => ({
        position: 'absolute',
        right: spacing.md,
        bottom: 100,
        width: 48,
        height: 48,
        borderRadius: BorderRadius.full,
        shadowColor: colors.primary.main,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
      }),
      [colors.primary.main],
    );

    const locationButtonGradientStyle = useMemo(
      (): ViewStyle => ({
        width: 48,
        height: 48,
        borderRadius: BorderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
      }),
      [],
    );

    const locationButtonTextStyle = useMemo(
      (): TextStyle => ({
        fontSize: typography.size.h2,
        color: colors.text.inverse,
        fontWeight: typography.weight.bold,
      }),
      [colors.text.inverse],
    );

    const loadingOverlayStyle = useMemo(
      (): ViewStyle => ({
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: colors.gray[900] + 'CC',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: BorderRadius.xl,
      }),
      [colors.gray[900]],
    );

    return (
      <View style={containerStyle}>
        <View style={mockMapStyle}>
          <Animated.View
            style={mockMapContentStyle}
            entering={FadeInUp.duration(animation.duration.slow)}
          >
            <Animated.View
              style={mapPinStyle}
              entering={FadeInUp.duration(animation.duration.normal).delay(200)}
            >
              <Text style={mapPinTextStyle}>📍</Text>
            </Animated.View>
            <Text style={mockMapTextStyle}>地图视图</Text>
            <Text style={mockMapCoordsStyle}>
              {region.latitude.toFixed(4)}, {region.longitude.toFixed(4)}
            </Text>
            {markers.map(m => (
              <GlassCard
                key={m.id}
                style={markerCardStyle}
                intensity="medium"
              >
                <Text style={markerTitleStyle}>{m.title}</Text>
                <Text style={markerDescStyle}>{m.description}</Text>
              </GlassCard>
            ))}
          </Animated.View>
        </View>

        <TouchableOpacity
          style={locationButtonStyle}
          onPress={onLocationPress}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={gradients.primary}
            style={locationButtonGradientStyle}
          >
            <Text style={locationButtonTextStyle}>⊚</Text>
          </LinearGradient>
        </TouchableOpacity>

        {loading && (
          <View style={loadingOverlayStyle}>
            <ActivityIndicator size="large" color={colors.primary.main} />
          </View>
        )}
      </View>
    );
  },
);

MapView.displayName = 'MapView';
