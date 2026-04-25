# JUJU App UI 2026年重构方案

## 📊 当前UI现状分析

### 1. 设计系统现状

#### 现有主题系统 (`src/theme/`)
- ✅ **已建立统一的颜色系统**：主色调 `#667eea` + `#764ba2` 渐变，辅助色 `#FF6B6B`
- ✅ **暗色主题支持**：背景色 `#000000`, `#0a0a0a`, `#1a1a1a`, `#2a2a2a` 层级
- ✅ **字体系统**：Display 32px ~ Small 10px 的层级
- ✅ **间距系统**：4px 基值的 xs 到 5xl
- ✅ **阴影系统**：small/medium/large/xlarge 四级阴影
- ✅ **圆角系统**：xs(4) 到 full(9999)

#### 当前问题
1. **组件不一致**：Card 组件使用白色背景，但主题定义暗色背景
2. **硬编码颜色**：各页面样式中存在大量硬编码颜色值
3. **缺少动效**：几乎没有微交互动效
4. **组件库简单**：只有基础的 Button/Card/Input/Loading/EmptyState

### 2. 页面设计现状

| 页面 | 现状 | 问题 |
|------|------|------|
| **HomeScreen** | 暗色头部 + 白色内容区 | 视觉断层，缺少沉浸感 |
| **ProfileScreen** | 渐变头部 + 暗色内容 | 设计较好，但缺少高级感 |
| **VIPCenterScreen** | 暗色主题 + 紫色强调 | 较为完整，可加强视觉层次 |
| **MyOrdersScreen** | 白色卡片在灰色背景 | 与整体暗色主题不统一 |
| **MyTicketsScreen** | 票券卡片设计较好 | 二维码区域可优化 |
| **LoginScreen** | 紫色渐变背景 | 简洁但缺少2026年设计感 |

### 3. 技术栈
- React Native 0.84.1
- React Navigation v7
- 无第三方UI库（完全自定义）
- 无动画库

---

## 🎨 2026年设计趋势

### 1. 玻璃拟态 (Glassmorphism) 2.0
- 更精细的模糊效果 (backdrop-filter)
- 半透明层级叠加
- 细腻边框光泽

### 2. 液态渐变 (Liquid Gradients)
- 流动感渐变动画
- 网格渐变 (Mesh Gradients)
- 极光效果 (Aurora UI)

### 3. 新拟态 (Neumorphism) 精选应用
- 仅在特定场景使用（如按钮、开关）
- 结合暗色主题的 Soft UI

### 4. 微交互动效
- 按钮弹性反馈 (Spring Animation)
- 页面转场平滑过渡
- 列表项进入动画
- 骨架屏加载效果

### 5. 3D 元素与深度
- 卡片悬浮效果
- 透视变换
- 层级阴影系统

### 6. AI 驱动的个性化
- 动态主题色
- 智能布局适配

---

## 🚀 重构方案

### Phase 1: 设计系统升级 (基础)

#### 1.1 更新颜色系统
```typescript
// src/theme/colors.ts
export const colors = {
  // 主色调 - 2026年更鲜艳的渐变
  primary: {
    main: '#6366f1',      // Indigo 500
    light: '#818cf8',     // Indigo 400
    dark: '#4f46e5',      // Indigo 600
    gradient: ['#6366f1', '#a855f7', '#ec4899'] as const, // 彩虹渐变
    aurora: ['#0ea5e9', '#6366f1', '#a855f7', '#ec4899'] as const,
  },
  
  // 玻璃拟态色彩
  glass: {
    light: 'rgba(255, 255, 255, 0.1)',
    medium: 'rgba(255, 255, 255, 0.15)',
    heavy: 'rgba(255, 255, 255, 0.25)',
    border: 'rgba(255, 255, 255, 0.2)',
    borderStrong: 'rgba(255, 255, 255, 0.3)',
  },
  
  // 暗色背景层级 - 增加深度感
  background: {
    primary: '#030712',      // Gray 950 - 更深
    secondary: '#0f172a',    // Slate 900
    tertiary: '#1e293b',     // Slate 800
    card: '#1e293b',         // 玻璃卡片背景
    elevated: '#334155',     // Slate 700
    overlay: 'rgba(0, 0, 0, 0.8)',
  },
  
  // 功能色 - 2026年更柔和
  accent: {
    gold: '#fbbf24',         // Amber 400
    orange: '#fb923c',       // Orange 400
    vip: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
    success: '#34d399',      // Emerald 400
    warning: '#fbbf24',      // Amber 400
    error: '#f87171',        // Red 400
    info: '#60a5fa',         // Blue 400
  },
  
  // 文字色 - 增加层级
  text: {
    primary: '#f8fafc',      // Slate 50
    secondary: '#cbd5e1',    // Slate 300
    tertiary: '#64748b',     // Slate 500
    disabled: '#475569',     // Slate 600
    inverse: '#0f172a',      // Slate 900
  },
};
```

