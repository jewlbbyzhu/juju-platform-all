# 聚聚平台API文档更新

> **文档版本**: v2.1  
> **更新日期**: 2026-01-28  
> **更新类型**: 新增功能、字段扩展、接口优化

---

## 📋 更新概览

| 模块 | 更新类型 | 更新内容 |
|------|---------|----------|
| **聚会管理** | 字段扩展、逻辑优化 | 新增city、tags、min_participants等字段 |
| **支付管理** | 支付方式扩展 | 新增银行卡支付支持 |
| **订单管理** | 字段扩展 | 新增participant_completed、settlement_status字段 |
| **退款管理** | 流程优化 | 实现极速退款、银行卡退款 |
| **钱包管理** | 手续费调整 | 提现手续费降至0.1% |
| **社交功能** | 新增模块 | 关注、私信、拉黑功能 |
| **定时任务** | 新增模块 | 聚会自动取消功能 |

---

## 🔧 数据模型更新

### 1. Party模型扩展

#### 新增字段

| 字段名 | 类型 | 说明 | 默认值 | 必填 |
|--------|------|------|--------|-------|
| `tags` | JSON | 标签列表（1-3个） | null | 否 |
| `city` | VARCHAR(50) | 城市 | null | 否 |
| `registration_deadline` | DATETIME | 报名截止时间 | null | 否 |
| `min_participants` | INT | 最少参与人数（VIP专属） | null | 否 |
| `draft_status` | TINYINT | 草稿状态（-1草稿，0已提交） | -1 | 否 |

#### 字段修改

| 字段名 | 旧默认值 | 新默认值 | 说明 |
|--------|---------|---------|------|
| `status` | 0 | -1 | 默认改为草稿状态 |

#### 新增索引

```sql
CREATE INDEX idx_parties_city ON parties(city);
```

#### 相关API接口

**创建聚会**
```http
POST /api/v1/parties
Content-Type: application/json
Authorization: Bearer {token}

{
  "title": "周末派对",
  "description": "一起来嗨皮！",
  "category": "party",
  "city": "北京",
  "tags": ["音乐", "社交"],
  "min_participants": 10,
  "registration_deadline": "2026-02-01T18:00:00Z",
  "start_time": "2026-02-02T20:00:00Z",
  "end_time": "2026-02-03T02:00:00Z",
  "address": "朝阳区三里屯",
  "latitude": 39.9042,
  "longitude": 116.4074,
  "max_participants": 50,
  "ticket_types": [...]
}

Response 200 OK
{
  "code": 0,
  "message": "创建成功",
  "data": {
    "id": 1,
    "title": "周末派对",
    "status": -1,
    "draft_status": -1,
    "city": "北京",
    "tags": ["音乐", "社交"],
    "min_participants": 10,
    "registration_deadline": "2026-02-01T18:00:00Z",
    ...
  }
}
```

**获取聚会列表（支持城市筛选）**
```http
GET /api/v1/parties?page=1&pageSize=10&city=北京&category=party
Authorization: Bearer {token}

Response 200 OK
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "list": [...],
    "total": 100,
    "page": 1,
    "pageSize": 10
  }
}
```

---

### 2. Payment模型扩展

#### 新增字段

| 字段名 | 类型 | 说明 | 默认值 | 必填 |
|--------|------|------|--------|-------|
| `bank_card_id` | INT | 银行卡ID（银行卡支付时使用） | null | 否 |

#### 新增索引

```sql
CREATE INDEX idx_payments_bank_card_id ON payments(bank_card_id);
```

#### 相关API接口

**创建订单（支持银行卡支付）**
```http
POST /api/v1/orders
Content-Type: application/json
Authorization: Bearer {token}

{
  "party_id": 1,
  "ticket_type_id": 2,
  "name": "张三",
  "phone": "13800138000",
  "gender": 1,
  "payment_method": "bankcard",
  "bank_card_id": 5
}

Response 200 OK
{
  "code": 0,
  "message": "订单创建成功",
  "data": {
    "id": 100,
    "order_no": "ORD20260128001",
    "payment_method": "bankcard",
    "bank_card_id": 5,
    "amount": 99.00,
    "status": 0,
    ...
  }
}
```

---

### 3. Order模型扩展

#### 新增字段

| 字段名 | 类型 | 说明 | 默认值 | 必填 |
|--------|------|------|--------|-------|
| `participant_completed` | BOOLEAN | 参与者是否点击完成按钮 | false | 否 |
| `settlement_status` | TINYINT | 结算状态（0-未结算，1-已结算） | 0 | 否 |

