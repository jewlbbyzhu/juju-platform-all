// 创建群组页面 - 2026高颜值重构
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

  const types: GroupType[] = [
    {
      value: 'normal',
      label: '普通群',
      icon: '💬',
      description: '日常聊天交流',
    },
    {
      value: 'activity',
      label: '活动群',
      icon: '🎉',
      description: '聚会活动专用',
    },
    {
      value: 'interest',
      label: '兴趣群',
      icon: '⭐',
      description: '共同兴趣爱好',
    },
    { value: 'work', label: '工作群', icon: '💼', description: '工作协作沟通' },
  ];

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

  // 使用设计系统替代 useMemo 样式
  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background.secondary,
  };

  const headerStyle: ViewStyle = {
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
    color: colors.text.primary,
    fontWeight: typography.weight.semibold,
  };

  const headerTitleStyle: TextStyle = {
    ...textStyles.h3,
    color: colors.text.primary,
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
    color: colors.text.primary,
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
    marginBottom: spacing.md,
    letterSpacing: 0.3,
  };

  const inputBaseStyle: TextStyle = {
    backgroundColor: colors.background.secondary,
    borderRadius: BorderRadius.md,
    padding: spacing.lg,
    color: colors.text.primary,
    borderWidth: Border.width.normal,
    borderColor: colors.border,
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
    backgroundColor: colors.background.secondary,
    padding: spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: Border.width.normal,
    borderColor: colors.border,
    alignItems: 'center',
  };

  // typeIconStyle removed - was unused

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
    backgroundColor: colors.divider,
  };

  const submitContainerStyle: ViewStyle = {
    marginTop: spacing.sm,
    marginBottom: spacing['3xl'],
  };

  return (
    <SafeAreaView style={containerStyle} edges={['top']}>
      {/* Header */}
      <LinearGradient
        colors={gradients.primary}
        style={headerStyle}
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
        {/* Group Name */}
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

        {/* Group Description */}
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

        {/* Group Type */}
        <GlassCard style={fieldCardStyle} intensity="medium">
          <Text style={labelStyle}>群类型</Text>
          <View style={typesContainerStyle}>
            {types.map(t => {
              const isActive = type === t.value;
              const typeCardActiveStyle: ViewStyle = isActive
                ? {
                    borderColor: colors.primary.main,
                    backgroundColor: colors.primary.light + '15',
                    ...glassmorphism.card,
                  }
                : {};
              const typeLabelActiveStyle: TextStyle = isActive
                ? { color: colors.primary.main }
                : {};

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

        {/* Group Settings */}
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

        {/* Create Button */}
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
