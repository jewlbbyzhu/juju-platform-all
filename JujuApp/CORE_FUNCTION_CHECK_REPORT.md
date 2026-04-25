# JUJU App - 核心功能检查与补充报告

**检查日期:** 2026-04-09  
**检查人员:** Hermes Agent  
**项目版本:** 1.0.4  
**项目路径:** ~/.openclaw.pre-migration/workspace/juju-platform-all/JujuApp

---

## 一、检查结果概览

| 检查项 | 状态 | 备注 |
|--------|------|------|
| API接口配置 (src/api/) | ⚠️ 部分问题 | 双API客户端架构，部分不一致 |
| 关键依赖检查 (package.json) | ⚠️ 需要补充 | 缺少环境变量管理和推送依赖 |
| 环境变量配置 (.env) | ❌ 缺失 | 未配置环境变量文件 |
| 核心功能模块 | ✅ 完整 | 24个API模块覆盖所有功能 |

---

## 二、详细发现

### 2.1 API接口配置检查 (src/api/)

#### ✅ 已完成的模块 (24个)

| 模块 | 文件 | 功能覆盖 | 状态 |
|------|------|----------|------|
| 核心API | `index.ts` | 基础请求封装、聚会/订单/用户API | ✅ |
| API客户端 | `apiClient.ts` | Token刷新、JWT解码、错误处理 | ✅ |
| 认证 | `auth.ts` | 微信/手机登录、验证码、退出 | ✅ |
| 用户 | `user.ts` | 用户信息、拉黑、搜索、统计 | ✅ |
| 聚会 | `party.ts` | CRUD、票务、审核、图片上传 | ✅ |
| 订单 | `order.ts` | 创建、支付、取消、退款、查询 | ✅ |
| 票券 | `ticket.ts` | 验票、转赠、统计、二维码 | ✅ |
| 钱包 | `wallet.ts` | 充值、提现、密码、转账 | ✅ |
| VIP | `vip.ts` | 套餐、订阅、积分、优惠券 | ✅ |
| VIP统计 | `vipStats.ts` | 数据分析、导出 | ✅ |
| 社交 | `social.ts` | 动态、点赞、评论、分享 | ✅ |
| 关注 | `follow.ts` | 关注/取关、粉丝列表 | ✅ |
| 收藏 | `favorites.ts` | 添加/删除收藏、检查 | ✅ |
| 聊天 | `chat.ts` | 会话、消息、已读状态 | ✅ |
| 群聊 | `group-chat.ts` | 群组管理、消息(合并版) | ✅ |
| 通知 | `notification.ts` | 通知列表、已读、删除 | ✅ |
| 推送 | `push.ts` | 推送消息、设置管理 | ✅ |
| 地图 | `map.ts` | 搜索、路线、距离计算 | ✅ |
| 扫码 | `scan.ts` | 验票、历史记录 | ✅ |
| 退款 | `refund.ts` | 申请、列表、取消 | ✅ |
| 邀请 | `invite.ts` | 邀请码、记录、统计 | ✅ |
| 内容 | `content.ts` | Banner、公告、帖子 | ✅ |
| 标签 | `tag.ts` | 标签管理、关注、搜索 | ✅ |
| 票务统计 | `ticket-stats.ts` | 销售趋势、使用统计 | ✅ |

#### ⚠️ 发现的问题

1. **双API客户端架构问题**
   - `api/index.ts` 定义了旧的 `api` 实例 (基于 axios.create)
   - `api/apiClient.ts` 定义了新的 `apiClient` 实例 (带Token刷新)
   - 部分模块混用两个客户端，导致行为不一致

