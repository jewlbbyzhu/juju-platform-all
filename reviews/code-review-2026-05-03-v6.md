# JUJU App 代码审查报告

**日期**: 2026-05-03 (v6 - 增量审查)
**审查人**: code-reviewer
**状态**: ⚠️ 有问题（存在中等问题，建议修复后上线）
**审查范围**: auth.js, tickets.js, server.js 增量变更（2026-05-03 16:36后）

## 审查概览

| 检查项 | 状态 | 说明 |
|--------|------|------|
| API路由安全性 | ✅ | tickets.js 公开路由已添加strictLimiter限流保护 |
| 敏感信息泄露 | ✅ | auth.js console.log仅在开发环境输出验证码 |
| SQL注入风险 | ✅ | ui-themes.js tag参数白名单校验已就位 |
| 错误处理 | ✅ | errorHandler.js 无stack返回客户端 |
| React Native安全 | ⚠️ | AsyncStorage存储Token（中风险，建议迁移） |
| 限流配置 | ✅ | authLimiter已收紧至15分钟3次 |
| 认证绕过 | ✅ | 测试Token机制已加生产环境禁止+环境变量控制 |
| 权限校验 | ✅ | orderController全部添加权限校验 |
| 加密安全 | ✅ | createCipheriv已正确使用，bankCardService随机IV |

## 增量变更审查（2026-05-03 16:36后）

### auth.js 变更审查

**变更时间**: 2026-05-03 17:03

| # | 检查项 | 状态 | 说明 |
|---|--------|------|------|
| 1 | 验证码清理机制 | ✅ | 每10分钟清理过期验证码，防止内存无限增长 |
| 2 | 验证码生成 | ✅ | 使用 `crypto.randomInt()` 加密安全 |
| 3 | 内存限速 | ✅ | 60秒5次请求限制，防止短信轰炸 |
| 4 | 统一发送函数 | ✅ | `handleSendCode` 提取，三个路由复用 |
| 5 | 开发环境日志 | ✅ | 验证码仅在 `NODE_ENV === 'development'` 输出 |
| 6 | 登录错误处理 | ⚠️ | 第193行 `console.error('Login error:', error)` 可能泄露敏感信息到日志 |
| 7 | 注册错误处理 | ⚠️ | 第258行 `console.error('Register error:', error)` 同上 |
| 8 | 重置密码错误 | ⚠️ | 第403行 `console.error('Reset password error:', error)` 同上 |

**建议**: 将 `console.error` 替换为 `logger.error`（已集成日志脱敏），避免原始错误对象泄露敏感信息到控制台。

### tickets.js 变更审查

**变更时间**: 2026-05-03 17:02

| # | 检查项 | 状态 | 说明 |
|---|--------|------|------|
| 1 | 公开路由限流 | ✅ | `/code/:code` 和 `/number/:ticketNo` 已添加 `strictLimiter`（1分钟20次） |
| 2 | 路由注释 | ✅ | 已添加安全设计注释，说明票券编码使用UUID防枚举 |
| 3 | 认证状态 | 🟡 | 仍为公开路由（无auth中间件），业务上合理但需监控 |

**评估**: 公开验票接口在线下场景（扫码/输入票号）是必需的。当前限流配置（1分钟20次）可有效防止枚举攻击。票券编码使用UUID不可预测，风险可控。

### server.js 状态确认

| # | 检查项 | 状态 | 说明 |
|---|--------|------|------|
| 1 | CORS credentials | ✅ | 已确认为 `=== 'true'`（原始字节验证通过 `3d3d3d`） |

## 重大发现（本次增量审查）

| # | 严重度 | 文件 | 问题 | 建议 |
|---|--------|------|------|------|
| 1 | 🟡 | `backend/src/routes/v1/auth.js:193,258,403` | `console.error` 直接输出错误对象到控制台，可能泄露敏感信息 | 替换为 `logger.error`（已集成脱敏） |
| 2 | 🟡 | `backend/src/routes/v1/auth.js:131` | 密码登录中 `user.password.startsWith('$2')` 判断，若密码字段为null可能抛异常 | 已在前一行检查 `!user.password`，但建议添加更严格的类型检查 |

## 低风险问题

| # | 文件 | 问题 | 建议 |
|---|------|------|------|
| 3 | `backend/src/routes/v1/auth.js` | `mockVerifyCodes` 仍为内存存储 | 已加定时清理，生产环境迁移至Redis |
| 4 | `JujuApp_new/src/api/apiClient.ts` | AsyncStorage存储Token | 建议迁移至Keychain/Keystore |

## 历史问题追踪（截至v5状态）

| # | 问题 | 首次发现 | 当前状态 |
|---|------|---------|---------|
| 1 | `createCipher` → `createCipheriv` | 2026-05-03 | ✅ **已修复** |
| 2 | CORS credentials语法错误 | 2026-05-03 | ✅ **已修复**（原始字节验证 `3d3d3d`） |
| 3 | `mockVerifyCodes` 内存存储 | 2026-05-03 | ✅ **部分修复** — 已加定时清理 |
| 4 | `ui-themes.js` tag参数SQL校验 | 2026-05-03 | ✅ **已修复** — 白名单校验 |
| 5 | 明文密码迁移通道 | 2026-05-03 | 🟡 **已废弃** — 登录拒绝非bcrypt密码 |
| 6 | 验证码路由重复 | 2026-05-03 | ✅ **已修复** — 统一 `handleSendCode` |
| 7 | `authLimiter` 过于宽松 | 2026-05-03 | ✅ **已修复** — 收紧至3次 |
| 8 | 测试Token硬编码 | 2026-05-03 | ✅ **已改善** — 环境变量配置 |
| 9 | orderController权限校验 | 2026-05-03 | ✅ **全部已修复** |
| 10 | `bankCardService.js` 固定IV | 2026-05-03 | ✅ **已修复** — 随机IV |
| 11 | `tickets.js` 公开路由 | 2026-05-03 | ✅ **已评估** — strictLimiter限流保护 |
| 12 | `errorHandler.js` 堆栈泄露 | 2026-05-03 | ✅ **审查误判** — 无stack返回客户端 |

## 安全评分

| 维度 | 评分 | 说明 |
|------|------|------|
| 认证授权 | 92/100 | 测试Token机制完善，order权限已修复，tickets公开路由已限流 |
| 数据保护 | 88/100 | encryption.js已修复，bankCard随机IV，AsyncStorage存储Token待迁移 |
| 输入验证 | 92/100 | ui-themes tag已加白名单，auth.js参数校验完善 |
| 错误处理 | 88/100 | 无stack返回客户端，但auth.js仍有console.error直接输出错误 |
| 日志安全 | 90/100 | 21处console.*语句，其中6处为错误处理，建议统一使用logger |
| **综合** | **90/100** | 问题少且风险可控，建议修复console.error后上线 |

## 下一步（优先级排序）

### P1 — 建议修复
1. [ ] 将 auth.js 中的 `console.error` 替换为 `logger.error`（3处：登录、注册、重置密码）
2. [ ] 评估 `tickets.js` 公开路由是否需要额外的防枚举措施（如验证码）

### P2 — 优化
3. [ ] AsyncStorage Token存储迁移至Keychain/Keystore
4. [ ] 设定明文密码迁移通道移除截止日期

---
*报告生成时间: 2026-05-03*
*审查工具: 自动化代码扫描 + 原始字节验证 + 人工规则检查*
*增量审查范围: auth.js (2026-05-03 17:03), tickets.js (2026-05-03 17:02)*
