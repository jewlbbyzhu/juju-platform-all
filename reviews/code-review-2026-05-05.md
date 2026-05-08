# 代码审查报告

**日期**: 2026-05-05
**审查人**: code-reviewer
**状态**: ⚠️ 有问题
**安全评分**: 88/100 (较上次 2026-05-04 的 95/100 下降)

---

## 重大发现

| # | 严重度 | 文件 | 问题 | 建议 |
|---|--------|------|------|------|
| 1 | 🔴 | `adminService.js:148,192,423` | **bcrypt rounds=10** — 管理员密码哈希使用10而非项目标准12 | 改为 `bcrypt.hash(..., 12)` |
| 2 | 🔴 | `Wallet.js:62,67` | **bcrypt rounds=10** — 钱包支付密码哈希使用10 | 改为 `bcrypt.hash(..., 12)` |
| 3 | 🔴 | `Wallet.js` model | **Wallet.toJSON()暴露password字段** — walletController.js:22直接返回`wallet.toJSON()`，含password哈希 | 添加 `defaultScope: { attributes: { exclude: ['password'] } }` 或手动选择字段 |
| 4 | 🔴 | `v2/auth.js:161` | **Math.random()生成验证码** — `Math.random().toString(10).slice(2,6)`可预测 | 改用 `crypto.randomInt(100000, 999999)` |
| 5 | 🟡 | `walletController.js:22` | **钱包响应暴露password** — `res.json({ data: wallet.toJSON() })` | 手动选择字段返回: `{ id, user_id, balance, ... }` |

---

## 低风险问题

| # | 文件 | 问题 | 建议 |
|---|------|------|------|
| 6 | `systemMonitoringService.js:89,113,146,229,240,255,268` | **error.message在内部监控端点暴露** | admin端点，但建议统一用通用错误消息 |
| 7 | `walletController.js:99,197,423` | **Math.random()用于交易号** — 可预测，高并发下可能重复 | 改用 `crypto.randomBytes()` 或 `uuid` |
| 8 | `orderService.js:129,484,532,788,1095` | **Math.random()用于订单/退款/票号** | 同上 |
| 9 | `partyService.js:740` | **Math.random()用于退款号** | 同上 |
| 10 | `transactionManager.js:34,46,82` | **Math.random()用于连接ID** | 低风险，测试用标识符 |
| 11 | `canaryRelease.js:40,91` | **Math.random()用于灰度路由** | 低风险，fallback逻辑 |

---

## bcrypt rounds一致性检查

| 文件 | 用途 | 当前rounds | 状态 |
|------|------|-----------|------|
| `auth.js:223` | 用户注册密码 | 12 | ✅ 正确 |
| `auth.js:396` | 密码重置 | 12 | ✅ 正确 |
| `encryption.js:99` | 加密服务 | 12 (via saltRounds) | ✅ 正确 |
| `walletController.js:243,302` | 支付密码设置 | 12 | ✅ 正确 |
| `adminService.js:148,192,423` | 管理员密码 | **10** | 🔴 不一致 |
| `Wallet.js:62,67` | 钱包密码hook | **10** | 🔴 不一致 |
| `v2/auth.js:150` | v2管理员密码 | **10** | 🔴 不一致 |

---

## 错误处理检查

### ✅ 已正确处理的
- `errorHandler.js:91-93` — stack trace 仅在 `NODE_ENV === 'development'` 时返回 ✅
- `auth.js` — 所有 `res.json()` 错误响应无 `error.message` 泄露 ✅
- `socialController.js` — 42处 `logger.error(..., { error: error.message })` 仅为结构化日志，不返回客户端 ✅

### ⚠️ 需关注
- `errorReporter.js:14` — `error.stack` 被发送到外部错误服务（仅production环境），需确保外部服务安全
- `systemMonitoringService.js` — 内部admin监控端点返回 `error.message`，风险较低但仍建议审计

---

## 交易号随机性问题

使用 `Math.random()` 生成的可预测交易号：

| 文件:行 | 用途 | 风险 |
|--------|------|------|
| `walletController.js:99` | paymentNo | 🟡 中 — 支付场景 |
| `walletController.js:197` | transactionNo (提现) | 🟡 中 — 金融交易 |
| `walletController.js:423` | transactionNo (转账) | 🟡 中 — 金融交易 |
| `orderService.js:129` | orderNo | 🟡 中 — 订单号 |
| `orderService.js:484` | refundNo | 🟡 中 — 退款号 |
| `orderService.js:532` | ticketCode | 🟡 中 — 票码 |
| `orderService.js:788,1095` | paymentNo | 🟡 中 — 支付号 |
| `partyService.js:740` | refundNo | 🟡 中 — 退款号 |
| `v2/auth.js:161` | 验证码 | 🔴 高 — 安全性务 |

**建议**: 使用 `crypto.randomBytes()` + `Date.now()` 组合或 `uuid` 库替代。

---

## 验证结果

| 检查项 | 状态 |
|--------|------|
| console.log/error残留 | ✅ 无活跃残留（仅1处DEBUG注释） |
| error.message在HTTP响应中 | ✅ 已全部清理 |
| error.stack在生产响应中 | ✅ 已正确隔离 |
| auth中间件黑名单检查 | ✅ 已实现 |
| 订单越权访问 | ✅ 已修复 |
| SQL注入（LIKE子句） | ✅ ui-themes.js有白名单校验 |

---

## 下一步

1. **立即修复** — adminService.js 和 Wallet.js 的 bcrypt rounds 统一改为12
2. **立即修复** — Wallet model 添加 defaultScope 排除 password 字段
3. **高优先级** — v2/auth.js 验证码生成改用 crypto.randomInt
4. **建议** — 交易号生成改用 crypto.randomBytes()

---

## 审查覆盖范围

本次审查为**增量审查**，重点关注：
- bcrypt rounds 一致性（首次发现 adminService/Wallet 使用 rounds=10）
- walletController 安全性（首次发现 toJSON() 暴露 password）
- 增量代码（v2/auth.js 的 Math.random() 验证码）

历史审查已覆盖的安全问题继续有效，详见：
- `reviews/code-review-2026-05-04.md`
- `reviews/code-review-2026-05-03-v6.md`
