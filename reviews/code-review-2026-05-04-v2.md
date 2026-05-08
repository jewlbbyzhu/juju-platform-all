# 代码审查报告（增量审查 v2）

**日期**: 2026-05-04
**审查人**: code-reviewer
**状态**: ⚠️ 有问题（新增文件审查）
**审查策略**: 增量审查 — 基于上次报告(code-review-2026-05-04.md)，审查新增/变更文件

## 新增/变更文件

| 文件 | 类型 | mtime | 状态 |
|------|------|-------|------|
| `backend/src/routes/v1/reports.js` | 新增路由 | 2026-05-04 03:07 | ✅ 已审查 |
| `backend/src/controllers/reportController.js` | 新增控制器 | 2026-05-04 03:07 | ✅ 已审查 |
| `backend/src/controllers/walletController.js` | 新增控制器 | 2026-05-04 12:53 | ⚠️ 发现问题 |
| `backend/src/routes/v1/wallet.js` | 已有路由 | 2026-04-23 | ✅ 已审查 |
| `backend/src/config/alipay.js` | 新增配置 | 2026-05-04 13:08 | ✅ 已审查 |
| `backend/src/config/wechatPay.js` | 新增配置 | 2026-05-04 13:06 | ✅ 已审查 |

---

## 1. reports.js — 举报路由 ✅ 安全

| 检查项 | 结果 | 说明 |
|--------|------|------|
| auth中间件 | ✅ | 所有路由均使用 `auth` |
| adminAuth中间件 | ✅ | 管理路由使用 `adminAuth` |
| 限流 | ✅ | 用户创建举报使用 `strictLimiter` |
| 路由结构 | ✅ | 7个子路由，结构清晰 |

**结论**: 路由设计合理，权限分层正确。

---

## 2. reportController.js — 举报控制器 ✅ 安全

| 检查项 | 结果 | 说明 |
|--------|------|------|
| error.message泄露 | ✅ 无 | 全部使用 `next(error)` |
| console残留 | ✅ 无 | 全部使用 `logger` |
| SQL注入 | ✅ 无 | 使用 Sequelize ORM |
| 权限校验 | ✅ | `getMyReports` 限制 `reporter_id=req.user.id` |
| 自举报防护 | ✅ | `target_type==='user'` 时检查 `target_id !== reporter_id` |
| 重复举报防护 | ✅ | 数据库层面 `findOne` + 409 返回 |
| 目标存在性校验 | ✅ | user/party/post 类型校验目标是否存在 |
| 输入白名单 | ✅ | `target_type` 和 `reason` 均有白名单校验 |
| logger使用 | ✅ | 11处，无敏感信息泄露 |

**结论**: 控制器实现规范，安全防护完善。

---

## 3. walletController.js — 钱包控制器 ⚠️ 发现问题

### 🔴 问题1: Math.random() 用于交易号生成（3处）

| 位置 | 代码 | 风险 |
|------|------|------|
| 行99 | `PAY${Date.now()}${Math.floor(Math.random() * 1000)}` | 可预测 |
| 行197 | `WTH${Date.now()}${Math.floor(Math.random() * 1000)}` | 可预测 |
| 行423 | `TRF${Date.now()}${Math.floor(Math.random() * 1000)}` | 可预测 |

**风险**: `Math.random()` 生成的交易号可预测，在高并发场景下可能产生重复交易号，导致支付系统异常。

**建议**:
```javascript
const crypto = require('crypto');
// 使用 crypto.randomInt() 或 crypto.randomBytes()
const paymentNo = `PAY${Date.now()}${crypto.randomInt(1000, 9999)}`;
// 或更好：使用 UUID 或 crypto.randomUUID()
const paymentNo = `PAY${crypto.randomUUID().replace(/-/g, '')}`;
```

### 🟡 问题2: Wallet 模型未排除 password 字段

**风险**: `wallet.toJSON()` 可能返回 `password` hash 给客户端。

**建议**: 在 Wallet 模型中添加 `defaultScope`:
```javascript
defaultScope: {
  attributes: { exclude: ['password'] }
}
```

### 🟡 问题3: 提现未校验银行卡归属

**风险**: `withdraw` 方法接收 `bankCardId` 参数，但未验证该银行卡是否属于当前用户。攻击者可能使用他人的银行卡ID发起提现请求。

**建议**:
```javascript
const bankCard = await BankCard.findOne({
  where: { id: bankCardId, user_id: req.user.id }
});
if (!bankCard) {
  return res.status(403).json({ success: false, message: '无效的银行卡' });
}
```

