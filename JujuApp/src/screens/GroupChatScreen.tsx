import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Animated, { FadeIn } from 'react-native-reanimated';
import {
  useTheme,
  spacing,
  BorderRadius,



  animation,
} from '../theme';
import { Skeleton } from '../components/Skeleton';
import {
  ChatHeader,
  MessageItem,
  ChatInput,
  EmptyChatState,
  Message,
} from '../components/groupChat';

export default function GroupChatScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [groupInfo] = useState({ name: '群聊', memberCount: 0 });
  const flatListRef = useRef<Animated.FlatList<Message>>(null);

  const sendMessage = useCallback(async () => {
    if (!inputText.trim()) return;
    const newMsg: Message = {
      id: Date.now().toString(),
      content: inputText,
      is_self: true,
      userName: '我',
      created_at: new Date().toISOString(),
      avatar: 'https://via.placeholder.com/40',
    };
    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [inputText]);

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleMorePress = useCallback(() => {}, []);

  const renderMessage = useCallback(
    ({ item, index }: { item: Message; index: number }) => (
      <MessageItem message={item} index={index} />
    ),
    [],
  );

  const keyExtractor = useCallback((item: Message) => item.id, []);

  const renderEmptyState = useCallback(() => <EmptyChatState />, []);

  // 使用设计系统替代内联样式
  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background.primary,
  };

  const loadingContainerStyle: ViewStyle = {
    flex: 1,
    padding: spacing.lg,
  };

  const skeletonSelfStyle: ViewStyle = {
    marginTop: spacing.md,
    alignSelf: 'flex-end',
  };

  const skeletonMarginStyle: ViewStyle = {
    marginTop: spacing.md,
  };

  const listContentStyle: ViewStyle = {
    padding: spacing.lg,
    flexGrow: 1,
  };

  return (
    <KeyboardAvoidingView
      style={containerStyle}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ChatHeader
        groupName={groupInfo.name}
        memberCount={groupInfo.memberCount}
        onBackPress={handleBackPress}
        onMorePress={handleMorePress}
      />

      {loading ? (
        <View style={loadingContainerStyle}>
          <Skeleton
            width="80%"
            height={60}
            borderRadius={BorderRadius.lg}
          />
          <Skeleton
            width="60%"
            height={60}
            borderRadius={BorderRadius.lg}
            style={skeletonSelfStyle}
          />
          <Skeleton
            width="70%"
            height={60}
            borderRadius={BorderRadius.lg}
            style={skeletonMarginStyle}
          />
        </View>
      ) : (
        <Animated.FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={keyExtractor}
          contentContainerStyle={listContentStyle}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          entering={FadeIn.duration(animation.duration.normal)}
        />
      )}

      <ChatInput
        value={inputText}
        onChangeText={setInputText}
        onSend={sendMessage}
      />
    </KeyboardAvoidingView>
  );
}
