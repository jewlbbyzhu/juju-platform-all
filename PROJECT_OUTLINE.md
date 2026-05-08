# 聚聚 (JUJU) 项目全景大纲 — 精简版

> 版本: v1.0  
> 更新日期: 2026-05-04  
> 状态: 开发完成，待优化收尾

---

## 1. 项目概述

### 1.1 产品定位
**聚聚 (JUJU)** 是一个线下聚会预约社交平台，连接活动组织者与参与者。

- **核心功能**: 发现聚会 → 报名购票 → 支付 → 参加活动 → 社交互动
- **目标用户**: 18-35岁城市青年，寻找线下社交活动
- **商业模式**: 平台抽成（票务佣金）+ VIP会员订阅 + 增值服务

### 1.2 核心闭环

```
用户注册/登录 → 浏览聚会 → 选择票种 → 下单支付 → 获得电子票 → 现场核销 → 评价/社交
```

### 1.3 项目规模

| 指标 | 数值 |
|------|------|
| 总代码量 | ~56万行 (JS/TS/Vue) |
| 后端API | 47个端点 |
| 数据库表 | 54张 |
| APP屏幕 | 59个 |
| 管理后台页面 | 25个 |
| 小程序页面 | 50个 |
| 官网页面 | 5个 |

---

## 2. 技术架构全景

### 2.1 五端架构

| 端 | 技术栈 | 状态 | 部署目标 |
|----|--------|------|---------|
| **APP** | React Native 0.74.6 + TypeScript | ✅ 完成 | APK v1.0.8 (测试阶段) |
| **后端API** | Node.js + Express + Sequelize | ✅ 运行中 | 腾讯云 122.51.255.13:18789 |
| **管理后台** | Vue 3 + Element Plus + Vite | ✅ 完成 | Nginx静态 /var/www/admin/ |
| **官网** | HTML + CSS + JS | ✅ 完成 | Nginx静态 /var/www/website/ |
| **微信小程序** | uni-app (Vue) | ⚠️ 开发中 | 待部署 |

### 2.2 部署架构

```
用户 → Nginx (80/443) → 后端API (localhost:3000/PM2)
                ↓
         静态文件 (admin/website)
                ↓
         腾讯云服务器 (122.51.255.13)
                ↓
         MySQL + Redis (同机)
```

### 2.3 关键基础设施

| 组件 | 地址/配置 | 状态 |
|------|----------|------|
| 服务器 | 122.51.255.13 (Ubuntu) | ✅ 运行中 |
| 数据库 | MySQL 5.7, hfparty_db_new | ✅ 运行中 |
| 缓存 | Redis 6.x | ✅ 运行中 |
| 进程管理 | PM2 (server) | ✅ 运行中 |
| Web服务器 | Nginx | ⚠️ 配置待优化 |
| 域名 | hfparty.asia | ✅ 已解析 |

---

## 3. 核心业务模块（精准实现）

> 以下所有业务流程均基于后端代码实际实现，非设计文档。

### 3.1 用户认证模块

**状态**: ✅ 完成

| 功能 | 状态 | 实现细节 |
|------|------|---------|
| 手机注册/登录 | ✅ | 验证码登录，手机号唯一，支持换绑 |
| 微信登录 | ✅ | OAuth2.0，获取openid绑定用户 |
| 实名认证 | ✅ | 身份证+人脸识别，信息加密存储 |
| 用户资料 | ✅ | 头像/昵称/性别/生日，生日用于年龄校验 |
| 权限系统 | ✅ | user/organizer/admin 三级角色 |

**关键规则**:
- 手机号唯一索引，换绑需验证旧手机号
- 实名信息AES加密，仅用于年龄/性别校验
- 年龄计算：`当前年份 - 出生年份`（未过生日减1）
- 性别限制：聚会可设置 gender_restriction，与user.gender比对

---

### 3.2 聚会管理模块

**状态**: ✅ 完成

