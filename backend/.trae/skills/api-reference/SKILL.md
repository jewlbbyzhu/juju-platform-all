---
name: "api-reference"
description: "提供聚聚平台API整体概览和通用规范，包括版本说明、认证方式、错误码、分页规范。当用户询问API概览、通用规范或需要了解整体API结构时调用。"
---

# API参考 Skill

## 使用范围
- API整体概览
- 通用规范和约定
- 错误码参考
- 认证方式说明

## 内容边界
本Skill仅提供API概览和通用规范，具体模块API请查看：
- 用户API（见 user-module Skill）
- 聚会API（见 party-module Skill）
- 订单API（见 order-module Skill）
- 钱包API（见 wallet-module Skill）
- VIP API（见 vip-module Skill）

## API 版本

| 版本 | 路径前缀 | 说明 |
|------|----------|------|
| V1 | `/api/v1/*` | 用户端API，面向微信小程序、uni-app |
| V2 | `/api/v2/*` | 管理端API，面向Web管理后台 |

## 基础 URL

```
开发环境: http://localhost:3000
生产环境: https://api.jujuparty.com
```

## 请求格式

- **Content-Type**: `application/json`
- **字符编码**: UTF-8
- **时间格式**: ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)
- **金额单位**: 分 (接口传输)，元 (显示)

## 响应格式

```json
{
  "success": true,
  "message": "操作成功",
  "data": {},
  "timestamp": "2026-01-01T00:00:00.000Z"
}
```

## 认证方式

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

## 分页规范

### 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | integer | 否 | 1 | 页码 |
| limit | integer | 否 | 20 | 每页数量 |

### 响应格式

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

## 限流说明

| 限流级别 | 配置 | 适用场景 |
|----------|------|----------|
| 通用限流 | 15分钟100请求 | 普通接口 |
| 严格限流 | 1分钟100请求 | 支付、提现等敏感操作 |
| 认证限流 | 15分钟1000请求 | 登录、注册等认证接口 |

## 通用错误码

| 错误码 | HTTP状态码 | 说明 |
|--------|-----------|------|
| SUCCESS | 200 | 操作成功 |
| UNKNOWN_ERROR | 500 | 未知错误 |
| VALIDATION_ERROR | 400 | 参数验证错误 |
| NOT_FOUND | 404 | 资源不存在 |

## 认证错误码

| 错误码 | HTTP状态码 | 说明 |
|--------|-----------|------|
| UNAUTHORIZED | 401 | 未授权 |
| TOKEN_EXPIRED | 401 | Token已过期 |
| TOKEN_INVALIDATED | 401 | Token已失效 |
| INVALID_TOKEN | 400 | 无效的Token |
| INVALID_REFRESH_TOKEN | 401 | 无效的刷新Token |
| REFRESH_TOKEN_EXPIRED | 401 | 刷新Token已过期 |

## 业务错误码

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

## 状态码速查

### 聚会状态
- `-1`: 草稿
- `0`: 待审核
- `1`: 已发布
- `2`: 进行中
- `3`: 已结束
- `4`: 已取消

### 订单状态
- `0`: 待支付
- `1`: 已支付
- `2`: 处理中
- `3`: 已完成
- `4`: 已取消
- `5`: 退款中
- `6`: 已退款

### 票券状态
- `0`: 未使用
- `1`: 已使用
- `2`: 已过期
- `3`: 已退款
- `4`: 已作废

### 支付状态
- `0`: 待支付
- `1`: 支付成功
- `2`: 支付失败
- `3`: 已关闭

### 退款状态
- `0`: 待审核
- `1`: 审核通过
- `2`: 审核拒绝
- `3`: 退款成功
- `4`: 退款失败

### VIP订阅状态
- `0`: 已过期
- `1`: 订阅成功
- `2`: 已取消

## 模块API索引

| 模块 | Skill名称 | 说明 |
|------|-----------|------|
| 用户模块 | user-module | 注册、登录、资料管理 |
| 聚会模块 | party-module | 聚会列表、详情、创建、审核 |
| 订单模块 | order-module | 创建订单、查询、取消、退款 |
| 钱包模块 | wallet-module | 钱包信息、充值、提现、银行卡 |
| VIP模块 | vip-module | VIP套餐、购买、权益 |
| 支付系统 | payment-system | 支付方式、流程、回调 |
| 认证系统 | auth-system | JWT、Token管理、权限 |
| 数据模型 | data-models | 数据库模型、表结构、关系 |
| 后端架构 | backend-architecture | 系统架构、技术栈、目录结构 |
