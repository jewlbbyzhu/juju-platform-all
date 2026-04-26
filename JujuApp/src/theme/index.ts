// JUJU App 主题系统统一导出 - 2026年重构版
export { colors, gradients, vipColors } from './colors';
export { spacing, layout } from './spacing';
export { typography, textStyles } from './typography';
export { Shadows, Shadows as shadows, BorderRadius, Border } from './shadows';
export { animation } from './animation';
export {
  glassmorphism,
  glow,
  innerGlow,
  getGlassBackground,
} from './glassmorphism';
export {
  useEntranceAnimation,
  usePressAnimation,
  useListItemAnimation,
  useNumberAnimation,
  useScreenEnterAnimation,
  EnteringAnimation,
} from './hooks';
export {
  useTheme,
  useThemeColors,
  useThemeSpacing,
  useThemeTypography,
  useThemeShadows,
  ThemeProvider,
  type Theme,
  type Typography,
} from './ThemeContext';

// 合并主题对象
import { colors, gradients, vipColors } from './colors';
import { spacing, layout } from './spacing';
import { typography, textStyles } from './typography';
import { Shadows as shadows, BorderRadius, Border } from './shadows';
import { animation } from './animation';
import { glassmorphism, glow, innerGlow } from './glassmorphism';

export const theme = {
  colors,
  gradients,
  vipColors,
  spacing,
  layout,
  typography,
  textStyles,
  shadows,
  BorderRadius,
  Border,
  animation,
  glassmorphism,
  glow,
  innerGlow,
};

export default theme;
