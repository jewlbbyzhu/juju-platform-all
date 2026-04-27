import { StyleSheet } from 'react-native';
import { colors, spacing, typography, layout, BorderRadius, Border } from '../theme';

export const ticketSelectStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: typography.size.h4,
    color: colors.text.primary,
  },
  headerTitle: {
    fontSize: typography.size.h3,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginHorizontal: layout.screenPadding,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.size.h4,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    marginHorizontal: spacing.xs,
    marginBottom: spacing.md,
  },
  bottomSpacer: {
    height: spacing['5xl'] + spacing['4xl'],
  },
});

export const ticketCardStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.card,
    borderRadius: BorderRadius.xl,
    marginBottom: spacing.md,
    borderWidth: Border.width.thick,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  cardSelected: {
    borderColor: colors.primary.main,
  },
  cardVip: {
    borderColor: colors.accent.gold,
  },
  gradientBar: {
    height: spacing.xs,
    width: '100%',
  },
  content: {
    padding: spacing.lg,
  },
  vipBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: BorderRadius.md,
    zIndex: 1,
  },
  vipBadgeText: {
    fontSize: typography.size.small,
    fontWeight: typography.weight.bold,
    color: colors.text.inverse,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  nameSection: {
    flex: 1,
  },
  name: {
    fontSize: typography.size.h3,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  remainingBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: BorderRadius.sm,
    backgroundColor: colors.overlay,
  },
  remaining: {
    fontSize: typography.size.caption,
    color: colors.status.warning,
  },
  priceSection: {
    alignItems: 'flex-end',
  },
  originalPrice: {
    fontSize: typography.size.caption,
    color: colors.text.tertiary,
    textDecorationLine: 'line-through',
    marginBottom: spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceTag: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: BorderRadius.md,
  },
  currency: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
    color: colors.text.inverse,
  },
  price: {
    fontSize: typography.size.h2,
    fontWeight: typography.weight.bold,
    color: colors.text.inverse,
  },
  description: {
    fontSize: typography.size.body2,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  featuresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: BorderRadius.sm,
    backgroundColor: colors.overlay,
    gap: spacing.xs,
  },
  featureIcon: {
    fontSize: typography.size.caption,
    color: colors.status.success,
  },
  featureText: {
    fontSize: typography.size.caption,
    color: colors.text.secondary,
  },
  selectedIndicator: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: BorderRadius.md,
  },
  selectedText: {
    fontSize: typography.size.small,
    fontWeight: typography.weight.bold,
    color: colors.text.inverse,
  },
});

export const quantitySelectorStyles = StyleSheet.create({
  container: {
    marginHorizontal: layout.screenPadding,
    marginBottom: spacing.lg,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.md,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    fontSize: typography.size.h2,
    fontWeight: typography.weight.bold,
    color: colors.primary.main,
  },
  buttonTextDisabled: {
    color: colors.text.tertiary,
  },
  display: {
    minWidth: 50,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.tertiary,
    borderRadius: BorderRadius.md,
  },
  quantityText: {
    fontSize: typography.size.h3,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
});

export const contactFormStyles = StyleSheet.create({
  container: {
    marginHorizontal: layout.screenPadding,
    marginBottom: spacing.lg,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: typography.size.caption,
    fontWeight: typography.weight.medium,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  input: {
    height: 48,
    borderRadius: BorderRadius.md,
    paddingHorizontal: spacing.lg,
    fontSize: typography.size.body,
    color: colors.text.primary,
    backgroundColor: colors.background.input,
  },
});

export const priceBreakdownStyles = StyleSheet.create({
  container: {
    marginHorizontal: layout.screenPadding,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: typography.size.body,
    color: colors.text.secondary,
  },
  value: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
  },
});

export const paymentBarStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    paddingBottom: spacing['3xl'],
    backgroundColor: colors.background.card,
    borderTopWidth: Border.width.normal,
    borderTopColor: colors.border,
  },
  totalSection: {
    flex: 1,
  },
  totalLabel: {
    fontSize: typography.size.caption,
    color: colors.text.tertiary,
  },
  totalPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  totalCurrency: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
    color: colors.primary.main,
  },
  totalPrice: {
    fontSize: typography.size.h2,
    fontWeight: typography.weight.bold,
    color: colors.primary.main,
  },
});

export const payButtonStyles = StyleSheet.create({
  button: {
    width: 180,
    height: 48,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
    color: colors.text.inverse,
  },
});

export const partyInfoCardStyles = StyleSheet.create({
  container: {
    marginHorizontal: layout.screenPadding,
    marginBottom: spacing.lg,
    flexDirection: 'row',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.size.h4,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: BorderRadius.sm,
    backgroundColor: colors.overlay,
    gap: spacing.xs,
  },
  metaIcon: {
    fontSize: typography.size.caption,
  },
  metaText: {
    fontSize: typography.size.caption,
    color: colors.text.secondary,
    maxWidth: 120,
  },
});
