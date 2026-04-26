import React, { memo } from 'react';
import { View, Text, TextInput } from 'react-native';
import { useTheme } from '../../theme';
import { GlassCard } from '../GlassCard';
import { contactFormStyles as styles } from '../../styles/ticketSelect';

interface ContactFormProps {
  name: string;
  phone: string;
  onNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
}

export const ContactForm: React.FC<ContactFormProps> = memo(
  ({ name, phone, onNameChange, onPhoneChange }) => {
    const { colors } = useTheme();

    return (
      <GlassCard intensity="light" title="联系人信息">
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>姓名</Text>
          <TextInput
            style={styles.input}
            placeholder="请输入联系人姓名"
            placeholderTextColor={colors.text.tertiary}
            value={name}
            onChangeText={onNameChange}
            autoCapitalize="none"
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>手机号</Text>
          <TextInput
            style={styles.input}
            placeholder="请输入联系电话"
            placeholderTextColor={colors.text.tertiary}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={onPhoneChange}
          />
        </View>
      </GlassCard>
    );
  },
);

ContactForm.displayName = 'ContactForm';
