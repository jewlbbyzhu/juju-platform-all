# JUJU App 代码审查报告

**日期**: 2026-05-02
**审查人**: code-reviewer
**状态**: ⚠️ 有问题

---

## 重大发现

| # | 严重度 | 文件 | 问题 | 建议 |
|---|--------|------|------|------|
| 1 | 🔴 | backend/src/routes/v1/auth.js | **密码重置漏洞**：`reset-password` 路由不验证验证码，攻击者只需知道手机号即可重置任意账户密码 | 必须验证 `verificationCode` 与 `phone` 匹配后才允许重置 |
| 2 | 🔴 | 环境配置 | JWT_SECRET 可能暴露在开发文档中 | 确保生产环境使用真正随机生成的强密钥（≥32字符） |
| 3 | 🟡 | backend/src/routes/v1/auth.js | 开发环境验证码通过 `console.log` 输出泄漏 | 使用专用logger并设置NODE_ENV检查 |
| 4 | 🟡 | 后端各Service | LIKE查询无长度限制，可能导致DoS | keyword最大长度限制（如50字符） |
| 5 | 🟡 | 后端CORS配置 | `CORS_ORIGIN=*` 允许所有来源 | 生产环境应指定具体域名白名单 |
| 6 | 🟢 | 前端src/store/index.ts | persist存储用户信息，设备被root/越狱后可能泄露 | Token/认证状态应仅存于内存或使用加密存储 |
| 7 | 🟢 | backend/src/utils/encryption.js | 存在弱XOR加密函数 | 确认是否被实际调用，若无则移除 |

---

## 做得好的方面 ✅

| 项目 | 状态 | 说明 |
|------|------|------|
| 密码加密 | ✅ | 使用 bcrypt (saltRounds=12)，注册时正确哈希 |
| 密码迁移 | ✅ | 明文密码自动升级为bcrypt，兼顾旧数据兼容 |
| SQL查询 | ✅ | Sequelize ORM + 参数化查询，无拼接SQL |
| 敏感数据加密 | ✅ | AES-256-GCM 加密银行卡、身份证等敏感字段 |
| JWT安全 | ✅ | access/refresh token分离，TokenBlacklist防重用 |
| 错误处理 | ✅ | 生产环境不返回stack trace，使用统一errorHandler |
| 速率限制 | ✅ | express-rate-limit + 内存限速(验证码场景) |
| 环境变量配置 | ✅ | 所有密钥通过 process.env 读取，.env不在git |
| API密钥泄露 | ✅ | 前端未发现硬编码API密钥 |
| 输入验证 | ✅ | 验证函数完善，覆盖密码强度等 |

---

## 修复优先级

| 优先级 | 问题 | 影响 |
|--------|------|------|
| **P0** | reset-password 不验证验证码 | 账户可被劫持 |
| **P0** | 生产JWT_SECRET是否足够强 | Token伪造风险 |
| **P1** | LIKE查询无长度限制 | 潜在DoS |
| **P1** | CORS=* 生产环境 | XSS攻击风险 |
| **P2** | console.log验证码泄漏 | 信息泄露 |
| **P2** | 邮件告警默认地址 | 告警误导 |

---

## 下一步

1. **立即修复 P0 问题**：密码重置路由必须验证验证码
2. **审计生产JWT_SECRET**：确保使用真正随机生成的强密钥
3. **配置生产CORS**：指定具体域名白名单
4. **限制搜索关键词长度**：防止DoS攻击
5. **移除console.log验证码输出**：使用专用logger

---

## 涉及的关键文件

- `backend/src/routes/v1/auth.js` — 密码重置漏洞、验证码日志
- `backend/src/middleware/auth.js` — JWT验证
- `backend/src/config/database.js` — 数据库连接（安全）
- `backend/src/utils/errorHandler.js` — 错误处理（安全）
- `backend/src/utils/encryption.js` — 加密工具（整体安全，有弱函数）
- `backend/src/middleware/rateLimiter.js` — 速率限制（安全）
- `frontend/src/store/index.ts` — persist存储用户信息
- `frontend/src/utils/validation.ts` — 输入验证（良好）
