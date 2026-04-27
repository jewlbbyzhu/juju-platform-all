# JUJU App 后端API联调测试报告

**测试时间**: 2026-04-21
**版本**: v1.0.5
**测试人**: 自动化测试

---

## 📊 API连通性测试结果

| 端点 | 状态码 | 状态 | 说明 |
|------|--------|------|------|
| GET /api/v1/parties | 200 | ✅ 正常 | 聚会列表接口可用 |
| POST /api/v1/auth/login | 404 | ❌ 不存在 | 可能需要/auth/login或其他路径 |
| GET /api/v1/users/profile | 401 | ⚠️ 需认证 | 需要登录token |

---

## ✅ 已完成的API配置

### 1. 基础配置
- ✅ API基础URL: `https://api.hfparty.asia/api/v1`
- ✅ WebSocket: `wss://api.hfparty.asia`
- ✅ HTTPS安全连接

### 2. 支付API
- ✅ 获取支付方式: `GET /payments/methods`
- ✅ 创建支付: `POST /payments`
- ✅ 查询支付: `GET /payments/:id`
- ✅ 订单支付: `POST /orders/:id/pay`
- ✅ 查询支付状态: `GET /orders/:id/payment-status`

### 3. 钱包API
- ✅ 获取钱包信息: `GET /wallet/my`
- ✅ 充值: `POST /wallet/recharge`
- ✅ 提现: `POST /wallet/withdraw`
- ✅ 交易记录: `GET /wallet/my/transactions`
- ✅ 设置密码: `POST /wallet/password`
- ✅ 转账: `POST /wallet/transfer`

### 4. 退款API
- ✅ 申请退款: `POST /orders/:id/refund`
- ✅ 退款列表: `GET /refunds`
- ✅ 退款详情: `GET /refunds/:id`
- ✅ 取消退款: `POST /refunds/:id/cancel`

---

## 🔧 待解决问题

### 1. 后端联调
- [ ] 关闭OFFLINE_MODE，连接真实后端
- [ ] 确认登录接口路径（可能是/auth/login或/api/v1/auth/login）
- [ ] 获取有效的测试token
- [ ] 测试完整的用户注册/登录流程

### 2. 支付沙箱测试
- [ ] 配置支付宝沙箱环境
- [ ] 配置微信支付测试环境
- [ ] 测试支付流程（创建订单→支付→回调）
- [ ] 测试退款流程

### 3. 功能验证
- [ ] 首页聚会列表（真实数据）
- [ ] 聚会详情页
- [ ] 购票流程
- [ ] 订单管理
- [ ] 个人中心
- [ ] 钱包功能

---

## 🎯 下一步行动

### 立即执行
1. 修改 `src/api/index.ts` 设置 `OFFLINE_MODE = false`
2. 测试登录接口，获取真实token
3. 验证核心功能流程

### 本周完成
1. 支付沙箱环境配置
2. 支付宝/微信支付测试
3. 端到端测试（注册→登录→购票→支付→查看订单）

---

**状态**: 🟡 后端API部分可用，需进一步联调
