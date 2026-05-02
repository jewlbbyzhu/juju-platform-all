# 代码审查报告

**日期**: 2026-05-03
**审查人**: code-reviewer
**状态**: ⚠️ 有问题（4个中风险问题需关注）

---

## 重大发现

| # | 严重度 | 文件 | 问题 | 建议 |
|---|--------|------|------|------|
| 1 | 🟠 | `auth.js:76-77` | 开发环境万能验证码`123456`暴露于生产代码 | 生产环境移除万能码逻辑 |
| 2 | 🟠 | `auth.js:116-124` | 明文密码支持旧数据迁移存在安全风险 | 强制要求所有用户迁移至bcrypt |
| 3 | 🟠 | `auth.js:159-165` | 微信登录占位符placeholder，生产环境无真实微信API | 补充真实微信API集成 |
| 4 | 🟠 | `auth.js` | 验证码存储于内存mockVerifyCodes，重启丢失，无持久化 | 生产环境使用Redis存储 |

---

## 低风险问题

| # | 文件 | 问题 | 建议 |
|---|------|------|------|
| 1 | `auth.js:42,55,68` | 验证码发送catch块过于简单，仅返回500+Failed，无错误日志 | 增加`logger.error()`记录具体错误 |
| 2 | `auth.js` 全文件 | 多个console.log用于开发调试，生产应使用logger | 统一使用logger替代console.log |
| 3 | `userService.js:488` | sequelize.query使用replacements参数化查询，安全 | ✅ 良好实践 |
| 4 | `logSanitizer.js` | 日志脱敏覆盖50+敏感字段 | ✅ 优秀 |
| 5 | `encryption.js` | bcrypt哈希saltRounds=10 | ✅ 安全达标 |
| 6 | `errorHandler.js` | 全局错误处理，自动过滤password等敏感字段 | ✅ 良好 |

---

## 安全亮点

- ✅ **密码哈希**: 使用bcrypt，saltRounds=10
- ✅ **日志脱敏**: 覆盖50+敏感字段，含phone/idcard/bankcard等
- ✅ **JWT认证**: access token + refresh token双token机制
- ✅ **参数化查询**: sequelize.query使用replacements防注入
- ✅ **敏感信息过滤**: errorHandler自动过滤password/token/creditCard
- ✅ **密码强度验证**: Joi验证含大小写+数字+特殊字符要求
- ✅ **Rate Limiting**: 验证码60秒内最多5次

---

## 需立即修复

### 1. 生产环境万能验证码（🟠 中风险）

**位置**: `backend/src/routes/v1/auth.js:76-77`
```javascript
// 验证验证码（开发环境支持万能码 123456）
const stored = mockVerifyCodes[phone];
```
**问题**: 万能码`123456`允许任何人登录
**影响**: 生产环境若未移除，攻击者可尝试万能码登录
**建议**:
```javascript
// 仅开发/测试环境支持万能码
if (process.env.NODE_ENV === 'development' && code === '123456') {
  // 开发环境放行
} else if (code !== stored.code) {
  return res.status(400).json({ success: false, message: 'Invalid code' });
}
```

### 2. 明文密码迁移逻辑（🟠 中风险）

**位置**: `backend/src/routes/v1/auth.js:116-124`
```javascript
} else {
  // 明文密码（旧数据迁移）
  isValidPassword = (password === user.password);
  if (isValidPassword) {
    // 自动升级：明文密码迁移为bcrypt哈希
    user.password = await bcrypt.hash(password, 10);
    await user.save();
  }
}
```
**问题**: 明文密码仍可登录，且在验证时自动升级
**影响**: 攻击者获取数据库后可尝试彩虹表攻击明文密码
**建议**: 添加`NODE_ENV !== 'production'`条件，仅在开发环境允许明文

### 3. 微信登录占位符（🟠 中风险）

**位置**: `backend/src/routes/v1/auth.js:159-165`
```javascript
// TODO: 替换为真实微信API调用: https://api.weixin.qq.com/sns/jscode2session
openid = `wechat_${code}_${Date.now()}`;
```
**问题**: 生产环境微信登录返回假openid
**影响**: 用户无法正常微信登录
**建议**: 实现真实微信API调用或返回明确错误

### 4. 验证码内存存储（🟠 中风险）

**位置**: `backend/src/routes/v1/auth.js:10`
```javascript
const mockVerifyCodes = {};
```
**问题**: 服务器重启验证码全部丢失；无法分布式部署
**影响**: 用户收不到验证码（服务器重启场景）
**建议**: 使用Redis存储，`mockVerifyCodes` → Redis

---

## 下一步

1. **高优先级**: 在`auth.js`添加`NODE_ENV`判断，移除生产环境万能码
2. **中优先级**: 明文密码迁移逻辑添加生产环境限制
3. **中优先级**: 实现真实微信登录API
4. **低优先级**: 统一使用logger替代console.log

---

## 审查文件清单

| 文件路径 | 关键内容 |
|----------|----------|
| `backend/src/routes/v1/auth.js` | 认证路由（含明文密码迁移、万能码） |
| `backend/src/utils/encryption.js` | bcrypt哈希（✅ 安全） |
| `backend/src/utils/logSanitizer.js` | 日志脱敏（✅ 优秀） |
| `backend/src/middleware/errorHandler.js` | 全局错误处理（✅ 良好） |
| `backend/src/middleware/securityValidator.js` | 安全验证（✅ 良好） |
| `backend/src/services/userService.js` | 用户服务（✅ 参数化查询） |
| `backend/.env` | 环境配置（含JWT_SECRET等） |
| `JujuApp_new/src/config/index.ts` | APP API配置 |
