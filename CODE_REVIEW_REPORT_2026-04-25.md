# JujuApp 代码审查报告

**审查日期**: 2026-04-25  
**审查分支**: backup-auto-20260331-210742  
**审查范围**: 最近3次提交涉及的后端API、前端React Native代码  
**审查重点**: API安全性、错误处理、代码可维护性、性能优化

---

## 摘要

| 严重程度 | 数量 |
|---------|------|
| 🔴 HIGH (高) | 3 |
| 🟡 MEDIUM (中) | 7 |
| 🟢 LOW (低) | 5 |
| **总计** | **15** |

---

## 🔴 HIGH 严重问题

### 1. SQL注入风险 - 动态LIKE查询

- **文件**: `backend/src/controllers/appController.js` 第69-71行
- **问题**: `where[Op.or]` 使用模板字符串直接拼接用户输入的keyword到SQL查询中
  ```javascript
  where[Op.or] = [
    { title: { [Op.like]: `%${req.query.keyword}%` } },
    { content: { [Op.like]: `%${req.query.keyword}%` } }
  ]
  ```
- **风险**: 虽然Sequelize有一定防护，但长字符串或特殊字符仍可能导致性能问题或意外行为
- **修复建议**: 
  - 添加输入长度限制（如最大100字符）
  - 过滤特殊SQL字符
  - 使用Sequelize的bind参数

### 2. TicketController 缺少输入验证

- **文件**: `backend/src/controllers/ticketController.js` 第172-187行
- **问题**: `createTicket` 和 `updateTicket` 直接将 `req.body` 传入service，没有任何字段验证
  ```javascript
  async createTicket(req, res, next) {
    const ticket = await ticketService.createTicket(req.body); // 无验证
  }
  ```
- **风险**: 可能创建无效数据、注入恶意字段或导致数据库错误
- **修复建议**: 添加Joi或express-validator验证schema

### 3. batchUpdateStatus 权限验证逻辑缺陷

- **文件**: `backend/src/controllers/ticketTypeController.js` 第350-415行
- **问题**: 批量更新时只检查了第一个票种的权限，但更新的是所有传入的ids
  ```javascript
  const partyId = ticketTypes[0].party_id; // 只检查第一个
  if (party.user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }
  await TicketType.update({ status }, { where: { id: { [Op.in]: ids } } });
  ```
- **风险**: 如果传入不同聚会的票种ID，可能越权修改其他聚会的票种
- **修复建议**: 确保所有票种都属于同一聚会，或逐个验证权限

---

## 🟡 MEDIUM 中等问题

### 4. 测试Token硬编码风险

- **文件**: `backend/src/middleware/auth.js` 第12-17行
- **问题**: `isValidTestToken` 在test环境跳过JWT验证，如果NODE_ENV配置错误可能导致安全漏洞
- **修复建议**: 添加额外的环境安全检查，确保TEST_TOKENS只在严格测试环境使用

### 5. applyRefund 错误处理不一致

- **文件**: `backend/src/controllers/orderController.js` 第102-121行
- **问题**: 手动处理了部分错误返回401，但其他错误交给next(error)，导致错误响应格式不一致
- **修复建议**: 统一使用errorHandler处理所有错误，或在service层统一错误类型

### 6. 订单超时服务缺少错误恢复机制

- **文件**: `backend/src/services/orderTimeoutService.js` 第63-103行
- **问题**: `checkAndCancelTimeoutOrders` 捕获错误仅记录日志，失败订单不会被重试处理
- **修复建议**: 添加失败订单的重试队列或告警机制

### 7. TransactionManager 过度补偿SQLite兼容性问题

- **文件**: `backend/src/utils/transactionManager.js` 第22-88行
- **问题**: 大量代码用于兼容SQLite测试环境（mock connection等），可能影响生产环境性能且难以维护
- **修复建议**: 分离测试和生产的事务管理逻辑，或使用依赖注入

### 8. 支付回调处理代码重复

