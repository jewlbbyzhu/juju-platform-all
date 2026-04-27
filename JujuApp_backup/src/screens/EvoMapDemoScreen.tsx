import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import {
  useTheme,
  spacing,
  BorderRadius,
  typography,
  textStyles,
  animation,
  gradients,
  Shadows,
} from '../theme';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { Skeleton } from '../components/Skeleton';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface Asset {
  id: string;
  asset_type: string;
  summary: string;
  gdi_score: number;
}

export default function EvoMapDemoScreen() {
  const { colors } = useTheme();
  const [nodeStatus, setNodeStatus] = useState<'disconnected' | 'connected'>(
    'disconnected',
  );
  const [loading, setLoading] = useState(false);
  const [claimUrl, setClaimUrl] = useState('');
  const [assets, setAssets] = useState<Asset[]>([]);

  const handleRegisterNode = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setNodeStatus('connected');
      setClaimUrl('https://evomap.example.com/claim/abc123');
      Alert.alert('节点注册', '成功注册节点并获得 Gene + Capsule');
    }, 1000);
  }, []);

  const handleFetchAssets = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setAssets([
        {
          id: '1',
          asset_type: 'Gene',
          summary: '创意聚焦音乐协作共同本日志密码',
          gdi_score: 0.95,
        },
        {
          id: '2',
          asset_type: 'Capsule',
          summary: 'APP试用低重多选题有限跳转化',
          gdi_score: 0.88,
        },
      ]);
      Alert.alert('获取成功', '成功获取 2 条资产项目');
    }, 1000);
  }, []);

  const handleCopyUrl = useCallback(() => {
    Alert.alert('复制成功', '链接已复制到剪贴板');
  }, []);

  // 命名样式对象替代 useMemo
  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background.secondary,
  };

  const headerStyle: ViewStyle = {
    padding: spacing.xl,
    paddingTop: spacing['5xl'],
    paddingBottom: spacing['2xl'],
  };

  const titleStyle: TextStyle = {
    ...textStyles.h1,
    color: colors.text.inverse,
    letterSpacing: 0.5,
  };

  const subtitleStyle: TextStyle = {
    fontSize: typography.size.body2,
    color: colors.text.primary + 'CC',
    marginTop: spacing.sm,
    fontWeight: typography.weight.medium,
  };

  const scrollViewStyle: ViewStyle = {
    flex: 1,
  };

  const cardStyle: ViewStyle = {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  };

  const statusRowStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const labelStyle: TextStyle = {
    fontSize: typography.size.caption,
    color: colors.text.tertiary,
    marginBottom: spacing.sm,
    fontWeight: typography.weight.medium,
    textTransform: 'uppercase',
    letterSpacing: 1,
  };

  const statusBaseStyle: TextStyle = {
    fontSize: typography.size.h2,
    fontWeight: typography.weight.bold,
  };

  const statusConnectedStyle: TextStyle = {
    color: colors.status.success,
  };

  const statusDisconnectedStyle: TextStyle = {
    color: colors.text.tertiary,
  };

  const statusDotBaseStyle: ViewStyle = {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.background.primary,
  };

  const statusDotConnectedStyle: ViewStyle = {
    backgroundColor: colors.status.success,
    ...Shadows.small,
    shadowColor: colors.status.success,
    shadowOpacity: 0.5,
    shadowRadius: 8,
  };

  const statusDotDisconnectedStyle: ViewStyle = {
    backgroundColor: colors.gray[300],
  };

  const urlContainerStyle: ViewStyle = {
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: spacing.md,
  };

  const urlStyle: TextStyle = {
    fontSize: typography.size.body2,
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.mono,
  };

  const copyBtnStyle: ViewStyle = {
    alignSelf: 'flex-start',
  };

  const actionsStyle: ViewStyle = {
    padding: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.sm,
  };

  const assetsSectionStyle: ViewStyle = {
    marginTop: spacing.sm,
    paddingBottom: spacing['2xl'],
  };

  const sectionTitleStyle: TextStyle = {
    ...textStyles.h3,
    color: colors.text.primary,
    marginLeft: spacing.lg,
    marginBottom: spacing.md,
    letterSpacing: 0.5,
  };

  const assetCardStyle: ViewStyle = {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  };

  const assetHeaderStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  };

  const assetTypeBadgeStyle: ViewStyle = {
    backgroundColor: colors.secondary.main + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: BorderRadius.sm,
  };

  const assetTypeStyle: TextStyle = {
    fontSize: typography.size.body,
    color: colors.secondary.main,
    fontWeight: typography.weight.bold,
  };

  const scoreBadgeStyle: ViewStyle = {
    backgroundColor: colors.status.success + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: BorderRadius.xs,
  };

  const assetScoreStyle: TextStyle = {
    fontSize: typography.size.caption,
    color: colors.status.success,
    fontWeight: typography.weight.semibold,
  };

  const assetSummaryStyle: TextStyle = {
    fontSize: typography.size.body,
    color: colors.text.primary,
    lineHeight: typography.size.body * typography.lineHeight.normal,
    fontWeight: typography.weight.medium,
  };

  const skeletonContainerStyle: ViewStyle = {
    padding: spacing.lg,
    paddingTop: spacing.sm,
  };

  return (
    <View style={containerStyle}>
      <LinearGradient
        colors={gradients.cool}
        style={headerStyle}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={titleStyle}>EvoMap GEP-A2A 节点管理</Text>
        <Text style={subtitleStyle}>去中心化资产管理网络</Text>
      </LinearGradient>

      <ScrollView
        style={scrollViewStyle}
        showsVerticalScrollIndicator={false}
      >
        <GlassCard
          style={cardStyle}
          intensity={nodeStatus === 'connected' ? 'medium' : 'light'}
          glow={nodeStatus === 'connected'}
          glowColor={colors.status.success}
        >
          <View style={statusRowStyle}>
            <View>
              <Text style={labelStyle}>节点状态</Text>
              <Text
                style={[
                  statusBaseStyle,
                  nodeStatus === 'connected'
                    ? statusConnectedStyle
                    : statusDisconnectedStyle,
                ]}
              >
                {nodeStatus === 'connected' ? '已连接' : '未连接'}
              </Text>
            </View>
            <View
              style={[
                statusDotBaseStyle,
                nodeStatus === 'connected'
                  ? statusDotConnectedStyle
                  : statusDotDisconnectedStyle,
              ]}
            />
          </View>
        </GlassCard>

        {claimUrl && (
          <GlassCard style={cardStyle} intensity="medium">
            <Text style={labelStyle}>认领链接</Text>
            <View style={urlContainerStyle}>
              <Text style={urlStyle} selectable numberOfLines={1}>
                {claimUrl}
              </Text>
            </View>
            <GlassButton
              title="复制链接"
              onPress={handleCopyUrl}
              variant="secondary"
              size="small"
              style={copyBtnStyle}
            />
          </GlassCard>
        )}

        <View style={actionsStyle}>
          <GlassButton
            title={loading ? '处理中...' : 'Step 1: 注册节点'}
            onPress={handleRegisterNode}
            disabled={loading || nodeStatus === 'connected'}
            variant={nodeStatus === 'connected' ? 'secondary' : 'primary'}
            size="large"
            fullWidth
            icon={
              loading ? (
                <ActivityIndicator size="small" color={colors.text.inverse} />
              ) : undefined
            }
          />

          <GlassButton
            title={loading ? '处理中...' : 'Step 2: 获取 Gene + Capsule'}
            onPress={handleFetchAssets}
            disabled={loading || nodeStatus !== 'connected'}
            variant="gradient"
            size="large"
            fullWidth
          />

          <GlassButton
            title="Step 3: 同步资产"
            onPress={handleFetchAssets}
            disabled={loading}
            variant="ghost"
            size="large"
            fullWidth
          />
        </View>

        {assets.length > 0 && (
          <View style={assetsSectionStyle}>
            <Text style={sectionTitleStyle}>我的资产</Text>
            {assets.map((asset, index) => (
              <Animated.View
                key={asset.id}
                entering={FadeInUp.duration(animation.duration.normal).delay(index * 100)}
              >
                <GlassCard
                  style={assetCardStyle}
                  intensity="light"
                >
                  <View style={assetHeaderStyle}>
                    <View style={assetTypeBadgeStyle}>
                      <Text style={assetTypeStyle}>{asset.asset_type}</Text>
                    </View>
                    <View style={scoreBadgeStyle}>
                      <Text style={assetScoreStyle}>GDI {asset.gdi_score}</Text>
                    </View>
                  </View>
                  <Text style={assetSummaryStyle}>{asset.summary}</Text>
                </GlassCard>
              </Animated.View>
            ))}
          </View>
        )}

        {loading && assets.length === 0 && (
          <View style={skeletonContainerStyle}>
            <Skeleton width="100%" height={100} borderRadius={BorderRadius.lg} />
            <Skeleton
              width="100%"
              height={100}
              borderRadius={BorderRadius.lg}
              style={{ marginTop: spacing.md }}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}
