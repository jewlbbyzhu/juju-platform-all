const { sequelize } = require('../config/database');

const User = require('./User');
const Party = require('./Party');
const TicketType = require('./TicketType');
const Ticket = require('./Ticket');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Payment = require('./Payment');
const Refund = require('./Refund');
const Wallet = require('./Wallet');
const WalletTransaction = require('./WalletTransaction');
const BankCard = require('./BankCard');
const Favorite = require('./Favorite');
const Notification = require('./Notification');
const VIPMembership = require('./VIPMembership');
const VipPackage = require('./VipPackage');
const VipSubscription = require('./VipSubscription');
const VipLevel = require('./VipLevel');
const VipBenefit = require('./VipBenefit');
const BlockedUser = require('./BlockedUser');
const Tag = require('./Tag');
const UserTag = require('./UserTag');
const PartyTag = require('./PartyTag');
const ScanRecord = require('./ScanRecord');
const UserPreference = require('./UserPreference');
const InviteRecord = require('./InviteRecord');
const Admin = require('./Admin');
const Role = require('./Role');
const Permission = require('./Permission');
const AppVersion = require('./AppVersion');
const Feedback = require('./Feedback');
const AppDownloadEvent = require('./AppDownloadEvent');
const SystemConfig = require('./SystemConfig');
const PartyStats = require('./PartyStats');
const PartyFeatured = require('./PartyFeatured');
const PartyAudit = require('./PartyAudit');
const AuditLog = require('./AuditLog');
const Banner = require('./Banner');
const Announcement = require('./Announcement');
const Post = require('./Post');
const Comment = require('./Comment');
const Follow = require('./Follow');
const Like = require('./Like');
const Conversation = require('./Conversation');
const Message = require('./Message');
const Group = require('./Group');
const GroupMember = require('./GroupMember');
const GroupMessage = require('./GroupMessage');
const PushMessage = require('./PushMessage');
const PushSetting = require('./PushSetting');
const AnalyticsReport = require('./AnalyticsReport');
const AnalyticsDashboard = require('./AnalyticsDashboard');
const PartyCategory = require("./PartyCategory");

User.hasMany(Party, { foreignKey: 'user_id', as: 'parties' });
Party.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Party.hasMany(TicketType, { foreignKey: 'party_id', as: 'ticket_types' });
TicketType.belongsTo(Party, { foreignKey: 'party_id', as: 'party' });

Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });

Order.belongsTo(Party, { foreignKey: 'party_id', as: 'party', constraints: false });
Party.hasMany(Order, { foreignKey: 'party_id', as: 'orders', constraints: false });

Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'order_items' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

OrderItem.belongsTo(TicketType, { foreignKey: 'ticket_type_id', as: 'ticket_type' });

Payment.belongsTo(Order, { foreignKey: 'order_id', as: 'order', constraints: false });
Order.hasOne(Payment, { foreignKey: 'order_id', as: 'payment', constraints: false });

Payment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Refund.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
Order.hasMany(Refund, { foreignKey: 'order_id', as: 'refunds' });

Refund.belongsTo(Payment, { foreignKey: 'payment_id', as: 'payment' });
Payment.hasMany(Refund, { foreignKey: 'payment_id', as: 'refunds' });

Refund.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Wallet.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasOne(Wallet, { foreignKey: 'user_id', as: 'wallet' });

WalletTransaction.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(WalletTransaction, { foreignKey: 'user_id', as: 'wallet_transactions' });

WalletTransaction.belongsTo(Wallet, { foreignKey: 'wallet_id', as: 'wallet' });
Wallet.hasMany(WalletTransaction, { foreignKey: 'wallet_id', as: 'transactions' });

BankCard.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(BankCard, { foreignKey: 'user_id', as: 'bank_cards' });

Favorite.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Favorite, { foreignKey: 'user_id', as: 'favorites' });

