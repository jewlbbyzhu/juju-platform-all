// CreateGroupScreen - 创建群组页面 (霓虹玻璃风格)
// 2026 精细化霓虹改造 - 渐变背景 + 玻璃卡片 + 霓虹文字
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  ScrollView,
  Switch,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { groupChatApi } from '../api/group-chat';
import {
  useTheme,
  spacing,
  BorderRadius,
  Border,
  typography,
  textStyles,
  gradients,
  glassmorphism,
} from '../theme';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { LinearGradient } from 'expo-linear-gradient';

interface GroupType {
  value: string;
  label: string;
  icon: string;
  description: string;
}

export default function CreateGroupScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'public' | 'private'>('public');
  const [allowInvite, setAllowInvite] = useState(true);
  const [needApproval, setNeedApproval] = useState(false);
  const [loading, setLoading] = useState(false);

  // 命名样式对象 - 霓虹玻璃风格
  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: '#0F172A',
  };

  const gradientHeaderStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['3xl'],
    paddingBottom: spacing.lg,
  };

  const backBtnStyle: ViewStyle = {
    padding: spacing.sm,
    width: 40,
  };

  const backTextStyle: TextStyle = {
    fontSize: typography.size.h2,
    color: colors.text.inverse,
    fontWeight: typography.weight.semibold,
  };

  const headerTitleStyle: TextStyle = {
    ...textStyles.h3,
    color: colors.text.inverse,
    textShadowColor: colors.primary.shadow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    letterSpacing: 0.5,
  };

  const placeholderStyle: ViewStyle = {
    width: 40,
  };

  const formStyle: ViewStyle = {
    padding: spacing.lg,
  };

  const fieldCardStyle: ViewStyle = {
    marginBottom: spacing.lg,
  };

  const labelStyle: TextStyle = {
    color: colors.text.inverse,
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
    marginBottom: spacing.md,
    letterSpacing: 0.3,
    textShadowColor: 'rgba(123, 97, 255, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  };

  const inputBaseStyle: TextStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BorderRadius.md,
    padding: spacing.lg,
    color: colors.text.primary,
    borderWidth: Border.width.normal,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    fontSize: typography.size.body2,
    fontWeight: typography.weight.medium,
  };

  const textareaStyle: TextStyle = {
    height: 100,
    textAlignVertical: 'top',
  };

  const countStyle: TextStyle = {
    color: colors.text.tertiary,
    textAlign: 'right',
    marginTop: spacing.sm,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.medium,
  };

  const typesContainerStyle: ViewStyle = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  };

  const typeCardBaseStyle: ViewStyle = {
    width: '47%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: Border.width.thin,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
  };

  const typeLabelBaseStyle: TextStyle = {
    fontSize: typography.size.body2,
    color: colors.text.primary,
    fontWeight: typography.weight.semibold,
    marginBottom: spacing.xs,
  };

  const typeDescStyle: TextStyle = {
    fontSize: typography.size.caption,
    color: colors.text.tertiary,
    textAlign: 'center',
  };

  const settingItemStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  };

  const settingTitleStyle: TextStyle = {
    fontSize: typography.size.body2,
    color: colors.text.primary,
    fontWeight: typography.weight.semibold,
    marginBottom: spacing.xs,
  };

  const settingDescStyle: TextStyle = {
    fontSize: typography.size.caption,
    color: colors.text.tertiary,
  };

  const settingDividerStyle: ViewStyle = {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  };

  const submitContainerStyle: ViewStyle = {
    marginTop: spacing.sm,
    marginBottom: spacing['3xl'],
  };

  const types: GroupType[] = [
    { value: 'normal', label: '普通群', icon: '💬', description: '日常聊天交流' },
    { value: 'activity', label: '活动群', icon: '🎉', description: '聚会活动专用' },
    { value: 'interest', label: '兴趣群', icon: '⭐', description: '共同兴趣爱好' },
    { value: 'work', label: '工作群', icon: '💼', description: '工作协作沟通' },
  ];

  const getNeonTextStyle = (isActive: boolean): TextStyle => ({
    color: isActive ? colors.primary.main : colors.text.secondary,
    textShadowColor: isActive ? colors.primary.shadow : 'transparent',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: isActive ? 8 : 0,
  });

  const handleCreate = async () => {
    if (!name.trim() || name.length < 2) {
      Alert.alert('提示', '群名称长度为2-50个字符');
      return;
    }
    setLoading(true);
    try {
      const res = await groupChatApi.createGroup({
        name,
        description,
        type,
        allowInvite,
        needApproval,
        memberIds: [],
      });
      if ((res as any).code === 0) {
        Alert.alert('创建成功', '群聊已创建，快去邀请好友吧！');
        navigation.goBack();
      }
    } catch {
      Alert.alert('创建失败', '请检查网络后重试');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={containerStyle} edges={['top']}>
      {/* 霓虹渐变 Header */}
      <LinearGradient
        colors={gradients.secondary as unknown as string[]}
        style={gradientHeaderStyle}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <GlassButton
          title="←"
          onPress={() => navigation.goBack()}
          variant="ghost"
          size="small"
          style={backBtnStyle}
          textStyle={backTextStyle}
        />
        <Text style={headerTitleStyle}>创建群聊</Text>
        <View style={placeholderStyle} />
      </LinearGradient>

      <ScrollView style={formStyle} showsVerticalScrollIndicator={false}>
        {/* 群名称 - 玻璃卡片 */}
        <GlassCard style={fieldCardStyle} intensity="medium">
          <Text style={labelStyle}>群名称 *</Text>
          <TextInput
            style={inputBaseStyle}
            value={name}
            onChangeText={setName}
            placeholder="给你的群聊起个名字"
            placeholderTextColor={colors.text.tertiary}
            maxLength={50}
          />
          <Text style={countStyle}>{name.length}/50</Text>
        </GlassCard>

        {/* 群描述 - 玻璃卡片 */}
        <GlassCard style={fieldCardStyle} intensity="light">
          <Text style={labelStyle}>群描述</Text>
          <TextInput
            style={[inputBaseStyle, textareaStyle]}
            value={description}
            onChangeText={setDescription}
            placeholder="介绍一下这个群聊..."
            placeholderTextColor={colors.text.tertiary}
            multiline
            maxLength={200}
          />
          <Text style={countStyle}>{description.length}/200</Text>
        </GlassCard>

        {/* 群类型 - 玻璃卡片 */}
        <GlassCard style={fieldCardStyle} intensity="medium">
          <Text style={labelStyle}>群类型</Text>
          <View style={typesContainerStyle}>
            {types.map(t => {
              const isActive = type === t.value;
              const typeCardActiveStyle: ViewStyle = isActive
                ? {
                    borderColor: colors.primary.main,
                    backgroundColor: 'rgba(255, 77, 109, 0.1)',
                    ...glassmorphism.card,
                  }
                : {};
              const typeLabelActiveStyle = getNeonTextStyle(isActive);

              return (
                <GlassButton
                  key={t.value}
                  title={`${t.icon}\n${t.label}\n${t.description}`}
                  onPress={() => setType(t.value as 'public' | 'private')}
                  variant={isActive ? 'primary' : 'ghost'}
                  size="small"
                  style={[typeCardBaseStyle, typeCardActiveStyle]}
                  textStyle={[typeLabelBaseStyle, typeLabelActiveStyle, typeDescStyle]}
                />
              );
            })}
          </View>
        </GlassCard>

        {/* 群设置 - 玻璃卡片 */}
        <GlassCard style={fieldCardStyle} intensity="light">
          <Text style={labelStyle}>群设置</Text>
          <View style={settingItemStyle}>
            <View>
              <Text style={settingTitleStyle}>允许成员邀请</Text>
              <Text style={settingDescStyle}>群成员可以邀请其他人加入</Text>
            </View>
            <Switch
              value={allowInvite}
              onValueChange={setAllowInvite}
              trackColor={{
                false: colors.gray[300],
                true: colors.primary.main + '50',
              }}
              thumbColor={allowInvite ? colors.primary.main : colors.gray[100]}
            />
          </View>
          <View style={settingDividerStyle} />
          <View style={settingItemStyle}>
            <View>
              <Text style={settingTitleStyle}>入群需审核</Text>
              <Text style={settingDescStyle}>新成员加入需要群主审核</Text>
            </View>
            <Switch
              value={needApproval}
              onValueChange={setNeedApproval}
              trackColor={{
                false: colors.gray[300],
                true: colors.primary.main + '50',
              }}
              thumbColor={needApproval ? colors.primary.main : colors.gray[100]}
            />
          </View>
        </GlassCard>

        {/* 创建按钮 */}
        <View style={submitContainerStyle}>
          <GlassButton
            title={loading ? '创建中...' : '创建群聊'}
            onPress={handleCreate}
            disabled={loading || name.length < 2}
            variant="gradient"
            size="large"
            fullWidth
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}