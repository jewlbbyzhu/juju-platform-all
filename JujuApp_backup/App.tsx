import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AppProvider } from './src/context/AppContext';

// 测试模式配置 - 开发环境下可跳过登录
const TEST_MODE = false; // 设置为 true 启用测试模式（自动登录）

// Tab Screens
import HomeScreen from './src/screens/HomeScreen';
import DownloadScreen from "./src/screens/DownloadScreen";
import ThemePreviewScreen from "./src/screens/ThemePreviewScreen";
import TicketInventoryScreen from "./src/screens/TicketInventoryScreen";
import TicketStatsScreen from "./src/screens/TicketStatsScreen";
import TicketStatsDetailScreen from "./src/screens/TicketStatsDetailScreen";
import EvoMapDemoScreen from "./src/screens/EvoMapDemoScreen";

import MyOrdersScreen from './src/screens/MyOrdersScreen';
import MyTicketsScreen from './src/screens/MyTicketsScreen';
import ProfileScreen from './src/screens/ProfileScreen';

// Stack Screens
import LoginScreen from './src/screens/LoginScreen';
import PartyDetailScreen from './src/screens/PartyDetailScreen';
import TicketSelectionScreen from './src/screens/TicketSelectionScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import OrderSuccessScreen from './src/screens/OrderSuccessScreen';
import OrderDetailScreen from './src/screens/OrderDetailScreen';
import CreatePartyScreen from './src/screens/CreatePartyScreen';
import WalletScreen from './src/screens/WalletScreen';
import MapScreen from './src/screens/MapScreen';
import LocationPickerScreen from './src/screens/LocationPickerScreen';
import PrivateChatScreen from './src/screens/PrivateChatScreen';
import GroupChatScreen from './src/screens/GroupChatScreen';
import GroupChatListScreen from './src/screens/GroupChatListScreen';
import CustomerServiceScreen from './src/screens/CustomerServiceScreen';
import SharePosterScreen from './src/screens/SharePosterScreen';
import FansScreen from './src/screens/FansScreen';
import FollowingScreen from './src/screens/FollowingScreen';
import RefundApplyScreen from './src/screens/RefundApplyScreen';
import ReviewScreen from './src/screens/ReviewScreen';
import SocialScreen from './src/screens/SocialScreen';
import CommunityScreen from './src/screens/CommunityScreen';
import CreatePostScreen from './src/screens/CreatePostScreen';
import CreateGroupScreen from './src/screens/CreateGroupScreen';
import MyPartiesScreen from './src/screens/MyPartiesScreen';
import ChatListScreen from './src/screens/ChatListScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import UserProfileScreen from './src/screens/UserProfileScreen';
import VIPCenterScreen from './src/screens/VIPCenterScreen';
import VIPLevelsScreen from './src/screens/VIPLevelsScreen';
import VIPPointsScreen from './src/screens/VIPPointsScreen';
import VIPPrivilegesScreen from './src/screens/VIPPrivilegesScreen';
import VIPHistoryScreen from './src/screens/VIPHistoryScreen';
import VIPEventsScreen from './src/screens/VIPEventsScreen';
import VIPStatsScreen from './src/screens/VIPStatsScreen';
import InviteCodeScreen from './src/screens/InviteCodeScreen';
import ScanTicketScreen from './src/screens/ScanTicketScreen';
import ScanHistoryScreen from './src/screens/ScanHistoryScreen';
import PushSettingsScreen from './src/screens/PushSettingsScreen';
import PushMessagesScreen from './src/screens/PushMessagesScreen';
import TagManageScreen from './src/screens/TagManageScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// 定义 Tab 图标映射
const TAB_ICONS: Record<string, string> = {
  Home: '🔍',
  Community: '💬',
  Orders: '📋',
  Tickets: '🎫',
  Profile: '👤',
};

// Tab 屏幕选项配置
const TAB_SCREEN_OPTIONS = {
  tabBarActiveTintColor: '#FF6B6B',
  tabBarInactiveTintColor: '#999',
  headerShown: false,
};

