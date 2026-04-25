# 聚聚平台 Skill 文档系统

> **标签**: long-term memory  
> **版本**: 1.0  
> **更新日期**: 2026-02-01

---

## 简介

本文档系统采用 **Skill 模块化设计**，将后端架构和 API 文档拆分为多个独立的单元文档。每个 Skill 都有明确的**使用范围**和**内容边界**，便于快速定位和检索信息。

---

## Skill 列表

### 架构类 Skill

| Skill 名称 | 文件路径 | 触发关键词 |
|------------|----------|------------|
| [backend-architecture](backend-architecture/SKILL.md) | `.trae/skills/backend-architecture/` | 后端架构、技术栈、目录结构、系统分层 |
| [data-models](data-models/SKILL.md) | `.trae/skills/data-models/` | 数据模型、表结构、数据库设计、模型关系 |
| [auth-system](auth-system/SKILL.md) | `.trae/skills/auth-system/` | 认证、JWT、Token、登录、权限 |

### 业务模块 Skill

| Skill 名称 | 文件路径 | 触发关键词 |
|------------|----------|------------|
| [user-module](user-module/SKILL.md) | `.trae/skills/user-module/` | 用户API、注册、登录、用户资料 |
| [party-module](party-module/SKILL.md) | `.trae/skills/party-module/` | 聚会API、活动列表、聚会详情、审核 |
| [order-module](order-module/SKILL.md) | `.trae/skills/order-module/` | 订单API、下单、订单管理、退款 |
| [wallet-module](wallet-module/SKILL.md) | `.trae/skills/wallet-module/` | 钱包API、充值、提现、银行卡 |
| [vip-module](vip-module/SKILL.md) | `.trae/skills/vip-module/` | VIP、会员权益、VIP购买、订阅 |

### 系统类 Skill

| Skill 名称 | 文件路径 | 触发关键词 |
|------------|----------|------------|
| [payment-system](payment-system/SKILL.md) | `.trae/skills/payment-system/` | 支付、微信支付、支付宝、支付回调 |
| [api-reference](api-reference/SKILL.md) | `.trae/skills/api-reference/` | API概览、通用规范、错误码、状态码 |

---

## 使用指南

### 如何调用 Skill

当询问相关问题时，系统会自动调用对应的 Skill。您也可以明确指定要查看的 Skill：

```
"查看后端架构信息"  →  调用 backend-architecture Skill
"用户登录API是什么"  →  调用 user-module Skill
"数据库表结构"       →  调用 data-models Skill
"VIP会员权益"        →  调用 vip-module Skill
```

### Skill 调用规则

1. **自动触发**: 根据问题关键词自动匹配 Skill
2. **明确指定**: 可以直接说出 Skill 名称来指定
3. **多 Skill 组合**: 复杂问题可能涉及多个 Skill
4. **边界清晰**: 每个 Skill 只回答其范围内的内容

---

## 文档结构

```
.trae/skills/
├── README.md                           # 本文档 - Skill 系统总览
├── backend-architecture/
│   └── SKILL.md                        # 后端架构 Skill
├── data-models/
│   └── SKILL.md                        # 数据模型 Skill
├── auth-system/
│   └── SKILL.md                        # 认证系统 Skill
├── payment-system/
│   └── SKILL.md                        # 支付系统 Skill
├── api-reference/
│   └── SKILL.md                        # API 参考 Skill
├── user-module/
│   └── SKILL.md                        # 用户模块 API Skill
├── party-module/
│   └── SKILL.md                        # 聚会模块 API Skill
├── order-module/
│   └── SKILL.md                        # 订单模块 API Skill
├── wallet-module/
│   └── SKILL.md                        # 钱包模块 API Skill
└── vip-module/
    └── SKILL.md                        # VIP 模块 Skill
```

---

## 快速参考

### 按主题查找

| 主题 | 推荐 Skill |
|------|-----------|
| 系统架构设计 | backend-architecture |
| 数据库设计 | data-models |
| 登录认证流程 | auth-system |
| 支付集成 | payment-system |
| 用户相关功能 | user-module |
| 聚会活动功能 | party-module |
| 订单购买流程 | order-module |
| 钱包财务功能 | wallet-module |
| VIP会员体系 | vip-module |
| API通用规范 | api-reference |

### 按开发阶段查找

| 开发阶段 | 推荐 Skill |
|----------|-----------|
| 项目初始化 | backend-architecture, data-models |
| 用户模块开发 | user-module, auth-system |
| 聚会模块开发 | party-module, data-models |
| 订单支付开发 | order-module, payment-system |
| 钱包功能开发 | wallet-module, payment-system |
| VIP功能开发 | vip-module, data-models |

---

## Skill 格式规范

每个 Skill 文档遵循以下格式：

```markdown
---
name: "skill-name"
description: "Skill 描述，包含使用场景和触发条件"
---

# Skill 标题

## 使用范围
- 该 Skill 适用的问题类型

## 内容边界
- 该 Skill 不包含的内容
- 相关 Skill 的引用

## 详细内容
...
```

---

## 维护说明

1. **版本控制**: 每个 Skill 独立维护版本
2. **更新记录**: 在 Skill 文档底部记录更新历史
3. **关联引用**: 在内容边界中引用相关 Skill
4. **定期同步**: 当代码变更时同步更新对应 Skill

---

*本文档为聚聚平台 Skill 系统的入口文档，请根据需要调用对应的 Skill。*
