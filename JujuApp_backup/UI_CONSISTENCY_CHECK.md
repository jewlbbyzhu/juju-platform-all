# UI 一致性检查报告

检查时间: 2026-04-09

发现问题总数: 26


## non_theme_color (26处)

- `src/screens/PartyDetailScreen.tsx:47`
  ```tsx
  0: '#FFF3E0', 1: '#E8F5E9', 2: '#FFEBEE', 3: colors.background.tertiary, 4: colors.border
  ```
- `src/screens/EvoMapDemoScreen.tsx:121`
  ```tsx
  statusConnected: { color: "#44ff44" },
  ```
- `src/screens/EvoMapDemoScreen.tsx:122`
  ```tsx
  statusDisconnected: { color: "#ff4444" },
  ```
- `src/screens/MyTicketsScreen.tsx:11`
  ```tsx
  valid: { label: '可使用', color: colors.status.success, bgColor: '#E8F5E9' },
  ```
- `src/screens/MyTicketsScreen.tsx:13`
  ```tsx
  expired: { label: '已过期', color: colors.status.error, bgColor: '#FFEBEE' },
  ```
- `src/screens/VIPCenterScreen.tsx:33`
  ```tsx
  { level: 1, name: "铜牌", color: "#CD7F32", icon: "🥉" },
  ```
- `src/screens/VIPCenterScreen.tsx:34`
  ```tsx
  { level: 2, name: "银牌", color: "#C0C0C0", icon: "🥈" },
  ```
- `src/screens/VIPCenterScreen.tsx:36`
  ```tsx
  { level: 4, name: "铂金", color: "#E5E4E2", icon: "💎" },
  ```
- `src/screens/VIPCenterScreen.tsx:37`
  ```tsx
  { level: 5, name: "钻石", color: "#B9F2FF", icon: "💠" },
  ```
- `src/screens/PushSettingsScreen.tsx:125`
  ```tsx
  trackColor={{ false: '#767577', true: colors.primary.main }}
  ```
- `src/screens/PushSettingsScreen.tsx:126`
  ```tsx
  thumbColor={value ? colors.text.inverse : '#f4f3f4'}
  ```
- `src/screens/WalletScreen.tsx:91`
  ```tsx
  <View style={[styles.transactionIcon, { backgroundColor: t.type === "income" || t.type === "recharge" ? colors.status.success : "#F44336" }]}>
  ```
- `src/screens/WalletScreen.tsx:97`
  ```tsx
  <Text style={[styles.transactionAmount, { color: t.type === "income" || t.type === "recharge" || t.type === "refund" ? colors.status.success : "#F44336" }]}>
  ```
- `src/screens/WalletScreen.tsx:103`
  ```tsx
  <Text style={[styles.transactionStatus, { color: t.status === 1 ? colors.status.success : "#FF9800" }]}>{getStatusText(t.status)}</Text>
  ```
- `src/screens/VIPLevelsScreen.tsx:30`
  ```tsx
  color: "#CD7F32",
  ```
- `src/screens/VIPLevelsScreen.tsx:39`
  ```tsx
  color: "#C0C0C0",
  ```
- `src/screens/VIPLevelsScreen.tsx:57`
  ```tsx
  color: "#E5E4E2",
  ```
- `src/screens/VIPLevelsScreen.tsx:66`
  ```tsx
  color: "#B9F2FF",
  ```
- `src/screens/HomeScreen.tsx:75`
  ```tsx
  const getStatusColor = (s: number) => ({ 0: '#ff9800', 1: '#4ECDC4', 2: colors.primary.main, 3: '#999', 4: '#666' }[s] || '#999');
  ```
- `src/screens/HomeScreen.tsx:76`
  ```tsx
  const getStatusBgColor = (s: number) => ({ 0: '#FFF3E0', 1: '#E0F7FA', 2: '#FFEBEE', 3: colors.background.tertiary, 4: colors.border }[s] || colors.border);
  ```
- `src/screens/UserProfileScreen.tsx:165`
  ```tsx
  recommendMatch: { fontSize: 12, color: "#52c41a", fontWeight: "500" },
  ```
- `src/screens/TicketInventoryScreen.tsx:164`
  ```tsx
  statusBadgeText: { fontSize: 12, fontWeight: '500', color: '#52c41a' },
  ```
- `src/screens/VIPPrivilegesScreen.tsx:34`
  ```tsx
  color: "#CD7F32",
  ```
- `src/screens/VIPPrivilegesScreen.tsx:44`
  ```tsx
  color: "#C0C0C0",
  ```
- `src/screens/VIPPrivilegesScreen.tsx:67`
  ```tsx
  color: "#E5E4E2",
  ```
- `src/screens/VIPPrivilegesScreen.tsx:79`
  ```tsx
  color: "#B9F2FF",
  ```
