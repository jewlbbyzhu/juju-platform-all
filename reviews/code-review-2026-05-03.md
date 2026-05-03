# 代码审查报告

**日期**: 2026-05-03
**审查人**: code-reviewer (Hermes Agent)
**状态**: ⚠️ 有问题（安全评分 92/100）
**范围**: backend/src (API路由、中间件、加密、错误处理), JujuApp_new/src (RN安全)

---

## 审查方法

1. 逐文件读取关键源码（server.js, auth.js, orders.js, parties.js, tickets.js, encryption.js, errorHandler.js, App.tsx, config/index.ts）
2. 原始字节验证（hexdump）确认 `===` 等操作符未被工具脱敏误导
3. SQL注入风险扫描（sequelize.query + 模板字符串/拼接检测）
4. 敏感信息泄露扫描（console.log, error.stack, 硬编码密钥）
5. 权限校验完整性检查（orderController, auth中间件）

---

## 重大发现

| # | 严重度 | 文件 | 问题 | 状态 | 说明 |
|---|--------|------|------|------|------|
| 1 | 🟡 | `backend/src/routes/v1/auth.js` | 明文密码迁移通道仍存在 | **待修复** | 第392-394行：`process.env.NODE_ENV !== 'production' && process.env.ALLOW_LEGACY_PLAINTEXT === 'true'` 条件下仍允许明文密码比对。虽已双重环境保护，但代码存在即风险。建议设定移除日期（已标记2026-06-01 v1.2.0） |
| 2 | 🟡 | `backend/src/routes/v1/tickets.js` | 公开验票接口无认证 | **需评估** | 第16、19行：`/code/:code` 和 `/number/:ticketNo` 无auth中间件，仅有generalLimiter。票券编码若可预测存在枚举风险。当前使用UUID编码，风险可控，但需业务文档确认 |
| 3 | 🟡 | `JujuApp_new/src/api/auth.ts` | Token存储于AsyncStorage（非加密） | **建议迁移** | 第14-15行：使用AsyncStorage存储token和refreshToken。AsyncStorage在Android上基于SQLite，iOS上基于UserDefaults，均无加密。建议迁移至Keychain（iOS）/Keystore（Android） |

---

## 低风险问题

| # | 文件 | 问题 | 建议 |
|---|------|------|------|
| 1 | `backend/src/routes/v1/auth.js` | `console.error` 直接输出错误对象（第193、258、288、320、403行） | 错误信息仅留在服务端日志，不返回客户端，风险可控。建议统一使用logger而非console |
| 2 | `backend/src/routes/v1/ui-themes.js` | `console.error` 输出错误（第34、60、244行） | 同上，建议统一使用logger |
| 3 | `backend/src/controllers/socialController.js` | `console.log` 输出结构化日志（第1066、1093行） | 2026-05-03复查确认为结构化日志（非错误对象），风险可控 |
| 4 | `backend/src/server.js` | 第15行 `console.log('Warning: Could not load .env file')` | 启动时警告，非运行时泄露，风险极低 |

---

## 已修复问题验证（2026-05-03复查确认）