#### 新增索引

```sql
CREATE INDEX idx_orders_participant_completed ON orders(participant_completed);
CREATE INDEX idx_orders_settlement_status ON orders(settlement_status);
```

#### 相关API接口

**参与者点击完成按钮**
```http
POST /api/v1/orders/:id/complete
Content-Type: application/json
Authorization: Bearer {token}

Response 200 OK
{
  "code": 0,
  "message": "操作成功",
  "data": {
    "id": 100,
    "participant_completed": true,
    "completed_at": "2026-01-28T10:00:00Z"
  }
}
```

---

### 4. 退款管理优化

#### 退款流程变更

**极速退款（无需审核）**
```http
POST /api/v1/refunds
Content-Type: application/json
Authorization: Bearer {token}

{
  "order_id": 100,
  "reason": "极速退款"
}

Response 200 OK
{
  "code": 0,
  "message": "退款申请成功",
  "data": {
    "id": 50,
    "refund_no": "REF20260128001",
    "amount": 99.00,
    "status": 1,
    "audit_status": 1,
    "audit_time": "2026-01-28T10:00:00Z",
    "audit_user": "system",
    "refund_id": "WX20260128001",
    "refund_time": "2026-01-28T10:00:05Z"
  }
}
```

**银行卡退款**
```http
POST /api/v1/refunds
Content-Type: application/json
Authorization: Bearer {token}

{
  "order_id": 100,
  "payment_method": "bankcard",
  "reason": "银行卡退款"
}

Response 200 OK
{
  "code": 0,
  "message": "退款申请成功",
  "data": {
    "id": 51,
    "refund_no": "REF20260128002",
    "amount": 99.00,
    "status": 3,
    "refund_id": "BANK20260128001",
    "refund_time": "2026-01-28T10:00:00Z"
  }
}
```

---

### 5. 钱包管理优化

#### 手续费调整

**提现手续费从1%降至0.1%**

**提现申请**
```http
POST /api/v1/wallet/withdraw
Content-Type: application/json
Authorization: Bearer {token}

{
  "amount": 100.00,
  "payment_method": "bankcard",
  "bank_card_id": 5
}

Response 200 OK
{
  "code": 0,
  "message": "提现申请成功",
  "data": {
    "id": 200,
    "transaction_no": "WTH20260128001",
    "amount": 100.00,
    "fee": 0.10,
    "fee_rate": 0.001,
    "actual_amount": 99.90,
    "status": 0,
    ...
  }
}
```

---

### 6. 社交功能新增

#### 关注功能

**关注用户**
```http
POST /api/v1/follows
Content-Type: application/json
Authorization: Bearer {token}

{
  "following_id": 5
}

Response 200 OK
{
  "code": 0,
  "message": "关注成功",
  "data": {
    "id": 10,
    "follower_id": 1,
    "following_id": 5,
    "created_at": "2026-01-28T10:00:00Z"
  }
}
```

**取消关注**
```http
DELETE /api/v1/follows/5
Authorization: Bearer {token}

Response 200 OK
{
  "code": 0,
  "message": "已取消关注"
}
```

**检查关注状态**
```http
GET /api/v1/follows/check?user_id=5
Authorization: Bearer {token}

Response 200 OK
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "isFollowing": true,
    "followTime": "2026-01-28T10:00:00Z"
  }
}
```

#### 私信功能

**获取会话列表**
```http
GET /api/v1/conversations?page=1&pageSize=20
Authorization: Bearer {token}

Response 200 OK
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": 1,
        "user_id": 5,
        "other_user_id": 10,
        "last_message": "你好！",
        "unread_count": 2,
        "updated_at": "2026-01-28T10:00:00Z"
      }
    ],
    "total": 10,
    "page": 1,
    "pageSize": 20
  }
}
```

**发送消息**
```http
POST /api/v1/conversations/1/messages
Content-Type: application/json
Authorization: Bearer {token}

{
  "content": "你好！",
  "type": "text"
}

Response 200 OK
{
  "code": 0,
  "message": "发送成功",
  "data": {
    "id": 100,
    "conversation_id": 1,
    "sender_id": 1,
    "content": "你好！",
    "type": "text",
    "status": 1,
    "created_at": "2026-01-28T10:00:00Z"
  }
}
```

#### 拉黑功能

**拉黑用户**
```http
POST /api/v1/users/5/block
Content-Type: application/json
Authorization: Bearer {token}

Response 200 OK
{
  "code": 0,
  "message": "拉黑成功",
  "data": {
    "id": 20,
    "blocker_id": 1,
    "blocked_id": 5,
    "created_at": "2026-01-28T10:00:00Z"
  }
}
```