function MainTabs() {
  return (
    <Tab.Navigator
      id="MainTabs"
      screenOptions={({ route }) => ({
        // eslint-disable-next-line react/no-unstable-nested-components
        tabBarIcon: ({ size, color }: { size: number; color: string }) => (
          <Text style={{ fontSize: size, color }}>{TAB_ICONS[route.name] || '🏠'}</Text>
        ),
        ...TAB_SCREEN_OPTIONS,
      })}
    >
      <Tab.Screen name='Home' component={HomeScreen} options={{ tabBarLabel: '发现' }} />
      <Tab.Screen name='Community' component={CommunityScreen} options={{ tabBarLabel: '社区' }} />
      <Tab.Screen name='Orders' component={MyOrdersScreen} options={{ tabBarLabel: '订单' }} />
      <Tab.Screen name='Tickets' component={MyTicketsScreen} options={{ tabBarLabel: '票券' }} />
      <Tab.Screen name='Profile' component={ProfileScreen} options={{ tabBarLabel: '我的' }} />
    </Tab.Navigator>
  );
}

// 测试模式：自动登录（仅开发环境使用）
const setupTestMode = async () => {
  if (TEST_MODE) {
    const testUser = {
      id: 1,
      nickname: '测试用户',
      avatar: '',
      phone: '13800138000',
      isVip: true,
      vipLevel: 3,
    };
    await AsyncStorage.setItem('token', 'test-token-for-development-only');
    await AsyncStorage.setItem('userInfo', JSON.stringify(testUser));
    return true;
  }
  return false;
};