- **文件**: `backend/src/services/paymentService.js` 第168-235行
- **问题**: `handleWechatNotify` 和 `handleAlipayNotify` 有大量重复逻辑
- **修复建议**: 提取公共的支付完成处理函数

### 9. getTicketStats 多次查询数据库

- **文件**: `backend/src/services/ticketService.js` 第289-334行
- **问题**: 使用5次独立的count查询
- **修复建议**: 使用 `Sequelize.fn('COUNT', Sequelize.col('status'))` + group by status 一次查询

### 10. 超时订单查询缺少索引优化

- **文件**: `backend/src/services/orderTimeoutService.js` 第70-85行
- **问题**: 查询条件 `status=0 AND payment_status=0 AND created_at < timeoutTime`，大数据量时可能慢查询
- **修复建议**: 确保 `(status, payment_status, created_at)` 有复合索引

---

## 🟢 LOW 低等问题

### 11. TEST_MODE 标志硬编码

- **文件**: `JujuApp/App.tsx` 第11行
- **问题**: `TEST_MODE = false` 硬编码，但保留了测试模式逻辑
- **修复建议**: 使用环境变量控制，生产构建时移除测试代码

### 12. 兼容性路由内联定义导致代码膨胀

- **文件**: `backend/src/routes/v1/tickets.js` 第20-107行
- **问题**: 多个前端兼容性路由直接在routes文件中内联定义async handler
- **修复建议**: 将兼容性路由提取到单独的compat控制器中

### 13. 状态码魔术数字

- **文件**: `backend/src/controllers/ticketTypeController.js` 多处
- **问题**: 多处使用 `status: 0/1` 等魔术数字
- **修复建议**: 定义 `TICKET_STATUS = { ACTIVE: 1, INACTIVE: 0 }` 等常量

### 14. setInterval 清理机制

- **文件**: `backend/src/services/orderTimeoutService.js` 第42-45行
- **问题**: timer在进程异常退出时可能泄漏
- **修复建议**: 在 gracefulShutdown 中确保调用 `stop()`

### 15. 验证码倒计时内存泄漏风险

- **文件**: `JujuApp/src/screens/LoginScreen.tsx` 第460-490行
- **问题**: `setInterval` 组件卸载时可能未清理
- **修复建议**: 使用 `useEffect` 清理函数清除interval

---

## 改进建议总结

### 立即修复（HIGH）
1. 为 `appController.js` 的keyword查询添加输入验证和长度限制
2. 为 `ticketController.js` 的create/update添加Joi验证
3. 修复 `batchUpdateStatus` 的权限验证逻辑，确保所有票种权限都被检查

### 短期修复（MEDIUM）
4. 统一错误处理机制，移除controller中的手动错误返回
5. 重构 `TransactionManager`，分离测试和生产逻辑
6. 提取支付回调的公共处理函数
7. 优化 `getTicketStats` 为单次聚合查询
8. 添加订单超时服务的失败重试机制

### 长期优化（LOW）
9. 定义状态常量替代魔术数字
10. 重构兼容性路由到单独控制器
11. 使用环境变量替代硬编码的TEST_MODE
12. 确保所有setInterval/setTimeout有清理机制

---

## 安全合规检查

| 检查项 | 状态 | 说明 |
|--------|------|------|
| SQL注入防护 | ⚠️ 需改进 | appController存在风险 |
| 输入验证 | ⚠️ 需改进 | 部分controller缺少验证 |
| 权限检查 | ⚠️ 需改进 | batchUpdate有缺陷 |
| 错误处理 | ✅ 基本完善 | 统一errorHandler已存在 |
| 敏感信息日志 | ✅ 已处理 | logSanitizer已集成 |
| 速率限制 | ✅ 已配置 | express-rate-limit已启用 |
| Helmet安全头 | ✅ 已配置 | helmet中间件已启用 |
| CORS配置 | ✅ 已配置 | 环境变量控制 |

---

*报告生成时间: 2026-04-25 15:15*  
*审查Agent: juju-code-reviewer*
