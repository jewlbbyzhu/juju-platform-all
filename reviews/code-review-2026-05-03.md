# 代码审查报告（增量审查）

**日期**: 2026-05-03
**审查人**: code-reviewer
**状态**: ⚠️ 有问题（1个中等风险遗留）
**审查策略**: 增量审查 — 仅审查自上次报告（2026-05-03 22:02）后变更的文件

## 审查范围
- 上次报告后变更文件: `encryption.js`, `socialController.js`
- 上次报告 🟡 复查问题: `tickets.js` 公开路由, `AsyncStorage` Token存储
- 新增发现: `onboarding.js`, `auditLogger.js`

## 上次报告后变更文件审查

### 1. ✅ encryption.js — 加密实现安全
| 项目 | 状态 | 说明 |
|------|------|------|
| 算法 | ✅ | AES-256-GCM（认证加密） |
| IV生成 | ✅ | `crypto.randomBytes(16)` 随机IV |
| 密钥派生 | ✅ | PBKDF2-SHA256, 100,000次迭代 |
| 盐值 | ✅ | 随机16字节，与密文一起存储 |
| createCipheriv | ✅ | 正确使用，非createCipher |

**结论**: 上次报告的 🔴 `createCipher` 问题已彻底修复，当前实现符合安全最佳实践。

### 2. ✅ socialController.js — 日志已规范化
| 项目 | 状态 | 说明 |
|------|------|------|
| console.* 残留 | ✅ | 全部替换为 `logger.error` |
| 错误处理 | ✅ | 不返回 `error.stack` 给客户端 |
| 错误信息 | ✅ | 仅返回通用消息（如"获取动态列表失败"） |

**结论**: 上次报告的 console.log 问题已修复，无新增安全问题。

## 上次 🟡 复查问题追踪

### 3. ✅ tickets.js 公开路由 — 业务评估完成
| 项目 | 状态 | 说明 |
|------|------|------|
| `/code/:code` | ✅ | 已加 `strictLimiter`（1分钟20次）防枚举 |
| `/number/:ticketNo` | ✅ | 同上 |
| 认证要求 | 🟡 | 公开验票接口，线下场景必需 |
| 编码随机性 | ✅ | 票券编码使用UUID，不可预测 |

**结论**: 公开验票是线下扫码检票的业务必需功能，当前 `strictLimiter` 限流配置合理，风险可控。

### 4. 🟡 AsyncStorage 存储 Token — 仍未修复
| 文件 | 问题 | 风险 |
|------|------|------|
| `JujuApp_new/src/api/auth.ts:14-15` | Token/refreshToken 存入 AsyncStorage | 设备root后可读取 |
| `JujuApp_new/src/api/apiClient.ts` | 从 AsyncStorage 读取 Token 附加到请求头 | 同上 |
| `JujuApp_new/src/utils/cache.ts` | 通用缓存使用 AsyncStorage | 敏感数据可能入缓存 |

**建议**: 迁移至 `react-native-keychain`（iOS Keychain / Android Keystore）。
**优先级**: 中 — 需评估业务影响后决定修复时机。

## 新发现问题

### 5. 🟡 onboarding.js — error.message 返回客户端
| 位置 | 问题 | 严重度 |
|------|------|--------|
| `onboarding.js:57` | `error: error.message` 返回给客户端 | 🟡 低 |
| `onboarding.js:142` | `error: error.message` 返回给客户端 | 🟡 低 |

**风险**: 可能泄露内部错误详情（如数据库连接失败信息）。
**建议**: 移除响应中的 `error.message`，仅返回通用错误消息。

### 6. 🟢 auditLogger.js — console.warn 用于安全告警
| 位置 | 问题 | 严重度 |
|------|------|--------|
| `auditLogger.js:207` | `console.warn('HIGH RISK SECURITY EVENT:', ...)` | 🟢 低 |

**说明**: 这是安全审计日志的高风险事件告警，使用 `console.warn` 是为了确保在日志系统故障时仍能输出。属于设计选择，非安全漏洞。

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
| 18 | error.message返回客户端 | ✅ 已移除（auth.js等） |
| 19 | 无密码用户环境判断 | ✅ 彻底移除环境判断 |

## 安全评分

| 维度 | 得分 | 说明 |
|------|------|------|
| API路由安全 | 95/100 | 公开验票接口已限流 |
| 敏感信息保护 | 85/100 | AsyncStorage Token存储待迁移 |
| SQL注入防护 | 95/100 | 白名单校验已覆盖 |
| 错误处理 | 90/100 | onboarding.js仍有泄露 |
| 加密安全 | 98/100 | AES-256-GCM + 随机IV |
| 限流配置 | 95/100 | authLimiter已收紧 |
| **综合评分** | **93/100** | 较上次提升1分 |

## 遗留问题清单

| # | 严重度 | 文件 | 问题 | 建议修复 |
|---|--------|------|------|---------|
| 1 | 🟡 | `JujuApp_new/src/api/auth.ts` | AsyncStorage存储Token | 迁移至react-native-keychain |
| 2 | 🟡 | `backend/src/routes/v1/onboarding.js:57,142` | error.message返回客户端 | 移除响应中的error字段 |
| 3 | 🟢 | `backend/src/server.js:15,50` | console.log/warn启动日志 | 可接受，非运行时泄露 |

## 下一步建议

1. **高优先级**: 修复 `onboarding.js` 的 `error.message` 泄露（简单修复，1行代码）
2. **中优先级**: 评估 AsyncStorage→Keychain 迁移成本，制定迁移计划
3. **低优先级**: 考虑将 `server.js` 启动日志改为 `logger.info`

---
**报告版本**: v1（增量审查）
**上次报告**: `code-review-2026-05-03.md`
**变更文件**: `encryption.js`, `socialController.js`
