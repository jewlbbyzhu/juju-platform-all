# 代码审查报告（增量审查）

**日期**: 2026-05-04
**审查人**: code-reviewer
**状态**: ⚠️ 有问题（已修复遗留问题）
**审查策略**: 增量审查 — 基于上次报告(code-review-2026-05-03.md)，扫描并修复遗留问题

## 审查范围
1. 上次报告遗留的 🟡 `onboarding.js` error.message 泄露
2. 上次报告未覆盖的 controller 层 error.message 泄露
3. `server.js` health 端点 error.message 泄露
4. 全量扫描确认无新增安全问题

## 变更文件审查

### 1. ✅ server.js — 已修复 health 端点信息泄露
| 位置 | 问题 | 修复 |
|------|------|------|
| `/health` catch 块 | `error: error.message` 返回数据库错误详情 | ✅ 已移除 error 字段 |
| `/health/ready` catch 块 | `error: error.message` 返回连接错误详情 | ✅ 已移除 error 字段 |

**说明**: Health 端点对外暴露，返回 error.message 可能泄露数据库连接字符串、认证失败等敏感信息。

### 2. ✅ onboarding.js — 已修复 error.message 泄露
| 位置 | 问题 | 修复 |
|------|------|------|
| `onboarding.js:57` | `error: error.message` 返回客户端 | ✅ 已移除 error 字段 |
| `onboarding.js:142` | `error: error.message` 返回客户端 | ✅ 已移除 error 字段 |

### 3. ✅ pushController.js — 已修复 10 处 error.message 泄露
| # | 方法 | 修复前 | 修复后 |
|---|------|--------|--------|
| 1 | getPushMessages | `message: error.message` | `message: '获取推送消息列表失败'` |
| 2 | markAsRead | `message: error.message` | `message: '标记已读失败'` |
| 3 | markAllAsRead | `message: error.message` | `message: '标记全部已读失败'` |
| 4 | deleteMessage | `message: error.message` | `message: '删除消息失败'` |
| 5 | clearAllMessages | `message: error.message` | `message: '清空消息失败'` |
| 6 | getUnreadCount | `message: error.message` | `message: '获取未读数失败'` |
| 7 | getPushSettings | `message: error.message` | `message: '获取推送设置失败'` |
| 8 | updatePushSettings | `message: error.message` | `message: '更新推送设置失败'` |
| 9 | enablePush | `message: error.message` | `message: '启用推送失败'` |
| 10 | disablePush | `message: error.message` | `message: '禁用推送失败'` |

### 4. ✅ orderController.js — 已修复 1 处 error.message 泄露
| 位置 | 修复前 | 修复后 |
|------|--------|--------|
| applyRefund catch | `message: error.message` | `message: '订单不存在或无权限'` |

### 5. ✅ partyController.js — 已修复 1 处 error.message 泄露
| 位置 | 修复前 | 修复后 |
|------|--------|--------|
| getPartyById catch | `message: error.message` | `message: '活动不存在'` |

### 6. ✅ scheduleController.js — 已修复 2 处 error.message 泄露
| 位置 | 修复前 | 修复后 |
|------|--------|--------|
| triggerAutoCancel catch | `error: error.message` | 已移除 error 字段 |
| getPartiesToCancel catch | `error: error.message` | 已移除 error 字段 |

### 7. ✅ monitoringController.js — 已修复 1 处 error.message 泄露
| 位置 | 修复前 | 修复后 |
|------|--------|--------|
| getHealthDetails catch | `error: error.message` | 已移除 error 字段 |

### 8. ✅ auth.js — 已修复 1 处 error.message 泄露
| 位置 | 修复前 | 修复后 |
|------|--------|--------|
| handleSendCode catch | `message: error.message` | `message: '验证码发送失败，请稍后重试'` |

## 历史 🔴 问题复查（全部已修复）

