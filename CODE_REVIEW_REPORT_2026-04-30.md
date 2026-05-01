# JujuApp 代码审查报告

**分支**: backup-auto-20260331-210742  
**审查日期**: 2026-04-30  
**审查范围**: 最近10次提交修改的文件

---

## 🔴 严重问题 (Critical Severity)

### 1. [Security] 硬编码默认密码和验证码
**位置**: `backend/src/routes/v1/auth.js:20,30,40,50,86,145`

**问题**: 整个认证模块存在严重的硬编码问题，任何人都可以使用固定验证码 `123456` 登录或注册账户。

```javascript
// 所有验证码接口统一返回 123456
mockVerifyCodes[phone] = '123456';
// ...
if (code !== '123456') return res.status(400).json({ success: false, message: 'Invalid code' });

// 默认密码也是 123456
if (password !== '123456') {
  return res.status(400).json({ success: false, message: 'Invalid password' });
}
```

**影响**: 攻击者可以使用任意手机号 + 验证码 `123456` 完成登录或注册，完全绕过认证。

**建议**: 
1. 集成真实的短信验证码服务（如阿里云、腾讯云短信）
2. 验证码应有时效性（5分钟过期）和次数限制（单手机号每天最多发送10次）
3. 生产环境必须移除 mock 验证码逻辑

---

### 2. [Security] bcrypt 被 mock 导致密码明文存储
**位置**: `backend/src/routes/v1/auth.js:3-8`

**问题**: bcrypt 库被注释掉，使用了不安全的 mock 实现，密码未经哈希直接比较。

```javascript
// const bcrypt = require('bcrypt'); // 临时注释，等待npm install修复
const bcrypt = {
  hashSync: (pwd, salt) => pwd,      // 密码直接返回，不加密！
  compareSync: (pwd, hash) => pwd === hash,  // 明文比较！
  genSaltSync: (rounds) => 'salt'
};
```

**影响**: 数据库存储的是明文密码，任何有数据库访问权限的人都能看到所有用户密码。

**建议**: 
1. 恢复 bcrypt 依赖：`npm install bcrypt`
2. 使用 `bcrypt.hash(password, 10)` 和 `bcrypt.compare(password, hash)`
3. 已有的用户密码需要重新哈希

---

### 3. [Security] 硬编码加密密钥
**位置**: `backend/src/utils/encryption.js:413`

**问题**: 加密函数使用硬编码的默认密钥。

```javascript
const key = process.env.ENCRYPTION_MASTER_KEY || 'default_key_1234567890123456';
```

**影响**: 如果环境变量未设置，所有加密数据都可被轻易解密。

**建议**: 在 `.env` 中设置 `ENCRYPTION_MASTER_KEY`，确保应用启动时必须提供有效的密钥。

---

### 4. [Security] 微信登录硬编码 openid
**位置**: `backend/src/routes/v1/auth.js:120`

**问题**: 微信登录 fallback 逻辑中使用了硬编码的 openid。

```javascript
let openid = 'smoke_openid_68713bff0761d19bdf351646';
```

**影响**: 任何人都可以伪装成同一个微信用户登录。

**建议**: 移除 fallback 逻辑，或在测试模式下明确标识。

---

## 🟠 中等问题 (Medium Severity)

### 5. [Error Handling] 错误信息泄露内部细节
**位置**: `backend/src/routes/v1/auth.js:131,193,266,302`

**问题**: 部分错误处理将敏感的错误详情返回给客户端。

```javascript
res.status(500).json({ success: false, message: 'Login failed: ' + error.message });
```

**影响**: 攻击者可以通过错误信息了解系统内部结构（如数据库错误、文件路径等）。

**建议**: 生产环境只返回通用错误消息，详细信息应记录到日志而不是返回给客户端。

---

### 6. [Security] JWT_SECRET 未验证
**位置**: `backend/src/routes/v1/auth.js:206,239`

**问题**: 直接使用 `process.env.JWT_SECRET` 而未检查是否为空。

```javascript
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

**影响**: 如果 JWT_SECRET 未设置，可能使用默认的弱密钥。

**建议**: 在应用启动时验证必要的环境变量是否已设置。

---

### 7. [Code Quality] 验证码接口缺少频率限制
**位置**: `backend/src/routes/v1/auth.js:16-42`

**问题**: `/verify-code`、`/send-code`、`/verification-code` 三个接口均无频率限制，可被用于短信轰炸攻击。

**建议**: 
1. 添加 Redis 计数：每手机号每分钟最多1次、每小时最多10次
2. 返回冷却时间给前端：`{ sent: true, cooldown: 60 }`

---

### 8. [Code Quality] 存在 TODO 待完成功能
**位置**: 多处

**问题**: 代码中有 14 处 TODO 注释，部分涉及核心功能：
- `backend/src/services/autoCancelService.js:32` - 通知功能未实现
- `backend/src/controllers/socialController.js:791` - 举报功能未实现
- `backend/src/controllers/walletController.js:206` - 交易号未使用

**建议**: 评估每个 TODO 的优先级，在生产部署前完成或记录到 issue 追踪系统。

---

## 🟡 低等问题 (Low Severity)

### 9. [Code Quality] 重复代码模式
**位置**: `backend/src/routes/v1/auth.js:16-42`

**问题**: 三个验证码接口（`/verify-code`、`/send-code`、`/verification-code`）的代码几乎完全相同。

**建议**: 提取公共逻辑到一个共享函数：
```javascript
async function handleSendCode(req, res) {
  const { phone, type } = req.body || {};
  if (!phone) return res.status(400).json({ success: false, message: 'Phone required' });
  // 公共逻辑...
}
router.post('/verify-code', handleSendCode);
router.post('/send-code', handleSendCode);
router.post('/verification-code', handleSendCode);
```

---

### 10. [Security] 敏感数据日志清理
**位置**: `backend/src/utils/logSanitizer.js`

**问题**: 好的一面是 `logSanitizer.js` 已实现敏感字段过滤，包括 `password`、`token`、`api_key`、`openid` 等。这是值得肯定的实践。

**建议**: 继续确保所有日志出口都经过 sanitizer 处理。

---

## ✅ 值得肯定的实践

1. **敏感数据日志清理** (`logSanitizer.js`) - 完善的敏感信息过滤机制
2. **JWT Token 生成** - 使用了 access token + refresh token 双令牌机制
3. **统一的错误处理中间件** - `errorHandler.js` 提供了一致的错误响应格式
4. **安全验证器** (`securityValidator.js`) - Joi 验证规则定义了强密码要求
5. **审计日志** (`auditLogger.js`) - 实现了审计日志功能

---

## 修复优先级建议

| 优先级 | 问题编号 | 修复工作量 |
|--------|----------|------------|
| P0 - 立即修复 | 1, 2, 3 | 高 |
| P1 - 本周修复 | 4, 6, 7 | 中 |
| P2 - 计划修复 | 5, 8, 9 | 低 |

---

## 结论

当前代码存在 **4个严重安全问题**，其中认证模块的硬编码验证码和明文密码存储是最严重的问题，**不建议在当前状态下部署到生产环境**。

建议优先修复安全相关问题（P0），然后进行功能测试验证修复后的认证流程正常工作。
