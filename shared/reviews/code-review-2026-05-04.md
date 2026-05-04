# 代码审查报告

**日期**: 2026-05-04
**审查人**: code-reviewer
**状态**: ⚠️ 有问题

## 审查范围
- API路由安全性（auth, parties, orders, tickets, reports, categories）
- 敏感信息泄露检查
- SQL注入风险
- 错误处理
- React Native安全实践
- 生产API健康状态验证

## 🔴 严重问题 (Critical Severity)

### 1. categories.js 模型引用错误 — 生产环境500错误
**位置**: `backend/src/routes/v1/categories.js:4,9`

**问题**: 文件导入 `Category` 但实际使用 `PartyCategory`，导致 `ReferenceError: PartyCategory is not defined`

```javascript
// L4: 错误导入
const { Category } = require('../../models');

// L9: 错误使用
const categories = await PartyCategory.findAll({
```

**影响**: 
- `/api/v1/categories` 返回 HTTP 500
- 分类列表功能完全不可用
- 阻塞首页、筛选等核心业务流程

**建议**: 
```javascript
const { PartyCategory } = require('../../models');
```

**验证**: 
```bash
curl -s https://api.hfparty.asia/api/v1/categories
# 实际返回: {"success":false,"message":"获取分类失败"}
```

---

### 2. 生产数据库 Schema Drift — parties/categories 返回500
**位置**: `backend/src/models/Party.js`

**问题**: 模型已添加 `report_count` 和 `last_report_time` 字段，但生产数据库表结构未同步

**影响**: 
- `/api/v1/parties` 返回 HTTP 500 + `Unknown column 'Party.report_count' in 'field list'`
- `/api/v1/categories` 也返回 500（可能同样受 schema drift 波及）
- 核心API完全不可用

**建议**: 
```sql
ALTER TABLE parties ADD COLUMN report_count INT NOT NULL DEFAULT 0 COMMENT '被举报次数';
ALTER TABLE parties ADD COLUMN last_report_time DATETIME NULL COMMENT '最后一次被举报时间';
```

**验证**: 
```bash
curl -s https://api.hfparty.asia/api/v1/parties | head -c 200
# 实际返回: HTTP 500
```

---

## 🟡 中等问题 (Medium Severity)

### 3. ui-themes.js SQL 模板字符串注入风险
**位置**: `backend/src/routes/v1/ui-themes.js:153`

**问题**: 使用模板字符串拼接 SQL replacement 值，虽经白名单过滤但仍为危险模式

```javascript
replacements.push(`%${sanitizedTag}%`);
```

**影响**: 
- 白名单校验后的 `sanitizedTag` 仍通过模板字符串进入 SQL
- 未来维护者可能误改白名单规则，引入注入风险
- 不符合安全编码规范

**建议**: 
```javascript
replacements.push('%' + sanitizedTag + '%');
```

**验证**: 
```bash
python3 -c "print(open('backend/src/routes/v1/ui-themes.js','rb').read().split(b'\n')[152].hex())"
# 确认: 607825247b73616e6974697a65645461677d2560293b (template string)
```

---

### 4. React Native AsyncStorage 存储敏感 Token
**位置**: 
- `JujuApp_new/src/api/auth.ts:14-15`
- `JujuApp_new/src/api/apiClient.ts:104-115`

**问题**: Token 和 refreshToken 存储在 AsyncStorage（非加密存储），存在被其他应用或 root 设备读取的风险

```typescript
await AsyncStorage.setItem('token', response.data.token);
await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
```

**影响**: 
- 设备被 root 后，Token 可被任意应用读取
- 无法利用 iOS Keychain / Android Keystore 的硬件级加密保护
- 不符合金融/支付类应用安全规范

**建议**: 
迁移至 `react-native-keychain` 或 `@react-native-secrets-manager`：
```typescript
import * as Keychain from 'react-native-keychain';
await Keychain.setGenericPassword('token', response.data.token);
```

---

### 5. mockVerifyCodes 内存存储 — 生产环境风险
**位置**: `backend/src/routes/v1/auth.js:12`

**问题**: 验证码仍使用内存对象存储，重启后丢失；虽有定时清理但无持久化

```javascript
// TODO: 生产环境应迁移至 Redis，当前内存存储仅用于开发/测试
const mockVerifyCodes = {};
```

**影响**: 
- 服务重启后所有未过期验证码失效
- 多实例部署时验证码无法共享
- 内存泄漏风险（虽已有清理机制）

**建议**: 
迁移至 Redis 或数据库存储，设置 TTL

---

## 🟢 低风险问题 (Low Severity)

