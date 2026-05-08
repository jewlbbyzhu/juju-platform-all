# 聚聚 (JUJU) 项目 — 业务流程文档

> 版本: v1.0  
> 日期: 2026-05-04  
> 用途: 精准业务流程实现，基于后端代码实际逻辑  

---

## 1. 订单票务流程 ⭐核心

### 1.1 订单创建（createOrder）

**代码位置**: `backend/src/services/orderService.js:9-159`

```
1. 参数校验 → 2. 聚会校验 → 3. 用户校验 → 4. 库存校验 → 5. 创建订单
```

| 步骤 | 校验内容 | 失败处理 | 代码行 |
|------|---------|---------|--------|
| 1. 参数转换 | ticket_id+quantity → items数组 | 报错：订单商品不能为空 | L17-23 |
| 2. 聚会存在性 | Party.findByPk(party_id) | 报错：Party not found | L29-34 |
| 3. 聚会上架状态 | party.status === 1 | 报错：Party is not available | L36-38 |
| 4. 用户存在性 | User.findByPk(userId) | 报错：User not found | L40-45 |
| 5. 年龄限制 | calculateAge(birthday) vs min_age/max_age | 报错：年龄不符合要求 | L47-59 |
| 6. 性别限制 | gender_restriction vs user.gender | 报错：性别不符合要求 | L61-63 |
| 7. 重复参与 | 查订单表 user_id+party_id+status=1 | 报错：重复参与聚会 | L65-76 |
| 8. 票种校验 | TicketType.findOne(id+party_id+status=1) | 报错：Ticket type not found | L83-95 |
| 9. 库存校验 | available_count - sold_count >= quantity | 报错：Insufficient tickets | L97-99 |
| 10. 人数上限 | current_participants + quantity <= max_participants | 报错：聚会参与人数已达上限 | L122-127 |
| 11. 扣减库存 | TicketType.increment('sold_count') | 事务回滚 | L114-118 |
| 12. 创建订单 | Order.create() + OrderItem.create() | 事务回滚 | L130-151 |

**订单号生成规则**:
```javascript
`${ORDER_PREFIX.ORDER}${Date.now()}${Math.floor(Math.random() * 1000)}`
// 示例: ORD1714857600000123
```

### 1.2 订单支付（payOrder）

**代码位置**: `backend/src/services/orderService.js:732-803`

```
1. 订单存在性校验 → 2. 归属校验 → 3. 状态校验 → 4. 支付处理
```

| 支付方式 | 实现逻辑 | 代码位置 |
|---------|---------|---------|
| **钱包余额** | 校验余额→校验密码→扣减余额→记录流水→更新订单状态 | walletService.js:31-59 |
| **微信支付** | 创建Payment记录→调微信API→等待回调→更新状态 | paymentService.js:13-56 |
| **支付宝** | 创建Payment记录→调支付宝API→等待回调→更新状态 | paymentService.js:83-106 |

**钱包支付详细流程**:
1. 查询钱包：`Wallet.findOne({user_id})`
2. 余额校验：`wallet.balance >= order.final_amount`
3. 密码校验：`wallet.verifyPassword(paymentPassword)`（bcrypt比对）
4. 扣减余额：`Wallet.update({balance: balance - amount})`
5. 创建流水：`WalletTransaction.create({type: 'payment', amount, balance_after})`
6. 更新订单：`updatePaymentStatus(orderId, 1)`

### 1.3 订单状态机

| 状态码 | 含义 | 触发条件 |
|--------|------|---------|
| 0 | 待支付 | 创建订单后 |
| 1 | 已支付 | 支付成功后 |
| 2 | 已出票 | 支付后自动生成Ticket |
| 3 | 已取消 | 用户取消/超时取消 |
| 4 | 退款中 | 申请退款后 |
| 5 | 已退款 | 退款完成后 |

**超时取消规则**:
- 创建订单后15分钟未支付自动取消
- 由定时任务扫描（orderTimeoutService）
- 取消后释放库存：`TicketType.decrement('sold_count')`

### 1.4 电子票生成

**代码位置**: `backend/src/services/orderService.js:503-559`

```
1. 订单状态=已支付 → 2. 按OrderItem生成Ticket → 3. 每张票唯一ticket_no
```

