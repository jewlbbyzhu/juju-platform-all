export const THEME_TYPES = {
  NEON: 'neon',
  MINIMAL: 'minimal',
  DARK: 'dark',
  VIBRANT: 'vibrant'
}

export const THEME_CONFIGS = {
  [THEME_TYPES.NEON]: {
    name: '霓虹',
    description: '炫酷霓虹风格',
    colors: {
      primary: '#667eea',
      secondary: '#764ba2',
      accent: '#FF6B35',
      background: '#000000',
      surface: '#1a1a1a',
      text: '#ffffff',
      textSecondary: 'rgba(255, 255, 255, 0.7)',
      border: 'rgba(255, 255, 255, 0.1)',
      success: '#4CAF50',
      warning: '#FFC107',
      error: '#F44336',
      gradient: {
        primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        accent: 'linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)',
        success: 'linear-gradient(135deg, #4CAF50 0%, #45A049 100%)',
        warning: 'linear-gradient(135deg, #FFC107 0%, #FF9800 100%)',
        error: 'linear-gradient(135deg, #F44336 0%, #FF6B35 100%)'
      }
    },
    styles: {
      glass: 'backdrop-filter: blur(10rpx)',
      shadow: '0 4rpx 20rpx rgba(0, 0, 0, 0.3)',
      borderRadius: '20rpx',
      spacing: '20rpx'
    }
  },

  [THEME_TYPES.MINIMAL]: {
    name: '简约',
    description: '清新简约风格',
    colors: {
      primary: '#2196F3',
      secondary: '#1976D2',
      accent: '#FF5722',
      background: '#ffffff',
      surface: '#f5f5f5',
      text: '#333333',
      textSecondary: 'rgba(51, 51, 51, 0.6)',
      border: 'rgba(0, 0, 0, 0.1)',
      success: '#4CAF50',
      warning: '#FFC107',
      error: '#F44336',
      gradient: {
        primary: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
        accent: 'linear-gradient(135deg, #FF5722 0%, #FF8A65 100%)',
        success: 'linear-gradient(135deg, #4CAF50 0%, #45A049 100%)',
        warning: 'linear-gradient(135deg, #FFC107 0%, #FF9800 100%)',
        error: 'linear-gradient(135deg, #F44336 0%, #FF6B35 100%)'
      }
    },
    styles: {
      glass: 'backdrop-filter: blur(5rpx)',
      shadow: '0 2rpx 10rpx rgba(0, 0, 0, 0.1)',
      borderRadius: '16rpx',
      spacing: '16rpx'
    }
  },

  [THEME_TYPES.DARK]: {
    name: '暗色',
    description: '舒适暗色风格',
    colors: {
      primary: '#4A5568',
      secondary: '#3D4F5F',
      accent: '#FFB84D',
      background: '#1a1a1a',
      surface: '#2d2d2d',
      text: '#e0e0e0',
      textSecondary: 'rgba(224, 224, 224, 0.6)',
      border: 'rgba(255, 255, 255, 0.08)',
      success: '#4CAF50',
      warning: '#FFC107',
      error: '#F44336',
      gradient: {
        primary: 'linear-gradient(135deg, #4A5568 0%, #3D4F5F 100%)',
        accent: 'linear-gradient(135deg, #FFB84D 0%, #FFA066 100%)',
        success: 'linear-gradient(135deg, #4CAF50 0%, #45A049 100%)',
        warning: 'linear-gradient(135deg, #FFC107 0%, #FF9800 100%)',
        error: 'linear-gradient(135deg, #F44336 0%, #FF6B35 100%)'
      }
    },
    styles: {
      glass: 'backdrop-filter: blur(8rpx)',
      shadow: '0 2rpx 15rpx rgba(0, 0, 0, 0.2)',
      borderRadius: '16rpx',
      spacing: '16rpx'
    }
  },

  [THEME_TYPES.VIBRANT]: {
    name: '活力',
    description: '鲜艳活力风格',
    colors: {
      primary: '#FF6B9C',
      secondary: '#4ECDC4',
      accent: '#FF4757',
      background: '#FFF5E5',
      surface: '#FFE4E1',
      text: '#2C2C2C',
      textSecondary: 'rgba(44, 44, 44, 0.7)',
      border: 'rgba(0, 0, 0, 0.1)',
      success: '#4CAF50',
      warning: '#FFC107',
      error: '#F44336',
      gradient: {
        primary: 'linear-gradient(135deg, #FF6B9C 0%, #4ECDC4 100%)',
        accent: 'linear-gradient(135deg, #FF4757 0%, #FF8A65 100%)',
        success: 'linear-gradient(135deg, #4CAF50 0%, #45A049 100%)',
        warning: 'linear-gradient(135deg, #FFC107 0%, #FF9800 100%)',
        error: 'linear-gradient(135deg, #F44336 0%, #FF6B35 100%)'
      }
    },
    styles: {
      glass: 'backdrop-filter: blur(12rpx)',
      shadow: '0 4rpx 25rpx rgba(0, 0, 0, 0.15)',
      borderRadius: '24rpx',
      spacing: '24rpx'
    }
  }
}

export const DEFAULT_THEME = THEME_TYPES.NEON

export const THEME_STORAGE_KEY = 'app_theme'

export function getThemeConfig(themeType) {
  return THEME_CONFIGS[themeType] || THEME_CONFIGS[DEFAULT_THEME]
}

export function getThemeList() {
  return Object.values(THEME_CONFIGS).map(config => ({
    type: Object.keys(THEME_CONFIGS).find(key => THEME_CONFIGS[key] === config),
    ...config
  }))
}