#### 1.2 添加动画配置
```typescript
// src/theme/animation.ts
import { Easing } from 'react-native';

export const animation = {
  // 弹性动画
  spring: {
    gentle: { tension: 120, friction: 14 },
    bouncy: { tension: 300, friction: 10 },
    stiff: { tension: 400, friction: 30 },
  },
  
  // 缓动函数
  easing: {
    easeOut: Easing.ease,
    easeInOut: Easing.inOut(Easing.ease),
    elastic: Easing.elastic(1),
    bounce: Easing.bounce,
    smooth: Easing.bezier(0.4, 0, 0.2, 1),
  },
  
  // 时长规范
  duration: {
    instant: 100,
    fast: 200,
    normal: 300,
    slow: 500,
    dramatic: 800,
  },
  
  // 预设动画
  presets: {
    fadeIn: { opacity: { from: 0, to: 1 }, duration: 300 },
    slideUp: { translateY: { from: 20, to: 0 }, opacity: { from: 0, to: 1 }, duration: 400 },
    scaleIn: { scale: { from: 0.9, to: 1 }, opacity: { from: 0, to: 1 }, duration: 300 },
    shimmer: { duration: 1500, loop: true },
  },
};
```

#### 1.3 玻璃拟态样式工具
```typescript
// src/theme/glassmorphism.ts
import { ViewStyle } from 'react-native';
import { colors } from './colors';

export const glassmorphism: Record<string, ViewStyle> = {
  // 基础玻璃效果
  base: {
    backgroundColor: colors.glass.light,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  
  // 卡片玻璃效果
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  
  // 导航栏玻璃效果
  navbar: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  // 弹出层玻璃效果
  modal: {
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  
  // 悬浮按钮玻璃效果
  fab: {
    backgroundColor: 'rgba(99, 102, 241, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
};
```

---

### Phase 2: 组件库重构 (核心)

#### 2.1 玻璃拟态按钮
```typescript
// src/components/GlassButton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, Animated } from 'react-native';
import { colors } from '../theme/colors';
import { glassmorphism } from '../theme/glassmorphism';
import { animation } from '../theme/animation';

interface GlassButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'gradient';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      ...animation.spring.gentle,
      useNativeDriver: true,
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      ...animation.spring.gentle,
      useNativeDriver: true,
    }).start();
  };

  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primary;
      case 'secondary':
        return styles.secondary;
      case 'ghost':
        return styles.ghost;
      case 'gradient':
        return styles.gradient;
      default:
        return styles.primary;
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[
          styles.button,
          getVariantStyle(),
          size === 'small' && styles.small,
          size === 'large' && styles.large,
          (disabled || loading) && styles.disabled,
          style,
        ]}
      >
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text style={[styles.text, textStyle]}>{title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
    ...glassmorphism.fab,
  },
  primary: {
    backgroundColor: colors.primary.main,
  },
  secondary: {
    backgroundColor: colors.glass.medium,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.glass.borderStrong,
  },
  gradient: {
    // 使用渐变背景
    backgroundColor: colors.primary.main,
  },
  small: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  large: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 20,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  iconContainer: {
    marginRight: 8,
  },
});
```

#### 2.2 玻璃拟态卡片
```typescript
// src/components/GlassCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { glassmorphism } from '../theme/glassmorphism';
import { colors } from '../theme/colors';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  useSharedValue,
  interpolate,
} from 'react-native-reanimated';

interface GlassCardProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  glowColor?: string;
  intensity?: 'light' | 'medium' | 'heavy';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  title,
  subtitle,
  children,
  onPress,
  style,
  titleStyle,
  subtitleStyle,
  glowColor = colors.primary.main,
  intensity = 'medium',
}) => {
  const pressed = useSharedValue(0);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(pressed.value, [0, 1], [1, 0.98]) },
    ],
    shadowOpacity: interpolate(pressed.value, [0, 1], [0.4, 0.2]),
  }));

  const getIntensityStyle = () => {
    switch (intensity) {
      case 'light':
        return { backgroundColor: 'rgba(30, 41, 59, 0.5)' };
      case 'heavy':
        return { backgroundColor: 'rgba(30, 41, 59, 0.9)' };
      default:
        return { backgroundColor: 'rgba(30, 41, 59, 0.7)' };
    }
  };

  const CardWrapper = onPress ? TouchableOpacity : View;

  return (
    <Animated.View style={[animatedStyle, styles.animatedContainer]}>
      <CardWrapper
        style={[
          styles.container,
          glassmorphism.card,
          getIntensityStyle(),
          style,
        ]}
        onPress={onPress}
        onPressIn={() => (pressed.value = withSpring(1))}
        onPressOut={() => (pressed.value = withSpring(0))}
        activeOpacity={0.9}
      >
        {(title || subtitle) && (
          <View style={styles.header}>
            <View>
              {title && <Text style={[styles.title, titleStyle]}>{title}</Text>}
              {subtitle && <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text>}
            </View>
          </View>
        )}
        <View style={styles.content}>{children}</View>
      </CardWrapper>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  animatedContainer: {
    width: '100%',
  },
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    marginVertical: 8,
  },
  header: {
    padding: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 4,
  },
  content: {
    padding: 20,
    paddingTop: 0,
  },
});
```