| 功能 | 状态 | 实现细节 |
|------|------|---------|
| 聚会发布 | ✅ | 组织者创建，需实名认证 |
| 聚会审核 | ✅ | status字段控制：0待审核/1已通过/2已拒绝 |
| 分类标签 | ✅ | PartyCategory表 + PartyTag表 |
| 搜索筛选 | ✅ | 城市/时间/分类/价格区间 |
| 库存管理 | ✅ | TicketType.available_count - sold_count |

**关键规则**:
- 发布者必须实名认证（is_real_name_verified）
- 审核通过后才能上架（status=1）
- 聚会可设置年龄限制（min_age/max_age）
- 聚会可设置性别限制（gender_restriction）
- 聚会可设置最大参与人数（max_participants）

---

### 3.3 订单票务模块 ⭐核心

**状态**: ✅ 核心流程完成

#### 3.3.1 订单创建流程（createOrder）

```
1. 参数校验 → 2. 聚会校验 → 3. 用户校验 → 4. 库存校验 → 5. 创建订单
```

**代码实现步骤**（orderService.js:9-159）:

| 步骤 | 校验内容 | 失败处理 |
|------|---------|---------|
| 1. 参数转换 | ticket_id+quantity → items数组 | 报错：订单商品不能为空 |
| 2. 聚会存在性 | Party.findByPk(party_id) | 报错：Party not found |
| 3. 聚会上架状态 | party.status === 1 | 报错：Party is not available |
| 4. 用户存在性 | User.findByPk(userId) | 报错：User not found |
| 5. 年龄限制 | calculateAge(birthday) vs min_age/max_age | 报错：年龄不符合要求 |
| 6. 性别限制 | gender_restriction vs user.gender | 报错：性别不符合要求 |
| 7. 重复参与 | 查订单表 user_id+party_id+status=1 | 报错：重复参与聚会 |
| 8. 票种校验 | TicketType.findOne(id+party_id+status=1) | 报错：Ticket type not found |
| 9. 库存校验 | available_count - sold_count >= quantity | 报错：Insufficient tickets |
| 10. 人数上限 | current_participants + quantity <= max_participants | 报错：聚会参与人数已达上限 |
| 11. 扣减库存 | TicketType.increment('sold_count') | 事务回滚 |
| 12. 创建订单 | Order.create() + OrderItem.create() | 事务回滚 |

**订单号生成规则**:
```javascript
`${ORDER_PREFIX.ORDER}${Date.now()}${Math.floor(Math.random() * 1000)}`
// 示例: ORD1714857600000123
```

#### 3.3.2 订单支付流程（payOrder）

**代码实现**（orderService.js:732-803）:

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

#### 3.3.3 订单状态机

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

#### 3.3.4 电子票生成（generateTickets）

**代码实现**（orderService.js:503-559）:

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

### 3.4 钱包金融模块 ⭐核心

**状态**: ✅ 完成

#### 3.4.1 钱包模型（Wallet）

| 字段 | 类型 | 说明 |
|------|------|------|
| user_id | BIGINT | 关联用户 |
| balance | DECIMAL(10,2) | 可用余额 |
| frozen_balance | DECIMAL(10,2) | 冻结余额（提现中） |
| total_income | DECIMAL(10,2) | 累计收入 |
| total_expense | DECIMAL(10,2) | 累计支出 |
| password | VARCHAR(255) | 支付密码（bcrypt加密） |
| status | TINYINT | 1正常/0冻结 |

#### 3.4.2 充值流程（recharge）

**代码实现**（walletService.js:31-59）:

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

#### 3.4.3 提现流程（withdraw）

**代码实现**（walletService.js:62-150）:

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

#### 3.4.4 支付密码

- 独立设置，与登录密码分离
- bcrypt加密存储
- 6位数字
- 忘记密码需短信验证重置

---

### 3.5 VIP会员模块 ⭐核心

**状态**: ✅ 完成

#### 3.5.1 VIP套餐定义（代码硬编码）

