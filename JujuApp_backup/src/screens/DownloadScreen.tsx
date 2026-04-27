import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  Clipboard,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useTheme,
  gradients,
  glassmorphism,
  spacing,
  BorderRadius,
  Shadows,
  typography,
  textStyles,
} from '../theme';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';

// 2026高颜值设计 - 下载页面 (重构版，使用设计系统替代 useMemo 样式)
export default function DownloadScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [downloadUrl] = useState(
    'https://hfparty.asia/download/juju-app-latest.apk',
  );

  const downloadAndroid = () => {
    Clipboard.setString(downloadUrl);
    Alert.alert('下载链接已复制', '请在浏览器中打开链接下载 APK');
  };

  const goToPrivacy = () => {
    (navigation as any).navigate('Webview', {
      url: 'https://hfparty.asia/privacy.html',
    });
  };

  const goToTerms = () => {
    (navigation as any).navigate('Webview', {
      url: 'https://hfparty.asia/terms.html',
    });
  };

  // 命名样式对象替代 useMemo
  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background.secondary,
  };

  const contentContainerStyle: ViewStyle = {
    flexGrow: 1,
  };

  const headerStyle: ViewStyle = {
    paddingVertical: spacing['4xl'],
    paddingHorizontal: spacing['2xl'],
    alignItems: 'center',
    borderBottomLeftRadius: BorderRadius['2xl'],
    borderBottomRightRadius: BorderRadius['2xl'],
    ...glassmorphism.header,
  };

  const logoStyle: ViewStyle = {
    width: 100,
    height: 100,
    backgroundColor: colors.gray[900],
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    ...Shadows.logo,
  };

  const logoTextStyle: TextStyle = {
    fontSize: typography.size.display,
    fontWeight: typography.weight.bold,
    color: colors.primary.main,
  };

  const titleStyle: TextStyle = {
    ...textStyles.display,
    color: colors.text.inverse,
    marginBottom: spacing.md,
    letterSpacing: 1,
  };

  const subtitleStyle: TextStyle = {
    fontSize: typography.size.body2,
    color: colors.text.secondary,
    textAlign: 'center',
    letterSpacing: 0.5,
  };

  const contentStyle: ViewStyle = {
    padding: spacing.lg,
    marginTop: -spacing.lg,
  };

  const platformCardStyle: ViewStyle = {
    marginBottom: spacing.lg,
    padding: spacing.lg,
  };

  const platformHeaderStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  };

  const platformIconBaseStyle: ViewStyle = {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  };

  const androidIconStyle: ViewStyle = {
    backgroundColor: colors.status.success,
  };

  const iosIconStyle: ViewStyle = {
    backgroundColor: colors.status.info,
  };

  const platformIconTextStyle: TextStyle = {
    fontSize: typography.size.h1,
  };

  const platformInfoStyle: ViewStyle = {
    flex: 1,
  };

  const platformNameStyle: TextStyle = {
    ...textStyles.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  };

  const platformDescStyle: TextStyle = {
    fontSize: typography.size.caption,
    color: colors.text.secondary,
  };

  const versionCardStyle: ViewStyle = {
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.sm,
  };

  const badgeStyle: ViewStyle = {
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: BorderRadius.full,
    marginBottom: spacing.lg,
  };

  const badgeTextStyle: TextStyle = {
    color: colors.text.inverse,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.bold,
  };

  const versionTextStyle: TextStyle = {
    ...textStyles.h2,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  };

  const versionDateStyle: TextStyle = {
    fontSize: typography.size.body2,
    color: colors.text.secondary,
  };

  const footerStyle: ViewStyle = {
    padding: spacing.xl,
    alignItems: 'center',
    marginTop: 'auto',
  };

  const footerTextStyle: TextStyle = {
    fontSize: typography.size.caption,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: typography.size.caption * typography.lineHeight.normal,
  };

  const linkStyle: TextStyle = {
    color: colors.primary.main,
    fontWeight: typography.weight.semibold,
  };

  const copyrightStyle: TextStyle = {
    fontSize: typography.size.small,
    color: colors.text.tertiary,
  };

  return (
    <SafeAreaView style={containerStyle} edges={['bottom']}>
      <ScrollView contentContainerStyle={contentContainerStyle}>
        {/* Header with Gradient */}
        <LinearGradient
          colors={gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={headerStyle}
        >
          <View style={logoStyle}>
            <Text style={logoTextStyle}>聚</Text>
          </View>
          <Text style={titleStyle}>聚聚</Text>
          <Text style={subtitleStyle}>发现精彩聚会，结识志同道合的朋友</Text>
        </LinearGradient>

        {/* Download Cards */}
        <View style={contentStyle}>
          {/* Android Download Card */}
          <GlassCard
            style={platformCardStyle}
            intensity="light"
            glow
            glowColor={colors.status.success}
          >
            <View style={platformHeaderStyle}>
              <View style={[platformIconBaseStyle, androidIconStyle]}>
                <Text style={platformIconTextStyle}>🤖</Text>
              </View>
              <View style={platformInfoStyle}>
                <Text style={platformNameStyle}>Android 版</Text>
                <Text style={platformDescStyle}>
                  适用于 Android 8.0 及以上
                </Text>
              </View>
            </View>
            <GlassButton
              title="📥 立即下载 APK"
              onPress={downloadAndroid}
              variant="primary"
              size="large"
              fullWidth
            />
          </GlassCard>

          {/* iOS Coming Soon Card */}
          <GlassCard style={platformCardStyle} intensity="light">
            <View style={platformHeaderStyle}>
              <View style={[platformIconBaseStyle, iosIconStyle]}>
                <Text style={platformIconTextStyle}>🍎</Text>
              </View>
              <View style={platformInfoStyle}>
                <Text style={platformNameStyle}>iOS 版</Text>
                <Text style={platformDescStyle}>适用于 iOS 14.0 及以上</Text>
              </View>
            </View>
            <GlassButton
              title="⏳ 即将上线"
              onPress={() => {}}
              variant="secondary"
              size="large"
              fullWidth
              disabled
            />
          </GlassCard>

          {/* Version Info Card */}
          <GlassCard style={versionCardStyle} intensity="medium">
            <View style={badgeStyle}>
              <Text style={badgeTextStyle}>最新版本</Text>
            </View>
            <Text style={versionTextStyle}>Android v1.0.0</Text>
            <Text style={versionDateStyle}>发布于 2026年2月19日</Text>
          </GlassCard>
        </View>

        {/* Footer */}
        <View style={footerStyle}>
          <Text style={footerTextStyle}>
            下载即表示您同意{' '}
            <Text style={linkStyle} onPress={goToPrivacy}>
              隐私政策
            </Text>{' '}
            和{' '}
            <Text style={linkStyle} onPress={goToTerms}>
              服务条款
            </Text>
          </Text>
          <Text style={copyrightStyle}>
            © 2026 聚聚. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
