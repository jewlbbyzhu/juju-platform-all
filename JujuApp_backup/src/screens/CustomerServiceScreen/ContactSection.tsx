import React, { useRef, memo } from 'react';
import {
  View,
  Text,
  Pressable,
  Animated,
  Linking,
} from 'react-native';
import { GlassCard } from '../../components/GlassCard';
import { GlassButton } from '../../components/GlassButton';
import {useTheme, spacing, BorderRadius} from '../../theme';
import { SERVICE_PHONE } from './types';

interface ContactSectionProps {
  onChatPress: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = memo(
  ({ onChatPress }) => {
    const { colors, textStyles } = useTheme();
    const phoneButtonScale = useRef(new Animated.Value(1)).current;
    const chatButtonScale = useRef(new Animated.Value(1)).current;

    const handlePhonePressIn = () => {
      Animated.spring(phoneButtonScale, {
        toValue: 0.95,
        tension: 150,
        friction: 10,
        useNativeDriver: true,
      }).start();
    };

    const handlePhonePressOut = () => {
      Animated.spring(phoneButtonScale, {
        toValue: 1,
        tension: 150,
        friction: 10,
        useNativeDriver: true,
      }).start();
    };

    const handleChatPressIn = () => {
      Animated.spring(chatButtonScale, {
        toValue: 0.95,
        tension: 150,
        friction: 10,
        useNativeDriver: true,
      }).start();
    };

    const handleChatPressOut = () => {
      Animated.spring(chatButtonScale, {
        toValue: 1,
        tension: 150,
        friction: 10,
        useNativeDriver: true,
      }).start();
    };

    const makePhoneCall = () => {
      Linking.openURL(`tel:${SERVICE_PHONE}`);
    };

    return (
      <>
        <GlassCard
          title="联系我们"
          style={{ margin: spacing.lg, marginTop: 0 }}
          intensity="light"
        >
          <Pressable
            onPress={makePhoneCall}
            onPressIn={handlePhonePressIn}
            onPressOut={handlePhonePressOut}
          >
            <Animated.View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: spacing.sm,
                transform: [{ scale: phoneButtonScale }],
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: spacing.md - 2,
                  backgroundColor: colors.status.success,
                  borderRadius: BorderRadius.md,
                }}
              >
                <Text style={{ fontSize: 24, color: colors.text.inverse }}>
                  📞
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    textStyles.body,
                    {
                      color: colors.text.primary,
                      marginBottom: 2,
                      fontWeight: '600',
                    },
                  ]}
                >
                  客服电话
                </Text>
                <Text
                  style={[
                    textStyles.caption,
                    { color: colors.text.secondary },
                  ]}
                >
                  {SERVICE_PHONE}
                </Text>
              </View>

              <GlassButton
                title="拨打"
                variant="primary"
                size="small"
                onPress={makePhoneCall}
              />
            </Animated.View>
          </Pressable>
        </GlassCard>

        <View
          style={{
            margin: spacing.lg,
            marginTop: spacing.md,
            marginBottom: 88,
          }}
        >
          <Pressable
            onPress={onChatPress}
            onPressIn={handleChatPressIn}
            onPressOut={handleChatPressOut}
          >
            <Animated.View
              style={{
                shadowColor: colors.primary.main,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 6,
                transform: [{ scale: chatButtonScale }],
              }}
            >
              <GlassButton
                title="💬 在线咨询"
                onPress={onChatPress}
                variant="gradient"
                size="large"
                fullWidth
              />
            </Animated.View>
          </Pressable>
        </View>
      </>
    );
  },
);

ContactSection.displayName = 'ContactSection';

export default ContactSection;