**取消拉黑**
```http
POST /api/v1/users/5/unblock
Content-Type: application/json
Authorization: Bearer {token}

Response 200 OK
{
  "code": 0,
  "message": "已取消拉黑"
}
```

---

### 7. 定时任务新增

#### 聚会自动取消功能

**手动触发自动取消**
```http
POST /api/v2/schedule/auto-cancel
Content-Type: application/json
Authorization: Bearer {token}

Response 200 OK
{
  "code": 0,
  "message": "自动取消检查完成",
  "data": {
    "cancelled_count": 5,
    "checked_count": 20,
    "message": "自动取消检查完成，共检查 20 个聚会，取消 5 个聚会"
  }
}
```

**获取待取消聚会列表**
```http
GET /api/v2/schedule/parties-to-cancel
Authorization: Bearer {token}

Response 200 OK
{
  "code": 0,
  "message": "获取待取消聚会列表成功",
  "data": [
    {
      "id": 10,
      "title": "周末派对",
      "min_participants": 10,
      "participant_count": 5,
      "registration_deadline": "2026-02-01T18:00:00Z",
      "status": 1
    }
  ]
}
```

---

## 🎯 票型规则完善

### 票型类型说明

| 类型值 | 类型名称 | 说明 | 特殊标识 |
|--------|---------|------|---------|
| 1 | 普通票 | 无特殊标识 |
| 2 | 早鸟票 | 显示"早鸟"标签 |
| 3 | 男性票 | 显示"男"标签 |
| 4 | 女性票 | 显示"女"标签 |
| 5 | 男性早鸟票 | 显示"早鸟"和"男"标签 |
| 6 | 女性早鸟票 | 显示"早鸟"和"女"标签 |

### 免费聚会支持

**免费票型标识**
```html
<div class="ticket-card free-ticket">
  <span class="price">¥0</span>
  <span class="free-badge">免费</span>
</div>
```

**API响应示例**
```json
{
  "id": 1,
  "name": "普通票",
  "price": 0,
  "original_price": 0,
  "type": 1,
  "available_count": 100,
  "is_free": true
}
```

---

## 📊 聚会显示权重计算

### 权重计算公式

```javascript
function calculatePartyWeight(party, userLat, userLng) {
  let weight = 1.0;

  // 1. VIP基础权重
  const user = party.user;
  if (user && user.is_vip) {
    if (user.vip_level === 'yearly') {
      weight *= 2.5;
    } else if (user.vip_level === 'quarterly') {
      weight *= 1.8;
    } else if (user.vip_level === 'monthly') {
      weight *= 1.2;
    }
  }

  // 2. 距离权重（100km内）
  if (userLat !== null && userLng !== null && party.latitude && party.longitude) {
    const distance = calculateDistance(userLat, userLng, party.latitude, party.longitude);
    if (distance <= 100) {
      const distanceWeight = (100 - distance) / 100;
      weight *= (1 + distanceWeight * 0.3);
    }
  }

  // 3. 时间权重（24小时内）
  const now = new Date();
  const hoursUntilStart = (new Date(party.start_time) - now) / (1000 * 60 * 60);
  if (hoursUntilStart > 0 && hoursUntilStart <= 24) {
    const timeWeight = (24 - hoursUntilStart) / 24;
    weight *= (1 + timeWeight * 0.2);
  }

  // 4. 报名进度权重（30%-70%）
  if (party.max_participants > 0) {
    const currentParticipants = party.orders ? party.orders.length : 0;
    const progress = currentParticipants / party.max_participants;
    if (progress >= 0.3 && progress <= 0.7) {
      const progressWeight = 1 - Math.abs(progress - 0.5) / 0.5;
      weight *= (1 + progressWeight * 0.15);
    }
  }

  return weight;
}
```

### API接口

**获取推荐聚会列表**
```http
GET /api/v1/parties?page=1&pageSize=10&latitude=39.9042&longitude=116.4074
Authorization: Bearer {token}

Response 200 OK
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": 1,
        "title": "周末派对",
        "weight": 2.5,
        "distance": 5.2,
        "hours_until_start": 12,
        "participant_progress": 0.6
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 10
  }
}
```

---

## 🔐 常量更新

### 新增常量

| 常量名 | 值 | 说明 |
|--------|-----|------|
| `WITHDRAWAL_FEE_RATE` | 0.001 | 提现手续费率（0.1%） |

