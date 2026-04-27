/* global jest */
// Jest setup file for mocking native modules

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

// Mock theme module
jest.mock('./src/theme', () => {
  const mockColors = {
    gray: { 50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5db', 400: '#9ca3af', 500: '#6b7280', 600: '#4b5563', 700: '#374151', 800: '#1f2937', 900: '#111827' },
    primary: { main: '#6366f1', light: '#818cf8', dark: '#4f46e5', contrastText: '#ffffff' },
    secondary: { main: '#ec4899', light: '#f472b6', dark: '#db2777' },
    accent: { cyan: '#06b6d4', purple: '#8b5cf6', orange: '#f97316', pink: '#ec4899' },
    text: { primary: '#111827', secondary: '#6b7280', tertiary: '#9ca3af', inverse: '#ffffff', disabled: '#d1d5db' },
    background: { default: '#ffffff', paper: '#f9fafb', elevated: '#ffffff', card: '#ffffff' },
    border: '#e5e7eb',
    divider: '#e5e7eb',
    error: { main: '#ef4444', light: '#fca5a5', dark: '#dc2626' },
    success: { main: '#22c55e', light: '#86efac', dark: '#16a34a' },
    warning: { main: '#f59e0b', light: '#fcd34d', dark: '#d97706' },
    info: { main: '#3b82f6', light: '#93c5fd', dark: '#2563eb' },
    status: { success: '#22c55e', error: '#ef4444', warning: '#f59e0b' },
    vip: { bronze: '#cd7f32', silver: '#c0c0c0', gold: '#ffd700', platinum: '#e5e4e2' },
  };
  const themeExports = {
    useTheme: () => ({ colors: mockColors, isDark: false, textStyles: { h1: {}, h2: {}, h3: {}, body: {}, body2: {}, caption: {} }, gradients: { primary: ['#6366f1', '#818cf8'], secondary: ['#ec4899', '#f472b6'], dark: ['#1f2937', '#111827'] } }),
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, '2xl': 48, '3xl': 64 },
    typography: { size: { caption: 12, body2: 14, body1: 16, h3: 20, h2: 24, h1: 32 }, weight: { normal: '400', medium: '500', semibold: '600', bold: '700' }, lineHeight: { normal: 1.5, relaxed: 1.75 } },
    glassmorphism: { header: { backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)' } },
    Border: { width: { thin: 1, normal: 2, thick: 3 } },
    BorderRadius: { sm: 4, md: 8, lg: 12, xl: 16, full: 9999 },
    layout: { screenPadding: 16 },
    animation: { duration: { fast: 150, normal: 300, slow: 500 } },
    Shadows: { large: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 } },
    vipColors: { bronze: '#cd7f32', silver: '#c0c0c0', gold: '#ffd700', platinum: '#e5e4e2' },
    glow: { bronze: { shadowColor: '#cd7f32', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10 }, silver: { shadowColor: '#c0c0c0', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10 }, gold: { shadowColor: '#ffd700', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10 }, platinum: { shadowColor: '#e5e4e2', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10 } },
    ThemeProvider: ({ children }) => children,
    usePressAnimation: () => ({ handlePressIn: () => {}, handlePressOut: () => {} }),
    useScreenEnterAnimation: () => ({ animatedStyle: {}, play: () => {} }),
  };
  // 直接导出 colors 供直接导入使用
  themeExports.colors = mockColors;
  themeExports.gradients = {
    primary: ['#6366f1', '#818cf8'],
    secondary: ['#ec4899', '#f472b6'],
    dark: ['#1f2937', '#111827'],
  };
  themeExports.textStyles = { h1: {}, h2: {}, h3: {}, body: {}, body2: {}, caption: {} };
  return themeExports;
});

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return {
    __esModule: true,
    Ionicons: Text,
    AntDesign: Text,
    MaterialIcons: Text,
    MaterialCommunityIcons: Text,
    FontAwesome: Text,
    Entypo: Text,
    EvilIcons: Text,
    Feather: Text,
    Foundation: Text,
    Octicons: Text,
    SimpleLineIcons: Text,
    Zocial: Text,
  };
});

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    LinearGradient: View,
  };
});

// Mock react-native-linear-gradient
jest.mock('react-native-linear-gradient', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: View,
  };
});

// Mock react-native-maps
jest.mock('react-native-maps', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: View,
    Marker: View,
    Circle: View,
    Callout: View,
  };
});