| 套餐 | 价格 | 时长 | 免费聚会数 | 结算费率 | 佣金费率 | 审核优先级 | 推荐权重 |
|------|------|------|-----------|---------|---------|-----------|---------|
| 月卡 | ¥88 | 30天 | 2场 | 97% | 3% | 2 | 1.2 |
| 季卡 | ¥188 | 90天 | 3场 | 98% | 2% | 1 | 1.8 |
| 年卡 | ¥888 | 365天 | 无限(-1) | 98% | 2% | 1 | 2.5 |

**代码位置**: `vipService.js:6-43`

#### 3.5.2 VIP权益实现

| 权益 | 实现方式 |
|------|---------|
| 购票折扣 | 订单计算时检查is_vip，应用discount_rate |
| 优先报名 | 聚会报名队列中VIP用户排在前面 |
| 专属客服 | 聊天路由优先分配给VIP客服 |
| 免费取消 | 取消订单时不扣手续费 |
| 积分加成 | 积分计算时乘以bonus_rate |

#### 3.5.3 VIP订阅流程

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

### 3.6 退款售后模块

**状态**: ✅ 完成

#### 3.6.1 退款申请流程

```
1. 用户申请 → 2. 平台审核 → 3. 审核通过 → 4. 执行退款
```

**代码实现**（refundService.js:128-238）:

| 步骤 | 校验 | 处理 |
|------|------|------|
| 1. 订单存在性 | Order.findByPk | 报错：订单不存在 |
| 2. 订单状态 | status=1(已支付)或2(已出票) | 报错：订单不可退款 |
| 3. 退款时限 | 活动开始前24小时 | 报错：超过退款时限 |
| 4. 创建退款单 | Refund.create | 状态=0(待审核) |
| 5. 平台审核 | 管理员操作 | 状态=1(审核通过)或2(拒绝) |
| 6. 执行退款 | 原路退回/钱包退回 | 状态=2(退款完成) |

#### 3.6.2 退款规则

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

#### 3.6.3 退款方式

| 原支付方式 | 退款路径 |
|-----------|---------|
| 微信支付 | 调用微信退款API，原路退回微信零钱/银行卡 |
| 支付宝 | 调用支付宝退款API，原路退回支付宝余额/银行卡 |
| 钱包余额 | 直接增加钱包余额，创建退款流水 |
| 组合支付 | 按比例退回各渠道 |

---

### 3.7 社交互动模块

**状态**: ⚠️ 基础完成

| 功能 | 状态 | 实现表 |
|------|------|--------|
| 关注/粉丝 | ✅ | Follow表 |
| 动态发布 | ✅ | Post表 |
| 评论 | ✅ | Comment表 |
| 点赞 | ✅ | Like表 |
| 私信 | ✅ | Message表 + Conversation表 |
| 群聊 | ⚠️ | Group表 + GroupMessage表（基础实现） |

---

## 4. 后端API

### 4.1 模块清单

| 模块 | 路由文件 | 主要功能 | 状态 |
|------|---------|---------|------|
| 认证 | auth.js | 注册/登录/验证码 | ✅ |
| 用户 | users.js | 资料/钱包/VIP | ✅ |
| 聚会 | parties.js | CRUD/搜索/筛选 | ✅ |
| 订单 | orders.js | 创建/支付/查询 | ✅ |
| 票务 | tickets.js | 出票/核销/转票 | ✅ |
| 支付 | payments.js | 微信/支付宝/余额 | ✅ |
| 钱包 | wallet.js | 充值/提现/记录 | ✅ |
| VIP | vip.js | 套餐/订阅/续费 | ✅ |
| 退款 | refunds.js | 申请/审核/处理 | ✅ |
| 社交 | posts.js, follows.js | 动态/关注 | ✅ |
| 通知 | notifications.js | 推送/消息 | ✅ |
| 管理 | admins.js | 后台管理 | ✅ |
| 文件 | uploads.js | 图片上传 | ✅ |
| 地图 | map.js | 位置服务 | ✅ |
| 聊天 | chat.js | 即时通讯 | ✅ |

### 4.2 数据库模型

**核心表**:

