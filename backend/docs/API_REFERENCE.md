# 聚聚平台 API 参考文档

> **标签**: long-term memory  
> **版本**: 1.0  
> **更新日期**: 2026-02-01  
> **适用范围**: JuJu Party 聚聚平台后端 API

---

## 目录

1. [概述](#概述)
2. [认证机制](#认证机制)
3. [通用规范](#通用规范)
4. [用户模块](#用户模块)
5. [聚会模块](#聚会模块)
6. [订单模块](#订单模块)
7. [支付模块](#支付模块)
8. [票券模块](#票券模块)
9. [钱包模块](#钱包模块)
10. [VIP模块](#vip模块)
11. [通知模块](#通知模块)
12. [管理后台模块](#管理后台模块)
13. [错误码参考](#错误码参考)

---

## 概述

### API 版本

| 版本 | 路径前缀 | 说明 |
|------|----------|------|
| V1 | `/api/v1/*` | 用户端API，面向微信小程序、uni-app |
| V2 | `/api/v2/*` | 管理端API，面向Web管理后台 |

### 基础 URL

```
开发环境: http://localhost:3000
生产环境: https://api.jujuparty.com
```

### 请求格式

- **Content-Type**: `application/json`
- **字符编码**: UTF-8
- **时间格式**: ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)
- **金额单位**: 分 (接口传输)，元 (显示)

### 响应格式

```json
{
  "success": true,
  "message": "操作成功",
  "data": {},
  "timestamp": "2026-01-01T00:00:00.000Z"
}
```

---

## 认证机制

### JWT Token

所有需要认证的接口需在请求头中携带 Token：

```http
Authorization: Bearer <access_token>
```

### Token 类型

| Token类型 | 有效期 | 用途 |
|-----------|--------|------|
| Access Token | 7天 | API访问 |
| Refresh Token | 30天 | 刷新Access Token |

### 刷新 Token

```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "<refresh_token>"
}
```

**响应示例：**

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

---

## 通用规范

### 分页参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | integer | 否 | 1 | 页码 |
| limit | integer | 否 | 20 | 每页数量 |

### 分页响应

```json
{
  "success": true,
  "data": {
    "list": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

### 排序参数

| 参数 | 类型 | 说明 |
|------|------|------|
| sortBy | string | 排序字段 |
| sortOrder | string | asc/desc |

### 限流说明

| 限流级别 | 配置 | 适用场景 |
|----------|------|----------|
| 通用限流 | 15分钟100请求 | 普通接口 |
| 严格限流 | 1分钟100请求 | 支付、提现等敏感操作 |
| 认证限流 | 15分钟1000请求 | 登录、注册等认证接口 |

---

## 用户模块

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

---

## 聚会模块

### 聚会状态

| 状态码 | 说明 |
|--------|------|
| -1 | 草稿 |
| 0 | 待审核 |
| 1 | 已发布 |
| 2 | 进行中 |
| 3 | 已结束 |
| 4 | 已取消 |

### 获取聚会列表

```http
GET /api/v1/parties/published
```

**查询参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | integer | 否 | 页码，默认1 |
| pageSize | integer | 否 | 每页数量，默认20 |
| sortBy | string | 否 | 排序字段 |
| category | string | 否 | 分类筛选 |
| minPrice | integer | 否 | 最低价格(分) |
| maxPrice | integer | 否 | 最高价格(分) |
| latitude | float | 否 | 纬度 |
| longitude | float | 否 | 经度 |
| maxDistance | integer | 否 | 最大距离(米) |

**响应示例：**

```json
{
  "success": true,
  "data": {
    "list": [
      {
        "id": 1,
        "title": "周末聚会",
        "description": "聚会描述",
        "coverImage": "https://example.com/cover.jpg",
        "category": "社交",
        "startTime": "2026-02-15T14:00:00.000Z",
        "endTime": "2026-02-15T18:00:00.000Z",
        "location": "北京市朝阳区",
        "address": "详细地址",
        "latitude": 39.9042,
        "longitude": 116.4074,
        "minPrice": 9900,
        "maxPrice": 29900,
        "status": 1,
        "organizer": {
          "id": 1,
          "nickname": "组织者",
          "avatar": "https://example.com/avatar.jpg"
        },
        "statistics": {
          "viewCount": 100,
          "favoriteCount": 20,
          "participantCount": 15
        }
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

### 获取聚会详情

```http
GET /api/v1/parties/:id
```

**响应示例：**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "周末聚会",
    "description": "聚会详细描述",
    "coverImage": "https://example.com/cover.jpg",
    "images": ["https://example.com/1.jpg", "https://example.com/2.jpg"],
    "category": "社交",
    "startTime": "2026-02-15T14:00:00.000Z",
    "endTime": "2026-02-15T18:00:00.000Z",
    "registrationDeadline": "2026-02-14T12:00:00.000Z",
    "location": "北京市朝阳区",
    "address": "详细地址",
    "latitude": 39.9042,
    "longitude": 116.4074,
    "maxParticipants": 50,
    "minParticipants": 10,
    "minAge": 18,
    "maxAge": 45,
    "genderRestriction": 0,
    "status": 1,
    "organizer": {
      "id": 1,
      "nickname": "组织者",
      "avatar": "https://example.com/avatar.jpg",
      "isVip": true
    },
    "ticketTypes": [
      {
        "id": 1,
        "name": "早鸟票",
        "description": "早鸟优惠",
        "price": 9900,
        "originalPrice": 19900,
        "quantity": 20,
        "soldCount": 15,
        "maxPerUser": 2,
        "saleStartTime": "2026-01-01T00:00:00.000Z",
        "saleEndTime": "2026-02-14T12:00:00.000Z"
      }
    ],
    "statistics": {
      "viewCount": 100,
      "favoriteCount": 20,
      "likeCount": 50,
      "shareCount": 10,
      "participantCount": 15
    },
    "isFavorite": false
  }
}
```

### 创建聚会 (V2)

```http
POST /api/v2/parties/
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "聚会标题",
  "description": "聚会描述",
  "coverImage": "https://example.com/cover.jpg",
  "images": ["https://example.com/1.jpg"],
  "category": "社交",
  "startTime": "2026-02-15T14:00:00.000Z",
  "endTime": "2026-02-15T18:00:00.000Z",
  "location": "北京市朝阳区",
  "address": "详细地址",
  "latitude": 39.9042,
  "longitude": 116.4074,
  "maxParticipants": 50,
  "minParticipants": 10,
  "ticketTypes": [
    {
      "name": "普通票",
      "description": "普通入场券",
      "price": 19900,
      "quantity": 30,
      "maxPerUser": 5
    }
  ]
}
```

### 搜索聚会

```http
GET /api/v1/parties/search?keyword=聚会&page=1&pageSize=20
```

### 获取我的聚会

```http
GET /api/v1/parties/my
Authorization: Bearer <token>
```

---

## 订单模块

### 订单状态

| 状态码 | 说明 |
|--------|------|
| 0 | 待支付 |
| 1 | 已支付 |
| 2 | 处理中 |
| 3 | 已完成 |
| 4 | 已取消 |
| 5 | 退款中 |
| 6 | 已退款 |

### 创建订单

```http
POST /api/v1/orders/
Authorization: Bearer <token>
Content-Type: application/json

{
  "partyId": 1,
  "items": [
    {
      "ticketTypeId": 1,
      "quantity": 2
    }
  ],
  "remark": "订单备注"
}
```

**响应示例：**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "orderNo": "O202601011200001",
    "partyId": 1,
    "partyTitle": "周末聚会",
    "amount": 39800,
    "status": 0,
    "items": [
      {
        "id": 1,
        "ticketTypeId": 1,
        "ticketTypeName": "早鸟票",
        "quantity": 2,
        "unitPrice": 19900,
        "totalPrice": 39800
      }
    ],
    "createdAt": "2026-01-01T12:00:00.000Z",
    "expireAt": "2026-01-01T12:30:00.000Z"
  }
}
```

### 获取订单列表

```http
GET /api/v1/orders/my
Authorization: Bearer <token>
```

**查询参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | integer | 否 | 订单状态筛选 |
| page | integer | 否 | 页码 |
| limit | integer | 否 | 每页数量 |

### 获取订单详情

```http
GET /api/v1/orders/:id
Authorization: Bearer <token>
```

### 取消订单

```http
PUT /api/v1/orders/:id/cancel
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "取消原因"
}
```

### 申请退款

```http
POST /api/v1/orders/:id/refund
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "退款原因"
}
```

---

## 支付模块

### 支付方式

| 方式 | 代码 | 说明 |
|------|------|------|
| 微信支付 | wechat | 微信支付 |
| 支付宝 | alipay | 支付宝支付 |
| 钱包支付 | wallet | 余额支付 |

### 创建支付

```http
POST /api/v1/payments/
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": 1,
  "paymentMethod": "wechat"
}
```

**响应示例：**

```json
{
  "success": true,
  "data": {
    "paymentId": 1,
    "paymentNo": "P202601011200001",
    "orderId": 1,
    "amount": 39800,
    "paymentMethod": "wechat",
    "status": 0,
    "wechatPayParams": {
      "appId": "wx_xxx",
      "timeStamp": "1234567890",
      "nonceStr": "random_string",
      "package": "prepay_id=xxx",
      "signType": "RSA",
      "paySign": "signature"
    },
    "expireAt": "2026-01-01T12:30:00.000Z"
  }
}
```

### 查询支付状态

```http
GET /api/v1/orders/:id/payment/status
Authorization: Bearer <token>
```

### 支付回调

```http
POST /api/v1/payments/wechat/notify
POST /api/v1/payments/alipay/notify
```

---

## 票券模块

### 票券状态

| 状态码 | 说明 |
|--------|------|
| 0 | 未使用 |
| 1 | 已使用 |
| 2 | 已过期 |
| 3 | 已退款 |
| 4 | 已作废 |

### 获取我的票券

```http
GET /api/v1/tickets/
Authorization: Bearer <token>
```

**查询参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | integer | 否 | 票券状态筛选 |
| page | integer | 否 | 页码 |
| limit | integer | 否 | 每页数量 |

**响应示例：**

```json
{
  "success": true,
  "data": {
    "list": [
      {
        "id": 1,
        "code": "TK202601011200001",
        "status": 0,
        "party": {
          "id": 1,
          "title": "周末聚会",
          "coverImage": "https://example.com/cover.jpg",
          "startTime": "2026-02-15T14:00:00.000Z",
          "endTime": "2026-02-15T18:00:00.000Z",
          "location": "北京市朝阳区"
        },
        "ticketType": {
          "id": 1,
          "name": "早鸟票"
        },
        "orderId": 1,
        "createdAt": "2026-01-01T12:00:00.000Z",
        "validUntil": "2026-02-15T18:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5
    }
  }
}
```

### 获取票券详情

```http
GET /api/v1/tickets/:id
Authorization: Bearer <token>
```

### 验票

```http
POST /api/v1/tickets/:id/verify
Content-Type: application/json

{
  "code": "TK202601011200001"
}
```

### 使用票券

```http
PATCH /api/v1/tickets/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": 1
}
```

---

## 钱包模块

### 获取钱包信息

```http
GET /api/v1/wallet/
Authorization: Bearer <token>
```

**响应示例：**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "balance": 100000,
    "frozenAmount": 0,
    "totalIncome": 500000,
    "totalExpense": 400000,
    "hasPassword": true,
    "bankCards": [
      {
        "id": 1,
        "bankName": "中国工商银行",
        "cardNo": "6222 **** **** 1234",
        "cardType": "储蓄卡",
        "isDefault": true
      }
    ]
  }
}
```

### 获取交易记录

```http
GET /api/v1/wallet/transactions
Authorization: Bearer <token>
```

**查询参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | 否 | 类型: income/expense |
| startDate | date | 否 | 开始日期 |
| endDate | date | 否 | 结束日期 |
| page | integer | 否 | 页码 |
| limit | integer | 否 | 每页数量 |

**响应示例：**

```json
{
  "success": true,
  "data": {
    "list": [
      {
        "id": 1,
        "type": "income",
        "typeName": "收入",
        "amount": 10000,
        "balanceAfter": 100000,
        "description": "订单结算",
        "relatedId": 1,
        "relatedType": "order",
        "createdAt": "2026-01-01T12:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50
    }
  }
}
```

### 充值

```http
POST /api/v1/wallet/recharge
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 10000,
  "paymentMethod": "wechat"
}
```

### 提现

```http
POST /api/v1/wallet/withdraw
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 5000,
  "bankCardId": 1,
  "password": "支付密码"
}
```

### 添加银行卡

```http
POST /api/v1/wallet/bankcards
Authorization: Bearer <token>
Content-Type: application/json

{
  "bankName": "中国工商银行",
  "cardNo": "6222123456789012345",
  "cardHolder": "持卡人姓名",
  "idCard": "身份证号",
  "phone": "银行预留手机号"
}
```

---

## VIP模块

### VIP类型

| 类型 | 价格 | 有效期 |
|------|------|--------|
| 月卡 | 88元 | 1个月 |
| 季卡 | 188元 | 3个月 |
| 年卡 | 888元 | 12个月 |

### 获取VIP套餐

```http
GET /api/v1/vip/packages
Authorization: Bearer <token>
```

**响应示例：**

```json
{
  "success": true,
  "data": {
    "packages": [
      {
        "id": 1,
        "type": "monthly",
        "name": "月卡",
        "price": 8800,
        "duration": 30,
        "benefits": [
          "聚会发布数量无限制",
          "免费发布聚会名额2个",
          "聚会审核优先处理",
          "享受97%结算比例"
        ]
      },
      {
        "id": 2,
        "type": "quarterly",
        "name": "季卡",
        "price": 18800,
        "duration": 90,
        "benefits": [
          "聚会发布数量无限制",
          "免费发布聚会名额3个",
          "聚会审核优先处理",
          "享受98%结算比例"
        ]
      },
      {
        "id": 3,
        "type": "yearly",
        "name": "年卡",
        "price": 88800,
        "duration": 365,
        "benefits": [
          "聚会发布数量无限制",
          "发布聚会无需服务费",
          "聚会审核优先处理",
          "享受98%结算比例",
          "年度数据报告"
        ]
      }
    ]
  }
}
```

### 购买VIP

```http
POST /api/v1/vip/purchase
Authorization: Bearer <token>
Content-Type: application/json

{
  "packageId": 1,
  "paymentMethod": "wechat"
}
```

### 获取VIP状态

```http
GET /api/v1/users/vip/status
Authorization: Bearer <token>
```

### 获取订阅历史

```http
GET /api/v1/vip/history
Authorization: Bearer <token>
```

---

## 通知模块

### 通知类型

| 类型 | 说明 |
|------|------|
| system | 系统通知 |
| party | 聚会相关 |
| order | 订单相关 |
| wallet | 钱包相关 |
| social | 社交相关 |

### 获取通知列表

```http
GET /api/v1/notifications/
Authorization: Bearer <token>
```

**查询参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | 否 | 通知类型 |
| isRead | boolean | 否 | 是否已读 |
| page | integer | 否 | 页码 |
| limit | integer | 否 | 每页数量 |

**响应示例：**

```json
{
  "success": true,
  "data": {
    "list": [
      {
        "id": 1,
        "type": "order",
        "typeName": "订单通知",
        "title": "订单支付成功",
        "content": "您的订单O202601011200001已支付成功",
        "isRead": false,
        "data": {
          "orderId": 1,
          "orderNo": "O202601011200001"
        },
        "createdAt": "2026-01-01T12:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 10
    }
  }
}
```

### 获取未读数量

```http
GET /api/v1/notifications/unread/count
Authorization: Bearer <token>
```

### 标记已读

```http
PATCH /api/v1/notifications/:id/read
Authorization: Bearer <token>
```

### 全部已读

```http
PATCH /api/v1/notifications/read-all
Authorization: Bearer <token>
```

---

## 收藏模块

### 添加收藏

```http
POST /api/v1/favorites/
Authorization: Bearer <token>
Content-Type: application/json

{
  "targetType": "party",
  "targetId": 1
}
```

### 取消收藏

```http
DELETE /api/v1/favorites/:id
Authorization: Bearer <token>
```

### 获取收藏列表

```http
GET /api/v1/favorites/
Authorization: Bearer <token>
```

### 检查收藏状态

```http
GET /api/v1/favorites/check?targetType=party&targetId=1
Authorization: Bearer <token>
```

---

## 管理后台模块

### 管理员登录

```http
POST /api/v2/admin/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password"
}
```

### 用户管理 (V2)

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

### 聚会审核 (V2)

```http
PUT /api/v2/parties/:id/audit
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": 1,
  "remark": "审核通过"
}
```

### 获取仪表盘统计 (V2)

```http
GET /api/v2/dashboard/stats
Authorization: Bearer <token>
```

**响应示例：**

```json
{
  "success": true,
  "data": {
    "users": {
      "total": 1000,
      "newToday": 50,
      "activeToday": 200
    },
    "parties": {
      "total": 100,
      "pending": 10,
      "ongoing": 20
    },
    "orders": {
      "total": 500,
      "today": 30,
      "amount": 100000
    },
    "revenue": {
      "today": 50000,
      "week": 300000,
      "month": 1000000
    }
  }
}
```

### 财务统计 (V2)

```http
GET /api/v2/finance/stats
Authorization: Bearer <token>
```

### 提现审核 (V2)

```http
POST /api/v2/finance/withdrawals/:id/audit
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "approved",
  "remark": "审核通过"
}
```

---

## 错误码参考

### 通用错误码

| 错误码 | HTTP状态码 | 说明 |
|--------|-----------|------|
| SUCCESS | 200 | 操作成功 |
| UNKNOWN_ERROR | 500 | 未知错误 |
| VALIDATION_ERROR | 400 | 参数验证错误 |
| NOT_FOUND | 404 | 资源不存在 |

### 认证错误码

| 错误码 | HTTP状态码 | 说明 |
|--------|-----------|------|
| UNAUTHORIZED | 401 | 未授权 |
| TOKEN_EXPIRED | 401 | Token已过期 |
| TOKEN_INVALIDATED | 401 | Token已失效 |
| INVALID_TOKEN | 400 | 无效的Token |
| INVALID_REFRESH_TOKEN | 401 | 无效的刷新Token |
| REFRESH_TOKEN_EXPIRED | 401 | 刷新Token已过期 |

### 业务错误码

| 错误码 | HTTP状态码 | 说明 |
|--------|-----------|------|
| USER_NOT_FOUND | 404 | 用户不存在 |
| USER_ALREADY_EXISTS | 409 | 用户已存在 |
| PARTY_NOT_FOUND | 404 | 聚会不存在 |
| PARTY_FULL | 400 | 聚会已满员 |
| ORDER_NOT_FOUND | 404 | 订单不存在 |
| ORDER_EXPIRED | 400 | 订单已过期 |
| ORDER_ALREADY_PAID | 400 | 订单已支付 |
| INSUFFICIENT_BALANCE | 400 | 余额不足 |
| PAYMENT_FAILED | 400 | 支付失败 |
| TICKET_NOT_FOUND | 404 | 票券不存在 |
| TICKET_ALREADY_USED | 400 | 票券已使用 |
| TICKET_EXPIRED | 400 | 票券已过期 |
| REFUND_NOT_ALLOWED | 400 | 不允许退款 |
| WITHDRAWAL_FAILED | 400 | 提现失败 |
| VIP_ALREADY_ACTIVE | 400 | VIP已激活 |

### 错误响应示例

```json
{
  "success": false,
  "message": "订单已过期",
  "code": "ORDER_EXPIRED",
  "error": {
    "code": "ORDER_EXPIRED",
    "message": "订单已过期",
    "details": {
      "orderId": 1,
      "expiredAt": "2026-01-01T12:30:00.000Z"
    }
  }
}
```

---

## 附录

### 状态码速查

#### 聚会状态
- `-1`: 草稿
- `0`: 待审核
- `1`: 已发布
- `2`: 进行中
- `3`: 已结束
- `4`: 已取消

#### 订单状态
- `0`: 待支付
- `1`: 已支付
- `2`: 处理中
- `3`: 已完成
- `4`: 已取消
- `5`: 退款中
- `6`: 已退款

#### 票券状态
- `0`: 未使用
- `1`: 已使用
- `2`: 已过期
- `3`: 已退款
- `4`: 已作废

#### 支付状态
- `0`: 待支付
- `1`: 支付成功
- `2`: 支付失败
- `3`: 已关闭

#### 退款状态
- `0`: 待审核
- `1`: 审核通过
- `2`: 审核拒绝
- `3`: 退款成功
- `4`: 退款失败

#### VIP订阅状态
- `0`: 已过期
- `1`: 订阅成功
- `2`: 已取消

---

*本文档为聚聚平台API的长期记忆文档，请保持更新。*
