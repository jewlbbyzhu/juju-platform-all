import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

// Define all screen parameters
export type RootStackParamList = {
  // Auth
  Login: undefined;
  
  // Main
  Main: undefined;
  
  // Party & Order
  PartyDetail: { partyId: string | number };
  MyParties: undefined;
  TicketSelection: { partyId: string | number; party?: any };
  CreateParty: undefined;
  Payment: { order?: any; party?: any; ticket?: any };
  OrderSuccess: { order?: any };
  OrderDetail: { orderId: string | number; order?: any };
  RefundApply: { orderId: string | number };
  Review: { orderId: string | number };
  
  // Wallet & VIP
  Wallet: undefined;
  VIPCenter: undefined;
  VIPLevels: undefined;
  VIPPoints: undefined;
  VIPPrivileges: undefined;
  VIPHistory: undefined;
  VIPEvents: undefined;
  VIPStats: undefined;
  
  // Map & Location
  Map: undefined;
  LocationPicker: undefined;
  
  // Chat & Social
  ChatList: undefined;
  PrivateChat: { conversationId: string | number; userInfo?: any };
  GroupChat: { groupId: string | number };
  GroupChatList: undefined;
  Community: undefined;
  CreatePost: undefined;
  PostDetail: { postId: number; focusComment?: boolean };
  CreateGroup: undefined;
  Social: undefined;
  Fans: undefined;
  Following: undefined;
  UserProfile: { userId: string | number };
  
  // Other
  CustomerService: { conversationId?: string; userInfo?: any };
  SharePoster: undefined;
  Notifications: undefined;
  InviteCode: undefined;
  ScanTicket: undefined;
  ScanHistory: undefined;
  PushSettings: undefined;
  PushMessages: undefined;
  TagManage: undefined;
  Favorites: undefined;
  
  // Additional screens
  Download: { url?: string };
  ThemePreview: undefined;
  TicketInventory: undefined;
  TicketStats: undefined;
  TicketStatsDetail: undefined;
  EvoMapDemo: undefined;
  SearchChat: undefined;
  Recharge: undefined;
  Withdraw: undefined;
  Transactions: undefined;
  PointsHistory: undefined;
  CheckIn: undefined;
  Invite: undefined;
  Orders: undefined;
  MyOrders: undefined;
  MyTickets: undefined;
  Profile: undefined;
  Home: undefined;
};

// Navigation prop type for screens
export type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Route prop types for specific screens
export type PartyDetailRouteProp = RouteProp<RootStackParamList, 'PartyDetail'>;
export type TicketSelectionRouteProp = RouteProp<RootStackParamList, 'TicketSelection'>;
export type PaymentRouteProp = RouteProp<RootStackParamList, 'Payment'>;
export type OrderSuccessRouteProp = RouteProp<RootStackParamList, 'OrderSuccess'>;
export type OrderDetailRouteProp = RouteProp<RootStackParamList, 'OrderDetail'>;
export type PrivateChatRouteProp = RouteProp<RootStackParamList, 'PrivateChat'>;
export type GroupChatRouteProp = RouteProp<RootStackParamList, 'GroupChat'>;
export type UserProfileRouteProp = RouteProp<RootStackParamList, 'UserProfile'>;
export type CustomerServiceRouteProp = RouteProp<RootStackParamList, 'CustomerService'>;
export type DownloadRouteProp = RouteProp<RootStackParamList, 'Download'>;
export type RefundApplyRouteProp = RouteProp<RootStackParamList, 'RefundApply'>;
export type ReviewRouteProp = RouteProp<RootStackParamList, 'Review'>;
