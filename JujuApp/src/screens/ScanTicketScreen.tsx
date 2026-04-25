import React, { useState, useCallback } from 'react';
import { View, Text, Alert, ViewStyle, TextStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { scanApi } from '../api/scan';
import {
  useTheme,
  spacing,
  typography,
  glassmorphism,
} from '../theme';
import {
  ScannerFrame,
  ScanButton,
  TicketResultCard,
} from '../components/scanTicket';

interface TicketResult {
  valid: boolean;
  ticket?: {
    orderNo: string;
    partyTitle: string;
    ticketTypeName: string;
    status: string;
  };
  message?: string;
}

export default function ScanTicketScreen(): React.JSX.Element {
  const { colors } = useTheme();
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<TicketResult | null>(null);

  // 使用设计系统替代 useMemo 样式 - 提取为命名样式对象
  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.gray[900],
  };

  const backgroundGradientStyle: ViewStyle = {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  };

  const headerStyle: ViewStyle = {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    ...glassmorphism.header,
  };

  const headerTitleStyle: TextStyle = {
    fontSize: typography.size.h3,
    fontWeight: typography.weight.bold,
    color: colors.text.inverse,
    letterSpacing: 0.5,
  };

  const contentStyle: ViewStyle = {
    flex: 1,
    padding: spacing.lg,
  };

  const scanContainerStyle: ViewStyle = {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  };

  const scanHintStyle: TextStyle = {
    marginTop: spacing['2xl'],
    fontSize: typography.size.body2,
    color: colors.text.secondary,
  };

  const resultContainerStyle: ViewStyle = {
    flex: 1,
    justifyContent: 'center',
  };

  const handleScan = useCallback(async () => {
    const mockQrCode = 'TICKET_123456';
    setScanning(true);
    setResult(null);

    await new Promise<void>(resolve => setTimeout(resolve, 2000));

    try {
      const res = await scanApi.verifyTicket(mockQrCode);
      const data = (res?.data as unknown) as TicketResult | undefined;
      
      if (data) {
        setResult(data);
        if (!data.valid) {
          Alert.alert('验证失败', data.message || '无效的票券');
        }
      } else {
        Alert.alert('错误', '服务器返回数据异常');
      }
    } catch {
      Alert.alert('错误', '扫码验证失败');
    } finally {
      setScanning(false);
    }
  }, []);

  const handleUseTicket = async () => {
    if (!result?.ticket) return;
    try {
      await scanApi.useTicket('TICKET_123456');
      Alert.alert('成功', '票券已使用');
      setResult(null);
    } catch {
      Alert.alert('错误', '使用票券失败');
    }
  };

  const handleContinue = () => setResult(null);

  return (
    <SafeAreaView style={containerStyle} edges={['top']}>
      <LinearGradient
        colors={[colors.gray[900], colors.gray[800], colors.gray[900]]}
        style={backgroundGradientStyle}
      />

      <View style={headerStyle}>
        <Text style={headerTitleStyle}>扫码验票</Text>
      </View>

      <View style={contentStyle}>
        {!result && (
          <View style={scanContainerStyle}>
            <ScannerFrame scanning={scanning} />

            <Text style={scanHintStyle}>
              {scanning ? '正在扫描...' : '将二维码放入框内'}
            </Text>

            <ScanButton scanning={scanning} onPress={handleScan} />
          </View>
        )}

        {result?.ticket && (
          <View style={resultContainerStyle}>
            <TicketResultCard
              ticket={result.ticket}
              onUseTicket={handleUseTicket}
              onContinue={handleContinue}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
