/**
 * 禁用动画版本 - AnimatedPartyCard
 * 解决 Worklets 循环引用崩溃问题
 */
import React, { memo } from 'react';
import { ViewStyle } from 'react-native';
import { PartyCard } from './PartyCard';
import { spacing, BorderRadius } from '../../theme';
import type { NavigationProp } from '../../types';
import type { Party as PartyType } from '../../types/api';

interface AnimatedPressableProps {
  children: React.ReactNode;
  onPress: () => void;
  style?: object;
  disabled?: boolean;
}

// 普通 Pressable 替代 AnimatedPressable
export const AnimatedPressable: React.FC<AnimatedPressableProps> = memo(
  ({ children, onPress, style, disabled }) => {
    return (
      <View
        style={style}
        onTouchEnd={() => {
          if (!disabled) {
            onPress();
          }
        }}
      >
        {children}
      </View>
    );
  },
);
AnimatedPressable.displayName = 'AnimatedPressable';

interface AnimatedPartyCardProps {
  item: PartyType;
  index: number;
  navigation: NavigationProp;
}

// 普通 View 替代 AnimatedPartyCard
export const AnimatedPartyCard: React.FC<AnimatedPartyCardProps> = memo(
  ({ item, index, navigation }) => {
    const gridItemWrapperStyle: ViewStyle = {
      width: '50%',
      padding: spacing.xs,
    };

    const cardWrapperStyle: ViewStyle = {
      overflow: 'hidden',
      borderRadius: BorderRadius.xl,
    };

    return (
      <View style={gridItemWrapperStyle}>
        <View style={cardWrapperStyle}>
          <AnimatedPressable
            onPress={() =>
              navigation.navigate('PartyDetail', { partyId: String(item.id) })
            }
            style={cardWrapperStyle}
          >
            <PartyCard item={item} index={index} navigation={navigation} />
          </AnimatedPressable>
        </View>
      </View>
    );
  },
);
AnimatedPartyCard.displayName = 'AnimatedPartyCard';
