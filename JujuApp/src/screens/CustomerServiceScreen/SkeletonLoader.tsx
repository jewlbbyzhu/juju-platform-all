import React, { memo } from 'react';
import { View } from 'react-native';
import { Skeleton, SkeletonList } from '../../components/Skeleton';
import { useTheme, spacing, BorderRadius } from '../../theme';

interface SkeletonLoaderProps {
  headerTopMargin?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = memo(
  ({ headerTopMargin = 88 }) => {
    const { colors } = useTheme();

    return (
      <View style={{ flex: 1, backgroundColor: colors.background.secondary }}>
        <View
          style={{
            padding: spacing['2xl'],
            alignItems: 'center',
            backgroundColor: colors.primary.main,
            margin: spacing.lg,
            marginTop: headerTopMargin,
            borderRadius: BorderRadius.xl,
          }}
        >
          <Skeleton width={80} height={80} borderRadius={BorderRadius.full} />
          <View style={{ marginTop: spacing.md, alignItems: 'center' }}>
            <Skeleton width={120} height={24} />
            <Skeleton
              width={160}
              height={16}
              style={{ marginTop: spacing.sm }}
            />
          </View>
        </View>
        <SkeletonList count={3} />
      </View>
    );
  },
);

SkeletonLoader.displayName = 'CustomerServiceSkeletonLoader';

export default SkeletonLoader;
