# 代码审查报告

**日期**: 2026-05-02
**审查人**: code-reviewer
**状态**: ⚠️ 有问题

---

## 审查范围

| 模块 | 路径 |
|------|------|
| 后端API路由 | `backend/src/routes/v1/` |
| 认证/鉴权 | `backend/src/routes/v1/auth.js`, `backend/src/middleware/auth.js` |
| 订单/活动API | `backend/src/routes/v1/parties.js`, `backend/src/routes/v1/orders.js` |
| 安全中间件 | `backend/src/middleware/securityHeaders.js`, `backend/src/middleware/rateLimiter.js` |
| React Native APP | `JujuApp_new/src/api/` |

---

## 重大发现

| # | 严重度 | 文件 | 问题 | 建议 |
|---|--------|------|------|------|
| 1 | 🔴 中 | `auth.js` L75-78 | 开发环境万能码 `123456` 直接写在注释中，实际逻辑通过但未强制废弃 | 生产环境移除万能码逻辑 |
| 2 | 🔴 低 | `auth.js` L106-123 | 明文密码迁移逻辑存在 — 用户密码以明文存储时直接比对而非哈希 | 强制所有明文密码迁移为bcrypt，可设置截止日期 |
| 3 | 🟡 中 | `encryption.js` L408 | 硬编码默认加密密钥 `default_key_1234567890123456` | 确保 `.env` 中 `ENCRYPTION_MASTER_KEY` 已正确配置，代码中 fallback 不应存在 |
| 4 | 🟡 中 | `auth.js` L157 | 微信登录 `openid` 硬编码为 `smoke_openid_68713bff0761d19bdf351646` | 生产应调用微信API获取真实openid |
| 5 | 🟡 中 | `rateLimiter.js` L27 | `strictLimiter` 限流阈值 100次/分钟，对支付/退款等敏感操作过宽松 | 支付、退款等操作应限制为 10-20次/分钟 |
| 6 | 🟡 中 | `server.js` L47-51 | CORS 默认允许 `['*']` 任何来源，生产环境暴露风险 | 明确配置 `CORS_ORIGIN` 环境变量，禁止生产环境使用通配符 |
| 7 | 🟡 中 | `securityHeaders.js` | CSP `connectSrc: ['\'self\'']` 过于严格，API请求会被阻止 | 应允许实际API域名；`imgSrc` 已有 `https:` 支持外部图片 |

---

## 低风险问题

| # | 文件 | 问题 | 建议 |
|---|------|------|------|
| 1 | `auth.js` L39/52/65 | 验证码通过 `console.log` 输出到服务器日志 | 替换为真实短信服务商或专用日志 |
| 2 | `rateLimiter.js` | 内存限速（`rateLimitMap`）在多实例部署时不共享 | 改用 Redis 存储限速状态 |
| 3 | `auth.js` L116-122 | 明文密码升级为bcrypt后用户需重新登录，但无通知 | 升级成功后推送通知告知用户 |
| 4 | `auth.js` L323-343 | 重置密码不需要验证旧密码 | 增加旧密码验证步骤 |
| 5 | `server.js` L52-57 | 全局限流被注释禁用（`app.use(limiter)`） | 测试完成后重新启用全局限流 |

---

## 安全实践（已正确实现 ✅）

| 项目 | 说明 |
|------|------|
| JWT Token | 使用 `jsonwebtoken` + `Bearer` 认证，过期时间 7d/30d |
| 密码存储 | 新用户使用 `bcrypt` (saltRounds=10) |
| Helmet | 安全响应头已配置（HSTS, X-Frame-Options, XSS等） |
| 请求验证 | 使用 Joi 进行输入校验（`orderValidator.js`） |
| SQL注入防护 | Sequelize ORM 参数化查询，无直接拼接SQL |
| Token黑名单 | `TokenBlacklist` 支持登出后token失效 |
| 敏感数据脱敏 | `dataMasking` 中间件记录审计日志 |
| 银行加密 | 银行卡使用 `aes-256-gcm` 加密 |

---

## API路由鉴权分析

| 端点 | 鉴权 | 备注 |
|------|------|------|
| `POST /auth/phone-login` | ❌ 无需认证 | 验证码+手机号 |
| `POST /auth/login` | ❌ 无需认证 | 手机号+密码或微信code |
| `POST /auth/register` | ❌ 无需认证 | 注册接口 |
| `GET /parties` | ❌ 公开 | 活动列表 |
| `GET /parties/:id` | ❌ 公开 | 活动详情 |
| `POST /parties` | ✅ `auth` | 创建活动需登录 |
| `GET /orders` | ✅ `auth` | 订单列表需登录 |
| `GET /orders/:id` | ✅ `auth` | 订单详情需登录 |
| `POST /orders/:id/refund` | ✅ `auth` + `strictLimiter` | 退款需登录+限流 |

---

## 下一步

1. **紧急**: 移除 `openid` 硬编码，改为真实微信API调用
2. **高优**: 配置 `CORS_ORIGIN` 环境变量，禁止生产环境 `*`
3. **高优**: 移除 `encryption.js` 中的默认密钥 fallback
4. **中优**: 支付/退款接口限流阈值从 100次/分钟降至 10-20次
5. **中优**: 完成明文密码迁移后，删除明文比对分支代码
6. **低优**: 重新启用 `server.js` 中的全局限流中间件
7. **低优**: 验证码发送改用真实短信服务商
