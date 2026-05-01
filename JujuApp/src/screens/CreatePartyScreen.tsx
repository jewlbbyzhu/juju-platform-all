// CreatePartyScreen - 创建聚会页面 (霓虹玻璃风格)
// 2026 精细化霓虹改造 - 渐变背景 + 玻璃卡片 + 霓虹文字
import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { partyApi } from '../api/party';
import { useTheme, spacing } from '../theme';
import { GlassButton } from '../components/GlassButton';
import { LinearGradient } from 'expo-linear-gradient';
import {
  CreatePartyHeader,
  BasicInfoSection,
  LocationTimeSection,
  TicketEditor,
} from '../components/createParty';
import { gradients, glassmorphism, BorderRadius } from '../theme';

interface FormData {
  title: string;
  description: string;
  category: string;
  theme: string;
  city: string;
  address: string;
  start_time: string;
  end_time: string;
  max_participants: string;
  ticket_types: Array<{
    name: string;
    type: number;
    price: string;
    available_count: string;
  }>;
  images: string[];
}

// 命名样式对象 - 霓虹玻璃风格
const containerStyle: ViewStyle = {
  flex: 1,
  backgroundColor: '#0F172A',
};

const keyboardAvoidingStyle: ViewStyle = {
  flex: 1,
};

const scrollViewStyle: ViewStyle = {
  flex: 1,
};

const scrollContentStyle: ViewStyle = {
  padding: spacing.lg,
  paddingBottom: spacing['5xl'] + spacing['4xl'],
};

const bottomSpacerStyle: ViewStyle = {
  height: spacing['5xl'] + spacing['4xl'],
};

const bottomBarStyle: ViewStyle = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
  paddingBottom: spacing['2xl'],
  ...glassmorphism.navbar,
};

const gradientHeaderStyle: ViewStyle = {
  paddingVertical: spacing.md,
  paddingHorizontal: spacing.lg,
};

export default function CreatePartyScreen() {
  const navigation = useNavigation();
  const { colors, glassmorphism } = useTheme();

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormData>({
    title: '',
    description: '',
    category: '',
    theme: '',
    city: '',
    address: '',
    start_time: '',
    end_time: '',
    max_participants: '50',
    ticket_types: [
      { name: '普通票', type: 1, price: '', available_count: '100' },
    ],
    images: [],
  });

  const updateForm = useCallback((key: keyof FormData, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  }, []);

  const validate = useCallback(() => {
    if (!form.title.trim()) {
      Alert.alert('提示', '请输入活动标题');
      return false;
    }
    if (!form.category) {
      Alert.alert('提示', '请选择分类');
      return false;
    }
    if (!form.description.trim()) {
      Alert.alert('提示', '请输入活动描述');
      return false;
    }
    if (!form.address.trim()) {
      Alert.alert('提示', '请输入活动地点');
      return false;
    }
    if (!form.start_time.trim()) {
      Alert.alert('提示', '请输入开始时间');
      return false;
    }
    return true;
  }, [form]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const data = {
        ...form,
        max_participants: parseInt(form.max_participants, 10) || 50,
        ticket_types: form.ticket_types.map(t => ({
          ...t,
          price: parseFloat(t.price) || 0,
          available_count: parseInt(t.available_count, 10) || 100,
        })),
      };
      const res = await partyApi.createParty(data);
      if ((res as any).code === 0) {
        Alert.alert('创建成功', '您的聚会已发布！', [
          { text: '确定', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('创建失败', (res as any).message || '请重试');
      }
    } catch {
      Alert.alert('错误', '网络错误');
    } finally {
      setLoading(false);
    }
  }, [form, validate, navigation]);

  const updateTicket = useCallback(
    (index: number, field: string, value: string) => {
      const newTickets = [...form.ticket_types];
      newTickets[index] = { ...newTickets[index], [field]: value };
      updateForm('ticket_types', newTickets);
    },
    [form.ticket_types, updateForm],
  );

  const addTicket = useCallback(() => {
    updateForm('ticket_types', [
      ...form.ticket_types,
      { name: '', type: 1, price: '', available_count: '50' },
    ]);
  }, [form.ticket_types, updateForm]);

  const removeTicket = useCallback(
    (index: number) => {
      if (form.ticket_types.length <= 1) {
        Alert.alert('提示', '至少需要保留一种票型');
        return;
      }
      const newTickets = form.ticket_types.filter((_, i) => i !== index);
      updateForm('ticket_types', newTickets);
    },
    [form.ticket_types, updateForm],
  );

  // 脉冲动画
  const pulseOpacity = useSharedValue(1);
  const pulseScale = useSharedValue(1);

  React.useEffect(() => {
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, [pulseOpacity, pulseScale]);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <SafeAreaView style={containerStyle} edges={['top']}>
      {/* 霓虹渐变 Header */}
      <LinearGradient
        colors={gradients.warm as unknown as string[]}
        style={gradientHeaderStyle}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <CreatePartyHeader index={0} />
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={keyboardAvoidingStyle}
      >
        <ScrollView
          style={scrollViewStyle}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={scrollContentStyle}
        >
          <BasicInfoSection
            form={{
              title: form.title,
              description: form.description,
              category: form.category,
              theme: form.theme,
            }}
            updateForm={updateForm}
            index={1}
          />

          <LocationTimeSection
            form={{
              address: form.address,
              city: form.city,
              start_time: form.start_time,
              end_time: form.end_time,
              max_participants: form.max_participants,
            }}
            updateForm={updateForm}
            index={2}
          />

          <TicketEditor
            ticketTypes={form.ticket_types}
            onUpdateTicket={updateTicket}
            onAddTicket={addTicket}
            onRemoveTicket={removeTicket}
            index={3}
          />

          <View style={bottomSpacerStyle} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 霓虹脉冲提交按钮 */}
      <View style={bottomBarStyle}>
        <Animated.View style={animatedButtonStyle}>
          <GlassButton
            title="创建聚会"
            onPress={handleSubmit}
            variant="gradient"
            size="large"
            loading={loading}
            disabled={loading}
            fullWidth
          />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}