| # | 问题 | 修复状态 |
|---|------|---------|
| 1 | `createCipher` → `createCipheriv` | ✅ 已确认修复 |
| 2 | CORS credentials 语法错误 | ✅ 已确认修复 |
| 3 | `mockVerifyCodes` 内存存储 | ✅ 已加定时清理（10分钟） |
| 4 | `ui-themes.js` tag SQL注入 | ✅ 已加白名单校验 |
| 5 | 明文密码迁移通道 | ✅ 已彻底移除 |
| 6 | 验证码路由重复 | ✅ 已提取统一函数 |
| 7 | `authLimiter` 过于宽松 | ✅ 10次→3次 |
| 8 | `Math.random()` 生成验证码 | ✅ → `crypto.randomInt()` |
| 9 | orderController 权限校验缺失 | ✅ 已添加 |
| 10 | `/orders/:id/tickets` 越权 | ✅ 已添加归属校验 |
| 11 | `logout` Token黑名单 | ✅ 已实现（Redis-backed） |
| 12 | `bankCardService.js` 固定IV | ✅ → `crypto.randomBytes(12)` |
| 13 | `bcrypt` salt rounds偏低 | ✅ 10→12 |
| 14 | login路由console.error泄露 | ✅ → logger.error + 脱敏 |
| 15 | adminAuth未检查Token黑名单 | ✅ 已添加 |
| 16 | 全局请求体限制10MB过大 | ✅ 10MB→5MB |
| 17 | 后端路由层console.*残留 | ✅ 统一替换为logger |
| 18 | error.message返回客户端 | ✅ **本次全部清理** |
| 19 | 无密码用户环境判断 | ✅ 彻底移除环境判断 |
| 20 | onboarding.js error泄露 | ✅ 已修复 |
| 21 | pushController.js error泄露(10处) | ✅ 已修复 |
| 22 | server.js health端点error泄露 | ✅ 已修复 |
| 23 | orderController.js error泄露 | ✅ 已修复 |
| 24 | partyController.js error泄露 | ✅ 已修复 |
| 25 | scheduleController.js error泄露 | ✅ 已修复 |
| 26 | monitoringController.js error泄露 | ✅ 已修复 |
| 27 | auth.js handleSendCode error泄露 | ✅ 已修复 |

## 安全评分

| 维度 | 得分 | 说明 |
|------|------|------|
| API路由安全 | 95/100 | 公开验票接口已限流 |
| 敏感信息保护 | 90/100 | AsyncStorage Token存储待迁移 |
| SQL注入防护 | 95/100 | 白名单校验已覆盖 |
| 错误处理 | **98/100** | **本次清理17处error.message泄露** |
| 加密安全 | 98/100 | AES-256-GCM + 随机IV |
| 限流配置 | 95/100 | authLimiter已收紧 |
| **综合评分** | **95/100** | **较上次提升2分** |

## 遗留问题清单

| # | 严重度 | 文件 | 问题 | 建议修复 |
|---|--------|------|------|---------|
| 1 | 🟡 | `JujuApp_new/src/api/auth.ts` | AsyncStorage存储Token | 迁移至react-native-keychain |
| 2 | 🟢 | `backend/src/server.js:15,50` | console.log/warn启动日志 | 可接受，非运行时泄露 |

## 本次修复统计

- **修复文件数**: 8 个
- **修复问题数**: 17 处 error.message/error 泄露
- **修复类型**: 全部为中低风险信息泄露
- **验证方法**: 自动化脚本扫描 + 人工确认

## 下一步建议

1. **中优先级**: 评估 AsyncStorage→Keychain 迁移成本，制定迁移计划
2. **低优先级**: 考虑将 `server.js` 启动日志改为 `logger.info`
3. **建议**: 建立 CI 钩子，自动扫描 `error.message` 返回客户端的模式

---
**报告版本**: v1（2026-05-04增量审查）
**上次报告**: `code-review-2026-05-03.md`
**变更文件**: server.js, onboarding.js, pushController.js, orderController.js, partyController.js, scheduleController.js, monitoringController.js, auth.js