### 🟡 问题4: bcrypt.compareSync 时序攻击风险

**风险**: 使用 `compareSync` 而非异步 `compare`，可能受时序攻击影响。

**建议**: 使用 `await bcrypt.compare(password, hash)`（异步版本）。

### 🟡 问题5: 转账无事务保护

**风险**: `transfer` 方法中，扣减发送方余额和增加接收方余额是两个独立查询，非原子操作。如果中间发生错误，可能导致资金不一致。

**建议**: 使用 Sequelize 事务包裹转账操作。

---

## 4. wallet.js — 钱包路由 ✅ 安全

| 检查项 | 结果 | 说明 |
|--------|------|------|
| auth中间件 | ✅ | 所有路由均使用 `auth` |
| 限流 | ✅ | 敏感操作使用 `strictLimiter` |
| 路由结构 | ✅ | 11个子路由，含兼容性路由 |

**结论**: 路由设计合理，敏感操作均有 auth + 限流保护。

---

## 5. alipay.js — 支付宝配置 ✅ 安全

| 检查项 | 结果 | 说明 |
|--------|------|------|
| 硬编码密钥 | ✅ 无 | 全部使用 `process.env` |
| 配置完整性检查 | ✅ | 启动时检查 `appId` + `privateKey` |
| 未配置降级 | ✅ | 未配置时创建占位SDK，不抛出错误 |
| 签名验证 | ✅ | 提供 `verifyNotify` 函数 |

**结论**: 配置安全，未配置时优雅降级。

---

## 6. wechatPay.js — 微信支付配置 ✅ 安全

| 检查项 | 结果 | 说明 |
|--------|------|------|
| 硬编码密钥 | ✅ 无 | 全部使用 `process.env` |
| 证书文件检查 | ✅ | 检查 `certPath` 和 `keyPath` 文件存在性 |
| 未配置降级 | ✅ | 未配置时返回占位数据，不抛出错误 |
| 签名验证 | ✅ | 提供 `verifyNotify` 函数 |

**结论**: 配置安全，证书路径通过环境变量配置。

---

## 遗留问题更新

| # | 严重度 | 文件 | 问题 | 建议修复 |
|---|--------|------|------|---------|
| 1 | 🟡 | `JujuApp_new/src/api/auth.ts` | AsyncStorage存储Token | 迁移至react-native-keychain |
| 2 | 🟢 | `backend/src/server.js:15,50` | console.log/warn启动日志 | 可接受，非运行时泄露 |
| **3** | **🟡** | **`backend/src/controllers/walletController.js`** | **Math.random()交易号生成** | **改用crypto.randomInt()** |
| **4** | **🟡** | **`backend/src/models/Wallet.js`** | **未排除password字段** | **添加defaultScope** |
| **5** | **🟡** | **`backend/src/controllers/walletController.js`** | **提现未校验银行卡归属** | **添加BankCard归属校验** |
| **6** | **🟢** | **`backend/src/controllers/walletController.js`** | **bcrypt.compareSync时序风险** | **改用异步compare** |
| **7** | **🟡** | **`backend/src/controllers/walletController.js`** | **转账无事务保护** | **添加Sequelize事务** |

---

## 安全评分更新

| 维度 | 得分 | 变化 |
|------|------|------|
| API路由安全 | 95/100 | → 保持不变 |
| 敏感信息保护 | 88/100 | ↓ 2分（Wallet password返回） |
| SQL注入防护 | 95/100 | → 保持不变 |
| 错误处理 | 98/100 | → 保持不变 |
| 加密安全 | 96/100 | ↓ 2分（Math.random交易号） |
| 限流配置 | 95/100 | → 保持不变 |
| **综合评分** | **94/100** | **↓ 1分** |

---

## 下一步建议

1. **中优先级**: 修复 walletController.js 中 Math.random() → crypto.randomInt()
2. **中优先级**: Wallet 模型添加 `defaultScope` 排除 password 字段
3. **中优先级**: 提现方法添加银行卡归属校验
4. **低优先级**: 转账方法添加 Sequelize 事务保护
5. **低优先级**: bcrypt.compareSync → bcrypt.compare()（异步）

---
**报告版本**: v2（2026-05-04增量审查）
**上次报告**: `code-review-2026-05-04.md`
**新增审查文件**: reports.js, reportController.js, walletController.js, wallet.js, alipay.js, wechatPay.js