Favorite.belongsTo(Party, { foreignKey: 'party_id', as: 'party' });
Party.hasMany(Favorite, { foreignKey: 'party_id', as: 'favorites' });
Party.hasMany(PartyStats, { foreignKey: 'party_id', as: 'stats' });
Party.hasMany(PartyFeatured, { foreignKey: 'party_id', as: 'featured' });

Post.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Post, { foreignKey: 'user_id', as: 'posts' });

Post.belongsTo(Party, { foreignKey: 'party_id', as: 'party' });
Party.hasMany(Post, { foreignKey: 'party_id', as: 'posts' });

Comment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Comment, { foreignKey: 'user_id', as: 'comments' });

Comment.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });
Post.hasMany(Comment, { foreignKey: 'post_id', as: 'comments' });

Comment.belongsTo(Party, { foreignKey: 'party_id', as: 'party' });
Party.hasMany(Comment, { foreignKey: 'party_id', as: 'comments' });

Comment.belongsTo(Comment, { foreignKey: 'reply_to', as: 'reply' });
Comment.hasMany(Comment, { foreignKey: 'reply_to', as: 'replies' });

Follow.belongsTo(User, { foreignKey: 'follower_id', as: 'follower' });
User.hasMany(Follow, { foreignKey: 'follower_id', as: 'following' });

Follow.belongsTo(User, { foreignKey: 'following_id', as: 'following' });
User.hasMany(Follow, { foreignKey: 'following_id', as: 'followers' });

Like.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Like, { foreignKey: 'user_id', as: 'likes' });

Like.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });
Post.hasMany(Like, { foreignKey: 'post_id', as: 'likes' });

Like.belongsTo(Party, { foreignKey: 'party_id', as: 'party' });
Party.hasMany(Like, { foreignKey: 'party_id', as: 'likes' });

Like.belongsTo(Comment, { foreignKey: 'comment_id', as: 'comment' });
Comment.hasMany(Like, { foreignKey: 'comment_id', as: 'likes' });

Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });

Feedback.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Feedback, { foreignKey: 'user_id', as: 'feedbacks' });

VIPMembership.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(VIPMembership, { foreignKey: 'user_id', as: 'vip_memberships' });

Admin.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });
Role.hasMany(Admin, { foreignKey: 'role_id', as: 'admins' });

Ticket.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Ticket, { foreignKey: 'user_id', as: 'tickets' });

Ticket.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
Order.hasMany(Ticket, { foreignKey: 'order_id', as: 'tickets' });

Ticket.belongsTo(TicketType, { foreignKey: 'ticket_type_id', as: 'ticket_type' });
TicketType.hasMany(Ticket, { foreignKey: 'ticket_type_id', as: 'tickets' });

Ticket.belongsTo(Party, { foreignKey: 'party_id', as: 'party' });
Party.hasMany(Ticket, { foreignKey: 'party_id', as: 'tickets' });

VIPMembership.belongsTo(Payment, { foreignKey: 'payment_id', as: 'payment' });
Payment.hasMany(VIPMembership, { foreignKey: 'payment_id', as: 'vip_memberships' });

// VIP 关联
VipSubscription.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(VipSubscription, { foreignKey: 'user_id', as: 'vip_subscriptions' });

VipSubscription.belongsTo(VipPackage, { foreignKey: 'package_id', as: 'package' });
VipPackage.hasMany(VipSubscription, { foreignKey: 'package_id', as: 'subscriptions' });

// 用户拉黑关联
BlockedUser.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(BlockedUser, { foreignKey: 'user_id', as: 'blocked_users' });

BlockedUser.belongsTo(User, { foreignKey: 'blocked_user_id', as: 'blocked_user' });
User.hasMany(BlockedUser, { foreignKey: 'blocked_user_id', as: 'blocked_by_users' });

// 标签关联
User.belongsToMany(Tag, { through: UserTag, foreignKey: 'user_id', as: 'tags' });
Tag.belongsToMany(User, { through: UserTag, foreignKey: 'tag_id', as: 'users' });

