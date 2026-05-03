# JUJU App 代码审查报告

**日期**: 2026-05-03 (v7 - 增量审查)
**审查人**: code-reviewer
**状态**: ⚠️ 有问题（存在中等问题，建议修复后上线）
**审查范围**: 全量关键文件增量审查（自2026-05-03 20:22后无代码变更）

## 审查概览

| 检查项 | 状态 | 说明 |
|--------|------|------|
| API路由安全性 | ✅ | tickets.js 公开路由已添加strictLimiter限流保护 |
| 敏感信息泄露 | ⚠️ | auth.js 仍有4处 `console.error` 未替换为 `logger.error` |
| SQL注入风险 | ✅ | ui-themes.js tag参数白名单校验已就位 |
| 错误处理 | ✅ | errorHandler.js 无stack返回客户端 |
| React Native安全 | ⚠️ | AsyncStorage存储Token（中风险，建议迁移） |
| 限流配置 | ✅ | authLimiter已收紧至15分钟3次 |
| 认证绕过 | ✅ | 测试Token机制已加生产环境禁止+环境变量控制 |
| 权限校验 | ✅ | orderController全部添加权限校验 |
| 加密安全 | ✅ | createCipheriv已正确使用，bankCardService随机IV |

## 增量变更审查

**结论**: 自上次报告（2026-05-03 20:22）以来，所有关键文件均无变更。本次审查为状态确认。

### auth.js 状态确认

| # | 检查项 | 状态 | 说明 |
|---|--------|------|------|
| 1 | 验证码清理机制 | ✅ | 每10分钟清理过期验证码 |
| 2 | 验证码生成 | ✅ | 使用 `crypto.randomInt()` |
| 3 | 统一发送函数 | ✅ | `handleSendCode` 提取 |
| 4 | 登录错误处理 | ✅ | 第193行已使用 `logger.error` |
| 5 | 注册错误处理 | ❌ | 第258行仍为 `console.error('Register error:', error)` |
| 6 | 获取用户错误 | ❌ | 第288行仍为 `console.error('Get current user error:', error)` |
| 7 | 更新资料错误 | ❌ | 第320行仍为 `console.error('Update profile error:', error)` |
| 8 | 重置密码错误 | ❌ | 第406行仍为 `console.error('Reset password error:', error)` |

**说明**: v6报告曾指出3处 `console.error`，实际核查发现4处。第193行已修复为 `logger.error`，但其余4处仍未替换。

### tickets.js 状态确认

| # | 检查项 | 状态 | 说明 |
|---|--------|------|------|
| 1 | 公开路由限流 | ✅ | `/code/:code` 和 `/number/:ticketNo` 已添加 `strictLimiter` |
| 2 | 路由注释 | ✅ | 已添加安全设计注释 |
| 3 | 认证状态 | 🟡 | 仍为公开路由，业务合理但需监控 |

### 其他文件状态确认

| 文件 | 状态 | 说明 |
|------|------|------|
| encryption.js | ✅ | `createCipheriv` 正确使用（hex验证 `63 72 65 61 74 65 43 69 70 68 65 72 69 76`） |
| server.js | ✅ | CORS credentials `=== 'true'`（hex验证 `3d3d3d`） |
| rateLimiter.js | ✅ | authLimiter收紧至3次 |
| auth.js (middleware) | ✅ | 测试Token默认9999，生产环境禁止 |
| orderController.js | ✅ | 全部方法添加权限校验 |
| errorHandler.js | ✅ | 无stack返回客户端 |
| dataAdapter.js | ✅ | 无error.stack返回 |
| securityValidator.js | ✅ | 无error.stack返回 |
| ui-themes.js | ✅ | tag参数白名单校验 |
| bankCardService.js | ✅ | 随机IV |
| App.tsx | ⚠️ | BackHandler代码已修复，但APK未重建 |

## 重大发现