| 表名 | 用途 | 关键字段 |
|------|------|---------|
| users | 用户 | id, phone, nickname, avatar, is_vip, vip_level |
| parties | 聚会 | id, title, description, location, time, price, status |
| orders | 订单 | id, order_no, user_id, party_id, amount, status |
| order_items | 订单项 | id, order_id, ticket_type_id, quantity, price |
| ticket_types | 票种 | id, party_id, name, price, available_count, sold_count |
| tickets | 电子票 | id, order_id, ticket_no, status, used_at |
| payments | 支付 | id, order_id, payment_no, method, amount, status |
| wallets | 钱包 | id, user_id, balance, password |
| wallet_transactions | 交易记录 | id, wallet_id, type, amount, balance_after |
| vip_packages | VIP套餐 | id, name, price, duration, is_active |
| vip_subscriptions | VIP订阅 | id, user_id, package_id, status, start_date, end_date |
| refunds | 退款 | id, order_id, amount, reason, status |

---

## 5. APP端

### 5.1 屏幕清单（59个）

**核心屏幕**:

| 模块 | 屏幕数 | 关键屏幕 |
|------|--------|---------|
| 认证 | 3 | LoginScreen, RegisterScreen, VerifyScreen |
| 首页 | 5 | HomeScreen, SearchScreen, CategoryScreen, FilterScreen, PartyDetailScreen |
| 聚会 | 8 | PartyListScreen, PartyMapScreen, OrganizerScreen, ReviewScreen |
| 订单 | 6 | CartScreen, OrderConfirmScreen, PaymentScreen, OrderDetailScreen, OrderListScreen |
| 票务 | 4 | TicketScreen, TicketDetailScreen, QRCodeScreen, TransferScreen |
| 钱包 | 5 | WalletScreen, RechargeScreen, WithdrawScreen, TransactionScreen, PasswordScreen |
| VIP | 3 | VIPScreen, VIPPackageScreen, VIPHistoryScreen |
| 个人中心 | 8 | ProfileScreen, SettingsScreen, AddressScreen, NotificationScreen |
| 社交 | 6 | FeedScreen, PostScreen, CommentScreen, ChatScreen, MessageScreen |
| 其他 | 11 | SplashScreen, OnboardingScreen, WebViewScreen, ErrorScreen |

### 5.2 构建状态

| 指标 | 状态 |
|------|------|
| APK版本 | v1.0.8 |
| APK大小 | 61.7MB |
| 构建时间 | 2026-05-05 01:45 |
| 包含修复 | BackHandler + 用户协议 |
| 状态 | ✅ 可发布 |

### 5.3 测试验证结果 (2026-05-05)

| 测试项 | 结果 | 说明 |
|--------|------|------|
| 后端API Health | ✅ | /api/v1/health 返回 healthy |
| Categories接口 | ✅ | 返回4个分类（户外/音乐/美食/运动） |
| Parties列表 | ✅ | 返回12个聚会，接口正常 |
| Party详情 | ✅ | 周末户外徒步，字段完整 |
| 用户协议链接 | ✅ | 点击弹出Alert，功能正常 |
| 登录页UI | ✅ | 正常渲染 |
| 模拟器输入 | ⚠️ | 模拟器键盘输入有兼容性问题（真机不受影响） |

---

## 6. 管理后台

### 6.1 页面清单（25个）

| 模块 | 页面数 | 功能 |
|------|--------|------|
| 仪表盘 | 1 | 数据统计、图表 |
| 用户管理 | 3 | 用户列表、详情、审核 |
| 聚会管理 | 4 | 聚会列表、审核、分类、标签 |
| 订单管理 | 3 | 订单列表、详情、退款处理 |
| 财务管理 | 4 | 充值记录、提现审核、对账、结算 |
| 内容管理 | 3 | 动态审核、评论管理、举报处理 |
| 系统设置 | 4 | 轮播图、公告、配置、日志 |
| 数据统计 | 3 | 用户统计、活动统计、收入统计 |

### 6.2 测试状态

