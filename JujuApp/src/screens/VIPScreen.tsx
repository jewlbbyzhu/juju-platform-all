/**
 * 聚聚 (JUJU) App - VIP会员页面
 * 2026 设计系统重构版 - 玻璃拟态风格
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  FadeIn,
  FadeInUp,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import {
  useTheme,
  colors,
  gradients,
  vipColors,
  spacing,
  typography,
  animation,
  BorderRadius,
  textStyles,
  glassmorphism,
} from '../theme';
import { GlassButton, GlassCard } from '../components';
import {
  VIPMainCard,
  VIPLevelSelector,
  VIPBenefitGrid,
  VIPPlanDetail,
  VIPPayBar,
} from '../components/vipScreen';

type VIPLevel = {
  level: number;
  name: string;
  price: number;
  duration: string;
  color: string;
  gradient: readonly [string, string];
  benefits: string[];
  popular?: boolean;
  vip?: boolean;
};

type Benefit = {
  icon: string;
  title: string;
  desc: string;
  gradient: readonly [string, string] | readonly [string, string, string?];
};

const VIP_LEVELS: VIPLevel[] = [
  {
    level: 1,
    name: '青铜会员',
    price: 29,
    duration: '月卡',
    color: vipColors.bronze,
    gradient: [vipColors.bronze, vipColors.bronzeEnd] as const,
    benefits: ['每月1张9折券', '优先客服', '生日礼包'],
  },
  {
    level: 2,
    name: '白银会员',
    price: 79,
    duration: '季卡',
    color: vipColors.silver,
    gradient: [vipColors.silver, vipColors.silverEnd] as const,
    benefits: ['每月2张8折券', '专属活动', '优先报名', '会员日特权'],
    popular: true,
  },
  {
    level: 3,
    name: '黄金会员',
    price: 199,
    duration: '年卡',
    color: vipColors.gold,
    gradient: [vipColors.gold, vipColors.goldEnd] as const,
    benefits: ['每月3张7折券', '免费参加1次活动', '专属客服', '线下聚会优先'],
  },
  {
    level: 4,
    name: '钻石会员',
    price: 599,
    duration: '终身',
    color: vipColors.diamond,
    gradient: [vipColors.diamond, vipColors.diamondEnd] as const,
    benefits: ['所有活动5折', '全年无限次免费', '专属社群', '定制活动'],
    vip: true,
  },
];

const ALL_BENEFITS: Benefit[] = [
  {
    icon: '🎫',
    title: '专属折扣',
    desc: '最高5折优惠',
    gradient: gradients.warm,
  },
  {
    icon: '⭐',
    title: '优先报名',
    desc: '热门活动优先',
    gradient: gradients.cool,
  },
  {
    icon: '🎁',
    title: '生日礼包',
    desc: '生日月专属惊喜',
    gradient: gradients.primary,
  },
  {
    icon: '👑',
    title: '专属客服',
    desc: '1对1专属服务',
    gradient: gradients.secondary,
  },
  {
    icon: '🎉',
    title: '会员活动',
    desc: '会员专属聚会',
    gradient: gradients.sunset,
  },
  {
    icon: '💎',
    title: '积分翻倍',
    desc: '消费积分双倍',
    gradient: gradients.vip,
  },
];

// 命名样式对象 - 2026设计系统增强版
const containerStyle = {
  flex: 1,
  backgroundColor: colors.background.primary,
};

// 顶部导航栏 - 玻璃拟态风格
const headerStyle = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  justifyContent: 'space-between' as const,
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
  ...glassmorphism.navbar,
};

// 返回按钮 - 玻璃拟态圆形按钮
const backButtonStyle = {
  width: 44,
  height: 44,
  borderRadius: BorderRadius.full,
  backgroundColor: 'rgba(255, 255, 255, 0.15)',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.2)',
  justifyContent: 'center' as const,
  alignItems: 'center' as const,
};

const backIconStyle = {
  fontSize: typography.size.h4,
  color: colors.text.inverse,
  fontWeight: typography.weight.bold,
};

// 页面标题
const headerTitleStyle = {
  ...textStyles.h3,
  color: colors.text.inverse,
  fontWeight: typography.weight.bold,
  letterSpacing: 0.5,
};

// 帮助按钮
const helpButtonStyle = {
  width: 44,
  height: 44,
  borderRadius: BorderRadius.full,
  backgroundColor: 'rgba(255, 255, 255, 0.15)',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.2)',
  justifyContent: 'center' as const,
  alignItems: 'center' as const,
};

const helpIconStyle = {
  fontSize: typography.size.h4,
  color: colors.text.inverse,
  fontWeight: typography.weight.bold,
};

// 内容区域
const scrollViewStyle = {
  flex: 1,
};

// 区块样式 - 添加顶部圆角和玻璃效果
const sectionStyle = {
  marginBottom: spacing.xl,
};

// 底部安全区
const bottomSpacerStyle = {
  height: 120,
};

export default function VIPScreen(): React.JSX.Element {
  useTheme();
  const navigation = useNavigation();
  const [selectedLevel, setSelectedLevel] = useState<number>(2);
  const [currentLevel] = useState<number>(0);

  const selectedPlan = VIP_LEVELS.find(l => l.level === selectedLevel);

  const handlePay = useCallback((): void => {
    console.log('Pay for plan:', selectedPlan?.name);
  }, [selectedPlan]);

  const handleBack = useCallback((): void => {
    navigation.goBack();
  }, [navigation]);

  return (
    <SafeAreaView style={containerStyle} edges={['top']}>
      {/* 顶部渐变背景 - 2026 VIP风格紫色渐变 */}
      <LinearGradient
        colors={[colors.secondary.main, colors.secondary.dark] as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.vipHeaderGradient}
      >
        <View style={headerStyle}>
          <GlassButton
            title="←"
            onPress={handleBack}
            variant="ghost"
            size="small"
            style={backButtonStyle}
            textStyle={backIconStyle}
          />
          <Text style={headerTitleStyle}>VIP会员</Text>
          <GlassButton
            title="?"
            onPress={() => {}}
            variant="ghost"
            size="small"
            style={helpButtonStyle}
            textStyle={helpIconStyle}
          />
        </View>
      </LinearGradient>

      {/* 内容区域 - 玻璃拟态卡片效果 */}
      <View style={styles.contentWrapper}>
        <View style={styles.contentSheet}>
          <View style={styles.sheetHandle} />
          <ScrollView
            style={scrollViewStyle}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <Animated.View
              entering={FadeInDown.duration(animation.duration.normal).delay(100)}
            >
              <VIPMainCard
                currentLevel={currentLevel}
                selectedPlan={selectedPlan}
                vipGradient={gradients.vip}
              />
            </Animated.View>

            <View style={sectionStyle}>
              <Animated.View
                entering={FadeInUp.duration(animation.duration.normal).delay(200)}
              >
                <VIPLevelSelector
                  levels={VIP_LEVELS}
                  selectedLevel={selectedLevel}
                  onSelectLevel={setSelectedLevel}
                />
              </Animated.View>
            </View>

            <View style={sectionStyle}>
              <Animated.View
                entering={FadeInUp.duration(animation.duration.normal).delay(300)}
              >
                <VIPBenefitGrid benefits={ALL_BENEFITS} />
              </Animated.View>
            </View>

            <Animated.View
              entering={FadeInUp.duration(animation.duration.normal).delay(400)}
            >
              <VIPPlanDetail selectedPlan={selectedPlan} />
            </Animated.View>

            <View style={bottomSpacerStyle} />
          </ScrollView>
        </View>
      </View>

      <VIPPayBar
        selectedPlan={selectedPlan}
        currentLevel={currentLevel}
        onPay={handlePay}
      />
    </SafeAreaView>
  );
}

// 2026设计系统增强样式 - 玻璃拟态+VIP渐变
const styles = StyleSheet.create({
  // 顶部渐变背景
  vipHeaderBg: {
    backgroundColor: colors.secondary.main,
  },
  vipHeaderGradient: {
    backgroundColor: colors.secondary.main,
  },
  // 内容区域
  scrollContent: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
});