### 6. TODO 残留
**位置**: 多处

| 文件 | 行 | TODO内容 |
|------|-----|---------|
| `auth.js` | 12 | 生产环境应迁移至 Redis |
| `auth.js` | 170 | 替换为真实微信API调用 |
| `auditLogger.js` | 215 | 集成告警系统 |
| `auditLogger.js` | 218 | 自动安全响应 |
| `vipController.js` | 418 | 实现成长值记录查询 |
| `vipController.js` | 441 | 实现VIP优惠券查询 |

---

### 7. partyController.js DEBUG 注释残留
**位置**: `backend/src/controllers/partyController.js:219`

```javascript
// DEBUG removed: console.log('DEBUG party.start_time:', party.start_time, 'type:', typeof party.start_time);
```

**建议**: 完全删除而非注释

---

## ✅ 已修复确认 (Verified Fixes)

| # | 文件 | 问题 | 验证方法 | 状态 |
|---|------|------|---------|------|
| 1 | `encryption.js` | `createCipher()` → `createCipheriv()` | `grep createCipheriv` + hex验证 | ✅ |
| 2 | `server.js` | `trust proxy` 配置 | `grep 'trust proxy'` | ✅ |
| 3 | `server.js` | Helmet/CSP | `grep helmet` | ✅ |
| 4 | `rateLimiter.js` | `authLimiter` 收紧至3次 | `grep 'authLimiter.*3'` | ✅ |
| 5 | `bankCardService.js` | 固定IV → 随机IV | `grep 'randomBytes(12)'` | ✅ |
| 6 | `orderController.js` | 权限校验 | `grep 'order.user_id'` | ✅ |
| 7 | `auth.js` | `console.error` → `logger.error` | `grep console.error` (无结果) | ✅ |
| 8 | `auth.js` | `Math.random()` → `crypto.randomInt()` | `grep randomInt` | ✅ |
| 9 | `auth.js` | 验证码路由重复提取 | `grep handleSendCode` | ✅ |
| 10 | `tickets.js` | `/code/:code` 加 `strictLimiter` | `grep 'strictLimiter'` | ✅ |
| 11 | `errorHandler.js` | 无 `error.stack` 返回客户端 | `sendErrorProd` 分析 | ✅ |
| 12 | `encryption.js` | bcrypt saltRounds=12 | `grep saltRounds` | ✅ |
| 13 | `reports.js` | 新增路由已加 auth | `grep auth` | ✅ |
| 14 | `refresh.js` | 已加 `strictLimiter` | `grep strictLimiter` | ✅ |
| 15 | `push.js` | 已加 `authenticate` | `grep authenticate` | ✅ |
| 16 | `map.js` | 已加 `auth` | `grep auth` | ✅ |
| 17 | `config/index.ts` | 正确使用 `__DEV__` | `grep __DEV__` | ✅ |
| 18 | `App.tsx` | BackHandler 已添加 | `grep BackHandler` | ✅ |
| 19 | `scan-error-message-leaks.py` | 无 error.message 泄露 | 脚本扫描通过 | ✅ |

---

## 下一步建议

### 立即修复 (P0)
1. **修复 categories.js 导入错误** — 将 `Category` 改为 `PartyCategory`
2. **同步生产数据库 schema** — 执行 `ALTER TABLE` 添加缺失列

### 短期修复 (P1)
3. **修复 ui-themes.js 模板字符串** — 改为字符串拼接
4. **迁移 AsyncStorage → Keychain** — 提升 Token 存储安全性
5. **迁移 mockVerifyCodes → Redis** — 生产环境验证码持久化

### 中期优化 (P2)
6. **清理 TODO 和 DEBUG 注释**
7. **categories.js 导入/使用一致性检查** — 建立自动化扫描防止类似问题

---

## 安全评分

| 维度 | 得分 | 说明 |
|------|------|------|
| 认证授权 | 90/100 | 新增路由均加 auth，公开路由加限流 |
| 数据加密 | 85/100 | bcrypt 12轮，createCipheriv，随机IV |
| 错误处理 | 85/100 | 无 stack 泄露客户端，但 error.message 在 dev 模式返回 |
| SQL安全 | 80/100 | 主要使用 Sequelize ORM，一处模板字符串风险 |
| 敏感存储 | 60/100 | AsyncStorage 存 Token，未用 Keychain |
| 部署安全 | 65/100 | schema drift 导致生产 500，categories 导入错误 |
| **综合** | **78/100** | 代码层面良好，生产部署层面有2个严重问题 |

---

*报告生成时间: 2026-05-04 06:05 UTC+8*