#### 2.3 骨架屏组件
```typescript
// src/components/Skeleton.tsx
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  useSharedValue,
} from 'react-native-reanimated';
import { colors } from '../theme/colors';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}) => {
  const progress = useSharedValue(0);
  
  React.useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0.3, 0.7]),
  }));

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, borderRadius },
        animatedStyle,
        style,
      ]}
    />
  );
};

export const SkeletonCard: React.FC = () => (
  <View style={styles.card}>
    <Skeleton width="100%" height={180} borderRadius={12} />
    <View style={styles.cardContent}>
      <Skeleton width="70%" height={20} />
      <Skeleton width="40%" height={14} style={{ marginTop: 8 }} />
      <View style={styles.cardFooter}>
        <Skeleton width="30%" height={18} />
        <Skeleton width="20%" height={14} />
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.background.elevated,
  },
  card: {
    backgroundColor: colors.background.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardContent: {
    marginTop: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
});
```

#### 2.4 渐变背景组件
```typescript
// src/components/GradientBackground.tsx
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { colors } from '../theme/colors';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  useSharedValue,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export const AuroraBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const progress = useSharedValue(0);
  
  React.useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 10000 }),
      -1,
      true
    );
  }, []);

  const animatedStyle1 = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(progress.value, [0, 1], [0, 50]) },
      { translateY: interpolate(progress.value, [0, 1], [0, 30]) },
    ],
  }));

  const animatedStyle2 = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(progress.value, [0, 1], [0, -40]) },
      { translateY: interpolate(progress.value, [0, 1], [0, -20]) },
    ],
  }));

  return (
    <View style={styles.container}>
      {/* 基础暗色背景 */}
      <View style={styles.baseBackground} />
      
      {/* 极光渐变层 */}
      <Animated.View style={[styles.auroraBlob, styles.blob1, animatedStyle1]} />
      <Animated.View style={[styles.auroraBlob, styles.blob2, animatedStyle2]} />
      
      {/* 内容 */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  baseBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background.primary,
  },
  auroraBlob: {
    position: 'absolute',
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width * 0.6,
    opacity: 0.15,
    blur: 100,
  },
  blob1: {
    backgroundColor: colors.primary.main,
    top: -height * 0.2,
    left: -width * 0.2,
  },
  blob2: {
    backgroundColor: '#ec4899',
    bottom: -height * 0.1,
    right: -width * 0.3,
  },
  content: {
    flex: 1,
  },
});
```

---

### Phase 3: 页面级重构

#### 3.1 首页重构 (HomeScreen)
```typescript
// src/screens/HomeScreen.v2.tsx (重构后示例)
// 主要改进：
// 1. 全屏沉浸式设计
// 2. 玻璃拟态头部
// 3. 卡片悬浮效果
// 4. 分类标签动效

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  // 玻璃拟态头部
  glassHeader: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderBottomWidth: 1,
    borderBottomColor: colors.glass.border,
    backdropFilter: 'blur(20px)',
  },
  // 聚会卡片 - 悬浮效果
  partyCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.glass.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 12,
    overflow: 'hidden',
  },
  // 分类标签 - 胶囊形状
  categoryPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: colors.glass.light,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  categoryPillActive: {
    backgroundColor: colors.primary.main,
    borderColor: 'transparent',
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
});
```

#### 3.2 个人中心重构 (ProfileScreen)
```typescript
// 主要改进：
// 1. 3D 头像效果
// 2. 统计卡片玻璃拟态
// 3. 菜单项悬浮动效
// 4. VIP 标识发光效果

const styles = StyleSheet.create({
  // 3D 头像容器
  avatarContainer3D: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.background.card,
    padding: 3,
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  // VIP 发光徽章
  vipBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: colors.accent.gold,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    shadowColor: colors.accent.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
  },
  // 玻璃菜单项
  menuItemGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.glass.light,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
});
```

---

### Phase 4: 依赖安装

```bash
# 动画库
npm install react-native-reanimated react-native-gesture-handler

# 渐变支持
npm install react-native-linear-gradient

# 图标库（使用更现代的图标）
npm install react-native-svg
npm install react-native-heroicons

# 模糊效果 (iOS/Android)
npm install @react-native-community/blur

# 骨架屏
npm install react-native-skeleton-placeholder
```

