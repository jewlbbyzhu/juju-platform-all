# 代码审查报告

**日期**: 2026-05-03
**审查人**: code-reviewer
**状态**: ⚠️ 有问题

## 重大发现
| # | 严重度 | 文件 | 问题 | 建议 |
|---|--------|------|------|------|
| 1 | 🔴 | `backend/src/utils/encryption.js` | `SensitiveDataEncryption` 使用随机盐派生密钥但盐值未保存，加密后无法解密 | 将盐值与密文一起存储，或在构造函数中固定盐值 |
| 2 | 🔴 | `backend/src/server.js` | `CORS_CREDENTIALS` 配置行被截断：`process.env.CORS_CREDENTIALS=*** 'true'` 是赋值表达式而非布尔值 | 修正为 `credentials: process.env.CORS_CREDENTIALS === 'true'` |
| 3 | 🔴 | `backend/src/routes/v1/auth.js` | `mockVerifyCodes` 内存存储，重启丢失；`console.log` 输出验证码到日志 | 迁移至 Redis；生产环境禁止日志输出验证码 |
| 4 | 🔴 | `backend/src/middleware/auth.js` | 测试环境硬编码Token可绕过认证：`isValidTestToken` 在 `NODE_ENV=test` 时生效 | 限制仅在 CI/测试环境使用，生产环境必须禁用 |
| 5 | 🟡 | `backend/src/routes/v1/auth.js` | 明文密码迁移通道仍存在（`process.env.NODE_ENV !== 'production'`） | 添加版本号/时间戳限制，设定迁移截止日期 |
| 6 | 🟡 | `backend/src/routes/v1/auth.js` | 三个验证码发送路由逻辑完全重复（`/verify-code`, `/send-code`, `/verification-code`） | 提取为统一中间件，减少维护成本 |
| 7 | 🟡 | `backend/src/middleware/rateLimiter.js` | `authLimiter` 15分钟20次过于宽松 | 收紧至 15分钟5次，并增加账号级限流 |
| 8 | 🟡 | `backend/src/routes/v1/auth.js` | `generateCode()` 使用 `crypto.randomInt` 但 `crypto` 未在文件顶部导入 | 确认 `crypto` 是否为全局变量，否则显式导入 |
| 9 | 🟡 | `backend/src/controllers/orderController.js` | `getOrderList` 中 `user_id` 无权限校验（`filters.user_id` 可被任意传递） | 非管理员请求时强制覆盖 `user_id` 为当前用户ID |
| 10 | 🟡 | `JujuApp_new/src/config/index.ts` | `process.env.NODE_ENV` 在RN打包后不存在，但后端代码多处依赖 | 统一使用 `__DEV__` 判断，移除对 `process.env.NODE_ENV` 的依赖 |
| 11 | 🟡 | `backend/src/routes/v1/parties.js` | 多处临时实现路由直接返回成功（`/reviews`, `/tickets/inventory` 等） | 标记 TODO 并补充真实业务逻辑，避免接口空转 |
| 12 | 🟢 | `backend/src/routes/v1/auth.js` | `logout` 已实现Token黑名单（Redis），但 `auth.js` 中的 `logout` 路由也实现了黑名单 | 确认是否重复，统一使用 `TokenBlacklist` 工具类 |
| 13 | 🟢 | `backend/src/routes/v1/ui-themes.js` | 原始SQL查询拼接 `whereClause`，存在SQL注入风险 | 使用 Sequelize 参数化查询或 ORM 替代字符串拼接 |
| 14 | 🟢 | `JujuApp_new/src/api/apiClient.ts` | Token 存储在 `AsyncStorage`（非加密），Root 后可被读取 | 敏感场景使用 `react-native-keychain` 或加密存储 |
| 15 | 🟢 | `backend/src/server.js` | `.env` 文件包含真实数据库密码、微信支付密钥、JWT_SECRET | 确认 `.env` 不在 Git 跟踪中；生产环境使用密钥管理服务 |

## 低风险问题
| # | 文件 | 问题 | 建议 |
|---|------|------|------|
| 1 | `backend/src/routes/v1/auth.js` | `Math.random()` 已替换为 `crypto.randomInt`，但 `crypto` 导入不明确 | 显式 `const crypto = require('crypto')` |
| 2 | `backend/src/middleware/errorHandler.js` | 错误日志包含完整堆栈，可能泄露内部路径 | 生产环境脱敏处理堆栈信息 |
| 3 | `JujuApp_new/src/api/index.ts` | `OFFLINE_MODE` 硬编码为 `false`，但 `mockApi` 仍被打包 | 使用环境变量控制，生产构建排除 mock 代码 |
| 4 | `backend/src/controllers/partyController.js` | `getPendingParties` 错误时返回 `success: true` 和空数组 | 应返回 500 错误码，避免前端误判 |
| 5 | `backend/src/routes/v1/orders.js` | `orders/:id/tickets` 已添加订单归属校验，但 `getOrderById` 未校验 | 在 `orderService.getOrderById` 中添加用户权限校验 |

## 已修复问题（本次审查确认）
| # | 文件 | 问题 | 状态 |
|---|------|------|------|
| 1 | `backend/src/routes/v1/auth.js` | `reset-password` 已添加验证码验证 | ✅ 已修复 |
| 2 | `backend/src/server.js` | 全局 Rate Limiter 已启用 | ✅ 已修复 |
| 3 | `backend/src/routes/v1/auth.js` | 微信登录生产环境返回 501 | ✅ 已修复 |
| 4 | `backend/src/routes/v1/orders.js` | `orders/:id/tickets` 越权访问已添加校验 | ✅ 已修复 |
| 5 | `backend/src/controllers/partyController.js` | 调试日志已清理 | ✅ 已修复 |

## 下一步
1. **立即修复**: `encryption.js` 盐值保存问题、`server.js` CORS 配置截断问题
2. **短期修复**: 验证码存储迁移至 Redis、authLimiter 收紧、SQL 注入防护
3. **中期改进**: Token 加密存储、明文密码迁移通道关闭、测试 Token 机制加固
4. **长期规划**: 密钥管理服务（KMS）替代 `.env`、完整的渗透测试
