# JUJU App 代码审查报告

**日期**: 2026-05-03
**审查人**: code-reviewer (Hermes Agent)
**状态**: ⚠️ 有问题
**范围**: API路由安全性、敏感信息泄露、SQL注入、错误处理、React Native安全实践

---

## 重大发现

| # | 严重度 | 文件 | 问题 | 建议 |
|---|--------|------|------|------|
| 1 | 🔴 | `backend/src/utils/encryption.js` | `SensitiveDataEncryption.encryptString()` 使用随机盐派生密钥，盐值已随密文存储，解密逻辑正确（salt:iv:tag:ciphertext格式），但 `encryptAES()` 函数第52行使用 `crypto.createCipher(algorithm, key, iv)` —— Node.js `createCipher` 不接受IV参数，应使用 `createCipheriv`。当前代码在运行时可能抛出异常或行为未定义 | 将 `crypto.createCipher` 改为 `crypto.createCipheriv`，并确保key和iv为Buffer类型 |
| 2 | 🔴 | `backend/src/server.js:54` | CORS `credentials` 配置行被截断/损坏：`credentials: process.env.CORS_CREDENTIALS=*** 'true'`。这是一个明显的语法错误，赋值操作符 `=` 出现在对象属性值中，会导致JavaScript解析异常，服务器可能无法启动 | 修复为 `credentials: process.env.CORS_CREDENTIALS === 'true'` 或 `credentials: true`。同样检查 `middleware/corsConfig.js:4` 的相同问题 |
| 3 | 🔴 | `backend/src/routes/v1/auth.js` | `mockVerifyCodes` 使用内存存储验证码，服务重启后全部丢失；且 `console.log` 在开发环境输出验证码到日志（第46行），日志文件可能被未授权人员读取 | 迁移至Redis；生产环境禁止日志输出验证码，或改用debug级别日志 |
| 4 | 🔴 | `backend/src/routes/v1/ui-themes.js` | `/ui-themes/parties/filter` 路由直接将 `req.query.tag` 拼接到SQL LIKE子句：`conditions.push('p.tags LIKE ?'); replacements.push(%"${tag}"%)`。虽然使用了参数化查询的 `replacements`，但 `tag` 值被包裹了 `%"${tag}"%`，如果 `tag` 包含引号仍可能导致SQL语法错误或意外行为 | 对 `tag` 进行严格的输入校验和转义，确保replacements中的值是干净的字符串 |
| 5 | 🟡 | `backend/src/routes/v1/auth.js` | 明文密码迁移通道仍存在（`process.env.NODE_ENV !== 'production' && process.env.ALLOW_LEGACY_PLAINTEXT === 'true'`）。虽然加了环境判断，但代码留在生产代码库中是风险 | 设定迁移截止日期，彻底移除明文密码支持代码 |
| 6 | 🟡 | `backend/src/routes/v1/auth.js` | 注册时验证码验证已强制要求（第205-210行），但 `/auth/verify-code`、`/auth/send-code`、`/auth/verification-code` 三个路由完全重复，维护成本高 | 合并为一个路由，或提取为单一函数，避免代码重复 |
| 7 | 🟡 | `backend/src/middleware/rateLimiter.js` | `authLimiter` 配置为15分钟5次，对于登录接口过于宽松，暴力破解风险高 | 收紧为15分钟3次，并增加IP+账号联合限速 |
| 8 | 🟡 | `backend/src/middleware/auth.js` | 测试Token绕过机制：`process.env.NODE_ENV !== 'test' || process.env.ENABLE_TEST_TOKEN !== 'true'` 时返回false。但 `isValidTestToken` 在 `auth` 和 `adminAuth` 中都硬编码了 `req.user = { id: 1, ... }`，所有测试Token都映射到用户ID 1 | 测试Token应映射到不同的测试用户，避免所有测试共享同一身份 |
| 9 | 🟡 | `JujuApp_new/src/config/index.ts` | `process.env.NODE_ENV` 在RN打包后不存在，但代码中未直接使用。当前使用 `__DEV__` 判断是正确做法，但注释提到"额外保护：生产打包时强制使用远程API" — 实际没有额外保护机制 | 添加打包时静态替换或构建脚本校验，确保生产包不会指向本地API |
| 10 | 🟢 | `backend/src/routes/v1/auth.js` | `generateCode()` 使用 `crypto.randomInt(100000, 999999)`，是加密安全的，优于旧版的 `Math.random()` | 无需修复，已正确 |
| 11 | 🟢 | `backend/src/controllers/orderController.js` | `getOrderList` 已添加权限校验（第66-77行）：普通用户强制只能查看自己的订单，且会校验 `filters.user_id` 是否匹配当前用户 | 无需修复，已正确 |
| 12 | 🟢 | `backend/src/routes/v1/orders.js` | `/orders/:id/tickets` 已添加订单归属校验（第39-44行），防止越权查看他人订单票券 | 无需修复，已正确 |
| 13 | 🟢 | `backend/src/routes/v1/auth.js` | `logout` 路由已将Token加入黑名单（第334-358行），通过 `TokenBlacklist.addToBlacklist` 实现 | 无需修复，已正确 |

---

## 中等风险问题

