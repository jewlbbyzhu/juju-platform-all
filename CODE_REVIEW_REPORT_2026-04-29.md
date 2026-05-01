# JujuApp 代码审查报告

**分支**: backup-auto-20260331-210742  
**审查时间**: 2026-04-29  
**审查者**: juju-code-reviewer

---

## 🔴 严重问题 (Critical Severity)

### 1. [Security] 硬编码验证码和密码 - auth.js

**位置**: `backend/src/routes/v1/auth.js:20, 30, 40, 50, 86, 145`

**问题**: 验证码和密码使用硬编码值 `123456`，攻击者可轻易绕过认证

```javascript
// 所有验证码发送接口均硬编码为 123456
mockVerifyCodes[phone] = '123456';

// 登录验证也硬编码检查
if (code !== '123456') return res.status(400).json({ success: false, message: 'Invalid code' });

// 默认密码检查
if (password !== '123456') {
  return res.status(400).json({ success: false, message: 'Invalid password' });
}
```

**影响**: 任何人只需使用手机号和验证码 `123456` 即可登录任意账户

**建议**: 
- 移除 mockVerifyCodes，使用真实短信验证码服务
- 或至少使用随机生成的6位数字验证码

---

### 2. [Security] bcrypt 被 Mock - 密码明文存储

**位置**: `backend/src/routes/v1/auth.js:4-8`

**问题**: bcrypt 函数被替换为明文比较，密码未经哈希存储

```javascript
const bcrypt = {
  hashSync: (pwd, salt) => pwd,      // 密码直接返回，未哈希
  compareSync: (pwd, hash) => pwd === hash,  // 明文比较
  genSaltSync: (rounds) => 'salt'
};
```

**影响**: 数据库泄露会导致所有用户密码暴露

**建议**: 安装并正确使用 bcryptjs: `npm install bcryptjs`

---

### 3. [Security] 硬编码加密密钥

**位置**: `backend/src/utils/encryption.js:413`

**问题**: 使用弱 XOR 加密和硬编码默认密钥

```javascript
const key = process.env.ENCRYPTION_MASTER_KEY || 'default_key_1234567890123456';
```

**影响**: 攻击者可用默认密钥解密所有敏感数据（银行卡号等）

**建议**: 
- 强制要求 `ENCRYPTION_MASTER_KEY` 环境变量
- 使用 AES-256-GCM 等标准加密算法

---

### 4. [Security] 硬编码测试 OpenID

**位置**: `backend/src/routes/v1/auth.js:120`

**问题**: 微信登录使用硬编码测试 openid

```javascript
let openid = 'smoke_openid_68713bff0761d19bdf351646';
```

**影响**: 可能导致用户身份混淆或安全问题

---

## 🟠 中等问题 (Medium Severity)

### 5. [Code Quality] 14 处 TODO 注释未完成

**位置**: 多个文件

**问题**: 关键功能尚未实现

| 文件 | 行号 | TODO 内容 |
|------|------|-----------|
| prometheus.js | 64 | 内存使用监控 |
| auditLogger.js | 215, 218 | 告警系统集成 |
| auditLogger.js | 382 | 审计日志查询 |
| vipController.js | 418, 441 | 成长值/VIP优惠券查询 |
| walletController.js | 206 | 交易号生成 |
| socialController.js | 326, 657 | 分享用户记录 |
| socialController.js | 791 | 举报功能 |
| autoCancelService.js | 32 | 通知功能 |
| settlementService.js | 111 | 组织者通知 |

**建议**: 优先完成安全相关 TODO（告警系统、通知功能）

---

### 6. [Code Quality] 重复代码 - auth.js

**位置**: `backend/src/routes/v1/auth.js:16-43`

**问题**: 三个验证码发送接口 `/verify-code`, `/send-code`, `/verification-code` 代码完全相同

```javascript
router.post('/verify-code', async (req, res) => { /* ... */ });   // 行16-23
router.post('/send-code', async (req, res) => { /* ... */ });     // 行25-33
router.post('/verification-code', async (req, res) => { /* ... */ }); // 行35-43
```

**建议**: 合并为单一路由处理器

---

### 7. [Security] transactionManager.js Mock 连接

**位置**: `backend/src/utils/transactionManager.js:82-101`

**问题**: 使用 mock 连接替代真实的数据库事务管理

```javascript
const mockUuid = `mock-conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
```

**影响**: 可能导致数据一致性问题

---

## 🟡 低优先级问题 (Low Severity)

### 8. [Code Quality] test mode 硬编码验证

**位置**: `backend/src/controllers/userController.js:24-27`

```javascript
if (process.env.NODE_ENV === 'test' && req.body.code === 'test_mock_code_123456') {
  // test mode
}
```

**建议**: 考虑使用环境变量配置测试验证码

---

## ✅ 代码亮点

- 敏感数据日志过滤 (`logSanitizer.js`) 实现完善
- 密码强度验证 (`validator.js:23-30`) 逻辑完整
- API 路由别名设计考虑前端兼容性

---

## 修复优先级建议

| 优先级 | 问题 | 预计工时 |
|--------|------|----------|
| P0 | bcrypt mock + 硬编码密码 | 1h |
| P0 | 验证码硬编码 | 2h |
| P1 | 加密密钥硬编码 | 1h |
| P2 | TODO 功能完成 | 按需 |
| P3 | 代码重复优化 | 0.5h |