Party.belongsToMany(Tag, { through: PartyTag, foreignKey: 'party_id', as: 'tagList' });
Tag.belongsToMany(Party, { through: PartyTag, foreignKey: 'tag_id', as: 'parties' });

// 扫码记录关联
ScanRecord.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(ScanRecord, { foreignKey: 'user_id', as: 'scan_records' });

// 用户偏好设置关联
UserPreference.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasOne(UserPreference, { foreignKey: 'user_id', as: 'preference' });

// 邀请记录关联
InviteRecord.belongsTo(User, { foreignKey: 'inviter_id', as: 'inviter' });
InviteRecord.belongsTo(User, { foreignKey: 'invitee_id', as: 'invitee' });
User.hasMany(InviteRecord, { foreignKey: 'inviter_id', as: 'sent_invites' });
User.hasMany(InviteRecord, { foreignKey: 'invitee_id', as: 'received_invites' });

// 聊天和群组关联
Conversation.belongsTo(User, { foreignKey: 'user_id_1', as: 'user1' });
Conversation.belongsTo(User, { foreignKey: 'user_id_2', as: 'user2' });
User.hasMany(Conversation, { foreignKey: 'user_id_1', as: 'conversations_as_user1' });
User.hasMany(Conversation, { foreignKey: 'user_id_2', as: 'conversations_as_user2' });

Message.belongsTo(Conversation, { foreignKey: 'conversation_id', as: 'conversation' });
Conversation.hasMany(Message, { foreignKey: 'conversation_id', as: 'messages' });
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiver_id', as: 'receiver' });

Group.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });
User.hasMany(Group, { foreignKey: 'owner_id', as: 'owned_groups' });

GroupMember.belongsTo(Group, { foreignKey: 'group_id', as: 'group' });
Group.hasMany(GroupMember, { foreignKey: 'group_id', as: 'members' });
GroupMember.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(GroupMember, { foreignKey: 'user_id', as: 'group_memberships' });

GroupMessage.belongsTo(Group, { foreignKey: 'group_id', as: 'group' });
Group.hasMany(GroupMessage, { foreignKey: 'group_id', as: 'messages' });
GroupMessage.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });

PushMessage.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(PushMessage, { foreignKey: 'user_id', as: 'push_messages' });

PushSetting.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasOne(PushSetting, { foreignKey: 'user_id', as: 'push_setting' });

AnalyticsReport.belongsTo(Admin, { foreignKey: 'created_by', as: 'creator' });
Admin.hasMany(AnalyticsReport, { foreignKey: 'created_by', as: 'analytics_reports' });

AnalyticsDashboard.belongsTo(Admin, { foreignKey: 'created_by', as: 'creator' });
Admin.hasMany(AnalyticsDashboard, { foreignKey: 'created_by', as: 'analytics_dashboards' });

const db = {
  sequelize,
  User,
  Party,
  TicketType,
  Ticket,
  Order,
  OrderItem,
  Payment,
  Refund,
  Wallet,
  WalletTransaction,
  BankCard,
  Favorite,
  Notification,
  VIPMembership,
  VipPackage,
  VipSubscription,
  VipLevel,
  VipBenefit,
  BlockedUser,
  Tag,
  UserTag,
  PartyTag,
  ScanRecord,
  UserPreference,
  InviteRecord,
  Admin,
  Role,
  Permission,
  AppVersion,
  Feedback,
  AppDownloadEvent,
  SystemConfig,
  PartyStats,
  PartyFeatured,
  PartyAudit,
  AuditLog,
  Banner,
  Announcement,
  Post,
  Comment,
  Follow,
  Like,
  Conversation,
  Message,
  Group,
  GroupMember,
  GroupMessage,
  PushMessage,
  PushSetting,
  AnalyticsReport,
  AnalyticsDashboard,
  PartyCategory,
};

module.exports = db;
