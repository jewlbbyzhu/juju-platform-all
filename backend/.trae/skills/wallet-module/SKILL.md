---
name: "wallet-module"
description: "提供聚聚平台钱包模块API详情，包括钱包信息、交易记录、充值、提现、银行卡管理。当用户询问钱包API、充值提现、银行卡或交易记录时调用。"
---

# 钱包模块 API Skill

## 使用范围
- 钱包信息查询
- 交易记录查询
- 充值和提现
- 银行卡管理

## 内容边界
本Skill仅包含钱包模块API，不涉及：
- 支付相关功能（见 payment-system Skill）
- 订单相关功能（见 order-module Skill）
- 数据模型定义（见 data-models Skill）

## API 端点

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

### 设置支付密码

```http
POST /api/v1/wallet/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "password": "新密码"
}
```

### 修改支付密码

```http
PUT /api/v1/wallet/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "oldPassword": "旧密码",
  "newPassword": "新密码"
}
```

## 银行卡管理

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

### 获取银行卡列表

```http
GET /api/v1/wallet/bankcards
Authorization: Bearer <token>
```

### 删除银行卡

```http
DELETE /api/v1/wallet/bankcards/:id
Authorization: Bearer <token>
```

### 设为默认银行卡

```http
PUT /api/v1/wallet/bankcards/:id/default
Authorization: Bearer <token>
```

## 提现规则

### 提现条件
- 钱包余额必须大于提现金额
- 必须设置支付密码
- 必须绑定银行卡

### 提现限制
- 单次提现最低金额：1元
- 单次提现最高金额：10000元
- 每日提现次数限制：3次
- 每月提现金额限制：30000元

### 提现状态
- 待审核：提交后等待审核
- 处理中：正在处理提现
- 已完成：提现成功
- 已拒绝：提现被拒绝

## 错误码

| 错误码 | HTTP状态码 | 说明 |
|--------|-----------|------|
| INSUFFICIENT_BALANCE | 400 | 余额不足 |
| WITHDRAWAL_FAILED | 400 | 提现失败 |
| INVALID_PASSWORD | 400 | 支付密码错误 |
| BANK_CARD_NOT_FOUND | 404 | 银行卡不存在 |
| WITHDRAWAL_LIMIT_EXCEEDED | 400 | 超出提现限制 |
