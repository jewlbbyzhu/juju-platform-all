import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SkeletonList } from '../../components/Skeleton';
import { useTheme } from '../../theme';

interface LoadingStateProps {
  headerTitle?: string;
  headerSubtitle?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  headerTitle = '我的订单',
  headerSubtitle = '查看和管理您的所有订单',
}) => {
  const { colors, spacing, typography, layout } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.secondary,
    },
    headerContainer: {
      paddingHorizontal: layout.screenPadding,
      paddingTop: spacing.sm,
      paddingBottom: spacing.xl,
    },
    headerTitle: {
      fontSize: typography.size.h2,
      fontWeight: typography.weight.bold,
      color: colors.text.inverse,
      textAlign: 'center',
    },
    headerSubtitle: {
      fontSize: typography.size.body2,
      color: colors.text.inverse,
      opacity: 0.7,
      textAlign: 'center',
      marginTop: spacing.xs,
    },
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[...colors.primary.gradient]}
        style={styles.headerContainer}
      >
        <Text style={styles.headerTitle}>{headerTitle}</Text>
        <Text style={styles.headerSubtitle}>{headerSubtitle}</Text>
      </LinearGradient>
      <SkeletonList count={3} />
    </View>
  );
};

export default LoadingState;
