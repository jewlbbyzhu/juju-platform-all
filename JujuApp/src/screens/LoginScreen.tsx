/**
 * 聚聚 (JUJU) App - 登录页面
 * 2026 设计系统重构版
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  SharedValue,
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useTheme,
  colors,
  gradients,
  spacing,
  animation,
  BorderRadius,
  typography,
  textStyles,
  Shadows,
} from '../theme';
import { usePressAnimation } from '../theme';
import { authApi } from '../api';
import {
  PhoneInput,
  VerifyCodeInput,
  AgreementCheckbox,
  SocialLoginButton,
} from '../components/login';

const LOGO_SIZE = 48;
const LOGO_TEXT_SIZE = 22;

const ORB_SIZE_LARGE = spacing['5xl'] * 8;
const ORB_SIZE_MEDIUM = spacing['5xl'] * 7;

// 命名样式对象替代 useMemo
const backgroundOrbsStyle: ViewStyle = {
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
};

const orbBaseStyle: ViewStyle = {
  position: 'absolute',
  opacity: 0.15,
};

const orbTopStyle: ViewStyle = {
  ...orbBaseStyle,
  top: -spacing['5xl'] * 4,
  right: -spacing['4xl'] * 3,
  width: ORB_SIZE_LARGE,
  height: ORB_SIZE_LARGE,
  borderRadius: ORB_SIZE_LARGE / 2,
};

const orbBottomStyle: ViewStyle = {
  ...orbBaseStyle,
  bottom: -spacing['4xl'] * 3,
  left: -spacing['5xl'] * 2,
  width: ORB_SIZE_MEDIUM,
  height: ORB_SIZE_MEDIUM,
  borderRadius: ORB_SIZE_MEDIUM / 2,
};

interface BackgroundOrbsProps {
  primaryColor: string;
  secondaryColor: string;
}

function BackgroundOrbs({
  primaryColor,
  secondaryColor,
}: BackgroundOrbsProps): React.JSX.Element {
  return (
    <View style={backgroundOrbsStyle} pointerEvents="none">
      <LinearGradient
        colors={[primaryColor, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={orbTopStyle}
      />
      <LinearGradient
        colors={[secondaryColor, 'transparent']}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={orbBottomStyle}
      />
    </View>
  );
}

// LogoSection 命名样式
const logoSectionStyle: ViewStyle = {
  alignItems: 'center',
  marginBottom: spacing['3xl'],
};

const logoCircleStyle: ViewStyle = {
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: spacing.md,
  width: LOGO_SIZE,
  height: LOGO_SIZE,
  borderRadius: LOGO_SIZE / 2,
};

const logoTextStyle: TextStyle = {
  fontWeight: typography.weight.bold,
  color: colors.text.inverse,
  fontSize: LOGO_TEXT_SIZE,
};

const logoTextSectionStyle: ViewStyle = {
  alignItems: 'center',
};

const appNameStyle: TextStyle = {
  marginBottom: spacing.xs,
  color: colors.text.primary,
  letterSpacing: 2,
};

const subTitleStyle: TextStyle = {
  marginTop: spacing.xs,
  color: colors.text.secondary,
};

interface LogoSectionProps {
  logoScale: SharedValue<number>;
  logoOpacity: SharedValue<number>;
}

function LogoSection({
  logoScale,
  logoOpacity,
}: LogoSectionProps): React.JSX.Element {
  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(logoOpacity.value, {
      duration: animation.duration.slow,
    }),
  }));

  return (
    <Animated.View
      entering={FadeIn.duration(animation.duration.dramatic).delay(100)}
      style={logoSectionStyle}
    >
      <Animated.View style={logoAnimatedStyle}>
        <LinearGradient
          colors={gradients.primary as unknown as string[]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={logoCircleStyle}
        >
          <Text style={logoTextStyle}>聚</Text>
        </LinearGradient>
      </Animated.View>

      <Animated.View
        style={[
          logoTextSectionStyle,
          textAnimatedStyle,
          { alignItems: 'center' },
        ]}
      >
        <Text style={[textStyles.h1, appNameStyle]}>聚聚</Text>
        <Text style={[textStyles.body2, subTitleStyle]}>
          发现身边的精彩聚会
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

// FormCard 命名样式
const formCardContainerStyle: ViewStyle = {
  marginBottom: spacing.md,
};

const formCardStyle: ViewStyle = {
  backgroundColor: colors.background.card,
  borderRadius: BorderRadius.xl,
  padding: spacing['2xl'],
  ...Shadows.medium,
};

const loginBtnStyle: ViewStyle = {
  marginTop: spacing.sm,
  overflow: 'hidden',
  height: 56,
};

const loginBtnGradientStyle: ViewStyle = {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
};

interface FormCardProps {
  phone: string;
  code: string;
  countdown: number;
  isLoading: boolean;
  agreed: boolean;
  onPhoneChange: (text: string) => void;
  onCodeChange: (text: string) => void;
  onSendCode: () => void;
  onLogin: () => void;
  onAgreementToggle: () => void;
  onWechatLogin: () => void;
}

function FormCard({
  phone,
  code,
  countdown,
  isLoading,
  agreed,
  onPhoneChange,
  onCodeChange,
  onSendCode,
  onLogin,
  onAgreementToggle,
  onWechatLogin,
}: FormCardProps): React.JSX.Element {
  const {
    animatedStyle: loginBtnAnimatedStyle,
    handlePressIn,
    handlePressOut,
  } = usePressAnimation({ scale: 0.97 });

  const loginBtnColors = isLoading
    ? [colors.gray[400], colors.gray[400]]
    : (gradients.primary as unknown as string[]);

  return (
    <Animated.View
      entering={FadeInDown.duration(animation.duration.dramatic)
        .delay(200)
        .springify()
        .damping(15)
        .stiffness(120)}
      style={formCardContainerStyle}
    >
      <View style={formCardStyle}>
        <PhoneInput value={phone} onChangeText={onPhoneChange} />

        <VerifyCodeInput
          value={code}
          onChangeText={onCodeChange}
          countdown={countdown}
          isLoading={isLoading}
          onSendCode={onSendCode}
        />

        <Animated.View style={loginBtnAnimatedStyle}>
          <View
            onTouchStart={handlePressIn}
            onTouchEnd={() => {
              if (!isLoading) onLogin();
              handlePressOut();
            }}
            style={loginBtnStyle}
          >
            <LinearGradient
              colors={loginBtnColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={loginBtnGradientStyle}
            >
              <Text style={[textStyles.button, { color: colors.text.inverse }]}>
                {isLoading ? '登录中...' : '立即登录'}
              </Text>
            </LinearGradient>
          </View>
        </Animated.View>
      </View>

      <ThirdPartySection />

      <Animated.View
        entering={FadeInUp.duration(animation.duration.normal).delay(400)}
      >
        <SocialLoginButton onPress={onWechatLogin} />
      </Animated.View>

      <Animated.View
        entering={FadeInUp.duration(animation.duration.normal).delay(500)}
      >
        <AgreementCheckbox agreed={agreed} onToggle={onAgreementToggle} />
      </Animated.View>
    </Animated.View>
  );
}

// ThirdPartySection 命名样式
const thirdPartySectionStyle: ViewStyle = {
  marginTop: spacing['3xl'],
  marginBottom: spacing.md,
  paddingHorizontal: spacing.md,
  flexDirection: 'row',
  alignItems: 'center',
};

const dividerLineStyle: ViewStyle = {
  backgroundColor: colors.border,
  flex: 1,
  height: 1,
};

const dividerTextStyle: TextStyle = {
  fontSize: typography.size.caption,
  fontWeight: typography.weight.medium,
  color: colors.text.tertiary,
  marginHorizontal: spacing.md,
};

function ThirdPartySection(): React.JSX.Element {
  return (
    <Animated.View
      entering={FadeInUp.duration(animation.duration.slow).delay(300)}
      style={thirdPartySectionStyle}
    >
      <View style={dividerLineStyle} />
      <Text style={dividerTextStyle}>其他登录方式</Text>
      <View style={dividerLineStyle} />
    </Animated.View>
  );
}

// LoginScreenContent 命名样式
const scrollContentStyle: ViewStyle = {
  flexGrow: 1,
  paddingHorizontal: spacing.lg,
  paddingTop: spacing['4xl'],
  paddingBottom: spacing.xl,
};

interface LoginScreenContentProps {
  phone: string;
  code: string;
  countdown: number;
  isLoading: boolean;
  agreed: boolean;
  onPhoneChange: (text: string) => void;
  onCodeChange: (text: string) => void;
  onSendCode: () => void;
  onLogin: () => void;
  onAgreementToggle: () => void;
  onWechatLogin: () => void;
}

function LoginScreenContent({
  phone,
  code,
  countdown,
  isLoading,
  agreed,
  onPhoneChange,
  onCodeChange,
  onSendCode,
  onLogin,
  onAgreementToggle,
  onWechatLogin,
}: LoginScreenContentProps): React.JSX.Element {
  const logoScale = useSharedValue(0.8);
  const logoOpacity = useSharedValue(0);

  useEffect(() => {
    logoScale.value = withDelay(100, withSpring(1, animation.spring.soft));
    logoOpacity.value = withDelay(
      100,
      withTiming(1, { duration: animation.duration.dramatic }),
    );
  }, [logoScale, logoOpacity]);

  return (
    <>
      <BackgroundOrbs
        primaryColor={colors.primary.light}
        secondaryColor={colors.secondary.main}
      />

      <ScrollView
        contentContainerStyle={scrollContentStyle}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <LogoSection logoScale={logoScale} logoOpacity={logoOpacity} />

        <FormCard
          phone={phone}
          code={code}
          countdown={countdown}
          isLoading={isLoading}
          agreed={agreed}
          onPhoneChange={onPhoneChange}
          onCodeChange={onCodeChange}
          onSendCode={onSendCode}
          onLogin={onLogin}
          onAgreementToggle={onAgreementToggle}
          onWechatLogin={onWechatLogin}
        />
      </ScrollView>
    </>
  );
}

// LoginScreen 命名样式
const safeAreaStyle: ViewStyle = {
  flex: 1,
  backgroundColor: colors.background.primary,
};

const containerStyle: ViewStyle = {
  flex: 1,
};

export default function LoginScreen(): React.JSX.Element {
  useTheme();
  const navigation = useNavigation();

  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const sendCode = useCallback(async () => {
    if (!phone || phone.length !== 11) {
      Alert.alert('提示', '请输入正确的手机号');
      return;
    }
    if (isLoading) return;

    try {
      setIsLoading(true);
      const res = await authApi.sendVerifyCode(phone);
      if (res.success) {
        Alert.alert('提示', '验证码已发送');
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown(c => {
            if (c <= 1) clearInterval(timer);
            return c - 1;
          });
        }, 1000);
      } else {
        Alert.alert(
          '提示',
          (res as { message?: string }).message || '发送失败',
        );
      }
    } catch {
      Alert.alert('提示', '网络错误');
    } finally {
      setIsLoading(false);
    }
  }, [phone, isLoading]);

  const handleLogin = useCallback(async () => {
    if (!phone || phone.length !== 11) {
      Alert.alert('提示', '请输入正确的手机号');
      return;
    }
    if (!code || code.length !== 6) {
      Alert.alert('提示', '请输入正确的验证码');
      return;
    }
    if (!agreed) {
      Alert.alert('提示', '请同意用户协议和隐私政策');
      return;
    }
    if (isLoading) return;

    try {
      setIsLoading(true);
      const res = await authApi.phoneLogin(phone, code);
      if (res.success) {
        await AsyncStorage.setItem(
          'token',
          (res as { data: { token: string } }).data.token,
        );
        await AsyncStorage.setItem(
          'userInfo',
          JSON.stringify((res as { data: { userInfo: object } }).data.userInfo),
        );
        // 直接导航，不弹Alert阻塞流程
        (navigation as { replace: (screen: string) => void }).replace('Main');
      } else {
        Alert.alert(
          '提示',
          (res as { message?: string }).message || '登录失败',
        );
      }
    } catch {
      Alert.alert('提示', '网络错误');
    } finally {
      setIsLoading(false);
    }
  }, [phone, code, agreed, isLoading, navigation]);

  const handleWechatLogin = useCallback(() => {
    Alert.alert('提示', '微信登录功能开发中');
  }, []);

  return (
    <SafeAreaView style={safeAreaStyle}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.background.primary}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={containerStyle}
      >
        <LoginScreenContent
          phone={phone}
          code={code}
          countdown={countdown}
          isLoading={isLoading}
          agreed={agreed}
          onPhoneChange={setPhone}
          onCodeChange={setCode}
          onSendCode={sendCode}
          onLogin={handleLogin}
          onAgreementToggle={() => setAgreed(!agreed)}
          onWechatLogin={handleWechatLogin}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
