# JUJU App 代码审查报告

**日期**: 2026-05-03
**审查人**: code-reviewer
**状态**: ⚠️ 有问题（5严重/4中等/3低风险）
**Git HEAD**: `8c33f9ad` - fix(security): 2026-05-03 Bug修复v2
**审查范围**: backend/src (API路由、安全、SQL注入、错误处理、RN端)

---

## 🔴 严重问题 (Critical Severity)

### 1. [公开路由] tickets.js 公开验票接口存在枚举风险
**位置**: `backend/src/routes/v1/tickets.js:14,17`

```javascript
router.get('/code/:code', ticketController.getTicketByCode);
router.get('/number/:ticketNo', ticketController.getTicketByCode);
```

**问题**: `/code/:code` 和 `/number/:ticketNo` 两个路由**未加 `auth` 中间件**，是公开验票接口。若票券编码可预测（如 `TICKET_123_168...` 模式），攻击者可通过枚举获取他人票券信息。

**影响**: 票券信息泄露、伪造入场凭证

**建议**: 
1. 评估业务必要性：验票是否必须公开？若需公开，应添加限流 + 验证码
2. 若仅内部使用，添加 `auth` 中间件
3. 票券编码应使用不可预测的随机字符串（如 UUID）

**修复状态**: 🔴 待修复

---

### 2. [错误处理] errorHandler.js 未完全消除堆栈泄露风险
**位置**: `backend/src/middleware/errorHandler.js:30-97`

**问题**: `errorHandler` 当前已不直接返回 `err.stack` 给客户端，但日志中仍记录完整堆栈（第34-49行）。更严重的是，`dataAdapter.js` 第108-118行的 catch 块中，当适配失败时调用 `originalJson(data)`，如果 data 中已包含错误信息，可能间接泄露。此外，`socialController.js` 多处 `console.error('...', error)` 直接输出完整 Error 对象，可能通过日志系统泄露敏感信息。

**影响**: 生产环境日志可能包含敏感堆栈信息，被日志收集系统捕获后泄露

**建议**: 
1. 生产环境日志应脱敏处理，不记录完整堆栈
2. `socialController.js` 的 30 处 `console.error` 应改为 `logger.error` 并脱敏
3. 统一使用 `logger` 替代 `console.error`

**修复状态**: 🟡 部分改善 — errorHandler 已不返回 stack 给客户端，但日志层仍泄露

---

### 3. [SQL注入] ui-themes.js tag参数LIKE子句
**位置**: `backend/src/routes/v1/ui-themes.js:141-149`

```javascript
if (tag) {
  const sanitizedTag = String(tag).replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '').substring(0, 20);
  if (sanitizedTag && sanitizedTag.length >= 1) {
    conditions.push('p.tags LIKE ?');
    replacements.push(`%${sanitizedTag}%`);
  }
}
```

**问题**: `sanitizedTag` 虽然做了字符白名单过滤，但 `replacements.push(\`%${sanitizedTag}%\`)` 中使用了模板字符串拼接。虽然 `sanitizedTag` 本身已过滤，但 `replacements` 机制本应完全避免字符串拼接。更安全的做法是：`replacements.push('%' + sanitizedTag + '%')`。

**影响**: 当前实现风险较低（已白名单过滤），但编码风格不安全，未来维护可能引入漏洞

**建议**: 将模板字符串改为纯字符串连接：`replacements.push('%' + sanitizedTag + '%')`

**修复状态**: 🟡 低风险但需修正编码风格

---

### 4. [敏感信息] map.js 硬编码高德地图Key占位符
**位置**: `backend/src/routes/v1/map.js:10`

```javascript
key: 'your_amap_key_here',
```

**问题**: 虽然这是占位符，但生产环境若未替换，会导致地图服务不可用。更关键的是，此配置接口**无 `auth` 中间件**（`map.js` 所有路由均无认证），任何人可获取应用配置信息。

**影响**: 配置信息泄露、地图Key被滥用

**建议**: 
1. 添加 `auth` 中间件保护配置接口
2. 生产环境部署检查确保 Key 已替换
3. 或改为服务端代理调用，不暴露 Key 给客户端

**修复状态**: 🔴 待修复

---

### 5. [认证] refresh.js Token刷新路由无速率限制
**位置**: `backend/src/routes/v1/refresh.js`

**问题**: `/auth/refresh` 路由（Token刷新）**未添加任何 rate limiter**，攻击者可无限次尝试刷新Token，配合已泄露的 refreshToken 进行重放攻击。

**影响**: Token重放攻击、资源耗尽