// 检查登录状态
const checkAuth = async () => {
  const token = await AsyncStorage.getItem('token');
  return !!token;
};

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const init = async () => {
      // 先尝试设置测试模式
      await setupTestMode();
      // 检查登录状态
      const loggedIn = await checkAuth();
      setIsLoggedIn(loggedIn);
      setIsReady(true);
    };
    init();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' }}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  return (
    <AppProvider>
      <NavigationContainer>
        <Stack.Navigator
          id="RootStack"
          initialRouteName={isLoggedIn ? "Main" : "Login"}
          screenOptions={{
            headerStyle: { backgroundColor: '#0a0a0a' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        >
          {/* Auth */}
          <Stack.Screen name='Login' component={LoginScreen} options={{ headerShown: false }} />
          
      <Stack.Screen name="Download" component={DownloadScreen} options={{ title: "下载" }} />
      <Stack.Screen name="ThemePreview" component={ThemePreviewScreen} options={{ title: "主题预览" }} />
      <Stack.Screen name="TicketInventory" component={TicketInventoryScreen} options={{ title: "票型库存" }} />
      <Stack.Screen name="TicketStats" component={TicketStatsScreen} options={{ title: "票务统计" }} />
      <Stack.Screen name="TicketStatsDetail" component={TicketStatsDetailScreen} options={{ title: "统计详情" }} />
      <Stack.Screen name="EvoMapDemo" component={EvoMapDemoScreen} options={{ title: "地图演示" }} />
          {/* Main App */}
          <Stack.Screen name='Main' component={MainTabs} options={{ headerShown: false }} />
          
          {/* Party & Order */}
          <Stack.Screen name='PartyDetail' component={PartyDetailScreen} options={{ title: '聚会详情' }} />
          <Stack.Screen name='MyParties' component={MyPartiesScreen} options={{ title: '我的聚会' }} />
          <Stack.Screen name='TicketSelection' component={TicketSelectionScreen} options={{ title: '选择票型' }} />
          <Stack.Screen name='CreateParty' component={CreatePartyScreen} options={{ title: '创建聚会' }} />
          <Stack.Screen name='Payment' component={PaymentScreen} options={{ title: '确认支付' }} />
          <Stack.Screen name='OrderSuccess' component={OrderSuccessScreen} options={{ title: '支付成功' }} />
          <Stack.Screen name='OrderDetail' component={OrderDetailScreen} options={{ title: '订单详情' }} />
          <Stack.Screen name='RefundApply' component={RefundApplyScreen} options={{ title: '申请退款' }} />
          <Stack.Screen name='Review' component={ReviewScreen} options={{ title: '评价' }} />
          
          {/* Wallet & VIP */}
          <Stack.Screen name='Wallet' component={WalletScreen} options={{ title: '我的钱包' }} />
          <Stack.Screen name='VIPCenter' component={VIPCenterScreen} options={{ title: 'VIP中心' }} />
          <Stack.Screen name='VIPLevels' component={VIPLevelsScreen} options={{ title: 'VIP等级' }} />
          <Stack.Screen name='VIPPoints' component={VIPPointsScreen} options={{ title: 'VIP积分' }} />
          <Stack.Screen name='VIPPrivileges' component={VIPPrivilegesScreen} options={{ title: 'VIP特权' }} />
          <Stack.Screen name='VIPHistory' component={VIPHistoryScreen} options={{ title: 'VIP历史' }} />
          <Stack.Screen name='VIPEvents' component={VIPEventsScreen} options={{ title: 'VIP活动' }} />
          <Stack.Screen name='VIPStats' component={VIPStatsScreen} options={{ title: 'VIP统计' }} />
          
          {/* Map & Location */}
          <Stack.Screen name='Map' component={MapScreen} options={{ title: '地图' }} />
          <Stack.Screen name='LocationPicker' component={LocationPickerScreen} options={{ title: '选择位置' }} />
          
          {/* Chat & Social */}
          <Stack.Screen name='ChatList' component={ChatListScreen} options={{ title: '消息列表' }} />
          <Stack.Screen name='PrivateChat' component={PrivateChatScreen} options={{ title: '私聊' }} />
          <Stack.Screen name='GroupChat' component={GroupChatScreen} options={{ title: '群聊' }} />
          <Stack.Screen name='GroupChatList' component={GroupChatListScreen} options={{ title: '群聊列表' }} />
          <Stack.Screen name='Community' component={CommunityScreen} options={{ title: '社区' }} />
          <Stack.Screen name='CreatePost' component={CreatePostScreen} options={{ title: '发布动态' }} />
          <Stack.Screen name='CreateGroup' component={CreateGroupScreen} options={{ title: '创建群组' }} />
          <Stack.Screen name='Social' component={SocialScreen} options={{ title: '社交' }} />
          <Stack.Screen name='Fans' component={FansScreen} options={{ title: '我的粉丝' }} />
          <Stack.Screen name='Following' component={FollowingScreen} options={{ title: '我的关注' }} />
          <Stack.Screen name='UserProfile' component={UserProfileScreen} options={{ title: '用户资料' }} />
          
          {/* Other */}
          <Stack.Screen name='CustomerService' component={CustomerServiceScreen} options={{ title: '客服中心' }} />
          <Stack.Screen name='SharePoster' component={SharePosterScreen} options={{ title: '分享海报' }} />
          <Stack.Screen name='Notifications' component={NotificationsScreen} options={{ title: '消息中心' }} />
          <Stack.Screen name='MyOrders' component={MyOrdersScreen} options={{ title: '我的订单' }} />
          <Stack.Screen name='MyTickets' component={MyTicketsScreen} options={{ title: '我的票券' }} />
          <Stack.Screen name='Settings' component={PushSettingsScreen} options={{ title: '设置' }} />
          <Stack.Screen name='Help' component={CustomerServiceScreen} options={{ title: '帮助与反馈' }} />
          <Stack.Screen name='InviteCode' component={InviteCodeScreen} options={{ title: '邀请码' }} />
          <Stack.Screen name='ScanTicket' component={ScanTicketScreen} options={{ title: '扫码检票' }} />
          <Stack.Screen name='ScanHistory' component={ScanHistoryScreen} options={{ title: '检票记录' }} />
          <Stack.Screen name='PushSettings' component={PushSettingsScreen} options={{ title: '推送设置' }} />
          <Stack.Screen name='PushMessages' component={PushMessagesScreen} options={{ title: '推送消息' }} />
          <Stack.Screen name='TagManage' component={TagManageScreen} options={{ title: '标签管理' }} />
          <Stack.Screen name='Favorites' component={FavoritesScreen} options={{ title: '我的收藏' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}
