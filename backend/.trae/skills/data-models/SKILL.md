---
name: "data-models"
description: "提供聚聚平台数据库模型定义、表结构、字段说明和模型关系。当用户询问数据库设计、表结构、模型字段或数据关系时调用。"
---

# 数据模型 Skill

## 使用范围
- 数据库模型设计咨询
- 表结构和字段说明
- 模型关系查询
- 数据类型和约束

## 内容边界
本Skill仅包含数据模型信息，不涉及：
- API调用方式（见各模块API Skill）
- 业务逻辑实现（见 backend-architecture Skill）
- 认证授权机制（见 auth-system Skill）

## 核心模型列表

| 模型 | 说明 | 文件位置 |
|------|------|----------|
| User | 用户模型 | models/User.js |
| Party | 聚会活动 | models/Party.js |
| TicketType | 票型定义 | models/TicketType.js |
| Ticket | 用户票券 | models/Ticket.js |
| Order | 订单 | models/Order.js |
| OrderItem | 订单项 | models/OrderItem.js |
| Payment | 支付记录 | models/Payment.js |
| Refund | 退款记录 | models/Refund.js |
| Wallet | 钱包 | models/Wallet.js |
| WalletTransaction | 钱包交易 | models/WalletTransaction.js |
| BankCard | 银行卡 | models/BankCard.js |
| Favorite | 收藏 | models/Favorite.js |
| Notification | 通知 | models/Notification.js |
| VIPMembership | VIP会员 | models/VIPMembership.js |
| Admin | 管理员 | models/Admin.js |

## 模型关系图

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

## 关键模型字段

### User 模型

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| openid | STRING(100) | 微信openid |
| unionid | STRING(100) | 微信unionid |
| phone | STRING(20) | 手机号 |
| nickname | STRING(50) | 昵称 |
| avatar | STRING(500) | 头像URL |
| gender | INTEGER | 性别: 0-未知, 1-男, 2-女 |
| birthday | DATE | 生日 |
| is_vip | BOOLEAN | 是否VIP |
| vip_level | INTEGER | VIP等级 |
| vip_expires_at | DATE | VIP过期时间 |
| status | INTEGER | 状态: 0-禁用, 1-正常 |

### Party 模型

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| title | STRING(200) | 聚会标题 |
| description | TEXT | 聚会描述 |
| cover_image | STRING(500) | 封面图 |
| images | JSON | 图片列表 |
| category | STRING(50) | 分类 |
| start_time | DATE | 开始时间 |
| end_time | DATE | 结束时间 |
| location | STRING(200) | 地点 |
| address | STRING(500) | 详细地址 |
| latitude | DECIMAL | 纬度 |
| longitude | DECIMAL | 经度 |
| max_participants | INTEGER | 最大人数 |
| status | INTEGER | 状态: -1草稿, 0待审核, 1已发布, 2进行中, 3已结束, 4已取消 |
| organizer_id | INTEGER | 组织者ID |

### Order 模型

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| order_no | STRING(50) | 订单号 |
| user_id | INTEGER | 用户ID |
| party_id | INTEGER | 聚会ID |
| amount | INTEGER | 订单金额(分) |
| status | INTEGER | 状态: 0待支付, 1已支付, 2处理中, 3已完成, 4已取消, 5退款中, 6已退款 |
| remark | STRING(500) | 备注 |
| expire_at | DATE | 过期时间 |

### Wallet 模型

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| user_id | INTEGER | 用户ID |
| balance | INTEGER | 余额(分) |
| frozen_amount | INTEGER | 冻结金额(分) |
| total_income | INTEGER | 总收入(分) |
| total_expense | INTEGER | 总支出(分) |
| password_hash | STRING(255) | 支付密码哈希 |

## 状态码定义

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
