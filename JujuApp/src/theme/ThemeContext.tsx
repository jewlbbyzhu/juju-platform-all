// JUJU App Theme Context - 主题系统上下文
// 提供动态主题切换和全局主题访问能力

import React, { createContext, useContext, ReactNode } from 'react';
import {
  theme as defaultTheme,
  typography as defaultTypography,
  textStyles as defaultTextStyles,
} from './index';

// 主题类型定义
export type Theme = typeof defaultTheme;

// Typography类型（包含size, weight, lineHeight, fontFamily, 以及便捷的文本样式）
export type Typography = typeof defaultTypography;

// TextStyles类型
export type TextStyles = typeof defaultTextStyles;

// Context 类型
interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
}

// 创建 Context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Provider Props
interface ThemeProviderProps {
  children: ReactNode;
  theme?: Theme;
}

// Theme Provider 组件
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  theme = defaultTheme,
}) => {
  const [isDark, setIsDark] = React.useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const value: ThemeContextType = {
    theme,
    isDark,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

// useTheme Hook - 返回主题对象本身（包含colors, gradients等）
export const useTheme = (): Theme => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context.theme;
};

// 便捷导出 - 解构使用（使用旧版Context值）
export const useThemeColors = () =>
  useContext(ThemeContext)?.theme?.colors ?? defaultTheme.colors;
export const useThemeSpacing = () =>
  useContext(ThemeContext)?.theme?.spacing ?? defaultTheme.spacing;
export const useThemeTypography = () =>
  useContext(ThemeContext)?.theme?.typography ?? defaultTheme.typography;
export const useThemeShadows = () =>
  useContext(ThemeContext)?.theme?.shadows ?? defaultTheme.shadows;

// Theme 类的静态方法
export const Theme = {
  fromContext: () => {
    try {
      return useTheme();
    } catch {
      return defaultTheme;
    }
  },
};

export default ThemeContext;