| # | 严重度 | 文件 | 问题 | 建议 |
|---|--------|------|------|------|
| 1 | 🟡 | `backend/src/routes/v1/auth.js:258,288,320,406` | 4处 `console.error` 直接输出错误对象到控制台，可能泄露敏感信息 | 统一替换为 `logger.error`（已集成脱敏） |
| 2 | 🟡 | `JujuApp_new/App.tsx` | BackHandler修复已提交但未重新构建APK，JS bundle不包含修复 | 重新构建APK并验证 |

## 低风险问题

| # | 文件 | 问题 | 建议 |
|---|------|------|------|
| 3 | `backend/src/routes/v1/auth.js` | `mockVerifyCodes` 仍为内存存储 | 已加定时清理，生产环境迁移至Redis |
| 4 | `JujuApp_new/src/api/auth.ts` | AsyncStorage存储Token | 建议迁移至Keychain/Keystore |
| 5 | `JujuApp_new/src/api/apiClient.ts` | AsyncStorage存储refreshToken | 建议迁移 |
| 6 | `JujuApp_new/src/utils/cache.ts` | AsyncStorage缓存敏感数据 | 建议加密或迁移 |

## 历史问题追踪（截至v6状态）

| # | 问题 | 首次发现 | 当前状态 |
|---|------|---------|---------|
| 1 | `createCipher` → `createCipheriv` | 2026-05-03 | ✅ **已修复** |
| 2 | CORS credentials语法错误 | 2026-05-03 | ✅ **已修复** |
| 3 | `mockVerifyCodes` 内存存储 | 2026-05-03 | ✅ **部分修复** |
| 4 | `ui-themes.js` tag参数SQL校验 | 2026-05-03 | ✅ **已修复** |
| 5 | 明文密码迁移通道 | 2026-05-03 | ✅ **已废弃** — 登录拒绝非bcrypt密码 |
| 6 | 验证码路由重复 | 2026-05-03 | ✅ **已修复** |
| 7 | `authLimiter` 过于宽松 | 2026-05-03 | ✅ **已修复** |
| 8 | 测试Token硬编码 | 2026-05-03 | ✅ **已改善** |
| 9 | orderController权限校验 | 2026-05-03 | ✅ **全部已修复** |
| 10 | `bankCardService.js` 固定IV | 2026-05-03 | ✅ **已修复** |
| 11 | `tickets.js` 公开路由 | 2026-05-03 | ✅ **已评估** — strictLimiter限流保护 |
| 12 | `errorHandler.js` 堆栈泄露 | 2026-05-03 | ✅ **审查误判** |
| 13 | `console.error` 未完全替换 | 2026-05-03 | ❌ **仍有4处** — 本次确认 |
| 14 | App.tsx BackHandler未打包 | 2026-05-03 | ⚠️ **代码已修复，APK未重建** |

## 安全评分

| 维度 | 评分 | 说明 |
|------|------|------|
| 认证授权 | 92/100 | 测试Token机制完善，order权限已修复 |
| 数据保护 | 88/100 | encryption.js已修复，bankCard随机IV，AsyncStorage待迁移 |
| 输入验证 | 92/100 | ui-themes tag已加白名单 |
| 错误处理 | 85/100 | 无stack返回客户端，但auth.js仍有4处console.error |
| 日志安全 | 85/100 | 4处console.error未替换，可能泄露敏感信息 |
| **综合** | **88/100** | 问题少且风险可控，建议修复console.error后上线 |

## 下一步（优先级排序）

### P1 — 建议修复
1. [ ] 将 auth.js 中的4处 `console.error` 替换为 `logger.error`（注册258、获取用户288、更新资料320、重置密码406）
2. [ ] 重新构建APK，确保App.tsx BackHandler修复被打包

### P2 — 优化
3. [ ] AsyncStorage Token存储迁移至Keychain/Keystore
4. [ ] 评估 tickets.js 公开路由是否需要额外防枚举措施

---
*报告生成时间: 2026-05-03*
*审查工具: 自动化增量扫描 + 原始字节验证*
*增量审查范围: 全量关键文件（自2026-05-03 20:22后无变更，状态确认）*
