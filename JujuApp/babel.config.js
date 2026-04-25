module.exports = {
  presets: [
    'module:@react-native/babel-preset',
  ],
  // 确保 flow 类型被正确移除
  plugins: [
    ['@babel/plugin-transform-flow-strip-types', { all: true }]
  ],
  // 覆盖默认配置，确保所有文件都被处理
  overrides: [
    {
      test: /node_modules\/(@react-native|react-native)/,
      presets: ['@babel/preset-flow'],
    }
  ]
};