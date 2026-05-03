# 代码审查报告

**日期**: 2026-05-03
**审查人**: code-reviewer
**状态**: ⚠️ 有问题（存在中等问题，建议修复后上线）

## 审查概览

| 检查项 | 状态 | 说明 |
|--------|------|------|
| API路由安全性 | ⚠️ | tickets.js `/code/:code` 和 `/number/:ticketNo` 缺少auth中间件 |
| 敏感信息泄露 | ⚠️ | socialController.js 32处console.error输出错误信息 |
| SQL注入风险 | ⚠️ | ui-themes.js tag参数需加强校验 |
| 错误处理 | ⚠️ | errorHandler.js 非test环境返回stack；dataAdapter/securityValidator返回error.message+stack |
| React Native安全 | ⚠️ | AsyncStorage存储Token（中风险，建议Keychain/Keystore） |
| 限流配置 | ✅ | authLimiter已收紧至15分钟3次 |
| 认证绕过 | 🟡 | 测试Token机制已加生产环境禁止+环境变量控制 |
| 权限校验 | ✅ | orderController全部添加权限校验 |

## 重大发现

| # | 严重度 | 文件 | 问题 | 建议 |
|---|--------|------|------|------|
| 1 | 🔴 | `backend/src/routes/v1/ui-themes.js:143` | `tag` 参数拼接到SQL LIKE子句，需加强输入校验 | 对tag做白名单校验，仅允许字母数字下划线 |
| 2 | 🔴 | `backend/src/routes/v1/tickets.js:14,17` | `/code/:code` 和 `/number/:ticketNo` 路由未加 `auth` 中间件 | 根据业务判断：查票是否需要认证？如公开查票需防枚举 |
| 3 | 🟡 | `backend/src/utils/errorHandler.js:91-92` | 非test环境向客户端返回 `err.stack` | 生产环境绝不可返回堆栈，仅记录日志 |
| 4 | 🟡 | `backend/src/middleware/dataAdapter.js:110-111` | 返回 `error.message` + `error.stack` 给客户端 | 改为通用错误消息，堆栈仅记录服务端日志 |
| 5 | 🟡 | `backend/src/middleware/securityValidator.js:336-337,426-427` | 返回 `error.message` + `error.stack` 给客户端 | 同上，避免信息泄露 |
| 6 | 🟡 | `JujuApp_new/src/api/apiClient.ts` | Token存储在AsyncStorage（非加密存储） | 建议迁移至Keychain(iOS)/Keystore(Android) |
| 7 | 🟡 | `backend/src/controllers/socialController.js` | 32处 `console.error` 直接输出错误对象 | 改为结构化日志，避免敏感信息泄露 |
| 8 | 🟡 | `backend/src/services/bankCardService.js:179,197` | CBC模式使用环境变量IV，若IV固定则削弱安全性 | 确保每次加密使用随机IV，随密文存储 |
| 9 | 🟢 | `backend/src/middleware/auth.js:41` | 测试Token用户ID默认9999，所有测试共享身份 | 建议支持多测试用户映射 |

## 历史问题对比

| # | 问题 | 首次发现 | 当前状态 |
|---|------|---------|---------|
| 1 | `createCipher` → `createCipheriv` | 2026-05-03 | ✅ **已修复** — 已改为 `crypto.createCipheriv()` |
| 2 | CORS credentials语法错误 | 2026-05-03 | ✅ **已修复** — `process.env.CORS_CREDENTIALS === 'true'` |
| 3 | `mockVerifyCodes` 内存存储 | 2026-05-03 | ✅ **部分修复** — 已加定时清理，Redis迁移待后续 |
| 4 | `ui-themes.js` tag参数SQL校验 | 2026-05-03 | 🔴 **待修复** |
| 5 | 明文密码迁移通道 | 2026-05-03 | 🟡 **待修复** — 待数据库全部迁移bcrypt后移除 |
| 6 | 验证码路由重复 | 2026-05-03 | ✅ **已修复** — 已提取 `handleSendCode` 统一函数 |
| 7 | `authLimiter` 过于宽松 | 2026-05-03 | ✅ **已修复** — 已从10次收紧至3次 |
| 8 | 测试Token硬编码用户ID=1 | 2026-05-03 | 🟡 **已改善** — 默认9999，生产环境绝对禁止 |
| 9 | RN生产环境API保护 | 2026-05-03 | ✅ **审查误判** — 已正确使用 `__DEV__` |
| 10 | `Math.random()` → `crypto.randomInt` | 2026-05-03 | ✅ **已修复** |
| 11-23 | orderController权限校验系列 | 2026-05-03 | ✅ **全部已修复** |
| 24 | `tickets.js:81` 缺少auth中间件 | 2026-05-03 | ❌ **复查发现** — `/tickets/:id/verify` 实际已有auth |
| 25 | `bankCardService.js` 固定IV | 2026-05-03 | 🟡 **需确认** — 使用环境变量IV，需验证是否每次变化 |