**票号生成规则**:
```javascript
`${ORDER_PREFIX.TICKET}${Date.now()}${Math.floor(Math.random() * 10000)}`
// 示例: TKT17148576000001234
```

**票状态**:
| 状态码 | 含义 |
|--------|------|
| 0 | 未使用 |
| 1 | 已使用（已核销） |
| 2 | 已转赠 |
| 3 | 已过期 |

---

## 2. 钱包金融流程 ⭐核心

### 2.1 钱包模型（Wallet）

| 字段 | 类型 | 说明 |
|------|------|------|
| user_id | BIGINT | 关联用户 |
| balance | DECIMAL(10,2) | 可用余额 |
| frozen_balance | DECIMAL(10,2) | 冻结余额（提现中） |
| total_income | DECIMAL(10,2) | 累计收入 |
| total_expense | DECIMAL(10,2) | 累计支出 |
| password | VARCHAR(255) | 支付密码（bcrypt加密） |
| status | TINYINT | 1正常/0冻结 |

### 2.2 充值流程

**代码位置**: `backend/src/services/walletService.js:31-59`

```
1. 参数校验(amount>0) → 2. 增加余额 → 3. 增加累计收入 → 4. 创建流水记录
```

**流水记录（WalletTransaction）**:
| 字段 | 说明 |
|------|------|
| type | recharge/withdraw/payment/refund |
| amount | 变动金额（正数收入/负数支出） |
| balance | 变动后余额 |
| related_order_id | 关联订单ID |
| description | 描述 |
| status | 1成功/0失败 |

### 2.3 提现流程

**代码位置**: `backend/src/services/walletService.js:62-150`

```
1. 查询钱包（加锁）→ 2. 余额校验 → 3. 密码校验 → 4. 限额校验 → 5. 频次校验 → 6. 扣减余额 → 7. 创建流水 → 8. 发起提现
```

**限额规则**:
| 规则 | 值 | 配置位置 |
|------|-----|---------|
| 单笔最低 | ¥1 | WALLET_CONSTANTS.MIN_WITHDRAWAL_AMOUNT |
| 单笔最高 | ¥10,000 | WALLET_CONSTANTS.MAX_WITHDRAWAL_AMOUNT |
| 每日次数 | 3次 | 代码硬编码 |
| 每日总额 | ¥50,000 | 代码硬编码 |

### 2.4 支付密码

- 独立设置，与登录密码分离
- bcrypt加密存储
- 6位数字
- 忘记密码需短信验证重置

---

## 3. VIP会员流程 ⭐核心

### 3.1 VIP套餐定义（代码硬编码）

| 套餐 | 价格 | 时长 | 免费聚会数 | 结算费率 | 佣金费率 | 审核优先级 | 推荐权重 |
|------|------|------|-----------|---------|---------|-----------|---------|
| 月卡 | ¥88 | 30天 | 2场 | 97% | 3% | 2 | 1.2 |
| 季卡 | ¥188 | 90天 | 3场 | 98% | 2% | 1 | 1.8 |
| 年卡 | ¥888 | 365天 | 无限(-1) | 98% | 2% | 1 | 2.5 |

**代码位置**: `vipService.js:6-43`

### 3.2 VIP权益实现

| 权益 | 实现方式 |
|------|---------|
| 购票折扣 | 订单计算时检查is_vip，应用discount_rate |
| 优先报名 | 聚会报名队列中VIP用户排在前面 |
| 专属客服 | 聊天路由优先分配给VIP客服 |
| 免费取消 | 取消订单时不扣手续费 |
| 积分加成 | 积分计算时乘以bonus_rate |

### 3.3 VIP订阅流程

```
1. 选择套餐 → 2. 创建VIPMembership记录 → 3. 支付 → 4. 更新用户is_vip=true
```

**VIPMembership表**:
| 字段 | 说明 |
|------|------|
| user_id | 用户ID |
| membership_type | monthly/quarterly/yearly |
| start_date | 开始时间 |
| end_date | 结束时间（start_date + duration） |
| status | 1有效/0过期/2取消 |
| payment_id | 关联支付记录 |

**过期检查**:
- 登录时检查：`end_date > NOW()`
- 定时任务扫描过期会员
- 过期后 `is_vip=false`，但保留历史记录

---

## 4. 退款售后流程

### 4.1 退款申请流程

**代码位置**: `refundService.js:128-238`

