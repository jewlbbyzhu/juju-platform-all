import React, { useState, useCallback, memo } from 'react';
import { Image, View, ActivityIndicator, StyleSheet } from 'react-native';

interface OptimizedImageProps {
  source: { uri: string };
  style: any;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  placeholder?: boolean;
}

// 优化的图片组件 - 支持缓存和加载状态
export const OptimizedImage = memo<OptimizedImageProps>(({
  source,
  style,
  resizeMode = 'cover',
  placeholder = true,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const onLoadStart = useCallback(() => setLoading(true), []);
  const onLoadEnd = useCallback(() => setLoading(false), []);
  const onError = useCallback(() => {
    setLoading(false);
    setError(true);
  }, []);

  return (
    <View style={[style, styles.container]}>
      <Image
        source={source}
        style={[styles.image, style]}
        resizeMode={resizeMode}
        onLoadStart={onLoadStart}
        onLoadEnd={onLoadEnd}
        onError={onError}
        // 启用原生图片缓存
        progressiveRenderingEnabled={true}
      />
      
      {loading && placeholder && (
        <View style={[styles.overlay, style]}>
          <ActivityIndicator size="small" color={colors.primary.main} />
        </View>
      )}
      
      {error && (
        <View style={[styles.overlay, styles.errorOverlay, style]}>
          <ActivityIndicator size="small" color={colors.text.tertiary} />
        </View>
      )}
    </View>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    backgroundColor: '#eee',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorOverlay: {
    backgroundColor: '#eee',
  },
});

export default OptimizedImage;
