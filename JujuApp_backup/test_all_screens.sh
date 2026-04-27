#!/bin/bash
# Juju App 全页面测试脚本

export PATH="$PATH:$HOME/Library/Android/sdk/platform-tools"
DEVICE="emulator-5554"
PACKAGE="com.jujuapp"
OUTPUT_DIR="/tmp/juju_screenshots"

mkdir -p $OUTPUT_DIR

# 截图函数
screenshot() {
    local name=$1
    adb -s $DEVICE shell screencap -p /sdcard/$name.png
    adb -s $DEVICE pull /sdcard/$name.png $OUTPUT_DIR/$name.png 2>/dev/null
    echo "✓ $name"
}

# 获取当前 Activity/页面
get_current_screen() {
    adb -s $DEVICE shell dumpsys activity top | grep "ACTIVITY" | tail -1
}

# 测试页面列表 - 核心页面
SCREENS=(
    "LoginScreen:登录"
    "HomeScreen:首页" 
    "ProfileScreen:个人中心"
    "VIPCenterScreen:VIP中心"
    "WalletScreen:钱包"
    "MyOrdersScreen:我的订单"
    "PartyDetailScreen:聚会详情"
    "ChatListScreen:聊天列表"
    "NotificationsScreen:通知"
    "FollowingScreen:关注"
    "FansScreen:粉丝"
    "CreatePostScreen:发布动态"
    "MapScreen:地图"
    "SocialScreen:社交"
    "ScanScreen:扫一扫"
    "MyTicketsScreen:我的门票"
    "SettingsScreen:设置"
    "AboutScreen:关于"
    "HelpScreen:帮助"
    "FeedbackScreen:反馈"
    "PrivacyScreen:隐私政策"
    "TermsScreen:用户协议"
    "AccountSecurityScreen:账号安全"
    "NotificationSettingsScreen:通知设置"
    "PaymentScreen:支付"
    "OrderDetailScreen:订单详情"
    "TicketDetailScreen:门票详情"
    "GroupChatScreen:群聊"
    "PrivateChatScreen:私聊"
    "UserProfileScreen:用户资料"
    "EditProfileScreen:编辑资料"
    "ChangePasswordScreen:修改密码"
    "BindPhoneScreen:绑定手机"
    "RealNameScreen:实名认证"
    "VIPHistoryScreen:VIP历史"
    "VIPPointsScreen:VIP积分"
    "VIPLevelsScreen:VIP等级"
    "VIPPrivilegesScreen:VIP特权"
    "VIPEventsScreen:VIP活动"
    "VIPStatsScreen:VIP统计"
    "RechargeScreen:充值"
    "WithdrawScreen:提现"
    "BankcardScreen:银行卡"
    "TransactionDetailScreen:交易详情"
    "InviteScreen:邀请好友"
    "InviteRecordScreen:邀请记录"
    "RedeemScreen:兑换"
    "FavoritesScreen:收藏"
    "HistoryScreen:历史记录"
    "SearchScreen:搜索"
    "SearchResultScreen:搜索结果"
    "TagScreen:标签"
    "ManageScreen:管理"
)

echo "开始 Juju App 全页面测试..."
echo "=============================="

# 先回到登录页
adb -s $DEVICE shell am start -n $PACKAGE/.MainActivity 2>/dev/null
sleep 2
screenshot "00_LoginScreen"

# 尝试模拟登录（输入测试手机号）
adb -s $DEVICE shell input text "13800138000"
sleep 1
screenshot "01_Login_InputPhone"

# 点击获取验证码（如果可见）
adb -s $DEVICE shell input tap 800 1100 2>/dev/null
sleep 1

# 输入验证码
adb -s $DEVICE shell input text "123456"
sleep 1
screenshot "02_Login_InputCode"

# 点击登录按钮
adb -s $DEVICE shell input tap 540 1300 2>/dev/null
sleep 3
screenshot "03_AfterLogin"

echo ""
echo "=============================="
echo "已截图保存在: $OUTPUT_DIR"
echo "=============================="
ls -la $OUTPUT_DIR/
