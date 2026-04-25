import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../../theme';
import { BorderRadius } from '../../theme/shadows';

interface AgreementCheckboxProps {
  agreed: boolean;
  onToggle: () => void;
}

export const AgreementCheckbox: React.FC<AgreementCheckboxProps> = React.memo(
  ({ agreed, onToggle }) => {
    const { colors, gradients, animation } = useTheme();
    const scaleAnim = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scaleAnim.value }],
    }));

    const handlePress = () => {
      scaleAnim.value = withSequence(
        withSpring(0.8, { damping: 15 }),
        withSpring(1, animation?.spring?.gentle || { damping: 15 }),
      );
      onToggle();
    };

    return (
      <View style={styles.agreementSection}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={handlePress}
          activeOpacity={0.7}
        >
          <Animated.View style={animatedStyle}>
            {agreed ? (
              <LinearGradient
                colors={[...gradients.primary]}
                style={styles.checkboxGradient}
              >
                <Text
                  style={[styles.checkmark, { color: colors.text.inverse }]}
                >
                  ✓
                </Text>
              </LinearGradient>
            ) : (
              <View
                style={[styles.checkboxEmpty, { borderColor: colors.border }]}
              />
            )}
          </Animated.View>
        </TouchableOpacity>
        <View style={styles.agreementTextContainer}>
          <Text style={[styles.agreementText, { color: colors.text.tertiary }]}>
            我已阅读并同意
          </Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text
              style={[styles.agreementLink, { color: colors.primary.main }]}
            >
              《用户协议》
            </Text>
          </TouchableOpacity>
          <Text style={[styles.agreementText, { color: colors.text.tertiary }]}>
            和
          </Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text
              style={[styles.agreementLink, { color: colors.primary.main }]}
            >
              《隐私政策》
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  agreementSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  checkbox: {
    marginRight: 10,
    marginTop: 2,
  },
  checkboxGradient: {
    width: 20,
    height: 20,
    borderRadius: BorderRadius.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 12,
    fontWeight: '700',
  },
  checkboxEmpty: {
    width: 20,
    height: 20,
    borderRadius: BorderRadius.xs,
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  agreementTextContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  agreementText: {
    fontSize: 13,
    lineHeight: 22,
  },
  agreementLink: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 22,
  },
});
