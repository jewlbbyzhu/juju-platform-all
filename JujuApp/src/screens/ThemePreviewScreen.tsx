import React from 'react';
import {
  View,
  Text,
  ScrollView,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  useTheme,
  colors,
  gradients,
  glassmorphism,
  spacing,
  typography,
  BorderRadius,
  Border,

  textStyles,
} from '../theme';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';

// 2026 Glassmorphism 主题颜色配置
const themeColors = {
  background: colors.background.secondary,
  surface: colors.background.primary + 'B3',
  surfaceLight: colors.background.primary + '80',
  text: colors.text.primary,
  textSecondary: colors.text.secondary,
  accent: colors.primary.main,
  primary: colors.primary.main,
  primaryLight: colors.primary.light,
  success: colors.status.success,
  warning: colors.status.warning,
  error: colors.status.error,
  border: colors.border,
};

// 2026高颜值设计 - 主题预览页 (重构版，使用设计系统替代 useMemo 样式)
export default function ThemePreviewScreen() {
  const { colors: themeColorsFromHook } = useTheme();

  // 容器样式
  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: themeColorsFromHook.background.secondary,
  };

  // Header 样式
  const headerStyle: ViewStyle = {
    paddingVertical: spacing['3xl'] + spacing.xl,
    paddingHorizontal: spacing['2xl'],
    alignItems: 'center',
    borderBottomLeftRadius: BorderRadius['2xl'],
    borderBottomRightRadius: BorderRadius['2xl'],
  };

  const previewTitleStyle: TextStyle = {
    ...textStyles.display,
    color: colors.text.inverse,
    marginBottom: spacing.sm,
    letterSpacing: 1,
  };

  const previewSubtitleStyle: TextStyle = {
    fontSize: typography.size.body2,
    color: colors.background.primary + 'CC',
  };

  // 内容区域样式
  const previewContentStyle: ViewStyle = {
    padding: spacing.xl,
    paddingBottom: spacing['3xl'],
  };

  const previewSectionStyle: ViewStyle = {
    marginBottom: spacing['2xl'],
  };

  const sectionTitleStyle: TextStyle = {
    ...textStyles.h3,
    color: themeColors.text,
    marginBottom: spacing.lg,
  };

  // 卡片样式
  const previewCardStyle: ViewStyle = {
    padding: spacing.xl,
  };

  const cardHeaderStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  };

  const cardTitleStyle: TextStyle = {
    ...textStyles.h3,
    color: themeColors.text,
  };

  const cardBadgeStyle: ViewStyle = {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primary.main + '26',
    borderRadius: BorderRadius.full,
    borderWidth: Border.width.thin,
    borderColor: colors.primary.main + '4D',
  };

  const cardBadgeTextStyle: TextStyle = {
    fontSize: typography.size.caption,
    color: colors.primary.main,
    fontWeight: typography.weight.semibold,
  };

  const cardBodyStyle: ViewStyle = {
    marginBottom: spacing.lg,
  };

  const cardDescStyle: TextStyle = {
    ...textStyles.body2,
    color: themeColors.textSecondary,
    lineHeight: typography.size.body2 * typography.lineHeight.normal,
  };

  const cardFooterStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const cardPriceStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'baseline',
  };

  const priceLabelStyle: TextStyle = {
    fontSize: typography.size.body,
    color: colors.primary.main,
    marginRight: spacing.xs,
  };

  const priceValueStyle: TextStyle = {
    fontSize: typography.size.h2,
    fontWeight: typography.weight.bold,
    color: colors.primary.main,
  };

  // 按钮组样式
  const buttonGroupStyle: ViewStyle = {
    gap: spacing.md,
  };

  // 标签组样式
  const tagGroupStyle: ViewStyle = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  };

  const previewTagStyle: ViewStyle = {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: themeColors.surface,
    borderRadius: BorderRadius.full,
    borderWidth: Border.width.thin,
    borderColor: colors.border,
    ...glassmorphism.chip,
  };

  const previewTagTextStyle: TextStyle = {
    fontSize: typography.size.body2,
    color: themeColors.text,
  };

  // 状态样式
  const statusGroupStyle: ViewStyle = {
    gap: spacing.md,
  };

  const statusItemBaseStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderLeftWidth: Border.width.thick,
  };

  const statusIconStyle: ViewStyle = {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  };

  const statusIconTextStyle: TextStyle = {
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
    color: colors.text.inverse,
  };

  const statusTextStyle: TextStyle = {
    fontSize: typography.size.body,
    color: themeColors.text,
  };

  // 输入框样式
  const inputCardStyle: ViewStyle = {
    padding: spacing.lg,
  };

  const previewInputStyle: ViewStyle = {
    height: 48,
    backgroundColor: themeColors.surfaceLight,
    borderRadius: BorderRadius.full,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
    borderWidth: Border.width.thin,
    borderColor: colors.border,
  };

  const inputPlaceholderStyle: TextStyle = {
    fontSize: typography.size.body2,
    color: themeColors.textSecondary,
  };

  return (
    <ScrollView style={containerStyle}>
      {/* Header */}
      <LinearGradient
        colors={gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={headerStyle}
      >
        <Text style={previewTitleStyle}>主题预览</Text>
        <Text style={previewSubtitleStyle}>2026高颜值设计系统</Text>
      </LinearGradient>

      <View style={previewContentStyle}>
        {/* 卡片样式 */}
        <View style={previewSectionStyle}>
          <Text style={sectionTitleStyle}>卡片样式</Text>
          <GlassCard
            style={previewCardStyle}
            intensity="light"
            glow
            glowColor={colors.primary.main}
          >
            <View style={cardHeaderStyle}>
              <Text style={cardTitleStyle}>聚会卡片示例</Text>
              <View style={cardBadgeStyle}>
                <Text style={cardBadgeTextStyle}>热门</Text>
              </View>
            </View>
            <View style={cardBodyStyle}>
              <Text style={cardDescStyle}>
                这是一个示例卡片，展示当前主题的卡片样式效果
              </Text>
            </View>
            <View style={cardFooterStyle}>
              <View style={cardPriceStyle}>
                <Text style={priceLabelStyle}>¥</Text>
                <Text style={priceValueStyle}>99</Text>
              </View>
              <GlassButton
                title="立即报名"
                onPress={() => {}}
                variant="primary"
                size="small"
              />
            </View>
          </GlassCard>
        </View>

        {/* 按钮样式 */}
        <View style={previewSectionStyle}>
          <Text style={sectionTitleStyle}>按钮样式</Text>
          <View style={buttonGroupStyle}>
            <GlassButton
              title="主要按钮"
              onPress={() => {}}
              variant="primary"
              fullWidth
            />
            <GlassButton
              title="次要按钮"
              onPress={() => {}}
              variant="secondary"
              fullWidth
            />
            <GlassButton
              title="描边按钮"
              onPress={() => {}}
              variant="ghost"
              fullWidth
            />
          </View>
        </View>

        {/* 标签样式 */}
        <View style={previewSectionStyle}>
          <Text style={sectionTitleStyle}>标签样式</Text>
          <View style={tagGroupStyle}>
            {['派对', '音乐', '运动', '艺术'].map(tag => (
              <View key={tag} style={previewTagStyle}>
                <Text style={previewTagTextStyle}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 状态颜色 */}
        <View style={previewSectionStyle}>
          <Text style={sectionTitleStyle}>状态颜色</Text>
          <View style={statusGroupStyle}>
            <GlassCard
              style={[
                statusItemBaseStyle,
                { borderLeftColor: themeColors.success },
              ]}
              intensity="light"
            >
              <View
                style={[
                  statusIconStyle,
                  { backgroundColor: themeColors.success },
                ]}
              >
                <Text style={statusIconTextStyle}>✓</Text>
              </View>
              <Text style={statusTextStyle}>成功</Text>
            </GlassCard>
            <GlassCard
              style={[
                statusItemBaseStyle,
                { borderLeftColor: themeColors.warning },
              ]}
              intensity="light"
            >
              <View
                style={[
                  statusIconStyle,
                  { backgroundColor: themeColors.warning },
                ]}
              >
                <Text style={statusIconTextStyle}>!</Text>
              </View>
              <Text style={statusTextStyle}>警告</Text>
            </GlassCard>
            <GlassCard
              style={[
                statusItemBaseStyle,
                { borderLeftColor: themeColors.error },
              ]}
              intensity="light"
            >
              <View
                style={[
                  statusIconStyle,
                  { backgroundColor: themeColors.error },
                ]}
              >
                <Text style={statusIconTextStyle}>×</Text>
              </View>
              <Text style={statusTextStyle}>错误</Text>
            </GlassCard>
          </View>
        </View>

        {/* 输入框样式 */}
        <View style={previewSectionStyle}>
          <Text style={sectionTitleStyle}>输入框样式</Text>
          <GlassCard style={inputCardStyle} intensity="light">
            <View style={previewInputStyle}>
              <Text style={inputPlaceholderStyle}>请输入搜索关键词</Text>
            </View>
          </GlassCard>
        </View>
      </View>
    </ScrollView>
  );
}
