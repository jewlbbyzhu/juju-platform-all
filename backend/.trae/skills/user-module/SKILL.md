---
name: "user-module"
description: "提供聚聚平台用户模块API详情，包括用户注册、登录、资料管理。当用户询问用户API、注册登录接口、用户资料或用户相关功能时调用。"
---

# 用户模块 API Skill

## 使用范围
- 用户注册、登录API
- 用户资料管理
- 用户统计信息
- VIP状态查询

## 内容边界
本Skill仅包含用户模块API，不涉及：
- 认证机制实现（见 auth-system Skill）
- 用户数据模型（见 data-models Skill）
- 其他业务模块API（见各模块Skill）

## API 端点

### 用户注册

```http
POST /api/v1/users/register
```

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| openid | string | 条件 | 微信openid |
| unionid | string | 否 | 微信unionid |
| phone | string | 条件 | 手机号 |
| nickname | string | 是 | 昵称 (1-50字符) |
| avatar | string | 否 | 头像URL |
| gender | integer | 否 | 性别: 0-未知, 1-男, 2-女 |
| birthday | date | 否 | 生日 |

**响应示例：**

```json
{
  "success": true,
  "message": "注册成功",
  "data": {
    "user": {
      "id": 1,
      "nickname": "用户昵称",
      "avatar": "https://example.com/avatar.jpg",
      "phone": "13800138000"
    },
    "token": "<access_token>",
    "refreshToken": "<refresh_token>"
  }
}
```

### 用户登录

```http
POST /api/v1/users/login
```

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| code | string | 条件 | 微信登录code |
| openid | string | 条件 | 微信openid |

**响应示例：**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "nickname": "用户昵称",
      "isVip": true,
      "vipLevel": 1,
      "vipExpiresAt": "2026-12-31T23:59:59.000Z"
    },
    "token": "<access_token>",
    "refreshToken": "<refresh_token>"
  }
}
```

### 获取个人资料

```http
GET /api/v1/users/profile
Authorization: Bearer <token>
```

**响应示例：**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "openid": "wx_xxx",
    "phone": "13800138000",
    "nickname": "用户昵称",
    "avatar": "https://example.com/avatar.jpg",
    "gender": 1,
    "birthday": "1990-01-01",
    "bio": "个人简介",
    "isVip": true,
    "vipLevel": 1,
    "vipExpiresAt": "2026-12-31T23:59:59.000Z",
    "statistics": {
      "participatedCount": 10,
      "createdCount": 5,
      "favoriteCount": 20,
      "followingCount": 50,
      "followersCount": 30
    }
  }
}
```

### 更新个人资料

```http
PUT /api/v1/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "nickname": "新昵称",
  "avatar": "https://example.com/new-avatar.jpg",
  "gender": 1,
  "birthday": "1990-01-01",
  "bio": "新的个人简介"
}
```

### 获取用户统计

```http
GET /api/v1/users/statistics
Authorization: Bearer <token>
```

### 获取VIP状态

```http
GET /api/v1/users/vip/status
Authorization: Bearer <token>
```

## V2 管理端API

### 获取用户列表

```http
GET /api/v2/users/
Authorization: Bearer <token>
```

**查询参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keyword | string | 否 | 搜索关键词 |
| status | integer | 否 | 用户状态 |
| isVip | boolean | 否 | 是否VIP |
| page | integer | 否 | 页码 |
| limit | integer | 否 | 每页数量 |

### 获取用户详情

```http
GET /api/v2/users/:id
Authorization: Bearer <token>
```

### 更新用户状态

```http
PUT /api/v2/users/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": 1
}
```

## 错误码

| 错误码 | HTTP状态码 | 说明 |
|--------|-----------|------|
| USER_NOT_FOUND | 404 | 用户不存在 |
| USER_ALREADY_EXISTS | 409 | 用户已存在 |
| VALIDATION_ERROR | 400 | 参数验证错误 |