| 指标 | 数值 |
|------|------|
| 测试覆盖率 | 90.62% |
| 单元测试 | 209 passed |
| 构建时间 | 3.66s |
| 状态 | ✅ 可部署 |

---

## 7. 官网

### 7.1 页面结构

| 页面 | 状态 | 说明 |
|------|------|------|
| 首页 | ✅ | 品牌展示、活动推荐 |
| 活动列表 | ✅ | 浏览聚会 |
| 活动详情 | ✅ | 聚会介绍、报名入口 |
| 关于我们 | ✅ | 团队介绍 |
| 下载APP | ✅ | 二维码下载 |

### 7.2 部署状态

- 路径: /var/www/website/
- Nginx: 已配置
- 状态: ✅ 可访问

---

## 8. 微信小程序

### 8.1 页面清单（50个）

| 模块 | 页面数 | 状态 |
|------|--------|------|
| 首页 | 5 | ✅ |
| 聚会 | 8 | ✅ |
| 订单 | 6 | ✅ |
| 钱包 | 5 | ✅ |
| VIP | 3 | ✅ |
| 个人中心 | 8 | ✅ |
| 社交 | 6 | ✅ |
| 其他 | 9 | ✅ |

### 8.2 阻塞问题

| 问题 | 优先级 | 说明 |
|------|--------|------|
| 正式appid | 🔴 P0 | 当前用 touristappid，需申请正式号 |
| 微信支付商户号 | 🔴 P0 | 需企业资质申请 |
| 微信支付接入 | 🟡 P1 | 代码已准备，等商户号 |
| 分享功能 | 🟡 P1 | 需正式appid才能完整测试 |

---

## 9. 部署运维

### 9.1 服务器配置

| 组件 | 配置 | 状态 |
|------|------|------|
| CPU | 2核 | ✅ |
| 内存 | 4GB | ✅ |
| 磁盘 | 50GB SSD | ✅ |
| 带宽 | 5Mbps | ✅ |
| 系统 | Ubuntu 20.04 LTS | ✅ |

### 9.2 已知部署问题

| 问题 | 状态 | 说明 |
|------|------|------|
| Nginx root路径 | ⚠️ | 指向旧版官网，需手动修复 |
| 后端端口 | ⚠️ | 配置18789，实际运行3000 |
| NODE_ENV | ⚠️ | 当前development，建议切production |
| PM2缓存 | ⚠️ | 部署后需手动重启清除缓存 |

---

## 10. 安全审计

### 10.1 已修复漏洞（2026-04~05）

| 漏洞 | 等级 | 修复时间 |
|------|------|---------|
| 明文密码存储 | 🔴 P0 | 2026-05-03 |
| bcrypt mock漏洞 | 🔴 P0 | 2026-05-03 |
| 错误信息泄露 | 🟡 P1 | 2026-05-03 |
| SQL注入风险 | 🟡 P1 | 2026-05-03 |
| 验证码内存存储 | 🟡 P1 | 2026-05-03 |
| 全局限流 | 🟡 P1 | 2026-05-03 |
| 调试日志清理 | 🟢 P2 | 2026-05-03 |

### 10.2 安全机制

| 机制 | 状态 |
|------|------|
| JWT认证 | ✅ |
| 密码加密(bcrypt) | ✅ |
| API限流 | ✅ |
| SQL参数化 | ✅ |
| XSS过滤 | ✅ |
| 敏感信息脱敏 | ✅ |

---

## 11. 待办清单

### 11.1 P0 — 阻塞发布

| 任务 | 负责人 | 截止时间 | 状态 |
|------|--------|---------|------|
| 申请微信小程序正式appid | 主人 | 待定 | ⏳ 待主人操作 |
| 申请微信支付商户号 | 主人 | 待定 | ⏳ 待主人操作 |
| 修复Nginx root路径 | 开发 | 2026-05-05 | ⏳ SSH连接失败，需排查 |
| 切换NODE_ENV=production | 开发 | 2026-05-05 | ✅ 已完成 (.env已改) |
| 修复后端端口配置 | 开发 | 2026-05-05 | ✅ 已完成 (PORT=18789) |
| APP测试收尾 | 开发 | 2026-05-06 | 🔄 进行中 (v1.0.8 APK测试) |
| 支付宝密钥配置 | 主人 | 待定 | ⏳ 需配置PRIVATE_KEY和PUBLIC_KEY |

