// 2026高颜值设计 - 分享海报页 (设计系统重构版)
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Alert,
  Dimensions,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { HapticFeedback } from '../components/HapticFeedback';
import { Skeleton } from '../components/Skeleton';
import {
  useTheme,
  spacing,
  typography,
  BorderRadius,
  textStyles,
  glassmorphism,
  animation,
} from '../theme';

interface Party {
  id: string;
  title: string;
  startTime: string;
  address: string;
  price: number;
}

type RootStackParamList = {
  SharePoster: { partyId: string };
};

const { width } = Dimensions.get('window');
const POSTER_WIDTH = Math.min(width - 40, 340);

export default function SharePosterScreen() {
  const { colors, gradients } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'SharePoster'>>();
  const { partyId } = route.params;
  const [party, setParty] = useState<Party | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPartyData();
  }, [partyId]);

  const loadPartyData = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
    setParty({
      id: partyId,
      title: '示例聚会',
      startTime: '2024-03-31 19:00',
      address: '上海市',
      price: 99,
    });
    setLoading(false);
  };

  const savePoster = () => {
    Alert.alert('提示', '海报已保存到相册');
  };

  const shareToWeChat = () => {
    Alert.alert('提示', '已分享到微信');
  };

  // 使用设计系统替代 useMemo 样式 - 提取为命名样式对象
  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background.secondary,
  };

  const gradientStyle: ViewStyle = {
    flex: 1,
    minHeight: '100%',
  };

  const headerStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: spacing['3xl'],
  };

  const headerTitleStyle: TextStyle = {
    ...textStyles.h3,
    color: colors.text.primary,
    letterSpacing: 0.5,
  };

  const closeBtnStyle: TextStyle = {
    fontSize: typography.size.h2,
    color: colors.text.secondary,
    fontWeight: typography.weight.regular,
  };

  const skeletonContainerStyle: ViewStyle = {
    alignItems: 'center',
    paddingTop: spacing.lg,
  };

  const buttonSkeletonStyle: ViewStyle = {
    marginTop: spacing['2xl'],
    width: POSTER_WIDTH,
  };

  const posterContainerStyle: ViewStyle = {
    padding: spacing.lg,
    alignItems: 'center',
  };

  const posterCardStyle: ViewStyle = {
    width: POSTER_WIDTH,
    padding: 0,
    overflow: 'hidden',
    ...glassmorphism.card,
  };

  const posterStyle: ViewStyle = {
    overflow: 'hidden',
    borderRadius: BorderRadius.lg,
  };

  const posterHeaderStyle: ViewStyle = {
    padding: spacing.lg,
    alignItems: 'center',
  };

  const posterLogoStyle: TextStyle = {
    fontSize: typography.size.h2,
    fontWeight: typography.weight.bold,
    color: colors.text.inverse,
    letterSpacing: 2,
  };

  const posterTaglineStyle: TextStyle = {
    fontSize: typography.size.caption,
    color: colors.text.primary + 'CC',
    marginTop: spacing.xs,
    letterSpacing: 1,
  };

  const posterImageStyle: ImageStyle = {
    width: '100%',
    height: 180,
  };

  const posterContentStyle: ViewStyle = {
    padding: spacing.lg,
  };

  const posterTitleStyle: TextStyle = {
    ...textStyles.h3,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  };

  const posterInfoRowStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  };

  const posterInfoIconStyle: TextStyle = {
    fontSize: typography.size.body2,
    marginRight: spacing.sm,
  };

  const posterInfoStyle: TextStyle = {
    fontSize: typography.size.body2,
    color: colors.text.secondary,
  };

  const posterPriceContainerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.lg,
  };

  const posterPriceLabelStyle: TextStyle = {
    fontSize: typography.size.h3,
    fontWeight: typography.weight.semibold,
    color: colors.primary.main,
    marginTop: spacing.xs,
  };

  const posterPriceStyle: TextStyle = {
    fontSize: typography.size.display,
    fontWeight: typography.weight.bold,
    color: colors.primary.main,
  };

  const posterPriceSuffixStyle: TextStyle = {
    fontSize: typography.size.body2,
    color: colors.text.tertiary,
    marginTop: spacing.sm,
    marginLeft: spacing.xs,
  };

  const posterFooterStyle: ViewStyle = {
    padding: spacing.lg,
    paddingTop: 0,
    alignItems: 'center',
  };

  const qrPlaceholderStyle: ViewStyle = {
    width: 80,
    height: 80,
    backgroundColor: colors.background.tertiary,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  };

  const qrTextStyle: TextStyle = {
    fontSize: typography.size.small,
    color: colors.text.tertiary,
  };

  const actionButtonsStyle: ViewStyle = {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing['3xl'],
  };

  const actionBtnStyle: ViewStyle = {
    flex: 1,
  };

  if (loading) {
    return (
      <View style={containerStyle}>
        <View style={headerStyle}>
          <Text style={headerTitleStyle}>生成分享海报</Text>
          <HapticFeedback onPress={() => navigation.goBack()}>
            <Text style={closeBtnStyle}>✕</Text>
          </HapticFeedback>
        </View>
        <View style={skeletonContainerStyle}>
          <Skeleton width={POSTER_WIDTH} height={480} borderRadius={BorderRadius.xl} />
          <View style={buttonSkeletonStyle}>
            <Skeleton width={POSTER_WIDTH} height={56} borderRadius={BorderRadius.lg} />
          </View>
        </View>
      </View>
    );
  }

  if (!party) return null;

  return (
    <ScrollView style={containerStyle} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={[
          `${colors.primary.main}1A`,
          `${colors.secondary.main}0D`,
          colors.background.secondary,
        ]}
        style={gradientStyle}
      >
        <Animated.View
          entering={FadeInUp.duration(animation.duration.normal).delay(100)}
        >
          <View style={headerStyle}>
            <Text style={headerTitleStyle}>生成分享海报</Text>
            <HapticFeedback onPress={() => navigation.goBack()}>
              <Text style={closeBtnStyle}>✕</Text>
            </HapticFeedback>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.duration(animation.duration.normal).delay(200)}
        >
          <View style={posterContainerStyle}>
            <GlassCard
              style={posterCardStyle}
              intensity="light"
              glow
              glowColor={colors.primary.main}
            >
              <View style={posterStyle}>
                <LinearGradient
                  colors={gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={posterHeaderStyle}
                >
                  <Text style={posterLogoStyle}>JUJU</Text>
                  <Text style={posterTaglineStyle}>发现精彩聚会</Text>
                </LinearGradient>

                <Image
                  source={{ uri: 'https://via.placeholder.com/300x200' }}
                  style={posterImageStyle}
                />

                <View style={posterContentStyle}>
                  <Text style={posterTitleStyle}>{party.title}</Text>
                  <View style={posterInfoRowStyle}>
                    <Text style={posterInfoIconStyle}>📅</Text>
                    <Text style={posterInfoStyle}>{party.startTime}</Text>
                  </View>
                  <View style={posterInfoRowStyle}>
                    <Text style={posterInfoIconStyle}>📍</Text>
                    <Text style={posterInfoStyle}>{party.address}</Text>
                  </View>
                  <View style={posterPriceContainerStyle}>
                    <Text style={posterPriceLabelStyle}>¥</Text>
                    <Text style={posterPriceStyle}>{party.price}</Text>
                    <Text style={posterPriceSuffixStyle}>起</Text>
                  </View>
                </View>

                <View style={posterFooterStyle}>
                  <View style={qrPlaceholderStyle}>
                    <Text style={qrTextStyle}>扫码参加</Text>
                  </View>
                </View>
              </View>
            </GlassCard>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.duration(animation.duration.normal).delay(300)}
        >
          <View style={actionButtonsStyle}>
            <GlassButton
              title="💾 保存海报"
              onPress={savePoster}
              variant="secondary"
              size="large"
              style={actionBtnStyle}
            />
            <GlassButton
              title="📤 分享微信"
              onPress={shareToWeChat}
              variant="primary"
              size="large"
              style={actionBtnStyle}
            />
          </View>
        </Animated.View>
      </LinearGradient>
    </ScrollView>
  );
}
