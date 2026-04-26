import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  Alert,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { tagApi } from '../api/tag';
import { useNavigation } from '@react-navigation/native';
import {
  useTheme,
  Border,
  BorderRadius,
  textStyles,
  spacing,
  typography,
  animation,
} from '../theme';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';

interface Tag {
  id: number;
  name: string;
}

// 2026高颜值设计 - 标签管理页 (设计系统重构版)
export default function TagManageScreen(): React.JSX.Element {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState('');

  const fetchTags = useCallback(async () => {
    try {
      const res = (await tagApi.getTags()) as unknown as { data?: Tag[] };
      if (res.data) {
        setTags(res.data);
      }
    } catch {
      // ignore fetch error
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const handleAddTag = useCallback(async () => {
    if (!newTagName.trim()) return;
    try {
      await tagApi.createTag({ name: newTagName });
      setNewTagName('');
      fetchTags();
    } catch {
      Alert.alert('错误', '添加标签失败');
    }
  }, [newTagName, fetchTags]);

  const handleDeleteTag = useCallback(async (tagId: number) => {
    Alert.alert('确认', '确定删除此标签？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          try {
            await tagApi.deleteTag(tagId);
            fetchTags();
          } catch {
            Alert.alert('错误', '删除标签失败');
          }
        },
      },
    ]);
  }, [fetchTags]);

  // 使用设计系统替代内联样式
  const safeAreaStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background.secondary,
  };

  const headerContainerStyle: ViewStyle = {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  };

  const subtitleStyle: ViewStyle = {
    marginTop: spacing.xs,
  };

  const inputCardStyle: ViewStyle = {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  };

  const inputRowStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  };

  const textInputStyle: TextStyle = {
    flex: 1,
    backgroundColor: colors.background.tertiary,
    color: colors.text.primary,
    padding: spacing.md,
    borderRadius: BorderRadius.md,
    fontSize: typography.size.body,
    borderWidth: Border.width.normal,
    borderColor: colors.primary.main + '20',
  };

  const listContentStyle: ViewStyle = {
    padding: spacing.md,
    paddingTop: 0,
  };

  const tagCardStyle: ViewStyle = {
    marginBottom: spacing.xs,
  };

  const tagRowStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.xs,
  };

  const tagIconContainerStyle: ViewStyle = {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    backgroundColor: colors.primary.main + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  };

  const tagIconTextStyle: TextStyle = {
    color: colors.primary.main,
    fontSize: typography.size.h3,
    fontWeight: typography.weight.bold,
  };

  const tagNameStyle: TextStyle = {
    flex: 1,
    color: colors.text.primary,
    fontSize: typography.size.body,
    fontWeight: typography.weight.medium,
  };

  // deleteButtonStyle removed - was unused

  // deleteButtonTextStyle removed - was unused

  const renderTag = useCallback(
    ({ item }: { item: Tag }) => (
      <GlassCard style={tagCardStyle} intensity="light">
        <View style={tagRowStyle}>
          <View style={tagIconContainerStyle}>
            <Text style={tagIconTextStyle}>#</Text>
          </View>
          <Text style={tagNameStyle}>{item.name}</Text>
          <GlassButton
            title="删除"
            onPress={() => handleDeleteTag(item.id)}
            size="small"
            variant="danger"
          />
        </View>
      </GlassCard>
    ),
    [handleDeleteTag],
  );

  return (
    <SafeAreaView style={safeAreaStyle} edges={['bottom']}>
      <Animated.View
        entering={FadeInUp.duration(animation.duration.normal).delay(100)}
        style={headerContainerStyle}
      >
        <Text style={[textStyles.h2, { color: colors.text.primary }]}>
          标签管理
        </Text>
        <Text
          style={[
            {
              fontSize: typography.size.body2,
              color: colors.text.secondary,
            },
            subtitleStyle,
          ]}
        >
          管理你的兴趣标签
        </Text>
      </Animated.View>

      <Animated.View
        entering={FadeInUp.duration(animation.duration.normal).delay(200)}
      >
        <GlassCard style={inputCardStyle} intensity="medium">
          <View style={inputRowStyle}>
            <TextInput
              style={textInputStyle}
              placeholder="输入新标签名称"
              placeholderTextColor={colors.text.tertiary}
              value={newTagName}
              onChangeText={setNewTagName}
            />
            <GlassButton
              title="添加"
              onPress={handleAddTag}
              size="small"
              variant="primary"
            />
          </View>
        </GlassCard>
      </Animated.View>

      <FlatList
        data={tags}
        renderItem={renderTag}
        keyExtractor={(item: Tag) => item.id.toString()}
        contentContainerStyle={listContentStyle}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
