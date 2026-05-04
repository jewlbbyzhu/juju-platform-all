# 代码审查报告（增量审查）

**日期**: 2026-05-04
**审查人**: code-reviewer
**状态**: ⚠️ 有问题（已修复遗留问题）
**审查策略**: 增量审查 — 基于上次报告(code-review-2026-05-04.md)，扫描新增/变更文件

## 审查范围
1. 新增路由文件 `reports.js` 安全性审查
2. 新增控制器 `reportController.js` 安全性审查
3. 新增/变更文件 `walletController.js` 安全性审查
4. 全量扫描确认无新增 client-side error.message 泄露

## 变更文件审查

### 1. ✅ reports.js — 路由权限配置正确
| 路由 | 方法 | 权限 | 限流 | 状态 |
|------|------|------|------|------|
| `/` | POST | auth + strictLimiter | ✅ | 用户创建举报 |
| `/my` | GET | auth | ✅ | 用户查看自己的举报 |
| `/my/:id` | GET | auth | ✅ | 用户查看举报详情 |
| `/` | GET | auth + adminAuth | ✅ | 管理员查看全部 |
| `/stats` | GET | auth + adminAuth | ✅ | 管理员统计 |
| `/:id` | GET | auth + adminAuth | ✅ | 管理员查看详情 |
| `/:id` | PATCH | auth + adminAuth | ✅ | 管理员处理举报 |

**说明**: 用户端路由和管理端路由分离，权限配置正确。用户只能查看自己的举报，管理后台需要 admin 权限。

### 2. ✅ reportController.js — 无安全漏洞
| 检查项 | 结果 |
|--------|------|
| error.message 泄露到客户端 | ❌ 无 — 所有 catch 使用 `next(error)` |
| console.* 残留 | ❌ 无 — 全部使用 logger |
| SQL 注入风险 | ❌ 无 — 使用 Sequelize ORM |
| 输入校验 | ✅ target_type / reason 白名单校验 |
| 重复举报检查 | ✅ 同一用户对同一目标只能举报一次 |
| 自我举报防护 | ✅ 不能举报自己 |
| 目标存在性校验 | ✅ user/party/post 会校验存在性 |

### 3. ⚠️ walletController.js — 发现 1 处安全问题（已修复）
| 位置 | 问题 | 严重度 | 修复 |
|------|------|--------|------|
| Line 243, 302 | `bcrypt.hash(password, 10)` — salt rounds 偏低 | 🟡 中 | ✅ 已改为 12 |

**说明**: 项目安全标准已统一为 bcrypt salt rounds = 12（auth.js 已修复）。walletController.js 新增代码仍使用 10，已同步修正。

**walletController.js 其他检查结果**:
- ✅ 无 error.message 泄露
- ✅ 无 console.* 残留
- ✅ 所有敏感操作（充值/提现/转账/设密）使用 `auth + strictLimiter`
- ✅ 支付密码使用 bcrypt 哈希
- ✅ 金额使用 `validateAmount()` 校验
- ✅ 转账有余额校验
- ✅ 密码修改需验证旧密码

### 4. ✅ 其他新增文件
| 文件 | 检查结果 |
|------|---------|
| `models/WalletTransaction.js` | ✅ 无安全问题 |
| `models/Report.js` | ✅ 无安全问题 |
| `services/autoCancelService.js` | ✅ 无安全问题 |
| `services/settlementService.js` | ✅ 无安全问题 |

## 历史 🔴 问题复查（全部保持已修复状态）

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
| 13 | `bcrypt` salt rounds偏低 | ✅ 全局统一为12 |
| 14 | login路由console.error泄露 | ✅ → logger.error + 脱敏 |
| 15 | adminAuth未检查Token黑名单 | ✅ 已添加 |
| 16 | 全局请求体限制10MB过大 | ✅ 10MB→5MB |
| 17 | 后端路由层console.*残留 | ✅ 统一替换为logger |
| 18 | error.message返回客户端 | ✅ 全部清理 |
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
| API路由安全 | 96/100 | 新增 reports 路由权限正确 |
| 敏感信息保护 | 90/100 | AsyncStorage Token存储待迁移 |
| SQL注入防护 | 95/100 | 白名单校验已覆盖 |
| 错误处理 | 98/100 | 无新增 client-side 泄露 |
| 加密安全 | 98/100 | AES-256-GCM + 随机IV + bcrypt rounds=12 |
| 限流配置 | 95/100 | authLimiter已收紧，新增路由有 strictLimiter |
| **综合评分** | **95/100** | **维持高分，新增代码质量良好** |

## 本次修复统计

- **修复文件数**: 1 个 (`walletController.js`)
- **修复问题数**: 2 处 bcrypt salt rounds 偏低
- **修复类型**: 中低风险加密强度
- **验证方法**: 自动化扫描 + 人工确认

## 遗留问题清单

| # | 严重度 | 文件 | 问题 | 建议修复 |
|---|--------|------|------|---------|
| 1 | 🟡 | `JujuApp_new/src/api/auth.ts` | AsyncStorage存储Token | 迁移至react-native-keychain |
| 2 | 🟢 | `backend/src/server.js:15,50` | console.log/warn启动日志 | 可接受，非运行时泄露 |

## 下一步建议

1. **中优先级**: 评估 AsyncStorage→Keychain 迁移成本，制定迁移计划
2. **低优先级**: 考虑将 `server.js` 启动日志改为 `logger.info`
3. **建议**: 建立 CI 钩子，自动扫描 `bcrypt.hash` 的 salt rounds 参数

---
**报告版本**: v2（2026-05-04增量审查）
**上次报告**: `code-review-2026-05-04.md`
**变更文件**: reports.js, reportController.js, walletController.js, WalletTransaction.js, Report.js, autoCancelService.js, settlementService.js
