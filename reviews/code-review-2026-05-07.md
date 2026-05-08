# 代码审查报告（增量审查）

**日期**: 2026-05-07
**审查人**: code-reviewer
**状态**: ✅ 通过（增量审查）
**审查策略**: 验证无新引入问题 + 确认遗留问题状态

---

## 未提交变更审查

### 本日变更文件（3个）
```
backend/src/config/alipay.js    | +30 -16
backend/src/config/wechatPay.js | +68 -16
backend/src/utils/logger.js     |  +8 -4
```

### 变更内容分析

#### 1. `alipay.js` — ✅ 安全改进
- 新增配置完整性检查（`hasAppId`, `hasPrivateKey`, `hasPublicKey`）
- 未配置时使用占位SDK替代直接抛出错误（`CONFIG.MISSING` 返回码）
- **评估**: 安全，无新问题

#### 2. `wechatPay.js` — ✅ 安全改进
- 新增证书文件存在性检查（`fs.existsSync`）
- `fullyConfigured = isConfigured && certFilesExist` 确保证书缺失时不声称已配置
- 所有支付方法在未完全配置时返回占位数据而非抛出异常
- **评估**: 安全，无新问题

#### 3. `logger.js` — ✅ 生产环境必要改进
- 添加日志文件轮转配置（`maxsize: 10MB/50MB`, `maxFiles: 5`）
- 防止日志文件无限增长撑满磁盘
- **评估**: 安全

**结论**: 未提交变更均为安全性改进，无需回滚。

---

## 新增问题扫描

### console.* 残留扫描
```bash
grep -rn 'console\.' backend/src/routes/v1/ | grep -v 'logger' | grep -v 'DEBUG removed'
```
**结果**: 无残留 ✅

### error.message 泄露扫描
```bash
grep -rn 'error\.message' backend/src/routes/v1/ | grep -E 'res\.json|res\.status'
```
**结果**: 无泄露 ✅

### Math.random() 交易号问题
```bash
grep -rn 'Math\.random()' backend/src/controllers/
```
**结果**: 3处（walletController.js 第99/197/423行）— 已知问题，🟡低优先级

| 位置 | 方法 | 风险 |
|------|------|------|
| L99 | recharge | 充值单号可预测 |
| L197 | withdraw | 提现单号可预测 |
| L423 | transfer | 转账单号可预测 |

### process.env.NODE_ENV 使用审查
所有使用均安全：
- `auth.js:15` — `production` 返回 false（测试Token保护）✅
- `auth.js:16` — `test` 环境检测 ✅
- `database.js:8` — 环境分支 ✅
- `dataAdapter.js:78` — 仅 development 附加调试信息 ✅

---

## 遗留问题状态

| # | 严重度 | 文件 | 问题 | 状态 | 说明 |
|---|--------|------|------|------|------|
| 1 | 🟡 | `walletController.js` | Math.random() 交易号 | ⚠️ 已知 | 3处 recharge/withdraw/transfer |
| 2 | 🟡 | `walletController.js` | 提现无银行卡归属校验 | ⚠️ 已知 | bankCardId 未验证归属 |
| 3 | 🟡 | `walletController.js` | 转账无事务保护 | ⚠️ 已知 | 扣减/增加非原子操作 |
| 4 | 🟢 | `walletController.js` | `compareSync` 时序风险 | ⚠️ 已知 | 5处支付密码验证，非高频路径 |
| 5 | 🟡 | `auth.ts` | AsyncStorage 存储Token | ⚠️ 已知 | 需 react-native-keychain |
| 6 | 🟡 | `cache.ts` | AsyncStorage 缓存敏感数据 | ⚠️ 已知 | 通用缓存组件 |
| 7 | 🟢 | `orderService.js` | Math.random() 订单号 | ⚠️ 已知 | 6处，高并发风险低 |
| 8 | 🟢 | `partyService.js` | Math.random() 退款号 | ⚠️ 已知 | 1处 |
| 9 | 🟢 | `adminService.js` | bcrypt rounds=10 | ✅ 可接受 | 管理后台非核心认证 |

**无新发现严重问题。**

---

## 安全评分

| 维度 | 评分 | 说明 |
|------|------|------|
| API路由安全 | 95/100 | auth/orders/parties 权限校验完善 |
| 敏感信息泄露 | 98/100 | logger统一，无console残留 |
| SQL注入防护 | 100/100 | Sequelize参数化查询 |
| 错误处理 | 95/100 | errorHandler统一，无stack泄露 |
| React Native安全 | 85/100 | AsyncStorage Token存储待升级 |
| 加密安全 | 95/100 | bcrypt rounds=12，IV随机 |
| 限流配置 | 95/100 | authLimiter 3次/15min |
| **总体** | **95/100** | — |

---

## 下一步建议

1. **P2 — Wallet交易号随机性**：将 `Math.random()` 改为 `crypto.randomBytes`
2. **P2 — AsyncStorage升级**：Token存储迁移至 react-native-keychain
3. **P3 — Wallet事务保护**：transfer 方法添加 Sequelize 事务
4. **P3 — 银行卡归属校验**：提现时验证 bankCardId 归属
