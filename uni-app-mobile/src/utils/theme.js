import { THEME_CONFIGS, DEFAULT_THEME, THEME_STORAGE_KEY, THEME_TYPES } from '../config/theme.js'

const THEME_CHANGE_EVENT = 'theme:change'

class ThemeManager {
  constructor() {
    this.currentTheme = null
    this.listeners = []
    this.init()
  }

  init() {
    const savedTheme = uni.getStorageSync(THEME_STORAGE_KEY)
    this.currentTheme = savedTheme || DEFAULT_THEME
    this.applyTheme(this.currentTheme)
  }

  getCurrentTheme() {
    return this.currentTheme
  }

  getThemeConfig(themeType = null) {
    const type = themeType || this.currentTheme
    return THEME_CONFIGS[type] || THEME_CONFIGS[DEFAULT_THEME]
  }

  setTheme(themeType) {
    if (!THEME_CONFIGS[themeType]) {
      console.warn(`主题类型 ${themeType} 不存在，使用默认主题`)
      themeType = DEFAULT_THEME
    }

    const oldTheme = this.currentTheme
    this.currentTheme = themeType

    uni.setStorageSync(THEME_STORAGE_KEY, themeType)
    this.applyTheme(themeType)
    this.notifyListeners(oldTheme, themeType)
  }

  applyTheme(themeType) {
    const config = this.getThemeConfig(themeType)
    const colors = config.colors
    const styles = config.styles

    const rootStyles = {
      '--theme-primary': colors.primary,
      '--theme-secondary': colors.secondary,
      '--theme-accent': colors.accent,
      '--theme-background': colors.background,
      '--theme-surface': colors.surface,
      '--theme-text': colors.text,
      '--theme-text-secondary': colors.textSecondary,
      '--theme-border': colors.border,
      '--theme-success': colors.success,
      '--theme-warning': colors.warning,
      '--theme-error': colors.error,
      '--theme-gradient': colors.gradient || `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
      '--theme-glass': styles.glass,
      '--theme-shadow': styles.shadow,
      '--theme-border-radius': styles.borderRadius,
      '--theme-spacing': styles.spacing
    }

    const styleString = Object.entries(rootStyles)
      .map(([key, value]) => `${key}: ${value};`)
      .join('')

    const styleId = 'theme-variables'
    let styleElement = document.getElementById(styleId)

    if (!styleElement) {
      styleElement = document.createElement('style')
      styleElement.id = styleId
      document.head.appendChild(styleElement)
    }

    styleElement.textContent = `:root { ${styleString} }`
  }

  onThemeChange(callback) {
    if (typeof callback === 'function') {
      this.listeners.push(callback)
    }
  }

  offThemeChange(callback) {
    const index = this.listeners.indexOf(callback)
    if (index > -1) {
      this.listeners.splice(index, 1)
    }
  }

  notifyListeners(oldTheme, newTheme) {
    this.listeners.forEach(callback => {
      try {
        callback(oldTheme, newTheme)
      } catch (error) {
        console.error('主题变化监听器执行失败:', error)
      }
    })

    uni.$emit(THEME_CHANGE_EVENT, {
      oldTheme,
      newTheme,
      themeConfig: this.getThemeConfig(newTheme)
    })
  }

  getThemeList() {
    return Object.entries(THEME_CONFIGS).map(([type, config]) => ({
      type,
      name: config.name,
      description: config.description,
      isActive: type === this.currentTheme
    }))
  }

  resetTheme() {
    this.setTheme(DEFAULT_THEME)
  }

  getColor(colorName, themeType = null) {
    const config = this.getThemeConfig(themeType)
    return config.colors[colorName] || config.colors.primary
  }

  getStyle(styleName, themeType = null) {
    const config = this.getThemeConfig(themeType)
    return config.styles[styleName] || ''
  }

  getGradient(themeType = null) {
    const config = this.getThemeConfig(themeType)
    return config.colors.gradient || `linear-gradient(135deg, ${config.colors.primary}, ${config.colors.secondary})`
  }

  isDarkTheme(themeType = null) {
    const type = themeType || this.currentTheme
    return type === THEME_TYPES.NEON || type === THEME_TYPES.DARK
  }

  isLightTheme(themeType = null) {
    const type = themeType || this.currentTheme
    return type === THEME_TYPES.MINIMAL || type === THEME_TYPES.VIBRANT
  }
}

const themeManager = new ThemeManager()

export default themeManager
export { THEME_CHANGE_EVENT }
