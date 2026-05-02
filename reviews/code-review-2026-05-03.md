# 代码审查报告

**日期**: 2026-05-03
**审查人**: code-reviewer
**状态**: ⚠️ 有问题

## 重大发现
| # | 严重度 | 文件 | 问题 | 建议 |
|---|--------|------|------|------|
| 1 | 🔴 | backend/src/routes/v1/auth.js | `mockVerifyCodes` 为内存存储，验证码仅5分钟过期，无持久化，重启后丢失；且 `console.log` 输出验证码到日志 | 生产环境必须接入真实短信服务商（如阿里云/腾讯云短信），移除 `console.log` 日志输出 |
| 2 | 🔴 | backend/src/routes/v1/auth.js | `reset-password` 路由中 `verificationCode` 验证后，若用户未设置密码（`!user.password`），`passwordValid` 保持 `false`，但逻辑分支允许空密码用户无法重置 | 确保重置密码流程对无密码用户也能正常工作，或明确提示先设置密码 |
| 3 | 🔴 | backend/src/routes/v1/auth.js | 明文密码迁移通道（`process.env.NODE_ENV !== 'production'`）仍存在，旧用户账户在生产环境前需完成迁移 | 上线前强制所有旧用户重置密码，移除明文兼容逻辑 |
| 4 | 🔴 | backend/src/server.js | `process.env.CORS_CREDENTIALS=*** 'true'` 这一行疑似被截断/篡改，存在语法风险 | 检查并修复 `cors` 配置行，确保 `credentials` 正确赋值 |
| 5 | 🔴 | backend/src/utils/encryption.js | `SensitiveDataEncryption` 类中 `encryptString` 和 `decryptString` 使用随机盐派生密钥，导致加密后无法解密（盐值未保存） | 加密时必须将盐值与密文一起存储，解密时提取盐值重新派生密钥 |
| 6 | 🔴 | JujuApp_new/src/config/index.ts | `isRelease` 判断逻辑 `!isDev \|\| process.env.NODE_ENV === 'production'` 中 `process.env` 在 RN 打包后不存在，可能导致误判 | 仅依赖 `__DEV__` 判断，移除 `process.env` 引用；或改用 `__DEV__ === false` 明确判断 |
| 7 | 🟡 | backend/src/middleware/auth.js | `isValidTestToken` 在 `NODE_ENV === 'test'` 时允许硬编码测试Token绕过认证 | 确保测试环境不部署到生产，或增加更严格的测试Token校验 |
| 8 | 🟡 | backend/src/controllers/partyController.js | `console.log('DEBUG party.start_time:', ...)` 调试代码残留 | 移除生产环境调试日志 |
| 9 | 🟡 | backend/src/routes/v1/auth.js | `register` 路由中验证码 `code` 为可选参数（`if (code)`），允许无验证码注册 | 注册时必须强制验证验证码，防止批量注册攻击 |
| 10 | 🟡 | backend/src/routes/v1/auth.js | `send-code` / `verify-code` / `verification-code` 三个路由逻辑完全重复，代码冗余 | 提取公共函数，统一验证码发送逻辑 |
| 11 | 🟡 | backend/src/middleware/rateLimiter.js | `authLimiter` 限制为 15分钟1000次，对登录接口过于宽松 | 登录/验证码接口应使用更严格的限制（如 15分钟10次） |
| 12 | 🟡 | JujuApp_new/src/api/index.ts | `OFFLINE_MODE = false` 为硬编码，但 `mockApi` 仍被打包进代码 | 生产构建时通过 Tree Shaking 移除 mock 模块，或改用动态导入 |
| 13 | 🟢 | backend/src/server.js | `.env` 文件通过 `fs.readFileSync` 手动解析，不支持多行值和引号 | 使用 `dotenv` 标准库解析，或确保.env格式简单 |
| 14 | 🟢 | backend/src/routes/v1/auth.js | `logout` 路由未将Token加入黑名单 | 调用 `TokenBlacklist.addToBlacklist` 使Token失效 |

## 低风险问题
| # | 文件 | 问题 | 建议 |
|---|------|------|------|
| 1 | backend/src/routes/v1/auth.js | `generateCode()` 使用 `Math.random()` 生成验证码，非加密安全 | 改用 `crypto.randomInt(100000, 999999)` |
| 2 | backend/src/routes/v1/parties.js | `getPublishedParties` 等接口无分页上限限制 | 增加 `limit` 最大值校验（如 ≤ 100） |
| 3 | backend/src/controllers/orderController.js | `getOrderList` 中 `user_id` 从 query 参数传入，但无权限校验 | 确保普通用户只能查看自己的订单 |
| 4 | backend/src/utils/encryption.js | `encrypt()` 使用 XOR 加密，安全性极低 | 废弃此函数，统一使用 AES-256-GCM |
| 5 | backend/src/services/paymentService.js | 支付回调中先更新状态再验证签名（`handlePaymentCallback`） | 严格先验签，再更新数据库状态 |

## 下一步
1. **立即修复（P0）**：修复 `encryption.js` 的盐值保存问题，否则敏感数据加密后无法解密
2. **立即修复（P0）**：检查 `server.js` 第54行 `CORS_CREDENTIALS` 被截断的问题
3. **上线前（P1）**：接入真实短信服务，替换 `mockVerifyCodes` 内存存储
4. **上线前（P1）**：清理所有 `console.log` 调试代码
5. **上线前（P1）**：完成明文密码用户强制迁移，移除明文兼容代码
6. **建议（P2）**：为关键接口（登录、支付）增加IP级频率限制
7. **建议（P2）**：对 `partyController` 和 `orderController` 增加更严格的输入校验和权限检查