```
1. 用户申请 → 2. 平台审核 → 3. 审核通过 → 4. 执行退款
```

| 步骤 | 校验 | 处理 |
|------|------|------|
| 1. 订单存在性 | Order.findByPk | 报错：订单不存在 |
| 2. 订单状态 | status=1(已支付)或2(已出票) | 报错：订单不可退款 |
| 3. 退款时限 | 活动开始前24小时 | 报错：超过退款时限 |
| 4. 创建退款单 | Refund.create | 状态=0(待审核) |
| 5. 平台审核 | 管理员操作 | 状态=1(审核通过)或2(拒绝) |
| 6. 执行退款 | 原路退回/钱包退回 | 状态=2(退款完成) |

### 4.2 退款规则

| 场景 | 退款比例 | 到账方式 | 到账时间 |
|------|---------|---------|---------|
| 活动前≥24小时取消 | 100% | 原路返回 | 3-7工作日 |
| 活动前2-24小时取消 | 80%（扣20%手续费） | 原路返回 | 3-7工作日 |
| 活动前<2小时取消 | 50% | 原路返回 | 3-7工作日 |
| 活动开始后 | 0%（不支持） | - | - |
| 平台取消活动 | 100% + 补偿券 | 钱包即时到账 | 即时 |

**手续费计算**:
```javascript
const feeRate = hoursBeforeStart >= 24 ? 0 : (hoursBeforeStart >= 2 ? 0.2 : 0.5);
const refundAmount = order.final_amount * (1 - feeRate);
```

### 4.3 退款方式

| 原支付方式 | 退款路径 |
|-----------|---------|
| 微信支付 | 调用微信退款API，原路退回微信零钱/银行卡 |
| 支付宝 | 调用支付宝退款API，原路退回支付宝余额/银行卡 |
| 钱包余额 | 直接增加钱包余额，创建退款流水 |
| 组合支付 | 按比例退回各渠道 |

---

## 5. 用户认证流程

### 5.1 注册/登录

| 功能 | 实现细节 |
|------|---------|
| 手机注册/登录 | 验证码登录，手机号唯一，支持换绑 |
| 微信登录 | OAuth2.0，获取openid绑定用户 |
| 实名认证 | 身份证+人脸识别，信息加密存储 |
| 用户资料 | 头像/昵称/性别/生日，生日用于年龄校验 |
| 权限系统 | user/organizer/admin 三级角色 |

**关键规则**:
- 手机号唯一索引，换绑需验证旧手机号
- 实名信息AES加密，仅用于年龄/性别校验
- 年龄计算：`当前年份 - 出生年份`（未过生日减1）
- 性别限制：聚会可设置 gender_restriction，与user.gender比对

---

## 6. 聚会管理流程

| 功能 | 实现细节 |
|------|---------|
| 聚会发布 | 组织者创建，需实名认证 |
| 聚会审核 | status字段控制：0待审核/1已通过/2已拒绝 |
| 分类标签 | PartyCategory表 + PartyTag表 |
| 搜索筛选 | 城市/时间/分类/价格区间 |
| 库存管理 | TicketType.available_count - sold_count |

**关键规则**:
- 发布者必须实名认证（is_real_name_verified）
- 审核通过后才能上架（status=1）
- 聚会可设置年龄限制（min_age/max_age）
- 聚会可设置性别限制（gender_restriction）
- 聚会可设置最大参与人数（max_participants）

---

## 附录：支付配置状态

### 微信支付

| 配置项 | 状态 | 值 |
|--------|------|-----|
| APPID | ✅ | wx30d2dc92fd6e3145 |
| 商户号 | ✅ | 1732803274 |
| API V3 Key | ✅ | 已配置 |
| 证书 | ✅ | cert/apiclient_cert.pem |
| 私钥 | ✅ | cert/apiclient_key.pem |

### 支付宝

| 配置项 | 状态 | 说明 |
|--------|------|------|
| APPID | ✅ | 2021006131688595 |
| 私钥 | ⚠️ | 未配置（生产环境需配置） |
| 公钥 | ⚠️ | 未配置（生产环境需配置） |

**注意**: 当前支付宝使用占位SDK，开发环境可正常运行，生产环境需配置密钥。

---

> **维护者**: Hermes (扎克)  
> **更新规则**: 业务逻辑变更时更新  
> **审核周期**: 每周审查与实际代码一致性
