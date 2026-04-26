import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, spacing, BorderRadius, typography, Border } from '../../theme';
import { GlassCard } from '../GlassCard';
import { GlassButton } from '../GlassButton';

interface TicketResultCardProps {
  ticket: {
    orderNo: string;
    partyTitle: string;
    ticketTypeName: string;
    status: string;
  };
  onUseTicket: () => void;
  onContinue: () => void;
}

export const TicketResultCard: React.FC<TicketResultCardProps> = React.memo(({
  ticket,
  onUseTicket,
  onContinue,
}) => {
  const { colors } = useTheme();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'unused':
        return { label: '未使用', color: colors.status.success, icon: '✓' };
      case 'used':
        return { label: '已使用', color: colors.status.error, icon: '✗' };
      default:
        return { label: '未知', color: colors.text.tertiary, icon: '?' };
    }
  };

  const status = getStatusConfig(ticket.status);
  const styles = getStyles(colors);

  return (
    <GlassCard
      style={styles.card}
      intensity="medium"
      glow
      glowColor={colors.status.success}
    >
      <View style={styles.successBadge}>
        <View
          style={[
            styles.successIcon,
            { backgroundColor: `${colors.status.success}20` },
          ]}
        >
          <Text style={[styles.successIconText, { color: colors.status.success }]}>
            ✓
          </Text>
        </View>
        <Text style={styles.successText}>验证成功</Text>
      </View>

      <View style={styles.ticketInfo}>
        <InfoRow label="活动名称" value={ticket.partyTitle} />
        <InfoRow label="票型" value={ticket.ticketTypeName} />
        <InfoRow label="订单号" value={ticket.orderNo} />
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>状态</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${status.color}20` },
            ]}
          >
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.icon} {status.label}
            </Text>
          </View>
        </View>
      </View>

      {ticket.status === 'unused' && (
        <GlassButton
          title="确认使用"
          onPress={onUseTicket}
          variant="primary"
          size="large"
          fullWidth
          style={styles.useButton}
        />
      )}

      <GlassButton
        title="继续扫码"
        onPress={onContinue}
        variant="secondary"
        size="medium"
        fullWidth
        style={styles.continueButton}
      />
    </GlassCard>
  );
});

TicketResultCard.displayName = 'TicketResultCard';

function InfoRow({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  const styles = infoRowStyles(colors);

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value} numberOfLines={1}>{value}</Text>
    </View>
  );
}

function infoRowStyles(colors: any) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderBottomWidth: Border.width.normal,
      borderBottomColor: colors.text.primary + '0D',
    },
    label: {
      fontSize: typography.size.body2,
      color: colors.text.secondary,
    },
    value: {
      fontSize: typography.size.body2,
      fontWeight: typography.weight.medium,
      color: colors.text.inverse,
      flex: 1,
      textAlign: 'right',
      marginLeft: spacing.md,
    },
  });
}

function getStyles(colors: any) {
  return StyleSheet.create({
    card: {
      padding: spacing['2xl'],
      marginHorizontal: spacing.sm,
    },
    successBadge: {
      alignItems: 'center',
      marginBottom: spacing['2xl'],
    },
    successIcon: {
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    successIconText: {
      fontSize: typography.size.h2,
      fontWeight: typography.weight.bold,
    },
    successText: {
      fontSize: typography.size.h3,
      fontWeight: typography.weight.semibold,
      color: colors.text.inverse,
    },
    ticketInfo: {
      marginBottom: spacing['2xl'],
    },
    statusRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.md,
    },
    statusLabel: {
      fontSize: typography.size.body2,
      color: colors.text.secondary,
    },
    statusBadge: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: BorderRadius.md,
    },
    statusText: {
      fontSize: typography.size.caption,
      fontWeight: typography.weight.semibold,
    },
    useButton: {
      marginBottom: spacing.md,
    },
    continueButton: {
      marginVertical: 0,
    },
  });
}
