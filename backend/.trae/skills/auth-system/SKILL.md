---
name: "auth-system"
description: "提供聚聚平台认证授权机制详情，包括JWT实现、Token管理、权限控制。当用户询问登录认证、Token刷新、权限验证或JWT实现时调用。"
---

# 认证系统 Skill

## 使用范围
- JWT认证机制咨询
- Token管理和刷新
- 权限控制说明
- 登录流程实现

## 内容边界
本Skill仅包含认证授权信息，不涉及：
- 用户API调用（见 user-module Skill）
- 数据库用户模型（见 data-models Skill）
- 具体业务逻辑（见 backend-architecture Skill）

## JWT认证机制

系统采用JWT (JSON Web Token) 进行用户认证。

### Token类型

| Token类型 | 有效期 | 用途 |
|-----------|--------|------|
| Access Token | 7天 | API访问认证 |
| Refresh Token | 30天 | 刷新Access Token |

### Token内容

```javascript
{
  id: userId,           // 用户ID
  openid: wechatOpenId, // 微信OpenID
  role: 'user',         // 角色: user/admin
  tokenType: 'access'   // Token类型: access/refresh
}
```

## 认证流程

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

## 认证中间件

### 三种认证方式

| 中间件 | 用途 | 文件位置 |
|--------|------|----------|
| auth | 普通用户认证 | middleware/auth.js |
| authWithRefresh | 支持刷新Token | middleware/auth.js |
| adminAuth | 管理员认证 | middleware/auth.js |

### 认证Header格式

```http
Authorization: Bearer <access_token>
```

## Token刷新

### 刷新端点

```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "<refresh_token>"
}
```

### 响应示例

```json
{
  "success": true,
  "data": {
    "token": "<new_access_token>",
    "refreshToken": "<new_refresh_token>",
    "expiresIn": 604800
  }
}
```

## Token黑名单

使用Redis存储已失效的Token：

- 登出时Token加入黑名单
- 认证时检查Token是否在黑名单
- 支持Token失效处理

## 权限控制

| 角色 | 权限范围 |
|------|----------|
| 普通用户 | 基础功能(浏览、报名、支付等) |
| VIP用户 | 额外权益(优先审核、更高结算比例等) |
| 管理员 | 后台管理功能 |
| 超级管理员 | 所有权限 |

## 错误码

| 错误码 | HTTP状态码 | 说明 |
|--------|-----------|------|
| UNAUTHORIZED | 401 | 未授权 |
| TOKEN_EXPIRED | 401 | Token已过期 |
| TOKEN_INVALIDATED | 401 | Token已失效 |
| INVALID_TOKEN | 400 | 无效的Token |
| INVALID_REFRESH_TOKEN | 401 | 无效的刷新Token |
| REFRESH_TOKEN_EXPIRED | 401 | 刷新Token已过期 |

## 配置参数

```javascript
// JWT配置 (config/jwt.js)
{
  secret: process.env.JWT_SECRET,
  expiresIn: '7d',           // Access Token有效期
  refreshExpiresIn: '30d'    // Refresh Token有效期
}
```
