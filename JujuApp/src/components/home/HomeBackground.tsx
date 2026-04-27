/**
 * 禁用动画版本 - HomeBackground
 * 解决 Worklets 循环引用崩溃问题
 */
import React from 'react';
import { View, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {gradients, BorderRadius} from '../../theme';

interface HomeBackgroundProps {
  scrollY: any;
  isScrolling: any;
}

const HomeBackground: React.FC<HomeBackgroundProps> = React.memo(
  ({ scrollY, isScrolling }) => {
    // 使用设计系统替代 StyleSheet.create
    const backgroundContainerStyle: ViewStyle = {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'hidden',
    };

    const gradientOverlayStyle: ViewStyle = {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    };

    const floatingParticleBaseStyle: ViewStyle = {
      position: 'absolute',
      borderRadius: BorderRadius.full,
      overflow: 'hidden',
    };

    const particle1StyleStatic: ViewStyle = {
      width: 200,
      height: 200,
      top: '10%',
      right: -50,
    };

    const particle2StyleStatic: ViewStyle = {
      width: 150,
      height: 150,
      top: '30%',
      left: -30,
    };

    const particle3StyleStatic: ViewStyle = {
      width: 100,
      height: 100,
      bottom: '20%',
      right: '20%',
    };

    const particleGradientStyle: ViewStyle = {
      width: '100%',
      height: '100%',
      borderRadius: BorderRadius.full,
    };

    return (
      <View
        style={[backgroundContainerStyle]}
        pointerEvents="none"
      >
        <LinearGradient
          colors={gradients.secondary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1.2, y: 1.2 }}
          style={gradientOverlayStyle}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.4)']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={gradientOverlayStyle}
        />
        <View
          style={[floatingParticleBaseStyle, particle1StyleStatic]}
        >
          <LinearGradient
            colors={['rgba(255,77,109,0.3)', 'transparent']}
            style={particleGradientStyle}
          />
        </View>
        <View
          style={[floatingParticleBaseStyle, particle2StyleStatic]}
        >
          <LinearGradient
            colors={['rgba(123,97,255,0.3)', 'transparent']}
            style={particleGradientStyle}
          />
        </View>
        <View
          style={[floatingParticleBaseStyle, particle3StyleStatic]}
        >
          <LinearGradient
            colors={['rgba(255,215,0,0.2)', 'transparent']}
            style={particleGradientStyle}
          />
        </View>
      </View>
    );
  },
);

export default HomeBackground;

HomeBackground.displayName = 'HomeBackground';
