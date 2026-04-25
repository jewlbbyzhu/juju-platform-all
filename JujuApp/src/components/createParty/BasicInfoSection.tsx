import React, { useCallback, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTheme } from '../../theme';
import { BorderRadius, Border } from '../../theme/shadows';
import { GlassCard } from '../GlassCard';
import { TagSelector } from './TagSelector';

interface FormData {
  title: string;
  description: string;
  category: string;
  theme: string;
}

interface BasicInfoSectionProps {
  form: FormData;
  updateForm: (key: keyof FormData, value: any) => void;
  index?: number;
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  form,
  updateForm,
  index = 1,
}) => {
  const { colors, spacing, typography } = useTheme();
  const styles = getStyles(colors, spacing, typography);

  const CATEGORIES = useMemo(
    () => [
      { key: 'party', label: '🎉 派对', color: colors.primary.main },
      { key: 'music', label: '🎵 音乐', color: colors.secondary.main },
      { key: 'sports', label: '⚽ 运动', color: colors.status.success },
      { key: 'art', label: '🎨 艺术', color: colors.accent.pink },
      { key: 'food', label: '🍜 美食', color: colors.accent.orange },
    ],
    [colors],
  );

  const THEMES = useMemo(
    () => [
      { key: 'entertainment', label: '🎪 娱乐' },
      { key: 'gaming', label: '🎮 游戏' },
      { key: 'social', label: '🎭 社交' },
      { key: 'outdoor', label: '🏃 户外' },
    ],
    [],
  );

  const handleTitleChange = useCallback(
    (text: string) => updateForm('title', text),
    [updateForm],
  );

  const handleDescriptionChange = useCallback(
    (text: string) => updateForm('description', text),
    [updateForm],
  );

  const handleCategorySelect = useCallback(
    (key: string) => updateForm('category', key),
    [updateForm],
  );

  const handleThemeSelect = useCallback(
    (key: string) => updateForm('theme', key),
    [updateForm],
  );

  return (
    <Animated.View entering={FadeInUp.duration(400).delay(index * 100)}>
      <GlassCard style={styles.card} intensity="light">
        <Text style={styles.sectionTitle}>基本信息</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            活动标题 <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="给你的聚会起个吸引人的名字"
            placeholderTextColor={colors.text.tertiary}
            value={form.title}
            onChangeText={handleTitleChange}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            分类 <Text style={styles.required}>*</Text>
          </Text>
          <TagSelector
            options={CATEGORIES}
            selected={form.category}
            onSelect={handleCategorySelect}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            主题 <Text style={styles.required}>*</Text>
          </Text>
          <TagSelector
            options={THEMES}
            selected={form.theme}
            onSelect={handleThemeSelect}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            活动描述 <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="详细描述你的聚会内容、流程安排等..."
            placeholderTextColor={colors.text.tertiary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={form.description}
            onChangeText={handleDescriptionChange}
          />
        </View>
      </GlassCard>
    </Animated.View>
  );
};

const getStyles = (colors: any, spacing: any, typography: any) =>
  StyleSheet.create({
    card: {
      marginBottom: spacing.md,
    },
    sectionTitle: {
      ...typography.size.h4,
      fontWeight: typography.weight.bold,
      color: colors.text.primary,
      marginBottom: spacing.md,
    },
    inputGroup: {
      marginBottom: spacing.md,
    },
    inputLabel: {
      ...typography.body2,
      color: colors.text.secondary,
      marginBottom: spacing.xs,
      fontWeight: typography.weight.medium,
    },
    required: {
      color: colors.status.error,
    },
    input: {
      backgroundColor: colors.background.input,
      borderRadius: BorderRadius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      ...typography.body,
      color: colors.text.primary,
      borderWidth: Border.width.normal,
      borderColor: colors.border,
    },
    textArea: {
      height: 100,
      paddingTop: spacing.sm,
      textAlignVertical: 'top',
    },
  });

export default BasicInfoSection;
