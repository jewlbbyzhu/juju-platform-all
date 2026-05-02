# JUJU App 代码审查报告

**日期**: 2026-05-02 (第二次审查)
**审查人**: code-reviewer
**审查范围**: backend/src/routes/v1/auth.js · backend/src/server.js · JujuApp_new/src/config/index.ts
**状态**: ⚠️ 有问题（较上次审查改善明显，2个严重问题已修复）

---

## 重大发现

| # | 严重度 | 文件 | 问题 | 建议 |
|---|--------|------|------|------|
| 1 | 🟡 中 | `auth.js` L72-88 | `phone-login` 路由跳过验证码校验 | 移除注释掉的万能码支持，改为必须验证短信验证码 |
| 2 | 🟡 中 | `server.js` L54 | CORS `credentials: process.env.CORS_CREDENTIALS=*** 'true'` 语法错误 | 修复为三元表达式 |
| 3 | 🟡 中 | `encryption.js` L408 | 硬编码默认密钥 `default_key_1234567890123456` | 确保 `ENCRYPTION_MASTER_KEY` 已配置生产值 |
| 4 | 🟡 中 | `userController.js` L24-27 | 测试 openid `smoke_openid_*` 硬编码 | 测试完应删除或环境变量化 |
| 5 | 🟡 中 | `auth.js` L338-359 | 重置密码不验证旧密码，仅需手机号+新密码 | 增加旧密码验证防止账户劫持 |

---

## 已修复（较2026-05-01）

| 项目 | 状态 |
|------|------|
| 万能验证码 `123456` | ✅ 已改为随机6位码 |
| `isDev = true` 硬编码 | ✅ `JujuApp_new/src/config/index.ts` L4 改为 `typeof __DEV__ !== 'undefined' && __DEV__` |
| bcrypt mock 漏洞 | ✅ 已使用真实 bcrypt.compare |
| SQL 拼接注入 | ✅ Sequelize ORM 参数化 |
| 管理后台 bcrypt | ✅ adminService 正确使用 bcrypt.compare |
| 明文密码迁移通道 | ⚠️ 仍存在（低风险：仅首次登录时自动升级） |

---

## 低风险问题

| # | 文件 | 问题 | 建议 |
|---|------|------|------|
| 1 | `auth.js` L260,294 | `jwt` 在函数内 require，风格问题 | 提升到文件顶部统一导入 |
| 2 | `server.js` L56-61 | Rate Limiter 被注释禁用 | 生产前启用，防止暴力攻击 |
| 3 | `auth.js` L114-117 | 明文密码比对（迁移通道） | 用户迁移完成后删除此分支 |
| 4 | `auth.js` L40,53,66 | `console.log` 替代 logger | 统一使用 logger |

---

## 安全实践 ✅

| 项目 | 说明 |
|------|------|
| JWT 认证 | Bearer Token + 7d/30d 过期 |
| 密码加密 | bcrypt saltRounds=10 |
| Helmet 安全头 | HSTS/X-Frame-Options 等 |
| 输入校验 | Joi validators (orders) |
| SQL 注入 | Sequelize ORM 参数化 |
| Token 黑名单 | 登出后失效 |
| 敏感数据脱敏 | dataMasking 中间件 |
| 银行加密 | aes-256-gcm |
| CORS 可配置 | `CORS_ORIGIN` 环境变量控制 |
| API 限速 | 内存限速 60s/5次 (验证码) |

---

## API路由鉴权

| 端点 | 鉴权 | 备注 |
|------|------|------|
| `POST /auth/phone-login` | ❌ 无需认证 | ⚠️ 验证码校验缺失 |
| `POST /auth/login` | ❌ 无需认证 | |
| `POST /auth/register` | ❌ 无需认证 | |
| `GET /parties` | ❌ 公开 | |
| `POST /parties` | ✅ auth | |
| `GET /orders` | ✅ auth | |
| `POST /orders/:id/refund` | ✅ auth + strictLimiter | |

---

## 认证/授权

| 检查项 | 状态 | 说明 |
|--------|------|------|
| JWT 验证 | ✅ | `auth.js` 中间件正确验证 JWT |
| Token 黑名单 | ✅ | `TokenBlacklist` 支持登出后失效 |
| 密码加密 | ✅/⚠️ | bcrypt 已采用，保留明文迁移通道（低风险） |
| 管理后台认证 | ✅ | `adminAuth` 独立实现，使用 bcrypt.compare |
| 验证码频率限制 | ✅ | 内存限速 60s/5次 |
| 支付密码验证 | ⚠️ | `payOrder` 接收 paymentPassword 但未强制验证 |

---

## 下一步

1. **[高]**: `phone-login` 路由增加验证码强制校验，移除开发环境万能码注释
2. **[高]**: 修复 `server.js` L54 CORS credentials 语法错误
3. **[中]**: 生产前启用 server.js Rate Limiter
4. **[中]**: 删除 `userController.js` 测试 openid 硬编码
5. **[中]**: 确保 `ENCRYPTION_MASTER_KEY` 生产环境已配置
6. **[中]**: `reset-password` 增加旧密码验证
7. **[低]**: 统一 logger 替代 console.log
8. **[低]**: jwt require 提升到文件顶部
