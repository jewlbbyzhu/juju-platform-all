import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme';

interface CreatePartyHeaderProps {
  index?: number;
}

export const CreatePartyHeader: React.FC<CreatePartyHeaderProps> = ({
  index = 0,
}) => {
  const navigation = useNavigation();
  const { colors, spacing, typography } = useTheme();
  const styles = getStyles(colors, spacing, typography);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <Animated.View
      entering={FadeInDown.duration(400).delay(index * 100)}
      style={styles.container}
    >
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>创建聚会</Text>
      <View style={styles.headerPlaceholder} />
    </Animated.View>
  );
};

const getStyles = (colors: any, spacing: any, typography: any) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      backgroundColor: colors.background.primary,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    backButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    backIcon: {
      ...typography.size.h2,
      color: colors.text.primary,
    },
    headerTitle: {
      ...typography.size.h3,
      fontWeight: typography.weight.semibold,
      color: colors.text.primary,
    },
    headerPlaceholder: {
      width: 40,
    },
  });

export default CreatePartyHeader;
