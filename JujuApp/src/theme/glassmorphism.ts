// JUJU App 玻璃拟态系统 - 2026年重构
// Glassmorphism 2.0 样式工具

import { ViewStyle } from 'react-native';
import { colors } from './colors';

// 玻璃拟态强度
export type GlassIntensity = 'light' | 'medium' | 'heavy';

// 获取玻璃背景色
export const getGlassBackground = (intensity: GlassIntensity = 'medium'): string => {
  switch (intensity) {
    case 'light':
      return 'rgba(30, 41, 59, 0.5)';
    case 'heavy':
      return 'rgba(30, 41, 59, 0.9)';
    case 'medium':
    default:
      return 'rgba(30, 41, 59, 0.7)';
  }
};

// 玻璃拟态基础样式
export const glassmorphism: Record<string, ViewStyle> = {
  // 基础玻璃效果
  base: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  // 卡片玻璃效果
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 8,
  },
  
  // 导航栏玻璃效果
  navbar: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 8,
  },
  
  // 头部玻璃效果
  header: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  // 弹出层玻璃效果
  modal: {
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.04,
    shadowRadius: 30,
    elevation: 20,
  },
  
  // 悬浮按钮玻璃效果
  fab: {
    backgroundColor: 'rgba(99, 102, 241, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 6,
  },
  
  // 输入框玻璃效果
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  // 按钮玻璃效果
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  
  // 标签/胶囊玻璃效果
  chip: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
};

// 发光效果
export const glow: Record<string, ViewStyle> = {
  // 主色发光
  primary: {
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 5,
  },
  // 金色发光 (VIP)
  gold: {
    shadowColor: colors.accent.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 6,
  },
  // 红色发光 (错误/危险)
  error: {
    shadowColor: colors.status.error,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 4,
  },
  // 绿色发光 (成功)
  success: {
    shadowColor: colors.status.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 4,
  },
  // 柔和发光
  soft: {
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.04,
    shadowRadius: 15,
    elevation: 3,
  },
};

// 内发光效果 (用于模拟 border-glow)
export const innerGlow: Record<string, ViewStyle> = {
  primary: {
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.5)',
  },
  gold: {
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.5)',
  },
};

export default glassmorphism;
