# JUJU App 代码审查报告

**日期**: 2026-05-03
**审查人**: code-reviewer
**状态**: ⚠️ 有问题（3个P0遗留未修复）

---

## 🔴 P0 遗留未修复（距上次审查2天）

| # | 严重度 | 文件 | 问题 | 首次发现 | 当前状态 |
|---|--------|------|------|----------|----------|
| 1 | 🔴 | JujuApp_new/src/config/index.ts | `isDev = true` 硬编码，生产APK会直连 `10.0.2.2:18789` | 2026-05-01 | **未修复** |
| 2 | 🔴 | backend/src/routes/v1/auth.js | `reset-password` 路由不验证短信验证码，攻击者只需手机号即可重置任意账户密码 | 2026-05-02 | **未修复** |
| 3 | 🔴 | backend/.env | CORS_ORIGIN=* 允许所有来源，生产环境XSS风险 | 2026-05-01 | **未修复** |

---

## ✅ 已修复问题

| # | 文件 | 问题 | 修复时间 |
|---|------|------|----------|
| 1 | auth.js | 硬编码万能验证码 `123456`（3处） | 2026-05-02前 |
| 2 | auth.js | 开发环境验证码通过 console.log 输出 | 部分修复（仍存在日志） |

---

## 新发现问题

### 🟡 中风险

| # | 文件 | 问题 | 建议 |
|---|------|------|------|
| 1 | backend/src/routes/v1/auth.js:115-123 | **明文密码迁移通道**仍然存在：`password === user.password` 明文比对，完成迁移后应禁用 | 完成所有旧用户迁移后删除此代码分支 |
| 2 | backend/src/routes/v1/auth.js:354 | `reset-password` 中 `oldPassword` 比对也走明文通道 | 同上 |
| 3 | backend/src/middleware/auth.js:15-17 | `isValidTestToken()` 仅在 NODE_ENV=test 时生效，但测试token机制可能被滥用 | 生产环境确保 NODE_ENV!=test |
| 4 | backend/src/server.js:56-61 | 全局 Rate Limiter 被注释禁用（`// app.use(limiter)`） | 生产前启用，或确保有其他限流保护 |

### 🟢 低风险

| # | 文件 | 问题 | 建议 |
|---|------|------|------|
| 1 | backend/src/routes/v1/auth.js:40,53,66 | `[DEV]` 日志标签但仍使用 console.log 打印验证码 | 改用 logger.info 并加 NODE_ENV 检查 |
| 2 | backend/src/routes/v1/auth.js:260,294 | `jwt` 在函数内部 require，而非文件顶部导入 | 提升到文件顶部 |
| 3 | backend/src/routes/v1/auth.js:160-172 | 微信登录 placeholder comment 占位，生产需替换为真实API | 确保生产部署前实现 |
| 4 | JujuApp_new/src/config/index.ts | 生产环境使用 HTTPS，但代码注释注明需确认 TLS | 验证服务器已配置有效证书 |

---

## 认证/授权现状 ✅

| 检查项 | 状态 | 说明 |
|--------|------|------|
| 密码加密 | ✅/⚠️ | bcrypt(salt=10)已采用，但保留明文迁移通道 |
| JWT验证 | ✅ | auth中间件正确验证，有tokenType和黑名单检查 |
| Token黑名单 | ✅ | TokenBlacklist支持登出失效 |
| 管理后台认证 | ✅ | adminAuth使用bcrypt.compare |
| 验证码频率限制 | ✅ | 内存限速60s/5次 |
| SQL注入防护 | ✅ | Sequelize ORM参数化查询 |
| 敏感数据加密 | ✅ | AES-256-GCM加密银行卡等字段 |
| 输入验证 | ✅ | Joi validators完善 |

---

## 敏感信息检查 ✅

| 检查项 | 状态 |
|--------|------|
| .env密钥管理 | ✅ 使用环境变量 |
| 日志敏感数据 | ✅ logSanitizer过滤password/token/secret |
| API错误信息 | ✅ 统一错误格式，未暴露内部路径 |
| 前端硬编码密钥 | ✅ 未发现 |
| 万能验证码 | ✅ 已删除 |

---

## 修复优先级

| 优先级 | 问题 | 影响 |
|--------|------|------|
| **P0** | isDev硬编码 | APK无法连接真实后端 |
| **P0** | reset-password无验证码校验 | 账户可被劫持 |
| **P0** | CORS=* | 生产环境XSS |
| **P1** | 明文密码迁移通道 | 旧用户账户风险 |
| **P1** | 全局Rate Limiter禁用 | 暴力攻击无防护 |
| **P2** | console.log验证码日志 | 信息泄露 |
| **P2** | jwt内部require | 代码风格 |

---

## 下一步

1. **[立即]** 修改 `JujuApp_new/src/config/index.ts`：改为 `const isDev = __DEV__ || process.env.NODE_ENV === 'development'`
2. **[立即]** 修复 `reset-password`：必须验证 `verificationCode` 与 `phone` 匹配
3. **[立即]** 生产环境CORS配置为具体域名白名单
4. **[尽快]** 完成后端明文密码用户迁移，删除明文比对代码
5. **[计划]** 生产部署前启用全局rate limiter

---

## 涉及的关键文件

- `JujuApp_new/src/config/index.ts` — isDev硬编码
- `backend/src/routes/v1/auth.js` — 密码重置漏洞、明文密码迁移通道
- `backend/.env` — CORS配置
- `backend/src/middleware/auth.js` — JWT验证
- `backend/src/server.js` — Rate Limiter注释禁用
- `backend/src/middleware/rateLimiter.js` — 限流配置
