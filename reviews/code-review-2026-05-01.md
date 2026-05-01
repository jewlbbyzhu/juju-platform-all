# 代码审查报告

**日期**: 2026-05-01
**审查人**: code-reviewer
**状态**: ⚠️ 有问题

## 重大发现

| # | 严重度 | 文件 | 问题 | 建议 |
|---|--------|------|------|------|
| 1 | 🔴 | auth.js | 硬编码万能验证码 `123456` 在3处出现 | 删除万能码，生产环境禁止明文验证 |
| 2 | 🔴 | config/index.ts | `isDev = true` 硬编码，生产APK会直连本地后端 | 改为基于 `__DEV__` 或环境变量 |
| 3 | 🔴 | server.js | CORS `origin: '*'` 生产暴露 | 限制为具体域名列表 |
| 4 | 🟡 | auth.js | 明文密码支持（legacy migration）`password === user.password` | 强制要求旧用户设置bcrypt密码后禁用 |
| 5 | 🟡 | server.js | 全局 Rate Limiter 被注释禁用 | 生产前启用限流，防止暴力攻击 |
| 6 | 🟡 | auth.js | 微信登录 hardcoded openid `smoke_openid_68713bff0761d19bdf351646` | 移至环境变量配置 |

## 认证/授权

| 检查项 | 状态 | 说明 |
|--------|------|------|
| JWT 验证 | ✅ | `auth.js` 中间件正确验证 JWT，tokenType 检查 |
| Token 黑名单 | ✅ | `TokenBlacklist` 支持登出后失效 |
| 密码加密 | ⚠️ | bcrypt 已采用，但保留明文迁移通道 (auth.js:114-122) |
| 管理后台认证 | ✅ | `adminAuth` 独立实现，使用 bcrypt.compare |
| 验证码频率限制 | ✅ | `checkRateLimit()` 内存限速 60s/5次 |
| 支付密码验证 | ⚠️ | `payOrder` 接收 paymentPassword 但未强制验证 |

## SQL注入风险

| 文件 | 风险 | 说明 |
|------|------|------|
| auth.js | ✅ 低 | Sequelize ORM 参数化查询 |
| orders.js | ✅ 低 | Joi 验证 + Sequelize ORM |
| parties.js | ✅ 低 | Sequelize ORM |
| walletService.js | ✅ 低 | bcrypt 密码比较 |
| adminService.js | ✅ 低 | Sequelize ORM |

**结论**: 核心路由(auth, parties, orders, payments)均使用 Sequelize ORM，无直接 SQL 拼接。LIKE 查询使用 Op.like 但字段名被白名单控制。

## 敏感信息泄露检查

| 项目 | 状态 |
|------|------|
| `.env` 密钥管理 | ✅ 使用环境变量，无硬编码密钥 |
| 日志敏感数据 | ✅ `logSanitizer` 中间件过滤 password/token/secret |
| API 错误信息 | ✅ 统一错误格式，未暴露内部路径 |
| 万能验证码日志 | ⚠️ `[DEV]` 标签但仍打印到 console |
| WeChat secret 在 URL | ⚠️ 日志会记录完整 URL（含 secret 参数）|
| alertService.js 默认密码 | ⚠️ `'your-password'` 占位符在代码中 |

## 错误处理

| 检查项 | 状态 |
|--------|------|
| 全局错误处理 | ✅ `errorHandler` 中间件统一处理 |
| 异步错误捕获 | ✅ 所有 async 路由包裹 try/catch |
| 错误日志记录 | ✅ `logger.error()` |
| 参数验证 | ✅ Joi validators for orders |
| 业务异常分级 | ✅ 400/401/404/500 分级响应 |

## React Native 安全实践

| 检查项 | 状态 | 说明 |
|--------|------|------|
| API 地址 | 🔴 | `isDev = true` 硬编码，APK 会连接 `10.0.2.2:18789` |
| Token 存储 | ⚠️ | 使用 AsyncStorage（未加密），生产应加密 |
| JS Bundle 敏感信息 | ✅ | 未检测到硬编码密钥 |
| HTTPS | ℹ️ | `config/index.ts` 使用 http，生产需确认 TLS |
| 10.0.2.2 模拟器地址 | ⚠️ | 生产构建时应自动切换到 `REMOTE_API` |

## 低风险问题

| # | 文件 | 问题 | 建议 |
|---|------|------|------|
| 1 | server.js | `console.log` 替代 logger | 统一使用 logger |
| 2 | auth.js | `jwt` 在每个请求内 require | 提升到文件顶部导入 |
| 3 | orders.js | `/:id` 路由缺参数类型验证 | 建议加 `validateObjectId` 中间件 |
| 4 | adminService.js | `getClientIP()` 永远返回 `127.0.0.1` | 实现真实 IP 提取 |
| 5 | auth.js (reset-password) | 验证码校验缺失 | 重置密码应验证短信验证码 |

## 下一步

1. **[高]** 修改 `config/index.ts`：`isDev = !!__DEV__`，生产构建自动切换到 `REMOTE_API`
2. **[高]** 删除万能验证码 `123456`（auth.js 3处）
3. **[高]** 生产环境 CORS 限制为具体域名
4. **[高]** 生产前启用 rate limiter
5. **[中]** 移除明文密码迁移通道，强制所有用户使用 bcrypt
6. **[中]** 微信 openid 移至环境变量
7. **[低]** 统一使用 logger 替代 console.log
8. **[低]** 微信登录占位 openid 配置化
