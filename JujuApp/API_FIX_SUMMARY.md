# JUJU App API 连接问题诊断与修复报告

## 问题概述
测试报告发现 JUJU App (v1.0.3) 存在以下 API 连接问题：
- 多个页面显示 "网络错误"
- 测试模式使用了模拟 token，但后端 API 不接受
- API 配置指向错误的地址

## 问题诊断

### 1. API 基础 URL 配置错误
**问题**：前端配置的 API 地址不正确
- 原配置：`http://122.51.255.13:3010`
- 正确地址：`https://api.hfparty.asia/api/v1`

**影响文件**：
- `src/config/index.ts`
- `src/api/index.ts`
- `src/api/apiClient.ts`

### 2. API 路径版本缺失
**问题**：后端 API 使用 `/api/v1` 和 `/api/v2` 路径前缀，前端未正确配置
- 后端路由：`/api/v1/parties`, `/api/v1/auth/login` 等
- 前端调用：`/parties`, `/auth/login` (缺少前缀)

### 3. Token 获取逻辑错误
**问题**：`src/api/index.ts` 中 token 被硬编码为 `null`
```javascript
// 修复前
const token = null;

// 修复后
const token = await AsyncStorage.getItem('token');
```

### 4. 测试 Token 支持说明
后端在 `auth.js` 中间件中实现了测试 token 支持：
- 仅在 `NODE_ENV=test` 模式下生效
- 需要在后端 `.env.test` 中配置 `TEST_TOKENS` 环境变量

## 修复措施

### 已修改的文件

#### 1. `src/config/index.ts`
```typescript
// 修复前
export const API_BASE_URL = "http://122.51.255.13:3010";

// 修复后
export const API_BASE_URL = "https://api.hfparty.asia/api/v1";
export const API_BASE_URL_V2 = "https://api.hfparty.asia/api/v2";
export const WS_BASE_URL = "wss://api.hfparty.asia";
```

#### 2. `src/api/index.ts`
```typescript
// 修复前
const API_BASE_URL = "http://localhost:3000/api";
api.interceptors.request.use(
  (config) => {
    const token = null;  // 硬编码 null
    ...
  }
);

// 修复后
const API_BASE_URL = "https://api.hfparty.asia/api/v1";
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');  // 从存储获取
    ...
  }
);
```

#### 3. `src/api/apiClient.ts`
```typescript
// 修复 Token 刷新路径，使用完整 URL
const response = await axios.post(`https://api.hfparty.asia/api/v1/auth/refresh`, {
  refreshToken: refreshTokenValue,
});
```

## 验证结果

### API 连通性测试
```bash
# 测试健康检查
GET https://api.hfparty.asia/health
响应: 200 OK

# 测试活动列表接口
GET https://api.hfparty.asia/api/v1/parties?page=1&pageSize=2
响应: 200 OK，返回活动列表数据
```

### 后端认证逻辑确认
- 生产环境：使用 JWT_SECRET 验证真实 token
- 测试环境：支持 TEST_TOKENS 环境变量中的测试 token

## 使用测试 Token 的方法

如需在后端使用测试 token：

1. 在 `backend/.env.test` 中添加：
```bash
NODE_ENV=test
TEST_TOKENS=test-token-001,test-token-002
```

2. 在前端测试时使用这些 token：
```javascript
await AsyncStorage.setItem('token', 'test-token-001');
```

## 总结

### 修复内容
1. ✅ 更新了 API 基础 URL 为正确的生产环境地址
2. ✅ 添加了 API 版本路径前缀 (/api/v1)
3. ✅ 修复了 WebSocket URL (使用 wss:// 协议)
4. ✅ 修复了 Token 获取逻辑，从 AsyncStorage 正确读取
5. ✅ 修复了 Token 刷新路径

### 后续建议
1. 确保后端 `https://api.hfparty.asia` 的 SSL 证书有效
2. 测试环境下配置 TEST_TOKENS 环境变量
3. 考虑实现 API 环境切换机制（开发/生产环境）
4. 添加 API 请求日志以便调试

---
修复日期: 2026-04-05
修复版本: v1.0.3-fix
