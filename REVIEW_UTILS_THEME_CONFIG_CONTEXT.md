# JujuApp 工具函数和主题配置审查报告

## 审查范围
- `utils/` - 工具函数和缓存
- `theme/` - 主题系统
- `config/` - 配置文件
- `context/` - 全局上下文

---

## 发现的问题列表

### 🔴 严重问题

#### 1. 敏感信息不安全存储（token/refreshToken）
**文件**: `src/api/auth.ts`, `src/api/apiClient.ts`
**问题**: 使用 `AsyncStorage`（明文存储）保存 `token` 和 `refreshToken`
```typescript
await AsyncStorage.setItem('token', response.data.token);
await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
```
**风险**: AsyncStorage 在 iOS/Android 上都是明文存储，token 可被其他应用或越狱设备读取
**建议**: 使用 `react-native-keychain` 或 `expo-secure-store` 存储敏感凭证

#### 2. 支付配置硬编码风险
**文件**: `src/config/payment.ts`
**问题**: 
- 支付方式配置全部硬编码
- `appId` 和 `partnerId` 为空字符串占位，容易被后续误填真实值并提交到版本控制
```typescript
WECHAT: {
  appId: '',      // 空占位，但结构存在
  partnerId: '',
}
```
**建议**: 支付相关配置应从环境变量或安全配置中心获取

#### 3. API 基础地址硬编码
**文件**: `src/config/index.ts`
**问题**: 生产环境 API 地址硬编码在代码中
```typescript
const REMOTE_API = "https://api.hfparty.asia/api/v1";
```
**建议**: 使用环境变量或构建时注入配置

---

### 🟡 中等问题

#### 4. 缓存策略问题 - 无缓存大小限制
**文件**: `src/utils/cache.ts`
**问题**: 
- 使用 AsyncStorage 作为缓存后端，无总大小限制
- `clear()` 方法使用循环逐个删除，而非 `multiRemove`（虽然已修复部分）
- 无缓存淘汰策略（LRU等）
- 默认 TTL 仅 5 分钟，对移动应用偏短
```typescript
const DEFAULT_TTL = 5 * 60 * 1000; // 5分钟
```
**建议**: 增加缓存大小限制、实现 LRU 淘汰、考虑使用 MMKV 等更高效的存储

#### 5. 缓存清理效率问题
**文件**: `src/utils/cache.ts` (第50-58行)
**问题**: `clear()` 方法逐个删除缓存键，未使用 `AsyncStorage.multiRemove`
```typescript
for (const key of cacheKeys) {
  await AsyncStorage.removeItem(key);  // 低效
}
```
**建议**: 改为 `await AsyncStorage.multiRemove(cacheKeys)`

#### 6. Mock 数据包含真实用户信息模式
**文件**: `src/api/mockData.ts`
**问题**: Mock 用户数据使用了中国手机号格式 `13800138000`，虽然是测试号段，但存在被误认为真实数据的风险
**建议**: 使用明显虚构的数据（如 `13800000000` 或标注 `MOCK_DATA`）

#### 7. Mock Token 生成可预测
**文件**: `src/api/mockApi.ts` (第139行)
**问题**: Mock token 使用简单的时间戳拼接
```typescript
token: 'mock-token-' + Date.now(),
```
**建议**: 添加 `MOCK_` 前缀明确标识，避免与真实 token 混淆

---

### 🟢 低优先级问题

#### 8. 主题系统 - 暗色模式未实现
**文件**: `src/theme/ThemeContext.tsx`
**问题**: `toggleTheme` 只切换 `isDark` 布尔值，但未实际提供暗色主题配色方案
```typescript
const toggleTheme = () => {
  setIsDark(!isDark);  // 只切换状态，colors 未变
};
```
**建议**: 实现完整的暗色主题配色，或移除未完成的切换功能

#### 9. 主题系统 - 硬编码颜色值重复
**文件**: `src/theme/colors.ts`, `src/theme/shadows.ts`, `src/theme/glassmorphism.ts`
**问题**: 
- `shadows.ts` 第57、66行硬编码 `#FF4D6D`
- `glassmorphism.ts` 多处硬编码 RGBA 值，未从 colors 系统引用
- 玻璃拟态颜色与 colors.ts 中的暗色背景不一致
**建议**: 统一从 colors 系统引用，避免维护多个颜色源

#### 10. 地图服务 - 模拟位置硬编码
**文件**: `src/utils/mapService.ts` (第36-41行)
**问题**: 使用北京天安门坐标作为 mock 位置
```typescript
const mockLocation = {
  latitude: 39.9042,
  longitude: 116.4074
};
```
**建议**: 添加 TODO 注释或环境判断，确保生产环境不会使用 mock 数据

#### 11. 地图服务 - 权限检查虚假实现
**文件**: `src/utils/mapService.ts` (第25-33行)
**问题**: 位置权限检查直接返回 `true`，未实际检查权限
```typescript
async checkLocationPermission(): Promise<{ granted: boolean }> {
  this.isLocationAuthorized = true;
  return { granted: true };  // 虚假实现
}
```
**风险**: 可能导致应用在未获得权限时尝试获取位置
**建议**: 接入真实的权限检查库（如 `expo-location`）

#### 12. AppContext 类型使用 `unknown`
**文件**: `src/context/AppContext.tsx`
**问题**: 大量使用 `unknown` 类型，失去 TypeScript 类型保护
```typescript
interface AppContextType {
  user: unknown;
  setUser: (user: unknown) => void;
  // ...
}
```
**建议**: 定义具体的 User 类型

#### 13. 支付方法硬编码
**文件**: `src/context/AppContext.tsx` (第61行)
**问题**: 支付订单硬编码使用微信支付
```typescript
const res = await orderApi.createPayment(orderId, { paymentMethod: 'wechat' });
```
**建议**: 从用户选择或配置中动态获取支付方式

---

## 总结

| 级别 | 数量 | 主要问题 |
|------|------|----------|
| 🔴 严重 | 3 | 不安全token存储、支付配置硬编码、API地址硬编码 |
| 🟡 中等 | 4 | 缓存策略缺陷、mock数据风险、缓存清理效率 |
| 🟢 低优 | 6 | 主题暗色未实现、颜色硬编码、类型不完善等 |

**优先修复建议**:
1. 使用安全存储替代 AsyncStorage 保存 token
2. 将 API 地址和支付配置移至环境变量
3. 完善缓存策略（大小限制、LRU淘汰）
4. 实现真实的权限检查和位置获取
