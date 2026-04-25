# 后端 API Bug 修复记录

## 已修复的问题

### 1. 订单管理 API 500 错误 ✅

**问题**: 管理员获取订单列表时返回 500 错误
**原因**: `orderController.getOrderList` 传入了 `req.user.id`，限制了只能查看当前用户的订单
**修复文件**: 
- `src/controllers/orderController.js`
- `src/services/orderService.js`

**修改内容**:
```javascript
// orderController.js - 管理员获取所有订单
const result = await orderService.getOrderList(null, page, limit, filters);

// orderService.js - 支持 user_id 筛选
if (filters.user_id) {
  where.user_id = filters.user_id;
}
```

---

### 2. 用户封禁 API 参数错误 ✅

**问题**: 封禁用户时提示 `"reason" is not allowed`
**原因**: `userValidator.js` 的 `updateUserStatusSchema` 只允许 `status` 字段
**修复文件**: `src/validators/userValidator.js`

**修改内容**:
```javascript
const updateUserStatusSchema = Joi.object({
  status: Joi.number().valid(0, 1).required(),
  reason: Joi.string().max(500).optional()  // 添加可选的 reason 字段
});
```

---

### 3. 聚会取消 API 500 错误 ✅

**问题**: 取消聚会时返回 500 错误
**原因**: 
1. 控制器传递了 `reason` 参数，但服务方法没有接收
2. 权限检查不允许管理员取消其他用户的聚会
**修复文件**: `src/services/partyService.js`

**修改内容**:
```javascript
// 添加 reason 参数
async cancelParty(partyId, userId, reason) {
  // ...
  // 管理员可以取消任何聚会，普通用户只能取消自己的
  const { Admin } = require('../models');
  const admin = await Admin.findByPk(userId, { transaction: t });
  if (!admin && party.user_id !== userId) {
    throw new Error('Unauthorized');
  }
  // ...
}
```

---

### 4. Banner/公告 API 500 错误 (需要执行同步脚本) ⚠️

**问题**: Banner 创建和公告管理返回 500 错误
**原因**: 数据库表 `banners` 和 `announcements` 可能不存在
**解决方案**: 执行数据库同步脚本

**执行命令**:
```bash
cd d:\小程序项目\聚聚项目\backend
node scripts/sync-content-tables.js
```

**创建的文件**: `scripts/sync-content-tables.js`

---

## 修改的文件列表

1. `src/controllers/orderController.js` - 修复订单列表查询
2. `src/services/orderService.js` - 添加 user_id 筛选支持
3. `src/validators/userValidator.js` - 添加 reason 字段验证
4. `src/services/partyService.js` - 修复取消聚会逻辑
5. `scripts/sync-content-tables.js` - 同步内容管理表结构

---

## 待验证的功能

- [ ] 订单列表正常显示
- [ ] 封禁用户功能正常
- [ ] 取消聚会功能正常
- [ ] Banner 创建正常（执行同步脚本后）
- [ ] 公告管理正常（执行同步脚本后）

---

## 执行步骤

1. **重启后端服务** - 应用代码修改
2. **执行同步脚本** - 创建内容管理表
   ```bash
   node scripts/sync-content-tables.js
   ```
3. **重新测试** - 验证修复的功能