// Mock react-native-worklets
jest.mock('react-native-worklets', () => ({
  Worklets: {
    createRunOnJS: (fn) => fn,
    createRunOnUI: (fn) => fn,
    isOnUIThread: () => false,
    isOnJSThread: () => true,
  },
  default: {
    createRunOnJS: (fn) => fn,
    createRunOnUI: (fn) => fn,
    isOnUIThread: () => false,
    isOnJSThread: () => true,
  },
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { View, Text, ScrollView } = require('react-native');
  
  const AnimatedComponent = React.forwardRef((props, ref) => {
    return React.createElement(View, { ...props, ref });
  });
  
  return {
    __esModule: true,
    default: {
      View: AnimatedComponent,
      Text: AnimatedComponent,
      ScrollView: AnimatedComponent,
      createAnimatedComponent: (component) => {
        return React.forwardRef((props, ref) => {
          return React.createElement(component, { ...props, ref });
        });
      },
    },
    View: AnimatedComponent,
    Text: AnimatedComponent,
    ScrollView: AnimatedComponent,
    Animated: {
      View: AnimatedComponent,
      Text: AnimatedComponent,
      ScrollView: AnimatedComponent,
    },
    useSharedValue: (value) => ({ value }),
    useAnimatedScrollHandler: () => () => {},
    useScreenEnterAnimation: () => ({ animatedStyle: {}, play: () => {} }),
    useAnimatedStyle: () => ({}),
    useAnimatedProps: () => ({}),
    useAnimatedReaction: () => {},
    useDerivedValue: (fn) => ({ value: fn() }),
    useAnimatedGestureHandler: () => ({}),
    createAnimatedComponent: (component) => {
      return React.forwardRef((props, ref) => {
        return React.createElement(component, { ...props, ref });
      });
    },
    interpolate: (value, input, output) => value,
    Extrapolate: { CLAMP: 'clamp' },
    withTiming: (value) => value,
    withSpring: (value) => value,
    withDecay: (value) => value,
    withDelay: (delay, value) => value,
    withSequence: (...values) => values[values.length - 1],
    withRepeat: (value) => value,
    cancelAnimation: () => {},
    runOnJS: (fn) => fn,
    runOnUI: (fn) => fn,
    measure: () => ({ x: 0, y: 0, width: 0, height: 0, pageX: 0, pageY: 0 }),
    Easing: {
      linear: (t) => t,
      ease: (t) => t,
      quad: (t) => t * t,
      cubic: (t) => t * t * t,
    },
    FadeInUp: { duration: () => ({ delay: () => ({ springify: () => ({ damping: () => ({ stiffness: () => ({}) }) }) }) }), delay: () => ({ springify: () => ({ damping: () => ({ stiffness: () => ({}) }) }) }) },
    FadeInDown: { duration: () => ({ delay: () => ({ springify: () => ({ damping: () => ({ stiffness: () => ({}) }) }) }) }), delay: () => ({ springify: () => ({ damping: () => ({ stiffness: () => ({}) }) }) }) },
    FadeIn: { duration: () => ({ delay: () => ({ springify: () => ({ damping: () => ({ stiffness: () => ({}) }) }) }) }), delay: () => ({ springify: () => ({ damping: () => ({ stiffness: () => ({}) }) }) }) },
    FadeOut: { duration: () => ({ delay: () => ({ springify: () => ({ damping: () => ({ stiffness: () => ({}) }) }) }) }), delay: () => ({ springify: () => ({ damping: () => ({ stiffness: () => ({}) }) }) }) },
    SlideInRight: { duration: () => ({ delay: () => ({ springify: () => ({ damping: () => ({ stiffness: () => ({}) }) }) }) }) },
    SlideOutLeft: { duration: () => ({ delay: () => ({ springify: () => ({ damping: () => ({ stiffness: () => ({}) }) }) }) }) },
    BounceIn: { duration: () => ({ delay: () => ({ springify: () => ({ damping: () => ({ stiffness: () => ({}) }) }) }) }) },
    Layout: { duration: () => ({ delay: () => ({ springify: () => ({ damping: () => ({ stiffness: () => ({}) }) }) }) }) },
    EntryExitTransition: { duration: () => ({ delay: () => ({ springify: () => ({ damping: () => ({ stiffness: () => ({}) }) }) }) }) },
    Transition: { duration: () => ({ delay: () => ({ springify: () => ({ damping: () => ({ stiffness: () => ({}) }) }) }) }) },
    CurvedTransition: { duration: () => ({ delay: () => ({ springify: () => ({ damping: () => ({ stiffness: () => ({}) }) }) }) }) },
    JumpingTransition: { duration: () => ({ delay: () => ({ springify: () => ({ damping: () => ({ stiffness: () => ({}) }) }) }) }) },
    SequencedTransition: { duration: () => ({ delay: () => ({ springify: () => ({ damping: () => ({ stiffness: () => ({}) }) }) }) }) },
    LinearTransition: { duration: () => ({ delay: () => ({ springify: () => ({ damping: () => ({ stiffness: () => ({}) }) }) }) }) },
    FadingTransition: { duration: () => ({ delay: () => ({ springify: () => ({ damping: () => ({ stiffness: () => ({}) }) }) }) }) },
  };
});

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => ({
  Swipeable: 'Swipeable',
  DrawerLayout: 'DrawerLayout',
  State: {},
  ScrollView: 'ScrollView',
  Slider: 'Slider',
  Switch: 'Switch',
  TextInput: 'TextInput',
  ToolbarAndroid: 'ToolbarAndroid',
  ViewPagerAndroid: 'ViewPagerAndroid',
  DrawerLayoutAndroid: 'DrawerLayoutAndroid',
  WebView: 'WebView',
  NativeViewGestureHandler: 'NativeViewGestureHandler',
  TapGestureHandler: 'TapGestureHandler',
  FlingGestureHandler: 'FlingGestureHandler',
  ForceTouchGestureHandler: 'ForceTouchGestureHandler',
  LongPressGestureHandler: 'LongPressGestureHandler',
  PanGestureHandler: 'PanGestureHandler',
  PinchGestureHandler: 'PinchGestureHandler',
  RotationGestureHandler: 'RotationGestureHandler',
  RawButton: 'RawButton',
  BaseButton: 'BaseButton',
  RectButton: 'RectButton',
  BorderlessButton: 'BorderlessButton',
}));
