/**
 * JUJU App 阴影系统
 * 统一的阴影和 elevation 规范
 */

import { ViewStyle } from 'react-native';

// 阴影层级
export const Shadows = {
  // 无阴影
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  } as ViewStyle,

  // 小阴影（卡片、按钮）
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 2,
  } as ViewStyle,

  // 中等阴影（悬浮卡片）
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  } as ViewStyle,

  // 大阴影（模态框、抽屉）
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  } as ViewStyle,

  // 特大阴影（底部导航栏）
  xlarge: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 8,
  } as ViewStyle,

  // 主按钮阴影（聚聚红）
  primary: {
    shadowColor: '#FF4D6D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  } as ViewStyle,

  // Logo 阴影
  logo: {
    shadowColor: '#FF4D6D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  } as ViewStyle,
} as const;

// 圆角系统
export const BorderRadius = {
  none: 0,
  xs: 4, // badge、小标签
  sm: 8, // 按钮、输入框
  md: 12, // 卡片、列表项
  lg: 16, // 大卡片、弹窗
  xl: 20, // 大按钮、特殊卡片
  '2xl': 24, // 超大圆角
  full: 9999, // 圆形
} as const;

// 边框
export const Border = {
  width: {
    thin: 0.5,
    normal: 1,
    thick: 2,
  },
  color: {
    light: 'rgba(255,255,255,0.1)',
    medium: 'rgba(255,255,255,0.2)',
    dark: 'rgba(0,0,0,0.1)',
  },
} as const;

export default Shadows;