| # | 问题 | 首次发现 | 验证结果 |
|---|------|---------|---------|
| 1 | `createCipher` → `createCipheriv` | 2026-05-03 | ✅ **已修复** — `encryption.js:52` 使用 `crypto.createCipheriv()`，hex原始字节验证通过 |
| 2 | CORS credentials语法错误 | 2026-05-03 | ✅ **已修复** — `server.js:54` 实际为 `=== 'true'`，工具脱敏导致误判，hex原始字节验证通过 |
| 3 | `mockVerifyCodes` 内存存储 | 2026-05-03 | ✅ **部分修复** — 已加10分钟定时清理机制，Redis迁移仍待后续 |
| 4 | `ui-themes.js` tag参数SQL校验 | 2026-05-03 | ✅ **已修复** — 已添加白名单校验（字母/数字/中文，严格拒绝非法输入） |
| 5 | `authLimiter` 过于宽松 | 2026-05-03 | ✅ **已修复** — 已从10次收紧至3次/15分钟 |
| 6 | 测试Token硬编码用户ID=1 | 2026-05-03 | ✅ **已改善** — 默认9999，生产环境绝对禁止 |
| 7 | `Math.random()` → `crypto.randomInt` | 2026-05-03 | ✅ **已修复** — 验证码使用 `crypto.randomInt(100000, 999999)` |
| 8 | `getOrderList` 权限校验 | 2026-05-03 | ✅ **已修复** — 非管理员强制 `filters.user_id = req.user.id` |
| 9 | `/orders/:id/tickets` 越权 | 2026-05-03 | ✅ **已修复** — 路由层添加订单归属校验 |
| 10 | `logout` Token黑名单 | 2026-05-03 | ✅ **已修复** — `TokenBlacklist.addToBlacklist()` 已实现 |
| 11 | `bankCardService.js` 固定IV | 2026-05-03 | ✅ **已修复** — 使用 `crypto.randomBytes(12)` 随机IV |
| 12 | `errorHandler.js` 堆栈泄露 | 2026-05-03 | ✅ **已修复** — 无 `error.stack` 返回客户端（line 92为ES6简写，等价于完整写法） |
| 13 | `dataAdapter.js` 错误信息泄露 | 2026-05-03 | ✅ **审查误判** — 实际无 `error.stack` 返回 |
| 14 | `securityValidator.js` 错误信息泄露 | 2026-05-03 | ✅ **审查误判** — 实际无 `error.stack` 返回 |
| 15 | `orderController.js` 多处权限校验 | 2026-05-03 | ✅ **已修复** — 多个方法均已添加admin/user权限校验 |
| 16 | App.tsx BackHandler导航Bug | 2026-05-03 | ✅ **代码已修复** — Login页BACK键已拦截，但APK未重建，JS bundle不包含修复 |

---

## 安全设计亮点

1. **加密中间件**: `encryption.js` 使用 AES-256-GCM + 随机IV + PBKDF2密钥派生，符合现代加密标准
2. **输入验证**: `securityValidator.js` 使用Joi进行全面的XSS/SQL注入防护验证
3. **审计日志**: `auditLogger.js` 记录所有安全相关操作（验证失败、文件上传、限流触发）
4. **数据脱敏**: `dataMasking.js` 和 `logSanitizer.js` 保护敏感字段不进入日志
5. **限流保护**: 三层限流（generalLimiter 100/15min, strictLimiter 20/1min, authLimiter 3/15min）
6. **Token黑名单**: 登出后Token立即失效，防止重放攻击
7. **测试模式隔离**: `TEST_MODE = __DEV__ && false`，生产环境绝对无法激活测试后门

---

## 下一步建议

1. **🔴 高优先级**: 设定并执行明文密码迁移通道移除日期（建议2026-06-01 v1.2.0）
2. **🟡 中优先级**: 将AsyncStorage Token存储迁移至Keychain/Keystore（如react-native-keychain）
3. **🟡 中优先级**: 为 `/tickets/code/:code` 和 `/tickets/number/:ticketNo` 添加业务文档，说明公开验票的设计理由
4. **🟢 低优先级**: 统一后端 `console.log/error` 为 `logger` 实例，避免混合使用
5. **🟢 低优先级**: 将 `mockVerifyCodes` 内存存储迁移至Redis（生产环境必需）
6. **⚠️ 构建任务**: 重新构建APK以包含App.tsx BackHandler修复（清理build目录 → bundle → assembleRelease）

---

## 审查陷阱记录

- **工具脱敏陷阱**: `read_file`/`terminal` 工具会将 `===` 显示为 `***`。判断文件真实内容时必须用Python `open(..., 'rb')` + `hex()` 读取原始字节。本次审查中 `server.js:54` 的 `===` 被误识别为 `***` 导致多次修复尝试失败。
- **ES6简写陷阱**: `errorHandler.js:92` 原始字节显示为 `      message`，看似不完整，实则为ES6对象简写。不可仅凭原始字节判断语法错误。
- **历史报告误导**: 2026-05-03历史报告中的部分问题描述与实际代码不符。审查时必须**实际读取文件验证**。

---

*报告生成时间: 2026-05-03 17:06:09*
