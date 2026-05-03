# 代码审查报告

**日期**: 2026-05-03
**审查人**: code-reviewer
**状态**: ⚠️ 有问题

## 审查概览

- **审查范围**: API路由安全性、敏感信息泄露、SQL注入、错误处理、React Native安全实践
- **审查文件数**: 19个核心文件（后端路由/控制器/中间件 + RN前端配置/API层）
- **发现问题**: 8个（🔴严重3个 / 🟡中等4个 / 🟢低风险1个）

## 重大发现

| # | 严重度 | 文件 | 问题 | 建议 |
|---|--------|------|------|------|
| 1 | 🔴 | backend/src/routes/v1/auth.js | 验证码使用内存对象 mockVerifyCodes 存储，服务重启后丢失，且无法分布式共享 | 改用 Redis 或数据库存储验证码，设置TTL过期时间 |
| 2 | 🔴 | backend/src/routes/v1/auth.js | 开发环境通过 console.log 输出验证码到日志，生产环境若未清理会泄露敏感信息 | 移除 console.log 验证码逻辑，或使用专用调试级别日志 |
| 3 | 🔴 | backend/src/server.js | CORS_CREDENTIALS 配置行疑似被截断或混淆（含***），可能导致CORS配置异常 | 检查并修复CORS配置，确保 credentials 设置正确 |
| 4 | 🟡 | backend/src/routes/v1/auth.js | 明文密码迁移通道仍存在，虽然加了环境判断，但逻辑可能被绕过 | 彻底移除明文密码兼容逻辑，强制使用bcrypt |
| 5 | 🟡 | backend/src/middleware/rateLimiter.js | authLimiter 15分钟1000次请求过于宽松，无法有效防御暴力破解 | 登录/注册接口限流收紧为5分钟5-10次 |
| 6 | 🟡 | backend/src/middleware/auth.js | 测试环境存在硬编码Token或认证绕过逻辑，可能被利用绕过生产环境认证 | 测试绕过逻辑必须严格绑定 NODE_ENV==='test'，且不能用于生产 |
| 7 | 🟡 | JujuApp_new/src/api/apiClient.ts | Token存储在 AsyncStorage 中，非加密存储，可能被其他应用读取（Android） | 敏感Token使用 Keychain(iOS)/Keystore(Android) 存储 |
| 8 | 🟢 | backend/src/routes/v1/auth.js | logout 仅清除客户端Token，未将Token加入服务端黑名单，注销后Token仍可被利用 | 实现Token黑名单（Redis），logout时加入黑名单并检查 |

## 详细分析

### 🔴 严重问题

#### 1. 验证码内存存储（auth.js）
当前验证码存储在内存对象 `mockVerifyCodes` 中，存在以下风险：
- 服务重启后所有验证码丢失
- 多实例部署时验证码无法共享
- 无法设置过期时间，验证码长期有效

**修复方案**: 使用 Redis SETEX 存储验证码，key格式 `verify:{phone}`，TTL=300秒

#### 2. 验证码日志泄露（auth.js）
代码中存在 `console.log('验证码:', verifyCode)` 或类似逻辑，生产环境日志可能被：
- 日志收集系统采集
- 运维人员查看
- 外部日志服务泄露

**修复方案**: 使用 `debug` 或 `winston` 等日志库，开发环境才输出验证码

#### 3. CORS配置异常（server.js）
配置行出现 `process.env.CORS_CREDENTIALS=*** 'true'` 格式异常，可能原因：
- 环境变量被截断
- 配置文件被意外修改
- 敏感值被脱敏处理但破坏了语法

**修复方案**: 检查 `.env` 文件和 server.js 第56-61行，确保 `credentials: true/false` 格式正确

### 🟡 中等问题

#### 4. 明文密码迁移通道（auth.js）
虽然加了 `process.env.NODE_ENV !== 'production'` 判断，但：
- 若环境变量被篡改可能绕过
- 遗留代码增加维护复杂度
- 新部署环境可能误设为开发模式

**修复方案**: 直接移除明文密码兼容代码，数据库中已加密密码可正常使用

#### 5. 限流过于宽松（rateLimiter.js）
当前 authLimiter: 15分钟 / 1000请求
暴力破解场景下，攻击者可在15分钟内尝试1000次密码组合

**修复方案**: 
- 登录接口: 5分钟 / 5次
- 注册接口: 5分钟 / 3次  
- 验证码发送: 1分钟 / 1次

#### 6. 测试Token绕过（auth.js）
测试环境硬编码Token或 `skipAuth` 逻辑若未严格绑定环境，可能导致：
- 生产环境被意外绕过
- 内部人员利用测试Token访问

**修复方案**: 严格绑定环境变量

#### 7. AsyncStorage存储Token（apiClient.ts）
React Native的 AsyncStorage 是明文存储，Android上：
- 其他应用可能读取（若设备已root）
- 备份可能包含Token
- 无加密保护

**修复方案**: 使用 `react-native-keychain` 或加密存储

### 🟢 低风险

#### 8. Logout无黑名单（auth.js）
当前 logout 仅通知客户端清除Token，服务端Token仍然有效直到过期

**修复方案**: 使用 Redis 存储黑名单，JWT验证时检查

## 与历史审查对比

| 问题 | 2026-05-01 | 2026-05-02 | 2026-05-03 |
|------|-----------|-----------|-----------|
| isDev硬编码 | ❌ 发现 | ✅ 修复 | - |
| 微信openid硬编码 | ❌ 发现 | ✅ 修复 | - |
| CORS通配符 | ❌ 发现 | ✅ 修复 | - |
| 明文密码生产风险 | ❌ 发现 | - | ✅ 修复 |
| reset-password验证码 | ❌ 发现 | - | ✅ 修复 |
| RateLimiter禁用 | ❌ 发现 | - | ✅ 修复 |
| orders越权 | ❌ 发现 | - | ✅ 修复 |
| 加密盐值未保存 | - | - | ❌ 新发现 |
| CORS配置截断 | - | - | ❌ 新发现 |
| mockVerifyCodes | - | - | ❌ 新发现 |

## 下一步建议

1. **立即修复（P0）**:
   - 修复 CORS_CREDENTIALS 配置截断问题
   - 移除 console.log 验证码输出
   - 将验证码存储迁移到 Redis

2. **本周修复（P1）**:
   - 收紧 rateLimiter 配置
   - 移除明文密码迁移通道
   - 加固测试Token绕过逻辑

3. **下周修复（P2）**:
   - 实现 Token 黑名单
   - RN Token 存储改用 Keychain/Keystore
   - 检查 encryption.js 盐值保存逻辑

## 安全评分

| 维度 | 评分 | 说明 |
|------|------|------|
| 认证安全 | ⚠️ 65/100 | 验证码存储、限流、Token管理有待加强 |
| 数据保护 | ⚠️ 70/100 | 加密模块存在盐值保存问题 |
| 输入验证 | ✅ 80/100 | 未发现SQL注入，参数校验基本到位 |
| 错误处理 | ⚠️ 60/100 | 可能泄露敏感信息 |
| 客户端安全 | ⚠️ 55/100 | AsyncStorage存储Token不安全 |

**综合评分**: ⚠️ 66/100 — 存在安全问题，建议优先修复P0项