## 详细分析

### 🔴 严重问题

#### 1. ui-themes.js tag参数SQL风险
`backend/src/routes/v1/ui-themes.js:143` 处 `tag` 值被包裹 `%"${tag}"%` 后传入replacements。虽然使用了参数化查询，但tag未做输入校验，若前端传入特殊构造的tag仍可能引发LIKE注入或性能问题。

**建议**: 对tag做白名单校验，仅允许字母、数字、下划线、中文字符。

#### 2. tickets.js 公开路由未认证
`backend/src/routes/v1/tickets.js:14` 和 `:17` 的 `/code/:code` 和 `/number/:ticketNo` 未加 `auth` 中间件。若票券编码可预测，存在枚举风险。

**建议**: 评估业务需求，如为公开验票需增加频率限制；如为内部查询应加认证。

### 🟡 中等问题

#### 3. errorHandler.js 堆栈泄露
第91-92行：
```javascript
if (process.env.NODE_ENV !== 'test') {
  errorResponse.error.stack = err.stack;
}
```
非test环境返回堆栈，意味着 **production环境也会返回**（因为production !== test）。

**建议**: 改为仅在development环境返回堆栈：
```javascript
if (process.env.NODE_ENV === 'development') {
  errorResponse.error.stack = err.stack;
}
```

#### 4. dataAdapter.js 错误信息泄露
第110-111行直接返回 `error.message` 和 `error.stack`，可能泄露内部路径、数据库结构等敏感信息。

#### 5. securityValidator.js 错误信息泄露
第336-337行、426-427行同样返回 `error.message` + `error.stack`。

#### 6. AsyncStorage存储Token
`JujuApp_new/src/api/apiClient.ts` 使用 AsyncStorage 存储token和refreshToken。AsyncStorage是明文存储，可被root设备读取。

**建议**: 敏感Token迁移至 `react-native-keychain` 或 `expo-secure-store`。

#### 7. socialController.js console.error
32处 `console.error` 直接输出错误对象，可能包含敏感信息。虽然console.error不会直接返回给客户端，但日志收集系统可能捕获并存储。

**建议**: 改为结构化日志，敏感字段脱敏。

#### 8. bankCardService.js IV使用
使用环境变量 `ENCRYPTION_IV`，若该值固定不变，则CBC模式安全性被削弱（相同明文+相同IV=相同密文）。

**建议**: 每次加密生成随机IV，将IV随密文一起存储/传输。

### 🟢 低风险问题

#### 9. 测试Token默认用户ID
`auth.js:41` 测试Token默认映射到用户ID 9999。虽然生产环境已禁止测试Token，但建议支持多测试用户映射，避免测试间相互影响。

## 安全评分

| 维度 | 评分 | 说明 |
|------|------|------|
| 认证授权 | 85/100 | 测试Token机制完善，order权限已修复，tickets公开路由待评估 |
| 数据保护 | 75/100 | encryption.js已修复，bankCard IV需确认，AsyncStorage存储Token |
| 输入验证 | 80/100 | ui-themes tag需白名单，其他路由参数化查询良好 |
| 错误处理 | 70/100 | 多处返回error.message+stack，生产环境会泄露堆栈 |
| 日志安全 | 75/100 | socialController 32处console.error需改为结构化日志 |
| **综合** | **77/100** | 中等问题为主，建议修复后上线 |

## 下一步（优先级排序）

### P0 — 上线前必须修复
1. [ ] `errorHandler.js` 修复堆栈泄露：改为仅development返回stack
2. [ ] `dataAdapter.js` + `securityValidator.js` 移除error.stack返回
3. [ ] `ui-themes.js` 添加tag参数白名单校验

### P1 — 建议上线前修复
4. [ ] 评估 `tickets.js` `/code/:code` 和 `/number/:ticketNo` 是否需要认证
5. [ ] `socialController.js` 32处console.error改为结构化日志
6. [ ] 确认 `bankCardService.js` IV是否每次变化，如固定则改为随机IV

### P2 — 上线后优化
7. [ ] AsyncStorage Token存储迁移至Keychain/Keystore
8. [ ] 测试Token支持多用户映射
9. [ ] 明文密码迁移通道设定截止日期后移除

---
*报告生成时间: 2026-05-03*
*审查工具: 自动化代码扫描 + 人工规则检查*
