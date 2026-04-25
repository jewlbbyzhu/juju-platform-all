---
name: "vip-module"
description: "提供聚聚平台VIP会员模块详情，包括VIP套餐、权益、购买流程、订阅历史。当用户询问VIP会员、会员权益、VIP购买或订阅管理时调用。"
---

# VIP模块 Skill

## 使用范围
- VIP套餐和权益说明
- VIP购买流程
- 订阅历史查询
- VIP结算规则

## 内容边界
本Skill仅包含VIP会员相关信息，不涉及：
- 用户API调用（见 user-module Skill）
- 支付流程（见 payment-system Skill）
- 数据模型定义（见 data-models Skill）

## VIP类型和价格

| 类型 | 代码 | 价格 | 有效期 | 免费发布名额 |
|------|------|------|--------|-------------|
| 月卡 | monthly | 88元 | 30天 | 2个 |
| 季卡 | quarterly | 188元 | 90天 | 3个 |
| 年卡 | yearly | 888元 | 365天 | 无限制 |

## VIP权益对比

| 权益 | 普通用户 | 月卡VIP | 季卡VIP | 年卡VIP |
|------|---------|---------|---------|---------|
| 聚会发布数量 | 每月3条 | 无限制 | 无限制 | 无限制 |
| 免费发布名额 | 0 | 2个 | 3个 | 无限制 |
| 审核时间 | 4-12小时 | 2-4小时 | 2小时 | 2小时 |
| 结算比例 | 95% | 97% | 98% | 98% |
| 客服支持 | 普通 | 普通 | 专属 | 专属 |
| 推荐位权重 | 无 | 1.2x | 1.8x | 2.5x |
| 数据报告 | 无 | 月度 | 月度 | 月度+年度 |
| 定制化服务 | 无 | 无 | 无 | 有 |

## API 端点

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

### 续费VIP

```http
POST /api/v1/vip/renew
Authorization: Bearer <token>
Content-Type: application/json

{
  "packageId": 1,
  "paymentMethod": "wechat"
}
```

### 取消订阅

```http
POST /api/v1/vip/cancel
Authorization: Bearer <token>
```

### 获取VIP状态

```http
GET /api/v1/users/vip/status
Authorization: Bearer <token>
```

**响应示例：**

```json
{
  "success": true,
  "data": {
    "isVip": true,
    "level": 1,
    "type": "monthly",
    "startTime": "2026-01-01T00:00:00.000Z",
    "endTime": "2026-01-31T23:59:59.000Z",
    "daysRemaining": 15,
    "benefits": {
      "settlementRate": 0.97,
      "freePartyQuota": 2,
      "usedFreeQuota": 1
    }
  }
}
```

### 获取订阅历史

```http
GET /api/v1/vip/history
Authorization: Bearer <token>
```

**响应示例：**

```json
{
  "success": true,
  "data": {
    "list": [
      {
        "id": 1,
        "type": "monthly",
        "startTime": "2026-01-01T00:00:00.000Z",
        "endTime": "2026-01-31T23:59:59.000Z",
        "status": 1,
        "payment": {
          "paymentNo": "P20260101000001",
          "amount": 8800,
          "paymentMethod": "wechat",
          "paidAt": "2026-01-01T00:00:00.000Z"
        }
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

### 获取权益对比

```http
GET /api/v1/vip/compare
Authorization: Bearer <token>
```

## VIP订阅状态

| 状态码 | 说明 |
|--------|------|
| 0 | 已过期 |
| 1 | 订阅成功 |
| 2 | 已取消 |

## 结算规则

### 普通用户
- 平台佣金：5%
- 组织者结算：95%

### 月卡VIP
- 平台佣金：3%
- 组织者结算：97%

### 季卡VIP
- 平台佣金：2%
- 组织者结算：98%

### 年卡VIP
- 平台佣金：2%
- 组织者结算：98%

## 错误码

| 错误码 | HTTP状态码 | 说明 |
|--------|-----------|------|
| VIP_ALREADY_ACTIVE | 400 | VIP已激活 |
| VIP_EXPIRED | 400 | VIP已过期 |
| INSUFFICIENT_BALANCE | 400 | 余额不足 |
| PAYMENT_FAILED | 400 | 支付失败 |
