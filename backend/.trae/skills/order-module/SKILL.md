---
name: "order-module"
description: "提供聚聚平台订单模块API详情，包括创建订单、查询、取消、退款。当用户询问订单API、下单流程、订单管理或退款申请时调用。"
---

# 订单模块 API Skill

## 使用范围
- 创建订单
- 订单查询和管理
- 取消订单
- 申请退款

## 内容边界
本Skill仅包含订单模块API，不涉及：
- 支付相关功能（见 payment-system Skill）
- 票券相关功能（见 ticket-module Skill）
- 聚会相关功能（见 party-module Skill）

## 订单状态

| 状态码 | 说明 |
|--------|------|
| 0 | 待支付 |
| 1 | 已支付 |
| 2 | 处理中 |
| 3 | 已完成 |
| 4 | 已取消 |
| 5 | 退款中 |
| 6 | 已退款 |

## API 端点

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

### 查询支付状态

```http
GET /api/v1/orders/:id/payment/status
Authorization: Bearer <token>
```

## V2 管理端API

### 获取订单列表

```http
GET /api/v2/orders/
Authorization: Bearer <token>
```

### 获取订单统计

```http
GET /api/v2/orders/stats
Authorization: Bearer <token>
```

### 更新订单状态

```http
PUT /api/v2/orders/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": 3
}
```

### 审核退款

```http
POST /api/v2/orders/:id/refund/audit
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": 1,
  "remark": "审核通过"
}
```

## 错误码

| 错误码 | HTTP状态码 | 说明 |
|--------|-----------|------|
| ORDER_NOT_FOUND | 404 | 订单不存在 |
| ORDER_EXPIRED | 400 | 订单已过期 |
| ORDER_ALREADY_PAID | 400 | 订单已支付 |
| ORDER_ALREADY_CANCELLED | 400 | 订单已取消 |
| REFUND_NOT_ALLOWED | 400 | 不允许退款 |
| TICKET_TYPE_NOT_FOUND | 404 | 票型不存在 |
| TICKET_TYPE_SOLD_OUT | 400 | 票型已售罄 |
| EXCEED_MAX_PER_USER | 400 | 超出每人限购数量 |