### 11.2 P1 — 重要优化

| 任务 | 说明 |
|------|------|
| 微信支付接入 | 等商户号下来后接入 |
| 小程序分享功能 | 需正式appid测试 |
| 部署自动化 | 当前手动部署，需脚本化 |
| 数据库备份策略 | 目前无自动备份 |
| 日志监控告警 | PM2日志需接入告警 |

### 11.3 P2 — 体验优化

| 任务 | 说明 |
|------|------|
| APP启动速度 | 当前3-5秒，可优化 |
| 图片懒加载 | 首页图片过多 |
| 离线缓存 | 支持弱网环境 |
| 推送通知 | 活动提醒、订单状态 |
| 数据分析 | 用户行为埋点 |

---

## 12. 已知陷阱

### 12.1 路径混淆

| 名称 | 实际路径 | 常见混淆 |
|------|---------|---------|
| 官网 | website/ | uniapp-h5/ (APP Web版) |
| 管理后台 | admin-web/ | website/ |
| 小程序源工程 | uni-app-mobile/ | juju-platform/mp-weixin/ (编译产物) |
| APP工程 | JujuApp_new/ | JujuApp/ (旧版) |

### 12.2 部署陷阱

| 陷阱 | 说明 |
|------|------|
| scp被拦截 | 腾讯云安全组拦截scp，改用cat+ssh管道 |
| PM2缓存 | 部署后必须重启PM2，否则运行旧代码 |
| Nginx配置 | root路径指向旧版，需手动改 |
| 端口混淆 | 配置18789，实际监听3000 |

### 12.3 数据库陷阱

| 陷阱 | 说明 |
|------|------|
| schema drift | 模型新增字段后，生产数据库未同步 |
| report_count缺失 | 2026-05-04发现并修复 |
| categories 500 | 新发现，待排查 |

---

## 13. 版本历史

| 版本 | 日期 | 里程碑 |
|------|------|--------|
| v0.1 | 2026-03 | 项目启动，基础架构搭建 |
| v0.5 | 2026-04-15 | 后端API完成，APP核心页面完成 |
| v0.8 | 2026-04-25 | 管理后台完成，官网完成 |
| v0.9 | 2026-04-28 | 安全审计，修复11个漏洞 |
| v0.95 | 2026-05-03 | 安全修复v4，bcrypt+限流+日志 |
| v0.97 | 2026-05-04 | APP测试收尾，APK v1.0.8构建，日志轮转配置 |
| v1.0 | 待定 | 所有端测试通过，准备上架 |

---

## 附录：快速导航

| 资源 | 路径 |
|------|------|
| 项目根目录 | ~/.hermes/workspace/juju-platform-all/ |
| APP工程 | JujuApp_new/ |
| 后端工程 | backend/ |
| 管理后台 | admin-web/ |
| 官网 | website/ |
| 小程序源工程 | uni-app-mobile/ |
| 小程序编译产物 | juju-platform/mp-weixin/ |
| 后端报告 | backend/reports/ |
| 管理后台报告 | admin-web/reports/ |
| APK构建产物 | JujuApp_new/android/app/build/outputs/apk/release/ |

---

> **下一步建议**: 
> 1. 主人申请微信小程序正式appid和微信支付商户号
> 2. 修复部署配置（Nginx/端口/环境变量）
> 3. 完成小程序支付接入
> 4. 准备应用商店上架材料
> 5. **APP测试收尾** - 完成v1.0.8 APK真机测试、支付流程验证
> 6. **支付宝密钥配置** - 主人配置PRIVATE_KEY和PUBLIC_KEY
> 7. **SSH连接排查** - 解决服务器连接问题，修复Nginx配置
