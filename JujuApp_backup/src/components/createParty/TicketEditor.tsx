import React, { useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import Animated, { FadeInUp, FadeOut, Layout } from 'react-native-reanimated';
import { useTheme } from '../../theme';
import { BorderRadius, Border } from '../../theme/shadows';
import { GlassCard } from '../GlassCard';

export interface TicketType {
  name: string;
  type: number;
  price: string;
  available_count: string;
}

interface TicketEditorProps {
  ticketTypes: TicketType[];
  onUpdateTicket: (index: number, field: string, value: string) => void;
  onAddTicket: () => void;
  onRemoveTicket: (index: number) => void;
  index?: number;
}

export const TicketEditor: React.FC<TicketEditorProps> = ({
  ticketTypes,
  onUpdateTicket,
  onAddTicket,
  onRemoveTicket,
  index = 3,
}) => {
  const { colors, spacing, typography } = useTheme();
  const styles = getStyles(colors, spacing, typography);

  const handleNameChange = useCallback(
    (idx: number, text: string) => onUpdateTicket(idx, 'name', text),
    [onUpdateTicket],
  );

  const handlePriceChange = useCallback(
    (idx: number, text: string) => onUpdateTicket(idx, 'price', text),
    [onUpdateTicket],
  );

  const handleCountChange = useCallback(
    (idx: number, text: string) => onUpdateTicket(idx, 'available_count', text),
    [onUpdateTicket],
  );

  const handleRemove = useCallback(
    (idx: number) => {
      if (ticketTypes.length <= 1) {
        Alert.alert('提示', '至少需要保留一种票型');
        return;
      }
      onRemoveTicket(idx);
    },
    [ticketTypes.length, onRemoveTicket],
  );

  return (
    <Animated.View entering={FadeInUp.duration(400).delay(index * 100)}>
      <GlassCard style={styles.card} intensity="light">
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>票型设置</Text>
          <TouchableOpacity onPress={onAddTicket}>
            <Text style={styles.addButton}>+ 添加票型</Text>
          </TouchableOpacity>
        </View>

        <Animated.View layout={Layout.springify()}>
          {ticketTypes.map((ticket, idx) => (
            <Animated.View
              key={idx}
              entering={FadeInUp.duration(300)}
              exiting={FadeOut.duration(200)}
              layout={Layout.springify()}
              style={styles.ticketRow}
            >
              <View style={styles.ticketInputs}>
                <TextInput
                  style={[styles.input, styles.ticketInput]}
                  placeholder="票型名称"
                  placeholderTextColor={colors.text.tertiary}
                  value={ticket.name}
                  onChangeText={text => handleNameChange(idx, text)}
                />
                <TextInput
                  style={[styles.input, styles.ticketInput]}
                  placeholder="价格"
                  placeholderTextColor={colors.text.tertiary}
                  keyboardType="numeric"
                  value={ticket.price}
                  onChangeText={text => handlePriceChange(idx, text)}
                />
                <TextInput
                  style={[styles.input, styles.ticketInput]}
                  placeholder="数量"
                  placeholderTextColor={colors.text.tertiary}
                  keyboardType="numeric"
                  value={ticket.available_count}
                  onChangeText={text => handleCountChange(idx, text)}
                />
              </View>
              {ticketTypes.length > 1 && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemove(idx)}
                >
                  <Text style={styles.removeIcon}>🗑️</Text>
                </TouchableOpacity>
              )}
            </Animated.View>
          ))}
        </Animated.View>
      </GlassCard>
    </Animated.View>
  );
};

const getStyles = (colors: any, spacing: any, typography: any) =>
  StyleSheet.create({
    card: {
      marginBottom: spacing.md,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    sectionTitle: {
      ...typography.size.h4,
      fontWeight: typography.weight.bold,
      color: colors.text.primary,
    },
    addButton: {
      color: colors.primary.main,
      ...typography.body2,
      fontWeight: typography.weight.semibold,
    },
    ticketRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    ticketInputs: {
      flex: 1,
      flexDirection: 'row',
      gap: spacing.xs,
    },
    ticketInput: {
      flex: 1,
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
    removeButton: {
      padding: spacing.sm,
      marginLeft: spacing.xs,
    },
    removeIcon: {
      ...typography.size.h3,
    },
  });

export default TicketEditor;
