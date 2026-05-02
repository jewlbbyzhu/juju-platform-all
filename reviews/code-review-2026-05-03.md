# 代码审查报告

**日期**: 2026-05-03
**审查人**: code-reviewer
**状态**: ⚠️ 有问题

## 重大发现

| # | 严重度 | 文件 | 问题 | 建议 |
|---|--------|------|------|------|
| 1 | 🔴 | auth.js:342-377 | reset-password 路由不验证短信验证码，仅验证旧密码即可重置 | 必须同时验证短信验证码，防止已知手机号的攻击者重置任意账户 |
| 2 | 🔴 | server.js:56-61 | 全局Rate Limiter被注释禁用 | 生产环境必须启用限流，防止DDoS和暴力破解 |
| 3 | 🟡 | auth.js:115-123 | 明文密码迁移通道仍存在（开发环境） | 生产环境已保护，但开发环境明文对比仍有风险，建议完全移除 |
| 4 | 🟡 | auth.js:10 | mockVerifyCodes 使用内存存储，重启丢失且无法集群共享 | 使用Redis存储验证码，支持多实例共享 |
| 5 | 🟡 | auth.js:40,53,66 | 验证码通过 console.log 输出到日志 | 生产环境应接入真实短信服务，日志中不应包含验证码 |
| 6 | 🟡 | auth.js:342-377 | reset-password 未检查 verificationCode 参数 | 即使传了验证码也不校验，逻辑漏洞 |
| 7 | 🟡 | auth.js:257-288,291-327 | /me 和 /profile 路由重复实现JWT验证逻辑 | 应统一使用 auth 中间件，避免代码重复和安全不一致 |
| 8 | 🟡 | wechatService.js:9 | 微信API URL中 secret 被硬编码为 `***` | 检查是否为真实secret泄露，或只是占位符 |
| 9 | 🟡 | orderController.js:59 | getOrderList 传 null 作为 userId，可能返回所有用户订单 | 确认是否为管理员接口，否则存在越权风险 |
| 10 | 🟡 | auth.js:19-30 | 内存限速器 rateLimitMap 无持久化，重启清零 | 生产环境使用Redis限流 |

## 低风险问题

| # | 文件 | 问题 | 建议 |
|---|------|------|------|
| 1 | auth.js:186-189 | 错误处理中返回 `error.message` 可能泄露内部信息 | 生产环境返回通用错误消息，记录详细日志 |
| 2 | partyController.js | 多处 console.log 调试代码残留 | 清理调试日志，使用 logger |
| 3 | auth.js:40 | `[DEV] 验证码` 日志标记 | 生产环境应移除所有开发标记 |
| 4 | server.js:47 | CORS_ORIGIN 未配置时生产环境允许空数组 | 空数组 origin 可能导致CORS拒绝所有请求，需确认行为 |
| 5 | errorHandler.js:66 | 注释掉的 `isTest` 和 `isProduction` 判断 | 清理无用注释 |
| 6 | auth.js:98-99 | 重复检查 phone && password | 外层已判断，内层重复检查冗余 |
| 7 | auth.js:175 | 开发环境使用 `dev_openid_${code}` | 开发环境openid可预测 | 开发环境无风险，但建议加随机前缀 |
| 8 | orders.js:35-49 | /orders/:id/tickets 直接查询，未验证订单归属 | 添加 user_id 校验，防止查看他人订单票券 |
| 9 | partyController.js:218-220 | `index === 0` 的调试 console.log | 移除调试代码 |
| 10 | logger.js:29-36 | 非生产环境添加 Console transport | 开发环境OK，但确保生产环境 `NODE_ENV=production` |

## 安全亮点

| # | 文件 | 亮点 |
|---|------|------|
| 1 | auth.js:112-127 | 密码双模式验证（bcrypt + 明文迁移），且生产环境拒绝明文 |
| 2 | auth.js:165-172 | 生产环境微信登录返回501，强制要求真实API集成 |
| 3 | auth.js:36-37,49-50,62-63 | 验证码发送有速率限制（60秒5次） |
| 4 | auth.js:215 | 注册密码使用 bcrypt hash，saltRounds=10 |
| 5 | auth.js:77-79 | 验证码有过期检查（5分钟） |
| 6 | middleware/auth.js:47-58 | JWT验证检查 tokenType，防止refresh token滥用 |
| 7 | middleware/auth.js:60-71 | Token黑名单检查 |
| 8 | server.js:44-46 | 使用 helmet 安全头 |
| 9 | server.js:66-78 | 集成日志脱敏、审计、加密中间件 |
| 10 | errorHandler.js:17-27 | 错误日志中敏感字段脱敏处理 |
| 11 | orderValidator.js | 使用Joi进行输入验证 |
| 12 | orders.js | 支付相关路由使用 strictLimiter 限流 |

## 下一步建议

1. **立即修复（P0）**:
   - auth.js reset-password 添加短信验证码校验
   - server.js 取消注释全局Rate Limiter

2. **本周修复（P1）**:
   - 验证码存储迁移至Redis
   - 移除所有 console.log 调试代码
   - orders/:id/tickets 添加权限校验

3. **发布前检查**:
   - 确认生产环境 `NODE_ENV=production`
   - 确认 CORS_ORIGIN 配置正确（非通配符）
   - 确认 JWT_SECRET 强度足够（≥32字节随机字符串）
   - 确认 WECHAT_APPID/SECRET 已配置
