import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  Switch,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { pushApi } from '../api/push';
import { spacing, BorderRadius, Shadows, colors, typography } from '../theme';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';

interface PushSettings {
  party_enabled: boolean;
  comment_enabled: boolean;
  like_enabled: boolean;
  follow_enabled: boolean;
  message_enabled: boolean;
  activity_enabled: boolean;
  system_enabled: boolean;
  do_not_disturb_enabled: boolean;
  do_not_disturb_start: string;
  do_not_disturb_end: string;
  aggregate_enabled: boolean;
  push_interval: number;
}

const intervalOptions = ['实时', '5分钟', '15分钟', '30分钟', '1小时'];
const intervalValues = [0, 5, 15, 30, 60];

export default function PushSettingsScreen() {
  const defaultSettings: PushSettings = useMemo(
    () => ({
      party_enabled: true,
      comment_enabled: true,
      like_enabled: true,
      follow_enabled: true,
      message_enabled: true,
      activity_enabled: true,
      system_enabled: true,
      do_not_disturb_enabled: false,
      do_not_disturb_start: '22:00',
      do_not_disturb_end: '08:00',
      aggregate_enabled: false,
      push_interval: 0,
    }),
    [],
  );
  const [settings, setSettings] = useState<PushSettings>(defaultSettings);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res: any = await pushApi.getPushSettings();
      if ((res as any).code === 0 || (res as any).data) {
        setSettings({ ...defaultSettings, ...(res as any).data });
      }
    } catch {
      // ignore
    }
  };

  const toggleSetting = (key: keyof PushSettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const res: any = await pushApi.updatePushSettings(settings);
      if ((res as any).code === 0) {
        Alert.alert('提示', '保存成功');
      } else {
        Alert.alert('提示', (res as any).message || '保存失败');
      }
    } catch {
      Alert.alert('提示', '网络错误');
    } finally {
      setLoading(false);
    }
  };

  const resetSettings = () => {
    Alert.alert('确认重置', '确定要恢复默认设置吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定',
        onPress: async () => {
          setSettings(defaultSettings);
          try {
            const res: any = await pushApi.updatePushSettings(defaultSettings);
            if ((res as any).code === 0) Alert.alert('提示', '已恢复默认设置');
          } catch {
            // ignore
          }
        },
      },
    ]);
  };

  const getIntervalText = (value: number) => {
    const index = intervalValues.indexOf(value);
    return intervalOptions[index] || '实时';
  };

  // === 设计系统样式 ===
  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background.secondary,
  };

  const headerStyle: ViewStyle = {
    paddingVertical: 50,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background.primary + 'D8',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  };

  const headerTitleStyle: TextStyle = {
    fontSize: typography.size.h2,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
  };

  const headerSubtitleStyle: TextStyle = {
    fontSize: typography.size.body2,
    color: colors.text.tertiary,
  };

  const sectionCardStyle: ViewStyle = {
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
  };

  const settingItemStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background.tertiary,
    borderRadius: BorderRadius.md,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border + '10',
  };

  const settingItemRowStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  };

  const iconContainerStyle: ViewStyle = {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    backgroundColor: colors.secondary.main + '20',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.secondary.main + '30',
  };

  const iconTextStyle: TextStyle = {
    fontSize: typography.size.body,
  };

  const settingLabelStyle: TextStyle = {
    fontSize: typography.size.body,
    color: colors.text.primary,
    fontWeight: typography.weight.semibold,
  };

  const settingDescStyle: TextStyle = {
    fontSize: typography.size.caption,
    color: colors.text.tertiary,
    marginTop: 2,
  };

  const timePickerCardStyle: ViewStyle = {
    padding: spacing.md,
    backgroundColor: colors.background.tertiary,
    borderRadius: BorderRadius.md,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border + '10',
  };

  // timePickerRowStyle removed - was unused

  const timePickerValueStyle: TextStyle = {
    fontSize: typography.size.body,
    color: colors.primary.main,
    fontWeight: typography.weight.semibold,
  };

  const timePickerArrowStyle: TextStyle = {
    fontSize: typography.size.h3,
    color: colors.text.tertiary,
    marginLeft: spacing.xs,
  };

  const intervalRowStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  };

  const actionButtonsStyle: ViewStyle = {
    gap: spacing.sm,
    padding: spacing.md,
    paddingBottom: 40,
  };

  const resetBtnStyle: ViewStyle = {
    backgroundColor: colors.background.tertiary,
  };

  const SettingItem = ({
    icon,
    label,
    desc,
    value,
    onToggle,
  }: {
    icon: string;
    label: string;
    desc?: string;
    value: boolean;
    onToggle: () => void;
  }) => (
    <View style={settingItemStyle}>
      <View style={settingItemRowStyle}>
        <View style={iconContainerStyle}>
          <Text style={iconTextStyle}>{icon}</Text>
        </View>
        <View>
          <Text style={settingLabelStyle}>{label}</Text>
          {desc && <Text style={settingDescStyle}>{desc}</Text>}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.gray[600], true: colors.primary.main }}
        thumbColor={value ? colors.text.inverse : colors.gray[400]}
      />
    </View>
  );

  const TimePickerItem = ({
    icon,
    label,
    value,
    onPress,
  }: {
    icon: string;
    label: string;
    value: string;
    onPress: () => void;
  }) => (
    <GlassCard onPress={onPress} intensity="light">
      <View style={timePickerCardStyle}>
        <View style={settingItemRowStyle}>
          <View style={iconContainerStyle}>
            <Text style={iconTextStyle}>{icon}</Text>
          </View>
          <Text style={settingLabelStyle}>{label}</Text>
        </View>
        <View style={intervalRowStyle}>
          <Text style={timePickerValueStyle}>{value}</Text>
          <Text style={timePickerArrowStyle}>›</Text>
        </View>
      </View>
    </GlassCard>
  );

  const showTimePicker = (
    key: 'do_not_disturb_start' | 'do_not_disturb_end',
  ) => {
    Alert.alert('提示', '时间选择器需要集成原生组件，这里使用预设时间选项', [
      {
        text: '20:00',
        onPress: () => setSettings(prev => ({ ...prev, [key]: '20:00' })),
      },
      {
        text: '21:00',
        onPress: () => setSettings(prev => ({ ...prev, [key]: '21:00' })),
      },
      {
        text: '22:00',
        onPress: () => setSettings(prev => ({ ...prev, [key]: '22:00' })),
      },
      {
        text: '23:00',
        onPress: () => setSettings(prev => ({ ...prev, [key]: '23:00' })),
      },
      { text: '取消', style: 'cancel' },
    ]);
  };

  const showIntervalPicker = () => {
    Alert.alert(
      '选择推送间隔',
      '',
      intervalOptions.map((opt, idx) => ({
        text: opt,
        onPress: () =>
          setSettings(prev => ({
            ...prev,
            push_interval: intervalValues[idx],
          })),
      })),
    );
  };

  return (
    <View style={containerStyle}>
      {/* 头部 */}
      <View style={headerStyle}>
        <Text style={headerTitleStyle}>推送设置</Text>
        <Text style={headerSubtitleStyle}>自定义通知偏好</Text>
      </View>

      <ScrollView
        style={{ flex: 1, paddingTop: spacing.xs }}
        showsVerticalScrollIndicator={false}
      >
        {/* 通知类型 */}
        <GlassCard
          title="通知类型"
          intensity="medium"
          style={sectionCardStyle}
        >
          <SettingItem
            icon="🎉"
            label="聚会通知"
            desc="聚会相关消息推送"
            value={settings.party_enabled}
            onToggle={() => toggleSetting('party_enabled')}
          />
          <SettingItem
            icon="💬"
            label="评论通知"
            desc="收到评论时推送"
            value={settings.comment_enabled}
            onToggle={() => toggleSetting('comment_enabled')}
          />
          <SettingItem
            icon="❤️"
            label="点赞通知"
            desc="收到点赞时推送"
            value={settings.like_enabled}
            onToggle={() => toggleSetting('like_enabled')}
          />
          <SettingItem
            icon="👥"
            label="关注通知"
            desc="新增关注时推送"
            value={settings.follow_enabled}
            onToggle={() => toggleSetting('follow_enabled')}
          />
          <SettingItem
            icon="✉️"
            label="私信通知"
            desc="收到私信时推送"
            value={settings.message_enabled}
            onToggle={() => toggleSetting('message_enabled')}
          />
          <SettingItem
            icon="🎁"
            label="活动通知"
            desc="VIP活动推送"
            value={settings.activity_enabled}
            onToggle={() => toggleSetting('activity_enabled')}
          />
          <SettingItem
            icon="🔔"
            label="系统通知"
            desc="系统消息推送"
            value={settings.system_enabled}
            onToggle={() => toggleSetting('system_enabled')}
          />
        </GlassCard>

        {/* 推送时间 */}
        <GlassCard
          title="推送时间"
          intensity="medium"
          style={sectionCardStyle}
        >
          <SettingItem
            icon="🕐"
            label="免打扰时段"
            desc="设置不接收通知的时间段"
            value={settings.do_not_disturb_enabled}
            onToggle={() => toggleSetting('do_not_disturb_enabled')}
          />
          {settings.do_not_disturb_enabled && (
            <>
              <TimePickerItem
                icon="🌙"
                label="开始时间"
                value={settings.do_not_disturb_start || '22:00'}
                onPress={() => showTimePicker('do_not_disturb_start')}
              />
              <TimePickerItem
                icon="🌅"
                label="结束时间"
                value={settings.do_not_disturb_end || '08:00'}
                onPress={() => showTimePicker('do_not_disturb_end')}
              />
            </>
          )}
        </GlassCard>

        {/* 推送频率 */}
        <GlassCard
          title="推送频率"
          intensity="medium"
          style={sectionCardStyle}
        >
          <SettingItem
            icon="📊"
            label="聚合推送"
            desc="合并相似通知"
            value={settings.aggregate_enabled}
            onToggle={() => toggleSetting('aggregate_enabled')}
          />
          <GlassCard onPress={showIntervalPicker} intensity="light">
            <View style={timePickerCardStyle}>
              <View style={settingItemRowStyle}>
                <View style={iconContainerStyle}>
                  <Text style={iconTextStyle}>⏰</Text>
                </View>
                <View>
                  <Text style={settingLabelStyle}>推送间隔</Text>
                  <Text style={settingDescStyle}>设置推送最小间隔</Text>
                </View>
              </View>
              <View style={intervalRowStyle}>
                <Text style={timePickerValueStyle}>
                  {getIntervalText(settings.push_interval)}
                </Text>
                <Text style={timePickerArrowStyle}>›</Text>
              </View>
            </View>
          </GlassCard>
        </GlassCard>

        {/* 操作按钮 */}
        <View style={actionButtonsStyle}>
          <GlassButton
            title={loading ? '保存中...' : '保存设置'}
            onPress={saveSettings}
            variant="primary"
            size="large"
            disabled={loading}
            fullWidth
            style={Shadows.primary}
          />
          <GlassButton
            title="恢复默认"
            onPress={resetSettings}
            variant="ghost"
            size="large"
            fullWidth
            style={resetBtnStyle}
          />
        </View>
      </ScrollView>
    </View>
  );
}