**建议**: 添加 `authLimiter` 或 `strictLimiter` 到 refresh 路由

**修复状态**: 🔴 待修复

---

## 🟡 中等问题 (Medium Severity)

### 6. [日志] socialController.js 30处 console.error 直接输出错误对象
**位置**: `backend/src/controllers/socialController.js`（多处）

```javascript
console.error('获取动态列表失败:', error);
console.error('发布动态失败:', error);
// ... 共30处
```

**问题**: `socialController.js` 中有 **30 处 `console.error`** 直接输出完整 Error 对象。虽然这些错误不返回给客户端，但生产环境的 stdout/stderr 日志可能被日志收集系统（如 ELK、Datadog）捕获，导致敏感信息（如数据库连接错误中的密码、SQL语句）泄露。

**影响**: 日志系统可能捕获并存储敏感错误信息

**建议**: 统一替换为 `logger.error('描述', { message: error.message })`，避免直接输出完整 Error 对象

**修复状态**: 🟡 待修复

---

### 7. [SQL注入] 多处 sequelize.query 使用模板字符串拼接
**位置**: 
- `backend/src/services/databaseOptimizationService.js:167-168`
- `backend/src/services/systemMonitoringService.js:63-75`

```javascript
await sequelize.query(`ANALYZE ${tableName}`, { type: QueryTypes.RAW });
await sequelize.query(`VACUUM ANALYZE ${tableName}`, { type: QueryTypes.RAW });
```

**问题**: `tableName` 直接拼接到 SQL 中，虽然这些服务可能是内部管理使用，但仍存在注入风险。

**影响**: 若 `tableName` 来源不可控，可能导致 SQL 注入

**建议**: 对 `tableName` 进行白名单校验（只允许已知的表名）

**修复状态**: 🟡 待修复

---

### 8. [React Native] App.tsx TEST_MODE 硬编码测试账号
**位置**: `JujuApp_new/App.tsx:12-13`

```typescript
const TEST_MODE = false; // 设置为 true 启用测试模式（自动登录）
```

**问题**: `TEST_MODE` 是编译时常量，若为 `true` 会自动写入测试 Token 和用户信息到 AsyncStorage。虽然当前为 `false`，但：
1. 代码中存在测试账号硬编码（`id: 1`, `phone: '13800138000'`）
2. 测试 Token `'test-token-for-development-only'` 是固定字符串
3. 若误开启或反编译 APK 后修改，可绕过登录

**影响**: 测试后门风险

**建议**: 
1. 使用 `__DEV__` 控制测试模式：`const TEST_MODE = __DEV__ && false;`
2. 测试账号信息应从环境配置读取，不硬编码在源码中
3. 打包前确保 TEST_MODE 为 false

**修复状态**: 🟡 待改善

---

### 9. [公开路由] content.js / posts.js 公开内容接口未加认证
**位置**: `backend/src/routes/v1/content.js`

```javascript
router.get('/banners', contentController.getBanners);
router.get('/announcements', contentController.getAnnouncements);
router.get('/posts', contentController.getArticles);
```

**问题**: 内容相关路由（banner、公告、文章）**无 `auth` 中间件**。虽然这些内容通常是公开的，但：
1. `getArticles` 使用 `Announcement` 模型查询，可能包含未发布的内部公告
2. 无认证意味着任何人可枚举所有内容ID

**影响**: 内容枚举、未发布内容可能泄露

**建议**: 
1. 确认这些路由确实需要公开访问
2. 若部分内容为内部使用，添加状态过滤（只返回 `status='published'`）
3. 考虑添加 `generalLimiter` 防止枚举

**修复状态**: 🟡 需确认业务需求

---

## 🟢 低风险问题 (Low Severity)

### 10. [代码质量] 多处 TODO 未实现
**位置**: 全项目共 20 处 TODO

**关键 TODO**:
- `auth.js:11` — 验证码内存存储应迁移 Redis（已加定时清理，部分改善）
- `auth.js:169,176` — 微信API未集成（生产环境已返回501，安全）
- `parties.js:59,73,90,107` — 评价/库存/票券状态更新为占位实现
- `auth.js:384` — 明文密码迁移通道计划 2026-06-01 移除

**建议**: 建立 TODO 追踪机制，防止安全相关 TODO 被遗忘

**修复状态**: 🟢 已知，部分已有计划

---

### 11. [代码质量] 兼容性路由过多增加维护成本
**位置**: 全项目多处

**问题**: 项目存在大量前端兼容性路由（如 `/auth/verify-code`、`/auth/send-code`、`/auth/verification-code` 三个路由指向同一 handler），增加了：
1. 路由冲突风险
2. 安全审查遗漏风险
3. 维护成本

