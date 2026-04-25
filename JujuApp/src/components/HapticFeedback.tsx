/**
 * JUJU App - HapticFeedback 组件
 * 带触觉反馈的触控组件（当前为基础实现，可后续集成 react-native-haptic-feedback）
 */

import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  Pressable,
  PressableProps,
} from 'react-native';

// 触觉反馈类型
export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

interface HapticFeedbackProps extends TouchableOpacityProps {
  hapticType?: HapticType;
  children: React.ReactNode;
}

/**
 * HapticFeedback 组件 - 带触觉反馈的触控组件
 * 
 * 当前为基础实现，使用 TouchableOpacity 作为底层组件。
 * 后续可集成 react-native-haptic-feedback 添加真实触觉反馈。
 */
export const HapticFeedback: React.FC<HapticFeedbackProps> = ({
  children,
  onPress,
  activeOpacity = 0.8,
  ...props
}) => {
  const handlePress = (event: any) => {
    // TODO: 集成 react-native-haptic-feedback 后添加触觉反馈
    // import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
    // ReactNativeHapticFeedback.trigger(hapticType);
    
    onPress?.(event);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={activeOpacity}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
};

interface HapticPressableProps extends PressableProps {
  hapticType?: HapticType;
  children: React.ReactNode;
}

/**
 * HapticPressable - 带触觉反馈的 Pressable 组件
 */
export const HapticPressable: React.FC<HapticPressableProps> = ({
  children,
  onPress,
  ...props
}) => {
  const handlePress = (event: any) => {
    // TODO: 集成 react-native-haptic-feedback 后添加触觉反馈
    onPress?.(event);
  };

  return (
    <Pressable onPress={handlePress} {...props}>
      {children}
    </Pressable>
  );
};

export default HapticFeedback;
