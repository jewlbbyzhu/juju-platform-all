# JUJU App 代码审查报告

**日期**: 2026-05-02
**审查人**: code-reviewer
**审查范围**: backend/src/routes/v1/v2 · JujuApp_new/src/config · middleware/auth · services
**状态**: ⚠️ 有问题（较上次审查改善明显）

---

## 重大发现

| # | 严重度 | 文件 | 问题 | 建议 |
|---|--------|------|------|------|
| 1 | 🔴 | `JujuApp_new/src/config/index.ts` L4 | `isDev = true` 硬编码，生产APK直连 `10.0.2.2:18789` | 改为 `const isDev = !!(typeof __DEV__ !== 'undefined' && __DEV__)` |
| 2 | 🟡 中 | `encryption.js` L408 | 硬编码默认密钥 `default_key_1234567890123456` | 确保 `ENCRYPTION_MASTER_KEY` 已配置，移除 fallback |
| 3 | 🟡 中 | `userController.js` L24-27 | 测试openid `smoke_openid_*` 硬编码 | 测试完应删除或环境变量化 |
| 4 | 🟡 中 | `rateLimiter.js` L27 | `strictLimiter` 100次/分钟对支付操作偏宽松 | 敏感操作降至 10-20次/分钟 |

---

## 低风险问题

| # | 文件 | 问题 | 建议 |
|---|------|------|------|
| 1 | `auth.js` L109 | `jwt` 在函数内 require，风格问题 | 提升到文件顶部 |
| 2 | `rateLimiter.js` | 内存限速在多实例不共享 | 改用 Redis |
| 3 | `auth.js` L323-343 | 重置密码不验证旧密码 | 增加旧密码验证 |
| 4 | `server.js` L38 | `credentials: process.env.CORS_CREDENTIALS=***` 语法错误 | 应为三元表达式 |

---

## 已修复（较2026-05-01）

| 项目 | 状态 |
|------|------|
| 万能验证码 `123456` | ✅ 已改为随机6位码 |
| bcrypt mock 漏洞 | ✅ 已使用真实 bcrypt |
| SQL 拼接注入 | ✅ Sequelize ORM |
| 全局限流 | ✅ 已启用 (`app.use(limiter)`) |
| 管理后台 bcrypt | ✅ adminService 正确使用 |
| CORS 可配置化 | ✅ `CORS_ORIGIN` 环境变量 |
| 明文密码比对 | ⚠️ 仍存在迁移通道（低风险） |

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

---

## API路由鉴权

| 端点 | 鉴权 |
|------|------|
| `POST /auth/phone-login` | ❌ 无需认证 |
| `POST /auth/login` | ❌ 无需认证 |
| `GET /parties` | ❌ 公开 |
| `POST /parties` | ✅ auth |
| `GET /orders` | ✅ auth |
| `POST /orders/:id/refund` | ✅ auth + strictLimiter |

---

## 下一步

1. **紧急**: 修复 `isDev = true`，APK 构建会直连模拟器地址
2. **高优**: 确保生产 `ENCRYPTION_MASTER_KEY` 已配置
3. **高优**: 生产 `CORS_ORIGIN` 禁止 `*`
4. **中优**: 删除测试 openid 硬编码
5. **中优**: 支付接口限流阈值降至 10-20次/分钟
6. **低优**: 修复 `server.js` L38 语法错误
7. **低优**: 统一使用 logger 替代 console.log
