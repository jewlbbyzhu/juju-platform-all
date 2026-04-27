/**
 * 聚聚 (JUJU) App - 私聊页面
 * 2026 设计系统重构版
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {

  FlatList,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

import {
  useTheme,
  spacing,





} from '../theme';
import {
  ChatBackground,
  ChatHeader,
  ChatMessageItem,
  ChatInputArea,
  Message,
} from '../components/privateChat';

type RouteParams = {
  conversationId?: string | number;
  userName?: string;
  userInfo?: object;
};

export default function PrivateChatScreen(): React.JSX.Element {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList<Message>>(null);
  const [newMessageId, setNewMessageId] = useState<string | null>(null);
  const userName = route.params?.userName || '用户';

  useEffect(() => {
    setMessages([
      {
        id: '1',
        content: '你好！对今天的活动感兴趣吗？',
        is_self: false,
        created_at: new Date(Date.now() - 3600000).toISOString(),
        avatar: 'https://i.pravatar.cc/150?u=1',
      },
      {
        id: '2',
        content: '是的，我想了解一下详情',
        is_self: true,
        created_at: new Date(Date.now() - 3000000).toISOString(),
        avatar: 'https://i.pravatar.cc/150?u=2',
      },
    ]);
  }, []);

  const sendMessage = useCallback(async () => {
    if (!inputText.trim()) return;
    const newMsg: Message = {
      id: Date.now().toString(),
      content: inputText,
      is_self: true,
      created_at: new Date().toISOString(),
      avatar: 'https://i.pravatar.cc/150?u=2',
    };
    setNewMessageId(newMsg.id);
    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
    setTimeout(() => {
      setNewMessageId(null);
    }, 500);
  }, [inputText]);

  const renderMessage = useCallback(
    ({ item, index }: { item: Message; index: number }) => (
      <ChatMessageItem
        message={item}
        index={index}
        isNew={item.id === newMessageId}
      />
    ),
    [newMessageId],
  );

  // 使用设计系统替代内联样式
  const safeAreaStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background.primary,
  };

  const keyboardViewStyle: ViewStyle = {
    flex: 1,
  };

  const listContentStyle: ViewStyle = {
    padding: spacing.lg,
    paddingBottom: spacing.sm,
  };

  return (
    <SafeAreaView style={safeAreaStyle} edges={['top']}>
      <ChatBackground />
      <ChatHeader
        userName={userName}
        isOnline={true}
        onBackPress={() => navigation.goBack()}
      />
      <KeyboardAvoidingView
        style={keyboardViewStyle}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={listContentStyle}
          showsVerticalScrollIndicator={false}
        />
        <ChatInputArea
          value={inputText}
          onChangeText={setInputText}
          onSend={sendMessage}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
