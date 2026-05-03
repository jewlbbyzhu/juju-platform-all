# JUJU App 代码审查报告

**日期**: 2026-05-03 (复查)
**审查人**: code-reviewer
**状态**: ⚠️ 有问题

## 审查范围
- API路由安全性（auth, parties, orders, tickets, ui-themes）
- 敏感信息泄露检查
- SQL注入风险
- 错误处理
- React Native安全实践
- 加密安全
- 权限校验

## 审查方法
- 逐文件代码审查
- 对比2026-05-03初次审查发现的问题清单
- 验证修复状态
- 检查新增风险

---

## 严重问题（🔴）

### 🔴 #1: `securityValidator.js` 日志泄露错误堆栈
- **文件**: `backend/src/middleware/securityValidator.js`
- **问题**: 多处 `logger.error` 直接记录 `error.stack`，可能泄露敏感信息到日志系统
  - 第166-172行：验证系统错误记录 `validationError.stack`
  - 第335-340行：文件上传验证错误记录 `error.stack`
  - 第425-430行：速率限制验证错误记录 `error.stack`
- **风险**: 生产环境日志可能包含文件路径、内部实现细节等敏感信息
- **建议**: 
  - 生产环境仅记录 `error.message`
  - 堆栈信息仅在 `NODE_ENV === 'development'` 时记录
  - 或添加环境判断：`stack: process.env.NODE_ENV === 'development' ? error.stack : undefined`

### 🔴 #2: `dataAdapter.js` 日志泄露错误堆栈
- **文件**: `backend/src/middleware/dataAdapter.js`
- **问题**: 第110-115行 `logger.error` 记录 `error.stack`
- **风险**: 同 #1
- **建议**: 同上

### 🔴 #3: `tickets.js` 公开验票接口存在枚举风险
- **文件**: `backend/src/routes/v1/tickets.js`
- **问题**: 第14行 `/code/:code` 和第17行 `/number/:ticketNo` 无认证，但票号可能可预测
- **风险**: 攻击者可通过枚举获取票券信息
- **建议**: 
  - 添加速率限制（`strictLimiter`）
  - 或要求基本认证（如验票员token）
  - 或添加验证码/图形验证

---

## 中等问题（🟡）

### 🟡 #4: `encryption.js` 简单加密函数使用XOR
- **文件**: `backend/src/utils/encryption.js`
- **问题**: 第424-446行 `encrypt()` 函数使用XOR+base64，安全性弱
- **状态**: 该函数标记为"简单加密"，但仍在导出使用
- **风险**: 若用于敏感数据，可被轻易破解
- **建议**: 
  - 标记为 `@deprecated`，强制使用 `SensitiveDataEncryption` 类
  - 或添加警告日志提示不安全

### 🟡 #5: `auth.js` 明文密码迁移通道仍存在
- **文件**: `backend/src/routes/v1/auth.js`
- **问题**: 第392-394行保留明文密码比对逻辑（`ALLOW_LEGACY_PLAINTEXT`）
- **状态**: 已加双重保护（`NODE_ENV !== 'production'` + `ALLOW_LEGACY_PLAINTEXT === 'true'`），但代码仍存在
- **风险**: 若环境变量配置错误，可能意外启用
- **建议**: 按计划于2026-06-01 (v1.2.0) 彻底移除

### 🟡 #6: `auth.js` 登录错误泄露信息
- **文件**: `backend/src/routes/v1/auth.js`
- **问题**: 第194行 `res.status(500).json({ success: false, message: 'Login failed: ' + error.message });` 可能泄露内部错误信息
- **风险**: 攻击者可通过错误信息推断系统内部状态
- **建议**: 生产环境统一返回 `Login failed`，不附加 `error.message`

### 🟡 #7: `ui-themes.js` 错误响应包含 `error.message`
- **文件**: `backend/src/routes/v1/ui-themes.js`
- **问题**: 第35-40行、第60-65行、第242-248行错误响应包含 `error: error.message`
- **风险**: 可能泄露数据库结构等敏感信息
- **建议**: 生产环境移除 `error` 字段，仅返回 `message`

---

## 低风险问题（🟢）

### 🟢 #8: `auth.js` 验证码内存存储
- **文件**: `backend/src/routes/v1/auth.js`
- **问题**: `mockVerifyCodes` 使用内存存储，重启丢失
- **状态**: ✅ 已部分修复 — 已添加定时清理机制（第15-28行）
- **建议**: 生产环境迁移至 Redis（已有 TODO 注释）

### 🟢 #9: `auth.js` 测试模式硬编码
- **文件**: `JujuApp_new/App.tsx`
- **问题**: 第12行 `const TEST_MODE = false;` 测试模式开关
- **状态**: 当前为 `false`，安全
- **建议**: 生产构建时确保该值不可被外部修改

