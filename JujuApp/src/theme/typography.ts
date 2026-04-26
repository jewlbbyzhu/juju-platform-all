// ============================================
// 聚聚 (JUJU) 设计系统 2026 - 字体规范
// 字体: DM Sans (Google Fonts)
// ============================================

export const typography = {
  // ========================================
  // 字体大小 (2026现代规范)
  // ========================================
  size: {
    display: 32,        // 大标题 (页面主标题)
    h1: 28,             // 一级标题
    h2: 22,             // 二级标题 (卡片标题)
    h3: 18,             // 三级标题
    h4: 16,             // 四级标题
    body: 16,           // 正文 (加大以提高可读性)
    body2: 14,          // 次要正文
    caption: 12,        // 辅助文字
    small: 10,          // 最小文字
  },
  
  // ========================================
  // 字重
  // ========================================
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  
  // ========================================
  // 行高
  // ========================================
  lineHeight: {
    tight: 1.2,         // 标题
    normal: 1.5,        // 正文
    relaxed: 1.75,      // 宽松排版
  },
  
  // ========================================
  // 字体家族
  // ========================================
  fontFamily: {
    primary: "'DM Sans', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
};

// ========================================
// 预设文本样式
// ========================================
export const textStyles = {
  // 大标题
  display: {
    fontSize: typography.size.display,
    fontWeight: typography.weight.bold,
    lineHeight: typography.size.display * typography.lineHeight.tight,
    letterSpacing: -0.5,
  },
  
  // 一级标题
  h1: {
    fontSize: typography.size.h1,
    fontWeight: typography.weight.bold,
    lineHeight: typography.size.h1 * typography.lineHeight.tight,
    letterSpacing: -0.3,
  },
  
  // 二级标题 (卡片标题)
  h2: {
    fontSize: typography.size.h2,
    fontWeight: typography.weight.semibold,
    lineHeight: typography.size.h2 * typography.lineHeight.normal,
  },
  
  // 三级标题
  h3: {
    fontSize: typography.size.h3,
    fontWeight: typography.weight.semibold,
    lineHeight: typography.size.h3 * typography.lineHeight.normal,
  },
  
  // 正文
  body: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.regular,
    lineHeight: typography.size.body * typography.lineHeight.normal,
  },
  
  // 次要正文
  body2: {
    fontSize: typography.size.body2,
    fontWeight: typography.weight.regular,
    lineHeight: typography.size.body2 * typography.lineHeight.normal,
  },
  
  // 辅助文字
  caption: {
    fontSize: typography.size.caption,
    fontWeight: typography.weight.medium,
    lineHeight: typography.size.caption * typography.lineHeight.normal,
  },
  
  // 按钮文字
  button: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.semibold,
    lineHeight: typography.size.body * typography.lineHeight.tight,
  },
  
  // 标签文字
  label: {
    fontSize: typography.size.caption,
    fontWeight: typography.weight.semibold,
    lineHeight: typography.size.caption * typography.lineHeight.tight,
    letterSpacing: 0.5,
  },
};

export default typography;
