# JUJU App 代码审查报告

**分支**: main  
**Commit**: 93656cf8 (fix: 添加 /party/list 和 /parties/list 路由别名)  
**审查日期**: 2026-05-01  
**审查范围**: backend/src + JujuApp_new/src 安全审查

---

## 🔴 严重问题 (Critical Severity)

### 1. [CRITICAL] bcrypt 被 mock — 密码明文存储/比较

**位置**: 多文件
- `backend/src/services/walletService.js:297-301`
- `backend/src/services/adminService.js:5-9`
- `backend/src/routes/v1/auth.js` (之前审查已报告)

**问题**: bcrypt 库被注释掉，使用不安全的 mock 对象，密码以明文存储和比较。

```javascript
// walletService.js:297-301
const bcrypt = {
  hashSync: (pwd, salt) => pwd,      // 密码直接返回，不加密！
  compareSync: (pwd, hash) => pwd === hash,  // 明文比较！
  genSaltSync: (rounds) => 'salt'
};

// adminService.js:5-9 同样问题
```

**影响**: 
- 用户密码以明文存储在数据库中
- 攻击者拖库后可直接获取所有用户密码
- 金融操作（钱包支付密码）使用明文比较

**建议**: 
1. 执行 `npm install bcrypt --save` 修复依赖
2. 取消 bcrypt mock 注释
3. 对现有明文密码需重新哈希

---

### 2. [HIGH] 硬编码短信验证码 `123456`

**位置**: `backend/src/routes/v1/auth.js` (历史遗留问题)

**问题**: 注册和登录接口的验证码固定为 `123456`，攻击者可用任意手机号+该验证码绕过认证。

**影响**: 账户劫持风险

**建议**: 集成真实短信服务（阿里云/腾讯云）并移除 mock 逻辑

---

### 3. [HIGH] SQL 注入风险 — 地理位置查询

**位置**: `backend/src/routes/v1/ui-themes.js:172-182`

**问题**: 原生 SQL 查询使用字符串拼接构建 WHERE 子句，虽使用 parameterized replacements，但 `whereClause` 构造逻辑复杂，难保证绝对安全。

```javascript
const query = `SELECT p.*, u.nickname as organizer_name, ...
   FROM parties p
   LEFT JOIN users u ON p.user_id = u.id
   WHERE ${whereClause}  // 动态构建
   ORDER BY ${distanceOrder} ...
```

**影响**: 潜在 SQL 注入

**建议**: 使用 Sequelize ORM 方法替代原生查询

---

### 4. [MEDIUM] SMTP 默认凭据暴露

**位置**: `backend/src/services/alertService.js:11-12`

```javascript
pass: process.env.SMTP_PASSWORD || 'your-password'
```

**问题**: 代码中包含占位符密码，如部署文档泄露可被利用

**建议**: 确保生产环境正确配置 `.env`，移除默认值

---

## 🟡 中等风险 (Medium Severity)

### 5. [MEDIUM] JWT Secret 依赖环境变量无 fallback

**位置**: `backend/src/services/webSocketService.js:24`

```javascript
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

**问题**: 如果 `JWT_SECRET` 未配置，`process.env.JWT_SECRET` 为 `undefined`，jwt.verify 会抛出难以调试的错误。

**建议**: 启动时校验必要环境变量，不存在则拒绝启动。

---

### 6. [MEDIUM] 敏感信息未从 API 响应中排除

**位置**: `backend/src/services/adminService.js:441`

```javascript
delete dataValues.password;
```

**问题**: 只有部分接口显式删除密码字段，其他接口可能遗漏。

**建议**: 在模型层全局配置 `attributes: { exclude: ['password'] }`

---

## 🟢 建议改进 (Recommendations)

| 项目 | 建议 |
|------|------|
| 密码强度 | 注册时强制密码复杂度要求 |
| 速率限制 | auth 接口缺少请求频率限制 |
| 日志脱敏 | 日志中可能打印敏感参数 |
| CORS | 检查跨域配置是否限制可信域名 |

---

## 总结

| 严重程度 | 数量 |
|----------|------|
| 🔴 Critical | 2 |
| 🟠 High | 2 |
| 🟡 Medium | 2 |
| 🟢 Info | 2 |

**最高优先级修复**:
1. 修复 bcrypt mock — 启用真实密码哈希
2. 移除硬编码验证码

---

*审查人: Hermes Agent*  
*生成时间: 2026-05-01 07:38*