---

### Phase 5: 新组件清单

| 组件名 | 用途 | 复杂度 |
|--------|------|--------|
| `GlassButton` | 玻璃拟态按钮 | ⭐⭐ |
| `GlassCard` | 玻璃拟态卡片 | ⭐⭐ |
| `GradientCard` | 渐变背景卡片 | ⭐⭐ |
| `AuroraBackground` | 极光动态背景 | ⭐⭐⭐ |
| `Skeleton` | 骨架屏加载 | ⭐⭐ |
| `AnimatedList` | 带动画的列表 | ⭐⭐⭐ |
| `FloatingActionButton` | 悬浮操作按钮 | ⭐⭐ |
| `GlassInput` | 玻璃拟态输入框 | ⭐⭐ |
| `Chip` | 标签/胶囊组件 | ⭐ |
| `Badge` | 徽标组件 | ⭐ |
| `ProgressBar` | 进度条（发光） | ⭐⭐ |
| `Avatar` | 3D头像组件 | ⭐⭐ |

---

## 📋 重构优先级

### P0 - 立即执行 (基础)
1. ✅ 更新颜色系统 (`colors.ts`)
2. ✅ 添加动画配置 (`animation.ts`)
3. ✅ 添加玻璃拟态工具 (`glassmorphism.ts`)
4. ✅ 安装必要依赖

### P1 - 高优先级 (核心组件)
1. `GlassButton` - 替换所有按钮
2. `GlassCard` - 替换所有卡片
3. `Skeleton` - 添加加载体验
4. `AuroraBackground` - 首页背景

### P2 - 中优先级 (页面重构)
1. `HomeScreen` - 首页沉浸式设计
2. `ProfileScreen` - 个人中心3D效果
3. `VIPCenterScreen` - VIP页面升级
4. `MyOrdersScreen` - 订单页面统一

### P3 - 低优先级 (优化)
1. 列表进入动画
2. 转场动画
3. 微交互细节
4. 性能优化

---

## 🎯 设计参考

### 玻璃拟态最佳实践
```
✅ 背景模糊: backdrop-filter: blur(20px)
✅ 半透明背景: rgba(255, 255, 255, 0.1)
✅ 细腻边框: 1px solid rgba(255, 255, 255, 0.2)
✅ 层级阴影: 多层阴影创造深度
```

### 2026年配色参考
- **主色**: Indigo (#6366f1) + Purple (#a855f7) + Pink (#ec4899)
- **背景**: Deep Slate (#030712)
- **强调**: 霓虹青 (#06b6d4) + 霓虹粉 (#ec4899)

### 动效参考
- **弹性**: Spring animation with damping 15
- **时长**: 快速 200ms, 标准 300ms, 缓慢 500ms
- **缓动**: Cubic-bezier(0.4, 0, 0.2, 1)

---

## 📁 创建的文件结构

```
src/
├── theme/
│   ├── colors.ts          # ✅ 更新
│   ├── animation.ts       # 🆕 新增
│   ├── glassmorphism.ts   # 🆕 新增
│   ├── spacing.ts         # ✅ 保持
│   ├── typography.ts      # ✅ 保持
│   └── index.ts           # ✅ 更新
├── components/
│   ├── Button.tsx         # ✅ 保持（旧版兼容）
│   ├── GlassButton.tsx    # 🆕 新增
│   ├── Card.tsx           # ✅ 保持（旧版兼容）
│   ├── GlassCard.tsx      # 🆕 新增
│   ├── Input.tsx          # ✅ 保持
│   ├── GlassInput.tsx     # 🆕 新增
│   ├── Skeleton.tsx       # 🆕 新增
│   ├── Loading.tsx        # ✅ 保持
│   ├── EmptyState.tsx     # ✅ 保持
│   ├── GradientBackground.tsx # 🆕 新增
│   └── index.ts           # ✅ 更新
└── screens/
    ├── HomeScreen.tsx         # 📝 重构
    ├── ProfileScreen.tsx      # 📝 重构
    ├── VIPCenterScreen.tsx    # 📝 重构
    └── ...
```

---

## ✅ 验收标准

1. **视觉统一性**: 所有页面使用一致的设计语言
2. **动效流畅性**: 60fps 动画性能
3. **暗色主题**: 完整的暗色模式支持
4. **玻璃拟态**: 核心组件应用玻璃效果
5. **可访问性**: 足够的对比度和触摸目标
6. **性能**: 无掉帧，启动时间 < 3s

---

## 📝 总结

本重构方案将 JUJU App 从现有的基础暗色主题升级为 **2026年现代设计语言**：

- **玻璃拟态**创造层次感和高级感
- **极光渐变**背景增加视觉吸引力
- **微交互动效**提升用户体验
- **统一设计系统**确保一致性

预计重构周期：**3-4周**（按优先级分阶段实施）