**建议**: 文档化兼容性路由列表，定期清理废弃路由

**修复状态**: 🟢 建议文档化

---

### 12. [代码质量] ui-themes.js 错误响应直接返回 error.message
**位置**: `backend/src/routes/v1/ui-themes.js:34-40,59-65,236-242`

```javascript
res.status(500).json({
  success: false,
  message: '获取主题失败',
  error: error.message  // 可能泄露内部信息
});
```

**问题**: 虽然比返回 `error.stack` 安全，但 `error.message` 仍可能包含数据库结构、表名等敏感信息（如 `Table 'xxx' doesn't exist`）。

**建议**: 生产环境使用固定错误消息，不返回原始 `error.message`

**修复状态**: 🟢 建议改善

---

## 已修复问题确认（2026-05-03）

| # | 问题 | 验证状态 |
|---|------|---------|
| 1 | `createCipher` → `createCipheriv` | ✅ 已验证 — `encryption.js:52` 使用 `createCipheriv` |
| 2 | CORS credentials 语法错误 | ✅ 已验证 — `server.js:54` 为 `=== 'true'`（hex原始字节确认） |
| 3 | `mockVerifyCodes` 内存存储 | ✅ 部分修复 — 已加定时清理（每10分钟） |
| 4 | `authLimiter` 过于宽松 | ✅ 已修复 — 从10次收紧至3次 |
| 5 | `Math.random()` → `crypto.randomInt` | ✅ 已修复 — `auth.js:32` 使用 `crypto.randomInt` |
| 6 | `getOrderList` 权限校验 | ✅ 已修复 — 已添加管理员/普通用户权限校验 |
| 7 | `/orders/:id/tickets` 越权 | ✅ 已修复 — 已添加订单归属校验 |
| 8 | `logout` Token黑名单 | ✅ 已修复 — 已实现 Redis 黑名单机制 |
| 9 | `getOrderByOrderNo` 权限校验 | ✅ 已修复 |
| 10 | `getOrderTickets` 权限校验 | ✅ 已修复 |
| 11 | `getOrderRefund` 权限校验 | ✅ 已修复 |
| 12 | `updateOrderStatus` 权限校验 | ✅ 已修复 — 仅管理员可更新 |
| 13 | `generateTickets` 权限校验 | ✅ 已修复 — 仅管理员可生成 |
| 14 | `auditRefund` 权限校验 | ✅ 已修复 — 仅管理员可审核 |
| 15 | `getUserOrders` 权限校验 | ✅ 已修复 — 非管理员只能查看自己的订单 |
| 16 | `reset-password` 验证码验证 | ✅ 已修复 — 已添加验证码验证逻辑 |
| 17 | 全局 Rate Limiter 启用 | ✅ 已修复 — `server.js:56-61` 已启用 |
| 18 | 明文密码迁移通道 | ✅ 已改善 — 双重环境检查（非production + ALLOW_LEGACY_PLAINTEXT） |
| 19 | 测试Token硬编码 | ✅ 已改善 — 默认9999，生产环境绝对禁止 |
| 20 | RN `__DEV__` API配置 | ✅ 审查误判 — 已正确使用 `__DEV__` |

---

## 审查统计

| 类别 | 数量 |
|------|------|
| 🔴 严重 | 5 |
| 🟡 中等 | 4 |
| 🟢 低风险 | 3 |
| ✅ 已修复/改善 | 20 |
| **总计发现** | **32** |

---

## 下一步建议

1. **立即修复（P0）**:
   - 为 `tickets.js` 公开路由添加认证或限流保护
   - 为 `refresh.js` 添加速率限制
   - 为 `map.js` 添加 `auth` 中间件

2. **短期修复（P1）**:
   - 将 `socialController.js` 30处 `console.error` 替换为 `logger.error` 并脱敏
   - 修正 `ui-themes.js` 的模板字符串拼接风格
   - 为 `databaseOptimizationService.js` 的 `tableName` 添加白名单校验

3. **中期改善（P2）**:
   - 清理或文档化兼容性路由
   - 建立 TODO 安全追踪机制
   - 生产环境部署前检查清单（替换 map key、确认 TEST_MODE 关闭等）

4. **长期规划**:
   - 将 `mockVerifyCodes` 迁移至 Redis（计划 2026-06-01 前完成）
   - 彻底移除明文密码迁移通道（计划 v1.2.0）
   - 统一错误响应格式，生产环境不返回原始错误信息

---

*报告生成时间: 2026-05-03*
*审查工具: 自动化代码审查 + 人工复核*