| # | 文件 | 问题 | 建议 |
|---|------|------|------|
| 1 | `backend/src/server.js:47` | CORS origin 配置：生产环境如果 `CORS_ORIGIN` 未配置，会回退到 `['*']`，虽然有第49行的警告，但仍存在配置遗漏风险 | 生产环境强制要求配置 `CORS_ORIGIN`，未配置时拒绝启动 |
| 2 | `backend/src/middleware/errorHandler.js` | 错误响应中 `err.stack` 被记录到日志（第36行），但未发送到客户端。不过 `errorResponse` 中未区分开发和生产环境，所有环境返回相同格式 | 生产环境隐藏详细错误信息，仅返回通用错误码 |
| 3 | `backend/src/controllers/socialController.js` | 大量 `console.error` 输出中文错误信息（如"获取动态列表失败"），可能泄露内部业务逻辑 | 统一使用 `logger.error`，并避免在日志中暴露过多业务细节 |
| 4 | `backend/src/services/userService.js:478-504` | `getUserActivities` 使用 `sequelize.query` 拼接 `partyQuery` 和 `orderQuery`，虽然使用了 `replacements`，但动态SQL拼接仍存在维护风险 | 尽量使用Sequelize ORM查询，或增加更严格的输入校验 |
| 5 | `backend/src/utils/encryption.js:424-446` | `encrypt()` 函数使用XOR加密+base64，密钥为 `process.env.ENCRYPTION_MASTER_KEY`，安全性弱于AES-GCM | 废弃此简单加密函数，统一使用 `SensitiveDataEncryption` 类 |

---

## 低风险问题

| # | 文件 | 问题 | 建议 |
|---|------|------|------|
| 1 | `backend/src/routes/v1/auth.js:261-292` | `/auth/me` 和 `/auth/profile` 路由中重复实现了JWT验证逻辑，未复用 `auth` 中间件 | 使用 `auth` 中间件，从 `req.user` 获取用户信息 |
| 2 | `backend/src/controllers/partyController.js:218-219` | 调试日志已注释清理，但注释仍保留 `// DEBUG removed`，可彻底删除 | 清理无用注释 |
| 3 | `backend/src/routes/v1/parties.js` | 大量前端兼容性路由（`/public`, `/list`, `/featured` 等）增加了路由维护复杂度 | 文档化兼容性路由，计划逐步收敛 |
| 4 | `backend/src/middleware/securityHeaders.js` | Helmet CSP 配置中 `scriptSrc: ['\'self\'']` 可能过于严格，影响前端调试 | 开发环境适当放宽，生产环境保持严格 |

---

## SQL注入风险评估

| 位置 | 风险等级 | 说明 |
|------|---------|------|
| `ui-themes.js` 聚会筛选 | 🟡 中 | 使用 `sequelize.query` + `replacements`，但 `tag` 参数未做严格校验 |
| `userService.js` 活动查询 | 🟡 中 | 动态SQL拼接，但使用 `replacements` 参数化 |
| `partyService.js` 所有查询 | 🟢 低 | 主要使用Sequelize ORM，无字符串拼接 |
| `orderService.js` 所有查询 | 🟢 低 | 主要使用Sequelize ORM，无字符串拼接 |
| `databaseOptimizationService.js` | 🟢 低 | 内部管理SQL，无外部输入 |

**结论**：未发现直接的SQL注入漏洞（无用户输入直接拼接到SQL字符串），但 `ui-themes.js` 和 `userService.js` 中的动态SQL需要持续监控。

---

## React Native 安全评估

| 检查项 | 状态 | 说明 |
|--------|------|------|
| API地址硬编码 | ✅ 已修复 | 使用 `__DEV__` 判断，非硬编码 |
| Token存储 | ⚠️ 需确认 | 需检查 `AsyncStorage` 或 `Keychain` 使用方式 |
| 日志输出敏感信息 | ⚠️ 需确认 | 需检查RN端是否有 `console.log` 输出token/密码 |
| 证书校验 | ⚠️ 需确认 | 生产环境使用HTTPS，需确认证书固定(pinning) |
| 代码混淆 | ⚠️ 待确认 | APK是否启用ProGuard/R8混淆 |

---

## 下一步建议

1. **立即修复（P0）**：
   - 修复 `server.js:54` 和 `corsConfig.js:4` 的CORS credentials语法错误
   - 修复 `encryption.js` 中 `createCipher` → `createCipheriv` 的问题

2. **短期修复（P1）**：
   - 将 `mockVerifyCodes` 迁移至Redis
   - 移除或收紧明文密码迁移通道
   - 合并auth.js中重复的验证码发送路由
   - 收紧 `authLimiter` 配置

3. **中期优化（P2）**：
   - 统一错误处理，生产环境隐藏堆栈
   - 清理socialController中的中文console.error
   - 评估RN端Token存储安全性
   - 启用APK代码混淆

---

## 审查历史对比

| 日期 | 发现问题数 | 严重 | 中等 | 低 |
|------|-----------|------|------|-----|
| 2026-05-01 | - | - | - | - |
| 2026-05-02 | - | - | - | - |
| 2026-05-03 | 13 | 4 | 5 | 4 |

**趋势**：相比之前的审查，本次发现2个新的严重问题（CORS语法错误、encryption.js加密函数错误），以及之前标记为"待修复"的问题仍有部分未解决。

---

*报告生成时间: 2026-05-03 10:00 AM*
*审查工具: Hermes Agent (code-reviewer)*
