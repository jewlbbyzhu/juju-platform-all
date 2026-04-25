import React, { memo } from 'react';
import { Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme, glassmorphism } from '../../theme';
import { gradients, typography } from '../../theme';

interface SocialHeaderProps {
  title?: string;
}

const SocialHeaderComponent: React.FC<SocialHeaderProps> = ({
  title = '社交',
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <Animated.View entering={FadeInDown.duration(400).springify()}>
      <LinearGradient
        colors={gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.container}
      >
        <Text style={styles.title}>{title}</Text>
      </LinearGradient>
    </Animated.View>
  );
};

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 20,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
      ...glassmorphism.header,
    },
    title: {
      fontSize: typography.size.h1,
      fontWeight: typography.weight.bold,
      color: colors.text.inverse,
      letterSpacing: 0.5,
    },
  });

export const SocialHeader = memo(SocialHeaderComponent);
