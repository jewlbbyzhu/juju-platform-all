import React, { useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { SearchLocationResult } from '../../api/map';
import { colors, spacing, typography, BorderRadius } from '../../theme';
import mapService from '../../utils/mapService';

interface LocationItemProps {
  result: SearchLocationResult;
  index: number;
  onPress: (result: SearchLocationResult) => void;
}

export const LocationItem: React.FC<LocationItemProps> = React.memo(
  ({ result, index: _index, onPress }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = useCallback(() => {
      Animated.spring(scaleAnim, {
        toValue: 0.97,
        useNativeDriver: true,
      }).start();
    }, [scaleAnim]);

    const handlePressOut = useCallback(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }, [scaleAnim]);

    const handlePress = useCallback(() => {
      onPress(result);
    }, [result, onPress]);

    // 使用设计系统替代 StyleSheet.create
    const containerStyle = useMemo(
      (): ViewStyle => ({
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.sm + 2,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
      }),
      [colors.divider],
    );

    const iconContainerStyle = useMemo(
      (): ViewStyle => ({
        width: 36,
        height: 36,
        borderRadius: BorderRadius.sm,
        backgroundColor: colors.primary.main + '1A',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.sm + 4,
      }),
      [colors.primary.main],
    );

    const iconTextStyle = useMemo(
      (): TextStyle => ({
        fontSize: typography.size.body2,
      }),
      [],
    );

    const contentStyle = useMemo(
      (): ViewStyle => ({
        flex: 1,
      }),
      [],
    );

    const nameStyle = useMemo(
      (): TextStyle => ({
        color: colors.text.primary,
        fontSize: typography.size.body,
        fontWeight: typography.weight.semibold,
        marginBottom: spacing.xs,
      }),
      [colors.text.primary],
    );

    const addressStyle = useMemo(
      (): TextStyle => ({
        color: colors.text.secondary,
        fontSize: typography.size.caption,
      }),
      [colors.text.secondary],
    );

    const distanceStyle = useMemo(
      (): TextStyle => ({
        color: colors.primary.main,
        fontSize: typography.size.small,
        fontWeight: typography.weight.semibold,
        backgroundColor: colors.primary.main + '1A',
        paddingHorizontal: spacing.xs + 2,
        paddingVertical: 2,
        borderRadius: BorderRadius.sm,
      }),
      [colors.primary.main],
    );

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={containerStyle}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
        >
          <View style={iconContainerStyle}>
            <Text style={iconTextStyle}>📍</Text>
          </View>
          <View style={contentStyle}>
            <Text style={nameStyle}>{result.name}</Text>
            <Text style={addressStyle}>{result.address}</Text>
          </View>
          {result.distance && (
            <Text style={distanceStyle}>
              {mapService.formatDistance(result.distance)}
            </Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  },
);

LocationItem.displayName = 'LocationItem';
