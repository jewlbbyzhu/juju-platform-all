---
name: "payment-system"
description: "提供聚聚平台支付系统详情，包括支付方式、支付流程、回调处理、退款机制。当用户询问支付集成、微信支付、支付宝、支付回调或退款流程时调用。"
---

# 支付系统 Skill

## 使用范围
- 支付方式说明
- 支付流程咨询
- 回调处理机制
- 退款流程

## 内容边界
本Skill仅包含支付相关信息，不涉及：
- 订单API调用（见 order-module Skill）
- 钱包功能（见 wallet-module Skill）
- 具体代码实现（见 backend-architecture Skill）

## 支付方式

| 方式 | 代码 | 说明 | 库 |
|------|------|------|-----|
| 微信支付 | wechat | 微信支付 | wechatpay-node-v3 v2.2.1 |
| 支付宝 | alipay | 支付宝支付 | alipay-sdk v3.4.0 |
| 钱包支付 | wallet | 余额支付 | 内部实现 |

## 支付流程

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  用户下单  │───→│ 创建支付  │───→│ 调起支付  │───→│ 支付完成  │
│          │    │          │    │          │    │          │
└──────────┘    └──────────┘    └──────────┘    └────┬─────┘
                                                     │
                              ┌──────────────────────┘
                              ▼
                       ┌──────────────┐
                       │  支付回调     │
                       │ 更新订单状态  │
                       └──────────────┘
```

## 支付状态

| 状态码 | 说明 |
|--------|------|
| 0 | 待支付 |
| 1 | 支付成功 |
| 2 | 支付失败 |
| 3 | 已关闭 |

## 创建支付

### 请求

```http
POST /api/v1/payments/
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": 1,
  "paymentMethod": "wechat"
}
```

### 响应示例

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

## 支付回调

### 微信支付回调

```http
POST /api/v1/payments/wechat/notify
```

### 支付宝回调

```http
POST /api/v1/payments/alipay/notify
```

## 退款流程

### 退款状态

| 状态码 | 说明 |
|--------|------|
| 0 | 待审核 |
| 1 | 审核通过 |
| 2 | 审核拒绝 |
| 3 | 退款成功 |
| 4 | 退款失败 |

### 申请退款

```http
POST /api/v1/orders/:id/refund
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "退款原因"
}
```

### 退款规则

- 报名截止6小时前退款：平台佣金5%，退款用户95%
- 报名截止12小时前退款：平台佣金5%，退款用户80%，组织者15%
- 报名截止6小时内退款：平台佣金5%，退款用户70%，组织者25%

## 配置参数

```bash
# 微信支付配置
WECHAT_PAY_MCHID=xxx
WECHAT_PAY_SERIAL_NO=xxx
WECHAT_PAY_PRIVATE_KEY_PATH=./certs/wechat_pay_private_key.pem
WECHAT_PAY_API_V3_KEY=xxx

# 支付宝配置
ALIPAY_APP_ID=xxx
ALIPAY_PRIVATE_KEY=xxx
ALIPAY_PUBLIC_KEY=xxx
```

## 错误码

| 错误码 | HTTP状态码 | 说明 |
|--------|-----------|------|
| PAYMENT_FAILED | 400 | 支付失败 |
| INSUFFICIENT_BALANCE | 400 | 余额不足 |
| ORDER_ALREADY_PAID | 400 | 订单已支付 |
| ORDER_EXPIRED | 400 | 订单已过期 |
| REFUND_NOT_ALLOWED | 400 | 不允许退款 |