2. **硬编码API地址**
   ```typescript
   // apiClient.ts 第110行
   const response = await axios.post(`https://api.hfparty.asia/api/v1/auth/refresh`, {...})
   ```
   - 刷新Token端点使用硬编码URL，未从config导入

3. **API端点路径不一致**
   - `profile.ts` 使用 `/api/v1/` 前缀，与其他模块不一致
   - `recommendation.ts` 同样使用 `/api/v1/` 前缀
   - `tag.ts` 同样使用 `/api/v1/` 前缀

4. **离线模式配置冲突**
   - `api/index.ts` 中 `OFFLINE_MODE = true`
   - `api/mockApi.ts` 中 `OFFLINE_MODE = false`

---

### 2.2 关键依赖检查 (package.json)

#### ✅ 已有依赖

```json
核心框架:
- react: 19.2.3
- react-native: 0.84.1
- axios: ^1.14.0
- @react-navigation/*: ^7.x

存储:
- @react-native-async-storage/async-storage: ^2.2.0

地图:
- react-native-maps: ^1.27.2
```

#### ❌ 缺失的关键依赖

| 依赖 | 用途 | 建议版本 |
|------|------|----------|
| `react-native-dotenv` | 环境变量管理 | ^3.4.0 |
| `@react-native-community/push-notification-ios` | iOS推送 | ^1.11.0 |
| `@react-native-firebase/messaging` | Firebase推送 | ^21.x |
| `react-native-device-info` | 设备信息 | ^14.x |
| `react-native-image-picker` | 图片选择 | ^7.x |
| `react-native-permissions` | 权限管理 | ^5.x |

---

### 2.3 环境变量配置 (.env)

#### ❌ 问题: 完全缺失

**当前情况:**
- 项目根目录没有 `.env`、`.env.development`、`.env.production` 文件
- API地址直接硬编码在 `src/config/index.ts`

**风险:**
1. 无法区分开发/测试/生产环境
2. API密钥等敏感信息可能硬编码
3. 部署时需要修改代码才能切换环境

**应添加的环境变量:**
```bash
# .env
API_BASE_URL=https://api.hfparty.asia/api/v1
API_BASE_URL_V2=https://api.hfparty.asia/api/v2
WS_BASE_URL=wss://api.hfparty.asia

# 第三方服务
MAP_API_KEY=xxx
PUSH_NOTIFICATION_KEY=xxx

# 功能开关
ENABLE_ANALYTICS=true
ENABLE_CRASHLYTICS=true
```

---

### 2.4 类型定义检查 (src/types/)

#### ✅ 完整的类型定义

| 文件 | 内容 |
|------|------|
| `api.ts` | ApiResponse, PageResponse, Party, Order, UserProfile等 |
| `index.ts` | PageResult, User, VIPInfo等 |
| `navigation.ts` | RootStackParamList, Navigation Props |

#### ⚠️ 类型重复定义问题

- `types/api.ts` 和 `types/index.ts` 中 `VIPInfo`、`Party`、`Order` 等类型重复
- 可能导致使用时的混淆

---

## 三、修复方案

### 3.1 立即修复 (高优先级)

#### 1. 统一API客户端
```typescript
// 建议：统一使用 apiClient.ts 作为唯一客户端
// 删除 api/index.ts 中的旧 api 实例
// 所有模块统一从 apiClient.ts 导入
```

#### 2. 修复硬编码URL
```typescript
// apiClient.ts 第110行
// 修改前:
const response = await axios.post(`https://api.hfparty.asia/api/v1/auth/refresh`, ...)

// 修改后:
import { API_BASE_URL } from '../config';
const response = await axios.post(`${API_BASE_URL}/auth/refresh`, ...)
```

#### 3. 创建环境变量文件
```bash
# 创建 .env 文件
touch ~/.openclaw.pre-migration/workspace/juju-platform-all/JujuApp/.env
touch ~/.openclaw.pre-migration/workspace/juju-platform-all/JujuApp/.env.example
```

#### 4. 安装缺失依赖
```bash
npm install react-native-dotenv
npm install react-native-device-info
npm install react-native-image-picker
npm install react-native-permissions
```

---

### 3.2 中期优化 (中优先级)

#### 1. 统一API端点路径
- 移除所有 `/api/v1/` 前缀的硬编码
- 统一使用 config 中的 `API_BASE_URL`

#### 2. 清理类型定义
- 合并 `types/api.ts` 和 `types/index.ts`
- 删除重复定义

#### 3. 规范化离线模式
- 统一 `OFFLINE_MODE` 配置位置
- 建议在 `src/config/index.ts` 中管理

---

### 3.3 长期规划 (低优先级)

#### 1. API版本管理
```typescript
// config/index.ts
export const API_VERSIONS = {
  v1: '/api/v1',
  v2: '/api/v2',
};
```

#### 2. 请求缓存机制
- 对静态数据(如配置、分类)添加缓存
- 实现请求去重

#### 3. API健康检查
- 添加心跳检测
- 自动故障切换

---

## 四、文件清单

### 已检查的API文件 (32个)
```
src/api/
├── index.ts           (核心API + 旧客户端)
├── apiClient.ts       (新客户端 - Token刷新)
├── mockApi.ts         (Mock数据)
├── mockData.ts        (Mock数据集)
├── auth.ts            (认证)
├── user.ts            (用户)
├── party.ts           (聚会)
├── order.ts           (订单)
├── ticket.ts          (票券)
├── wallet.ts          (钱包)
├── vip.ts             (VIP)
├── vipStats.ts        (VIP统计)
├── social.ts          (社交)
├── follow.ts          (关注)
├── favorites.ts       (收藏)
├── chat.ts            (聊天)
├── group-chat.ts      (群聊 - 合并版)
├── notification.ts    (通知)
├── push.ts            (推送)
├── map.ts             (地图)
├── scan.ts            (扫码)
├── refund.ts          (退款)
├── invite.ts          (邀请)
├── content.ts         (内容)
├── tag.ts             (标签)
├── profile.ts         (资料)
├── recommendation.ts  (推荐)
├── message.ts         (消息)
├── ticket-stats.ts    (票务统计)
└── bankcards.ts       (银行卡 - 合并版)
```

---

## 五、总结

### 总体评价
JUJU App的核心功能架构完整，24个API模块覆盖了聚会、订单、支付、社交、VIP等所有业务场景。代码结构清晰，类型定义完整。

### 主要风险
1. **双API客户端混用** - 可能导致Token刷新失效
2. **环境变量缺失** - 部署和维护困难
3. **硬编码URL** - 维护风险

### 修复优先级
| 优先级 | 事项 | 预计时间 |
|--------|------|----------|
| P0 | 创建.env文件 | 10分钟 |
| P0 | 修复硬编码refresh URL | 5分钟 |
| P1 | 统一API客户端 | 2小时 |
| P1 | 安装环境变量依赖 | 10分钟 |
| P2 | 统一API端点路径 | 1小时 |
| P2 | 清理类型重复定义 | 1小时 |

---

**报告生成时间:** 2026-04-09 01:20 AM  
**检查人:** Hermes Agent