### 使用示例

```javascript
const { WITHDRAWAL_FEE_RATE } = require('../constants');

// 计算提现手续费
const fee = amount * WITHDRAWAL_FEE_RATE;
const actualAmount = amount - fee;
```

---

## 📱 前端组件更新

### 1. 用户信息模态窗

**组件路径**: `uni-app-mobile/components/user-info-modal/user-info-modal.vue`

**Props**
```javascript
{
  visible: Boolean,      // 是否显示
  userInfo: Object,     // 用户信息
  currentUserId: Number  // 当前用户ID
}
```

**Events**
```javascript
{
  'close': null,              // 关闭模态窗
  'follow-change': Object,   // 关注状态变化
  'confirm': null           // 确认操作
}
```

**使用示例**
```vue
<user-info-modal
  :visible="showUserInfoModal"
  :userInfo="selectedUser"
  :currentUserId="currentUserId"
  @close="showUserInfoModal = false"
  @follow-change="handleFollowChange"
/>
```

### 2. 地图选点组件

**组件路径**: `uni-app-mobile/components/location-picker/location-picker.vue`

**Props**
```javascript
{
  visible: Boolean,         // 是否显示
  initialLocation: Object   // 初始位置
}
```

**Events**
```javascript
{
  'close': null,           // 关闭选点器
  'confirm': Object        // 确认位置
}
```

**使用示例**
```vue
<location-picker
  :visible="showLocationPicker"
  :initialLocation="partyLocation"
  @close="showLocationPicker = false"
  @confirm="handleLocationConfirm"
/>
```

---

## ⚠️ 重要说明

### 1. 数据库迁移

**必须执行的迁移**
```sql
-- Party表
ALTER TABLE parties ADD COLUMN tags JSON COMMENT '标签列表（1-3个）';
ALTER TABLE parties ADD COLUMN city VARCHAR(50) COMMENT '城市';
ALTER TABLE parties ADD COLUMN registration_deadline DATETIME COMMENT '报名截止时间';
ALTER TABLE parties ADD COLUMN min_participants INT COMMENT '最少参与人数（VIP专属）';
ALTER TABLE parties ADD COLUMN draft_status TINYINT DEFAULT -1 COMMENT '草稿状态';
ALTER TABLE parties MODIFY COLUMN status TINYINT DEFAULT -1 COMMENT '状态';
CREATE INDEX idx_parties_city ON parties(city);

-- Payment表
ALTER TABLE payments ADD COLUMN bank_card_id INT COMMENT '银行卡ID（银行卡支付时使用）';
CREATE INDEX idx_payments_bank_card_id ON payments(bank_card_id);

-- Order表
ALTER TABLE orders ADD COLUMN participant_completed BOOLEAN DEFAULT FALSE COMMENT '参与者是否点击完成按钮';
ALTER TABLE orders ADD COLUMN settlement_status TINYINT DEFAULT 0 COMMENT '结算状态';
CREATE INDEX idx_orders_participant_completed ON orders(participant_completed);
CREATE INDEX idx_orders_settlement_status ON orders(settlement_status);
```

### 2. 依赖安装

**前端依赖**
```bash
npm install eslint eslint-plugin-vue @typescript-eslint/parser @typescript-eslint/eslint-plugin --save-dev
npm install prettier eslint-config-prettier eslint-plugin-prettier --save-dev
```

### 3. 配置文件

**已创建的配置文件**
- `.editorconfig` - 编辑器配置（统一换行符）
- `.eslintrc.js` - ESLint配置
- `.prettierrc.json` - Prettier配置

### 4. 脚本命令

**新增脚本**
```json
{
  "lint": "eslint . --ext .vue,.js,.ts",
  "format": "prettier --write \"**/*.{js,ts,vue,json,md}\""
}
```

---

## 📈 版本历史

| 版本 | 日期 | 更新内容 |
|------|------|----------|
| v2.1 | 2026-01-28 | P1高优先级功能实施完成 |
| v2.0 | 2026-01-28 | 初始版本 |

---

## 🔗 相关文档

- [juju-rules.md](file:///d:/小程序项目/聚聚项目/docs/juju-rules.md) - 业务规则文档
- [TEST_REPORT.md](file:///d:/小程序项目/聚聚项目/TEST_REPORT.md) - 测试报告
- [IMPLEMENTATION_REPORT.md](file:///d:/小程序项目/聚聚项目/IMPLEMENTATION_REPORT.md) - 实施报告

---

**文档结束**
