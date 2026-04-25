import React, { useCallback } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTheme } from '../../theme';
import { BorderRadius, Border } from '../../theme/shadows';
import { GlassCard } from '../GlassCard';

interface FormData {
  address: string;
  city: string;
  start_time: string;
  end_time: string;
  max_participants: string;
}

interface LocationTimeSectionProps {
  form: FormData;
  updateForm: (key: keyof FormData, value: any) => void;
  index?: number;
}

export const LocationTimeSection: React.FC<LocationTimeSectionProps> = ({
  form,
  updateForm,
  index = 2,
}) => {
  const { colors, spacing, typography } = useTheme();
  const styles = getStyles(colors, spacing, typography);

  const handleAddressChange = useCallback(
    (text: string) => updateForm('address', text),
    [updateForm],
  );

  const handleCityChange = useCallback(
    (text: string) => updateForm('city', text),
    [updateForm],
  );

  const handleParticipantsChange = useCallback(
    (text: string) => updateForm('max_participants', text),
    [updateForm],
  );

  const handleStartTimeChange = useCallback(
    (text: string) => updateForm('start_time', text),
    [updateForm],
  );

  const handleEndTimeChange = useCallback(
    (text: string) => updateForm('end_time', text),
    [updateForm],
  );

  return (
    <Animated.View entering={FadeInUp.duration(400).delay(index * 100)}>
      <GlassCard style={styles.card} intensity="light">
        <Text style={styles.sectionTitle}>时间地点</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            活动地点 <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="详细地址，方便参与者找到"
            placeholderTextColor={colors.text.tertiary}
            value={form.address}
            onChangeText={handleAddressChange}
          />
        </View>

        <View style={styles.row}>
          <View
            style={[styles.inputGroup, styles.halfWidth, styles.rightMargin]}
          >
            <Text style={styles.inputLabel}>城市</Text>
            <TextInput
              style={styles.input}
              placeholder="如：北京"
              placeholderTextColor={colors.text.tertiary}
              value={form.city}
              onChangeText={handleCityChange}
            />
          </View>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.inputLabel}>人数上限</Text>
            <TextInput
              style={styles.input}
              placeholder="50"
              placeholderTextColor={colors.text.tertiary}
              keyboardType="numeric"
              value={form.max_participants}
              onChangeText={handleParticipantsChange}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View
            style={[styles.inputGroup, styles.halfWidth, styles.rightMargin]}
          >
            <Text style={styles.inputLabel}>
              开始时间 <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="2026-04-15 14:00"
              placeholderTextColor={colors.text.tertiary}
              value={form.start_time}
              onChangeText={handleStartTimeChange}
            />
          </View>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.inputLabel}>结束时间</Text>
            <TextInput
              style={styles.input}
              placeholder="2026-04-15 18:00"
              placeholderTextColor={colors.text.tertiary}
              value={form.end_time}
              onChangeText={handleEndTimeChange}
            />
          </View>
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
    row: {
      flexDirection: 'row',
    },
    halfWidth: {
      flex: 1,
    },
    rightMargin: {
      marginRight: spacing.md,
    },
  });

export default LocationTimeSection;
