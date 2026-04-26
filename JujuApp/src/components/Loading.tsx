import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { colors } from "../theme/colors";

interface LoadingProps {
  text?: string;
  size?: 'small' | 'large';
  color?: string;
  style?: ViewStyle;
  fullscreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  text = '加载中...',
  size = 'large',
  color = colors.primary.main,
  style,
  fullscreen = false,
}) => {
  if (fullscreen) {
    return (
      <View style={[styles.fullscreen, style]}>
        <View style={styles.container}>
          <ActivityIndicator size={size} color={color} />
          {text && <Text style={[styles.text, { color }]}>{text}</Text>}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={[styles.text, { color }]}>{text}</Text>}
    </View>
  );
};

export const FullscreenLoading: React.FC<Omit<LoadingProps, 'fullscreen'>> = (props) => {
  return <Loading {...props} fullscreen={true} />;
};

const styles = StyleSheet.create({
  fullscreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default Loading;
