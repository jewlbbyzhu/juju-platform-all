import React, { useState, useCallback, useEffect, memo } from 'react';
import {

  ScrollView,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme';
import { Header } from './Header';
import { FaqSection } from './FaqSection';
import { ContactSection } from './ContactSection';
import { SkeletonLoader } from './SkeletonLoader';
import { CONVERSATION_ID, SERVICE_NICKNAME } from './types';

type RootStackParamList = {
  PrivateChat: {
    conversationId: string;
    userInfo: { nickname: string };
  };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const CustomerServiceScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const theme = useTheme();
  const colors = theme.colors;
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await new Promise<void>(resolve => setTimeout(resolve, 600));
      setLoading(false);
    };
    init();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise<void>(resolve => setTimeout(resolve, 800));
    setRefreshing(false);
  }, []);

  const openChat = useCallback(() => {
    navigation.navigate('PrivateChat', {
      conversationId: CONVERSATION_ID,
      userInfo: { nickname: SERVICE_NICKNAME },
    });
  }, [navigation]);

  if (loading) {
    return <SkeletonLoader />;
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary.main}
        />
      }
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <Header />

      <FaqSection />

      <ContactSection onChatPress={openChat} />
    </ScrollView>
  );
};

CustomerServiceScreen.displayName = 'CustomerServiceScreen';

export default CustomerServiceScreen;
