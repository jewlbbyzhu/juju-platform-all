// JUJU App 动画系统 - 2026年重构
// 统一的动画配置和预设

export const animation = {
  // 弹性动画配置
  spring: {
    // 温和弹性 - 用于按钮、卡片
    gentle: { damping: 15, stiffness: 150, mass: 1 },
    // 弹跳弹性 - 用于弹出层、提示
    bouncy: { damping: 10, stiffness: 400, mass: 1 },
    // 硬朗弹性 - 用于开关、滑块
    stiff: { damping: 20, stiffness: 500, mass: 1 },
    // 柔和弹性 - 用于大型元素
    soft: { damping: 25, stiffness: 120, mass: 1 },
  },
  
  // 时长规范 (毫秒)
  duration: {
    instant: 100,    // 瞬间
    fast: 200,       // 快速
    normal: 300,     // 标准
    slow: 500,       // 缓慢
    dramatic: 800,   // 戏剧性
  },
  
  // 预设动画配置
  presets: {
    // 淡入
    fadeIn: {
      from: { opacity: 0 },
      to: { opacity: 1 },
      duration: 300,
    },
    // 向上滑入
    slideUp: {
      from: { opacity: 0, translateY: 20 },
      to: { opacity: 1, translateY: 0 },
      duration: 400,
    },
    // 向下滑入
    slideDown: {
      from: { opacity: 0, translateY: -20 },
      to: { opacity: 1, translateY: 0 },
      duration: 400,
    },
    // 向左滑入
    slideLeft: {
      from: { opacity: 0, translateX: 20 },
      to: { opacity: 1, translateX: 0 },
      duration: 400,
    },
    // 向右滑入
    slideRight: {
      from: { opacity: 0, translateX: -20 },
      to: { opacity: 1, translateX: 0 },
      duration: 400,
    },
    // 缩放进入
    scaleIn: {
      from: { opacity: 0, scale: 0.9 },
      to: { opacity: 1, scale: 1 },
      duration: 300,
    },
    // 缩放弹出
    scalePop: {
      from: { opacity: 0, scale: 0.5 },
      to: { opacity: 1, scale: 1 },
      duration: 400,
    },
    // 列表项进入 (带延迟)
    listItem: (index: number) => ({
      from: { opacity: 0, translateY: 20 },
      to: { opacity: 1, translateY: 0 },
      duration: 400,
      delay: index * 50,
    }),
  },
  
  // 连续动画 (用于骨架屏、加载)
  loop: {
    shimmer: {
      duration: 1500,
      loop: true,
    },
    pulse: {
      duration: 2000,
      loop: true,
    },
    bounce: {
      duration: 1000,
      loop: true,
    },
  },
};

export default animation;
