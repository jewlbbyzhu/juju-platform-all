# 聚聚平台后端架构文档

> **标签**: long-term memory  
> **版本**: 1.0  
> **更新日期**: 2026-02-01  
> **适用范围**: JuJu Party 聚聚平台后端系统

---

## 目录

1. [架构概述](#架构概述)
2. [技术栈](#技术栈)
3. [系统架构](#系统架构)
4. [目录结构](#目录结构)
5. [核心组件](#核心组件)
6. [数据模型](#数据模型)
7. [认证授权](#认证授权)
8. [中间件系统](#中间件系统)
9. [错误处理](#错误处理)
10. [日志系统](#日志系统)
11. [多客户端适配](#多客户端适配)
12. [部署架构](#部署架构)

---

## 架构概述

聚聚平台后端采用 **Node.js + Express** 构建，遵循经典的三层架构模式，支持多客户端（微信小程序、uni-app移动端、Web管理后台、官方网站）的统一服务。系统采用 **MySQL** 作为主数据库，**Redis** 作为缓存层，实现了完整的认证授权、支付集成、消息推送等核心功能。

### 设计原则

- **分层清晰**: 路由层 → 控制器层 → 业务层 → 数据层
- **多客户端支持**: 适配器模式支持四种客户端类型
- **安全性**: JWT认证、Token黑名单、请求限流、数据脱敏
- **可扩展性**: 模块化设计，易于添加新功能
- **可维护性**: 统一的错误处理、日志记录、代码规范

---

## 技术栈

### 核心技术

| 类别 | 技术 | 版本 | 用途 |
|------|------|------|------|
| 运行时 | Node.js | >=16.0.0 | JavaScript运行环境 |
| Web框架 | Express | 4.18.2 | HTTP服务器框架 |
| 数据库 | MySQL | 8.0+ | 关系型数据库 |
| ORM | Sequelize | 6.35.0 | 数据库ORM工具 |
| 缓存 | Redis | 4.6.12 | 缓存和会话存储 |
| 认证 | JWT | 9.0.2 | Token认证 |
| 验证 | Joi | 17.11.0 | 数据验证 |
| 日志 | Winston | 3.11.0 | 日志记录 |

### 支付集成

| 支付方式 | 库 | 版本 |
|----------|------|------|
| 微信支付 | wechatpay-node-v3 | 2.2.1 |
| 支付宝 | alipay-sdk | 3.4.0 |

### 安全与监控

| 功能 | 库 | 版本 |
|------|------|------|
| 安全头部 | helmet | 7.1.0 |
| 跨域处理 | cors | 2.8.5 |
| 请求限流 | express-rate-limit | 7.1.5 |
| 监控指标 | prom-client | 15.1.3 |
| WebSocket | ws | 8.19.0 |

---

## 系统架构

### 分层架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        客户端层                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ 微信小程序 │ │uni-app   │ │Web管理后台│ │官方网站  │       │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘       │
└───────┼────────────┼────────────┼────────────┼──────────────┘
        │            │            │            │
        └────────────┴────────────┴────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                        接入层                                │
│  Nginx (反向代理) + SSL终止 + 静态资源服务                     │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                        应用层                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    Express Server                    │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │   │
│  │  │   安全中间件 │ │  认证中间件  │ │  限流中间件  │   │   │
│  │  │  helmet/cors│ │    JWT      │ │ rate-limit  │   │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘   │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │   │
│  │  │  数据适配器  │ │  日志中间件  │ │  错误处理   │   │   │
│  │  │   Adapter   │ │   Winston   │ │  Handler    │   │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   路由层      │  │   业务层      │  │   数据层      │
│  Routes      │  │  Services    │  │   Models     │
│  ├─v1/       │  │              │  │  Sequelize   │
│  └─v2/       │  │              │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
        │                 │                 │
        └─────────────────┼─────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                        数据层                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    MySQL     │  │    Redis     │  │   文件存储    │      │
│  │   (主数据)    │  │   (缓存)      │  │  (上传文件)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### 请求处理流程

```
Client Request
      │
      ▼
┌─────────────┐
│   Nginx     │ ← 反向代理、SSL、负载均衡
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Express   │ ← 服务器启动点
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Security   │ ← Helmet安全头部、CORS
│ Middleware  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Rate Limit  │ ← 请求频率限制
└──────┬──────┘
       │
       ▼
┌─────────────┐
│Client ID    │ ← 识别客户端类型
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Auth      │ ← JWT验证（如需要）
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Route     │ ← 路由匹配
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Controller  │ ← 参数校验、调用Service
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Service    │ ← 业务逻辑、事务管理
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Model     │ ← 数据库操作
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Database   │ ← MySQL/Redis
└─────────────┘
```

---

## 目录结构

```
backend/
├── src/                          # 源代码目录
│   ├── config/                   # 配置文件
│   │   ├── database.js           # 数据库配置
│   │   ├── databaseReadWrite.js  # 读写分离配置
│   │   ├── jwt.js                # JWT配置
│   │   └── redis.js              # Redis配置
│   ├── constants/                # 常量定义
│   ├── controllers/              # 控制器层
│   ├── middleware/               # 中间件
│   ├── models/                   # 数据模型(Sequelize)
│   ├── routes/                   # 路由层
│   │   ├── v1/                   # API v1版本(用户端)
│   │   └── v2/                   # API v2版本(管理端)
│   ├── schemas/                  # 验证Schema(Joi)
│   ├── services/                 # 业务逻辑层
│   ├── utils/                    # 工具函数
│   │   └── adapters/             # 数据适配器
│   ├── validators/               # 请求验证器
│   ├── locales/                  # 国际化文件
│   └── server.js                 # 应用入口
├── tests/                        # 测试目录
│   ├── unit/                     # 单元测试
│   ├── integration/              # 集成测试
│   └── performance/              # 性能测试
├── migrations/                   # 数据库迁移
├── scripts/                      # 脚本工具
├── config/                       # 部署配置
├── deploy/                       # 部署文件
└── logs/                         # 日志目录
```

---

## 核心组件

### 1. 路由层 (Routes)

路由层负责API端点定义和请求路由，采用版本控制策略：

- **V1 API**: `/api/v1/*` - 面向用户端的基础API
- **V2 API**: `/api/v2/*` - 面向管理后台的增强API

```javascript
// 路由注册示例 (server.js)
app.use('/api/v1', v1Routes);
app.use('/api/v2', v2Routes);
```

### 2. 控制器层 (Controllers)

控制器负责处理HTTP请求，调用Service层，返回统一格式的响应：

```javascript
// 控制器职责
- 接收和解析请求参数
- 调用验证器进行参数校验
- 调用Service执行业务逻辑
- 格式化响应数据
- 处理错误并返回统一错误格式
```

### 3. 业务层 (Services)

Service层实现核心业务逻辑，处理事务管理，协调多个Model操作：

```javascript
// Service职责
- 实现业务规则
- 管理数据库事务
- 协调多个Model操作
- 调用外部服务(支付、推送等)
- 处理业务异常
```

### 4. 数据层 (Models)

使用Sequelize ORM定义数据模型和数据库表结构：

```javascript
// Model职责
- 定义表结构
- 建立模型关联
- 提供数据访问方法
- 实现数据验证
- 支持查询构建
```

---

## 数据模型

### 核心模型列表

| 模型 | 说明 | 关键字段 |
|------|------|----------|
| **User** | 用户模型 | openid, phone, nickname, avatar, vip信息 |
| **Party** | 聚会活动 | title, description, time, location, status |
| **TicketType** | 票型定义 | name, price, quantity, sale_time |
| **Ticket** | 用户票券 | code, status, user_id, party_id |
| **Order** | 订单 | order_no, amount, status, user_id |
| **OrderItem** | 订单项 | ticket_type_id, quantity, price |
| **Payment** | 支付记录 | payment_no, method, amount, status |
| **Refund** | 退款记录 | refund_no, amount, reason, status |
| **Wallet** | 钱包 | balance, frozen_amount, user_id |
| **WalletTransaction** | 钱包交易 | type, amount, balance_after |
| **BankCard** | 银行卡 | card_no, bank_name, is_default |
| **Favorite** | 收藏 | target_type, target_id, user_id |
| **Notification** | 通知 | title, content, type, is_read |
| **VIPMembership** | VIP会员 | type, start_time, end_time, status |
| **Admin** | 管理员 | username, role, permissions |

### 模型关系图

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    User      │───────│    Party     │───────│  TicketType  │
│  (用户)       │ 1:N   │  (聚会)       │ 1:N   │   (票型)      │
└──────┬───────┘       └──────┬───────┘       └──────┬───────┘
       │                      │                      │
       │ 1:1                  │ 1:N                  │ 1:N
       ▼                      ▼                      ▼
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    Wallet    │       │    Order     │───────│    Ticket    │
│   (钱包)      │       │   (订单)      │ 1:N   │   (票券)      │
└──────┬───────┘       └──────┬───────┘       └──────────────┘
       │                      │
       │ 1:N                  │ 1:1
       ▼                      ▼
┌──────────────┐       ┌──────────────┐
│WalletTransac-│       │   Payment    │
│   tion       │       │  (支付记录)   │
│ (钱包交易)    │       └──────┬───────┘
└──────────────┘              │
                              │ 1:N
                              ▼
                        ┌──────────────┐
                        │    Refund    │
                        │   (退款)      │
                        └──────────────┘
```

---

## 认证授权

### JWT认证机制

系统采用JWT (JSON Web Token) 进行用户认证：

#### Token类型

| Token类型 | 有效期 | 用途 |
|-----------|--------|------|
| Access Token | 7天 | API访问认证 |
| Refresh Token | 30天 | 刷新Access Token |

#### Token内容

```javascript
{
  id: userId,           // 用户ID
  openid: wechatOpenId, // 微信OpenID
  role: 'user',         // 角色
  tokenType: 'access'   // Token类型
}
```

#### 认证流程

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  客户端   │───→│  微信登录  │───→│  后端验证  │───→│  生成JWT  │
│          │    │  获取code  │    │ code换openid│    │  Token   │
└──────────┘    └──────────┘    └──────────┘    └────┬─────┘
                                                     │
                              ┌──────────────────────┘
                              ▼
                       ┌──────────────┐
                       │  返回Token   │
                       │ AccessToken  │
                       │ RefreshToken │
                       └──────────────┘
```

#### 认证中间件

```javascript
// 三种认证方式
- auth: 普通用户认证
- authWithRefresh: 支持刷新Token
- adminAuth: 管理员认证

// 功能特性
- JWT Token验证
- Token黑名单检查
- 测试环境Mock Token支持
```

### Token黑名单

使用Redis存储已失效的Token：

```javascript
// 登出时Token加入黑名单
// 认证时检查Token是否在黑名单
// 支持Token失效处理
```

### 权限控制

| 角色 | 权限范围 |
|------|----------|
| 普通用户 | 基础功能(浏览、报名、支付等) |
| VIP用户 | 额外权益(优先审核、更高结算比例等) |
| 管理员 | 后台管理功能 |
| 超级管理员 | 所有权限 |

---

## 中间件系统

### 中间件清单

| 中间件 | 文件 | 功能描述 |
|--------|------|----------|
| **auth** | middleware/auth.js | JWT验证、Token黑名单检查 |
| **errorHandler** | middleware/errorHandler.js | 统一错误响应、错误日志 |
| **rateLimiter** | middleware/rateLimiter.js | IP限流、接口频率控制 |
| **clientIdentifier** | middleware/clientIdentifier.js | 识别客户端类型 |
| **dataAdapter** | middleware/dataAdapter.js | 多客户端数据格式转换 |
| **requestLogger** | middleware/requestLogger.js | 记录请求信息 |
| **securityValidator** | middleware/securityValidator.js | 输入验证、文件上传检查 |
| **prometheus** | middleware/prometheus.js | Prometheus指标收集 |
| **distributedTracing** | middleware/distributedTracing.js | 请求链路追踪 |
| **canaryRelease** | middleware/canaryRelease.js | 功能灰度控制 |

### 限流配置

| 限流器 | 配置 | 应用端点 |
|--------|------|----------|
| generalLimiter | 15分钟100请求 | 通用接口 |
| strictLimiter | 1分钟100请求 | 支付、提现等敏感操作 |
| authLimiter | 15分钟1000请求 | 认证接口 |

---

## 错误处理

### 错误处理架构

```
请求 → 业务逻辑 → 抛出错误 → ErrorHandler → 统一响应
                              ↓
                         错误日志记录
                         错误报告上报
```

### 自定义错误类

| 错误类 | HTTP状态码 | 用途 |
|--------|-----------|------|
| `AppError` | 500 | 基础应用错误 |
| `ValidationError` | 400 | 参数验证错误 |
| `AuthenticationError` | 401 | 认证失败 |
| `AuthorizationError` | 403 | 权限不足 |
| `NotFoundError` | 404 | 资源不存在 |
| `ConflictError` | 409 | 资源冲突 |
| `RateLimitError` | 429 | 请求过于频繁 |

### 错误响应格式

```json
{
  "success": false,
  "message": "错误描述信息",
  "code": "ERROR_CODE",
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述信息",
    "details": {}
  }
}
```

---

## 日志系统

### Winston配置

```javascript
// 日志级别: error, warn, info, debug
// 输出方式: 文件 + 控制台(开发环境)
// 格式: JSON格式 + 时间戳
// 默认元数据: service: 'juju-backend'
```

### 日志分类

| 日志文件 | 内容 |
|----------|------|
| error.log | 仅错误级别日志 |
| combined.log | 所有级别日志 |
| access.log | 请求访问日志 |

### 日志内容

```javascript
{
  "timestamp": "2026-01-01T00:00:00.000Z",
  "level": "error",
  "message": "错误信息",
  "service": "juju-backend",
  "requestId": "uuid",
  "userId": 123,
  "path": "/api/v1/orders",
  "method": "POST"
}
```

---

## 多客户端适配

### 适配器模式

系统采用适配器模式支持多客户端，自动根据客户端类型进行数据转换：

```javascript
// 多客户端适配器工厂模式
- MiniprogramAdapter: 微信小程序适配
- AppAdapter: uni-app移动端适配
- WebAdapter: Web管理后台适配
- WebsiteAdapter: 官方网站适配
```

### 适配功能

| 适配功能 | 说明 |
|----------|------|
| 金额单位转换 | 分转元 |
| 时间格式统一 | ISO 8601格式 |
| 字段名转换 | 下划线/驼峰命名 |
| 敏感字段过滤 | 移除敏感信息 |
| 分页数据适配 | 统一分页格式 |

### 客户端识别

```javascript
// 通过Header识别客户端类型
X-Client-Type: miniprogram | app | web | website
```

---

## 部署架构

### 环境配置

| 环境 | 配置文件 | 用途 |
|------|----------|------|
| 开发环境 | .env.development | 本地开发 |
| 测试环境 | .env.test | 自动化测试 |
| 生产环境 | .env.production | 线上运行 |

### 核心配置项

```bash
# 应用配置
NODE_ENV=production
PORT=3000

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=juju_platform
DB_USER=root
DB_PASSWORD=xxx
DB_POOL_MAX=20
DB_POOL_MIN=5

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT配置
JWT_SECRET=xxx
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# 微信支付配置
WECHAT_PAY_MCHID=xxx
WECHAT_PAY_API_V3_KEY=xxx

# 支付宝配置
ALIPAY_APP_ID=xxx
```

### 部署架构图

```
                    ┌──────────────┐
                    │    用户      │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
       ┌──────────┐ ┌──────────┐ ┌──────────┐
       │ 微信小程序 │ │uni-app   │ │官方网站  │
       └────┬─────┘ └────┬─────┘ └────┬─────┘
            │            │            │
            └────────────┼────────────┘
                         ▼
                  ┌──────────────┐
                  │  CDN/静态资源  │
                  └──────┬───────┘
                         ▼
                  ┌──────────────┐
                  │    Nginx     │
                  │  (反向代理)   │
                  └──────┬───────┘
                         ▼
                  ┌──────────────┐
                  │   Node.js    │
                  │   Express    │
                  └──────┬───────┘
                         ▼
              ┌──────────┴──────────┐
              ▼                     ▼
       ┌──────────────┐      ┌──────────────┐
       │    MySQL     │      │    Redis     │
       │   (主数据)    │      │   (缓存)      │
       └──────────────┘      └──────────────┘
```

---

## 架构特点总结

### 设计亮点

1. **多客户端支持**: 通过适配器模式无缝支持四种客户端类型
2. **分层清晰**: 严格的分层架构，职责分离明确
3. **完善的错误处理**: 自定义错误类 + 统一错误处理中间件
4. **安全机制**: JWT认证、Token黑名单、请求限流、数据脱敏
5. **监控与日志**: Winston日志、Prometheus监控、分布式追踪
6. **数据适配**: 自动化的多客户端数据格式转换
7. **优雅关闭**: 支持服务的优雅关闭，避免请求中断

### 扩展性

- **新增客户端**: 继承BaseAdapter实现新的适配器
- **新增业务模块**: 按照Controller → Service → Model → Route顺序添加
- **新增中间件**: 在server.js中按顺序注册

### 注意事项

1. 部分Controller直接调用微信服务，建议通过Service层封装
2. 持续优化测试覆盖率
3. API文档需要持续维护
4. 关注慢查询监控，持续优化数据库性能

---

*本文档为聚聚平台后端系统的长期记忆文档，请保持更新。*
