import React from 'react';
import { View, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { colors, spacing, Shadows, BorderRadius, typography } from '../../theme';
import { getVIPLevel } from './VIPLevelBadge';

export interface VipStatus {
  isVip: boolean;
  level: number;
  expireAt: string | null;
  benefits: string[];
}

interface VIPHeaderProps {
  vipStatus: VipStatus;
}

export const VIPHeader: React.FC<VIPHeaderProps> = React.memo(
  ({ vipStatus }) => {
    const currentLevel = getVIPLevel(vipStatus.level);

    return (
      <Animated.View entering={FadeInUp.duration(500)}>
        <LinearGradient
          colors={currentLevel.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingTop: 56,
            paddingHorizontal: spacing.md,
            paddingBottom: spacing.lg,
          }}
        >
          <View
            style={{
              borderRadius: BorderRadius.xl,
              padding: spacing.lg,
              alignItems: 'center',
              ...Shadows.large,
            }}
          >
            <View style={{ alignItems: 'center' }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: spacing.md,
                  gap: spacing.sm,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.xs,
                    borderRadius: 20,
                    gap: 4,
                    backgroundColor: currentLevel.color,
                  }}
                >
                  <Text style={{ fontSize: 20 }}>{currentLevel.icon}</Text>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: typography.weight.bold,
                      color: colors.text.inverse,
                    }}
                  >
                    {currentLevel.name}
                  </Text>
                </View>
                {vipStatus.isVip && (
                  <View
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 12,
                      backgroundColor: colors.status.success,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: typography.weight.bold,
                        color: colors.text.inverse,
                      }}
                    >
                      生效中
                    </Text>
                  </View>
                )}
              </View>

              <Text
                style={{
                  fontSize: 24,
                  fontWeight: typography.weight.bold,
                  color: colors.text.inverse,
                  marginBottom: spacing.xs,
                }}
              >
                {vipStatus.isVip ? '尊贵的 VIP 会员' : '开通 VIP 享特权'}
              </Text>

              {vipStatus.isVip && vipStatus.expireAt && (
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.text.inverse,
                    opacity: 0.8,
                  }}
                >
                  有效期至: {new Date(vipStatus.expireAt).toLocaleDateString()}
                </Text>
              )}

              {!vipStatus.isVip && (
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.text.inverse,
                    opacity: 0.8,
                  }}
                >
                  立即开通，享受专属权益
                </Text>
              )}
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  },
);

export default VIPHeader;