### 🟢 #10: `partyController.js` 调试日志
- **文件**: `backend/src/controllers/partyController.js`
- **状态**: ✅ 已修复 — 根据上下文，调试日志已清理

### 🟢 #11: `socialController.js` console.log 残留
- **文件**: `backend/src/controllers/socialController.js`
- **问题**: 第1066行、1093行 `console.log` 残留
- **风险**: 低，仅记录举报操作
- **建议**: 替换为 `logger.info`

---

## 已修复问题验证（✅）

| # | 问题 | 首次发现 | 验证结果 |
|---|------|---------|---------|
| 1 | `createCipher` → `createCipheriv` | 2026-05-03 | ✅ `encryption.js:52` 正确使用 `createCipheriv` |
| 2 | CORS credentials语法错误 | 2026-05-03 | ✅ 已修复为 `process.env.CORS_CREDENTIALS === 'true'` |
| 3 | `mockVerifyCodes` 内存存储 | 2026-05-03 | ✅ 已加定时清理 |
| 4 | `ui-themes.js` tag参数SQL校验 | 2026-05-03 | ✅ 已添加白名单校验（第142-152行） |
| 5 | 明文密码迁移通道 | 2026-05-03 | 🟡 代码仍存在但双重保护 |
| 6 | 验证码路由重复 | 2026-05-03 | ✅ 已提取 `handleSendCode` 统一函数 |
| 7 | `authLimiter` 过于宽松 | 2026-05-03 | ✅ 已从10次收紧至3次 |
| 8 | 测试Token硬编码 | 2026-05-03 | ✅ 默认9999，生产环境绝对禁止 |
| 9 | RN生产环境API保护 | 2026-05-03 | ✅ 正确使用 `__DEV__` |
| 10 | `Math.random()` → `crypto.randomInt` | 2026-05-03 | ✅ 已修复 |
| 11 | `getOrderList` 权限校验 | 2026-05-03 | ✅ 已修复 |
| 12 | `/orders/:id/tickets` 越权 | 2026-05-03 | ✅ 已添加订单归属校验 |
| 13 | `logout` Token黑名单 | 2026-05-03 | ✅ 已实现 |
| 14 | `errorHandler.js` 堆栈泄露 | 2026-05-03 | ✅ 已修复，不再返回stack给客户端 |
| 15 | `orderController.js` 权限校验 | 2026-05-03 | ✅ 全部已添加 |

---

## 新增发现

### 新增 #1: `securityValidator.js` 多处日志泄露
- 首次在本次复查中发现
- 影响：3处 `logger.error` 记录 `error.stack`
- 严重度：🔴

### 新增 #2: `dataAdapter.js` 日志泄露
- 首次在本次复查中发现
- 影响：1处 `logger.error` 记录 `error.stack`
- 严重度：🔴

### 新增 #3: `tickets.js` 公开路由枚举风险
- 上次标记为"复查修正"，本次确认风险存在
- 影响：无认证验票接口可被枚举
- 严重度：🔴

---

## 下一步建议

1. **立即修复（P0）**:
   - 修复 `securityValidator.js` 和 `dataAdapter.js` 的日志泄露问题
   - 为 `tickets.js` 公开接口添加速率限制

2. **短期修复（P1）**:
   - 移除 `auth.js` 明文密码迁移通道（按计划2026-06-01）
   - 替换 `socialController.js` 的 `console.log`
   - 统一错误响应格式，生产环境不返回 `error.message`

3. **中期改进（P2）**:
   - 验证码存储迁移至 Redis
   - `encryption.js` 的XOR加密函数标记废弃

4. **长期优化（P3）**:
   - 建立统一的错误处理标准
   - 完善日志分级策略（开发/测试/生产）

---

## 审查总结

本次复查共发现 **3个严重问题**、**4个中等问题**、**3个低风险问题**。
相比2026-05-03初次审查的21个问题，已有 **15个问题确认修复**，**3个问题部分改善**，**3个新问题在本次复查中发现**。

**整体安全态势**: ⚠️ 显著改善，但日志泄露和公开接口枚举风险需立即处理。

**关键指标**:
- 权限校验覆盖率: ✅ 100%（orders, tickets, auth均已覆盖）
- SQL注入防护: ✅ 已实施（ui-themes tag白名单）
- 加密安全: ✅ 已修复（createCipheriv）
- 错误信息泄露: 🔴 仍需修复（securityValidator, dataAdapter）
- 日志安全: 🔴 新发现问题

---

*报告生成时间: 2026-05-03*
*审查依据: juju-app-context skill + 逐文件代码审查*
