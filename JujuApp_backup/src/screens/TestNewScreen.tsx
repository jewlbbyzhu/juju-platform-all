import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, ViewStyle, TextStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/apiClient';
import {
  useTheme,
  spacing,
  typography,
  BorderRadius,


  gradients,
} from '../theme';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import LinearGradient from 'react-native-linear-gradient';

// 2026高颜值设计 - 开发测试工具页 (设计系统重构版)
export default function TestNewScreen(): React.JSX.Element {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (result: string) => {
    setTestResults(prev =>
      [`[${new Date().toLocaleTimeString()}] ${result}`, ...prev].slice(0, 20),
    );
  };

  const testAsyncStorage = async () => {
    try {
      await AsyncStorage.setItem('test_key', 'test_value');
      const value = await AsyncStorage.getItem('test_key');
      await AsyncStorage.removeItem('test_key');
      addResult(
        value === 'test_value'
          ? '✅ AsyncStorage 正常'
          : '❌ AsyncStorage 失败',
      );
    } catch (e) {
      addResult('❌ AsyncStorage 错误: ' + String(e));
    }
  };

  const testApiConnection = async () => {
    try {
      const start = Date.now();
      await apiClient.get('/health');
      const latency = Date.now() - start;
      addResult(`✅ API 连接正常 (${latency}ms)`);
    } catch {
      addResult('⚠️ API 连接失败 (可能后端未启动)');
    }
  };

  const clearResults = () => {
    setTestResults([]);
    addResult('🗑️ 结果已清除');
  };

  // 使用设计系统替代硬编码样式
  const containerStyle = useMemo(
    (): ViewStyle => ({
      flex: 1,
      backgroundColor: colors.background.secondary,
    }),
    [colors.background.secondary],
  );

  const headerStyle = useMemo(
    (): ViewStyle => ({
      padding: spacing['3xl'],
      paddingTop: spacing['4xl'],
      margin: spacing.lg,
      borderRadius: BorderRadius.xl,
      alignItems: 'center',
    }),
    [spacing['3xl'], spacing['4xl'], spacing.lg, BorderRadius.xl],
  );

  const titleStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.display,
      marginBottom: spacing.sm,
    }),
    [typography.size.display, spacing.sm],
  );

  const headerTitleStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.h2,
      fontWeight: typography.weight.bold,
      color: colors.text.inverse,
    }),
    [typography.size.h2, typography.weight.bold, colors.text.inverse],
  );

  const subtitleStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.body2,
      color: colors.text.inverse + 'CC',
      marginTop: spacing.xs,
    }),
    [typography.size.body2, colors.text.inverse, spacing.xs],
  );

  const sectionStyle = useMemo(
    (): ViewStyle => ({
      marginHorizontal: spacing.lg,
      marginBottom: spacing.md,
    }),
    [spacing.lg, spacing.md],
  );

  const sectionHeaderStyle = useMemo(
    (): ViewStyle => ({
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.lg,
    }),
    [spacing.lg],
  );

  const iconWrapStyle = useMemo(
    (): ViewStyle => ({
      width: 44,
      height: 44,
      borderRadius: BorderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    }),
    [BorderRadius.md, spacing.md],
  );

  const iconTextStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.h3,
    }),
    [typography.size.h3],
  );

  const sectionTitleStyle = useMemo(
    (): TextStyle => ({
      fontSize: typography.size.h4,
      fontWeight: typography.weight.bold,
      color: colors.text.primary,
    }),
    [typography.size.h4, typography.weight.bold, colors.text.primary],
  );

  const resultsContainerStyle = useMemo(
    (): ViewStyle => ({
      backgroundColor: colors.gray[50],
      borderRadius: BorderRadius.lg,
      padding: spacing.lg,
      marginTop: spacing.lg,
      minHeight: 200,
    }),
    [colors.gray[50], BorderRadius.lg, spacing.lg],
  );

  const emptyTextStyle = useMemo(
    (): TextStyle => ({
      color: colors.text.tertiary,
      textAlign: 'center',
      paddingVertical: spacing['3xl'],
      fontSize: typography.size.body2,
    }),
    [colors.text.tertiary, spacing['3xl'], typography.size.body2],
  );

  const resultItemStyle = useMemo(
    (): TextStyle => ({
      color: colors.text.primary,
      fontSize: typography.size.body2,
      fontFamily: typography.fontFamily.mono,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    }),
    [colors.text.primary, typography.size.body2, typography.fontFamily.mono, spacing.sm, colors.divider],
  );

  return (
    <SafeAreaView style={containerStyle} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 头部 */}
        <LinearGradient
          colors={gradients.secondary}
          style={headerStyle}
        >
          <Text style={titleStyle}>🛠️</Text>
          <Text style={headerTitleStyle}>开发测试工具</Text>
          <Text style={subtitleStyle}>快速验证核心功能</Text>
        </LinearGradient>

        {/* 存储测试 */}
        <GlassCard style={sectionStyle} intensity="medium">
          <View style={sectionHeaderStyle}>
            <View
              style={[
                iconWrapStyle,
                { backgroundColor: colors.status.success + '1A' },
              ]}
            >
              <Text style={[iconTextStyle, { color: colors.status.success }]}>
                💾
              </Text>
            </View>
            <Text style={sectionTitleStyle}>存储测试</Text>
          </View>
          <GlassButton
            title="测试 AsyncStorage"
            onPress={testAsyncStorage}
            variant="secondary"
            fullWidth
          />
        </GlassCard>

        {/* API 测试 */}
        <GlassCard style={sectionStyle} intensity="medium">
          <View style={sectionHeaderStyle}>
            <View
              style={[
                iconWrapStyle,
                { backgroundColor: colors.status.info + '1A' },
              ]}
            >
              <Text style={[iconTextStyle, { color: colors.status.info }]}>
                🌐
              </Text>
            </View>
            <Text style={sectionTitleStyle}>API 测试</Text>
          </View>
          <GlassButton
            title="测试 API 连接"
            onPress={testApiConnection}
            variant="secondary"
            fullWidth
          />
        </GlassCard>

        {/* 测试结果 */}
        <GlassCard style={sectionStyle} intensity="light">
          <View style={sectionHeaderStyle}>
            <View
              style={[
                iconWrapStyle,
                { backgroundColor: colors.status.warning + '1A' },
              ]}
            >
              <Text style={[iconTextStyle, { color: colors.status.warning }]}>
                📋
              </Text>
            </View>
            <Text style={sectionTitleStyle}>测试结果</Text>
          </View>
          <GlassButton
            title="清除结果"
            onPress={clearResults}
            variant="ghost"
            fullWidth
          />

          <View style={resultsContainerStyle}>
            {testResults.length === 0 ? (
              <Text style={emptyTextStyle}>
                暂无测试结果，点击上方按钮开始测试
              </Text>
            ) : (
              testResults.map((result, idx) => (
                <Text key={idx} style={resultItemStyle}>
                  {result}
                </Text>
              ))
            )}
          </View>
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
  );
}
