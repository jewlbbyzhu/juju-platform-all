# 数据库架构对比报告

**生成时间**: 2026/2/1 20:23:16

**数据库**: hfparty_db_new@122.51.255.13

---

## 📊 摘要

- **数据库中的表数量**: 36
- **模型定义数量**: 38
- **匹配的表**: 36
- **数据库中缺失的表**: 2
- **模型中缺失的表**: 0
- **字段不匹配的表**: 21

## 🔴 数据库中缺失的表（需要创建）

| 模型名 | 表名 | 状态 |
|--------|------|------|
| AppDownloadEvent | app_download_events | ❌ 缺失 |
| Feedback | feedbacks | ❌ 缺失 |

## ⚠️ 字段不匹配的表

### announcements (2 处差异)

| 字段 | 问题类型 | 模型定义 | 数据库实际 |
|------|----------|----------|------------|
| created_by | 🟡 多余 | ❌ 未定义 | varchar |
| tags | 🟡 多余 | ❌ 未定义 | text |

### bank_cards (1 处差异)

| 字段 | 问题类型 | 模型定义 | 数据库实际 |
|------|----------|----------|------------|
| is_default | ⚠️ 默认值不匹配 | false | 0 |

### banners (14 处差异)

| 字段 | 问题类型 | 模型定义 | 数据库实际 |
|------|----------|----------|------------|
| title | ⚠️ 类型不匹配 | STRING (200) | varchar (255) |
| image_url | 🔴 缺失 | STRING | ❌ 不存在 |
| link_url | 🔴 缺失 | STRING | ❌ 不存在 |
| sort_order | 🔴 缺失 | INTEGER | ❌ 不存在 |
| status | ⚠️ 类型不匹配 | ENUM () | tinyint () |
| status | ⚠️ 可空性不匹配 | 非空 | 可空 |
| status | ⚠️ 默认值不匹配 | inactive | 1 |
| created_at | ⚠️ 可空性不匹配 | 非空 | 可空 |
| updated_at | ⚠️ 可空性不匹配 | 非空 | 可空 |
| image | 🟡 多余 | ❌ 未定义 | varchar |
| link | 🟡 多余 | ❌ 未定义 | varchar |
| position | 🟡 多余 | ❌ 未定义 | int |
| start_date | 🟡 多余 | ❌ 未定义 | datetime |
| end_date | 🟡 多余 | ❌ 未定义 | datetime |

### comments (2 处差异)

| 字段 | 问题类型 | 模型定义 | 数据库实际 |
|------|----------|----------|------------|
| created_at | ⚠️ 可空性不匹配 | 非空 | 可空 |
| updated_at | ⚠️ 可空性不匹配 | 非空 | 可空 |

### conversations (2 处差异)

| 字段 | 问题类型 | 模型定义 | 数据库实际 |
|------|----------|----------|------------|
| created_at | ⚠️ 可空性不匹配 | 非空 | 可空 |
| updated_at | ⚠️ 可空性不匹配 | 非空 | 可空 |

### follows (2 处差异)

| 字段 | 问题类型 | 模型定义 | 数据库实际 |
|------|----------|----------|------------|
| created_at | ⚠️ 可空性不匹配 | 非空 | 可空 |
| updated_at | ⚠️ 可空性不匹配 | 非空 | 可空 |

### groups (7 处差异)

| 字段 | 问题类型 | 模型定义 | 数据库实际 |
|------|----------|----------|------------|
| name | ⚠️ 类型不匹配 | STRING (100) | varchar (255) |
| max_members | 🔴 缺失 | INTEGER | ❌ 不存在 |
| status | 🔴 缺失 | TINYINT | ❌ 不存在 |
| created_at | ⚠️ 可空性不匹配 | 非空 | 可空 |
| updated_at | ⚠️ 可空性不匹配 | 非空 | 可空 |
| last_message | 🟡 多余 | ❌ 未定义 | text |
| last_message_time | 🟡 多余 | ❌ 未定义 | timestamp |

### group_members (2 处差异)

| 字段 | 问题类型 | 模型定义 | 数据库实际 |
|------|----------|----------|------------|
| created_at | ⚠️ 可空性不匹配 | 非空 | 可空 |
| updated_at | ⚠️ 可空性不匹配 | 非空 | 可空 |

### group_messages (4 处差异)

| 字段 | 问题类型 | 模型定义 | 数据库实际 |
|------|----------|----------|------------|
| type | ⚠️ 可空性不匹配 | 非空 | 可空 |
| created_at | ⚠️ 可空性不匹配 | 非空 | 可空 |
| updated_at | ⚠️ 可空性不匹配 | 非空 | 可空 |
| status | 🟡 多余 | ❌ 未定义 | varchar |

### likes (2 处差异)

| 字段 | 问题类型 | 模型定义 | 数据库实际 |
|------|----------|----------|------------|
| created_at | ⚠️ 可空性不匹配 | 非空 | 可空 |
| updated_at | ⚠️ 可空性不匹配 | 非空 | 可空 |

### messages (9 处差异)

| 字段 | 问题类型 | 模型定义 | 数据库实际 |
|------|----------|----------|------------|
| conversation_id | ⚠️ 可空性不匹配 | 非空 | 可空 |
| receiver_id | 🔴 缺失 | INTEGER | ❌ 不存在 |
| type | ⚠️ 可空性不匹配 | 非空 | 可空 |
| is_read | 🔴 缺失 | BOOLEAN | ❌ 不存在 |
| read_at | 🔴 缺失 | DATE | ❌ 不存在 |
| created_at | ⚠️ 可空性不匹配 | 非空 | 可空 |
| updated_at | ⚠️ 可空性不匹配 | 非空 | 可空 |
| group_id | 🟡 多余 | ❌ 未定义 | int |
| status | 🟡 多余 | ❌ 未定义 | varchar |

### notifications (2 处差异)

| 字段 | 问题类型 | 模型定义 | 数据库实际 |
|------|----------|----------|------------|
| data | ⚠️ 类型不匹配 | JSONTYPE () | json () |
| is_read | ⚠️ 默认值不匹配 | false | 0 |

### orders (2 处差异)

| 字段 | 问题类型 | 模型定义 | 数据库实际 |
|------|----------|----------|------------|
| discount_amount | ⚠️ 默认值不匹配 | 0 | 0.00 |
| participant_completed | ⚠️ 默认值不匹配 | false | 0 |

### parties (6 处差异)

| 字段 | 问题类型 | 模型定义 | 数据库实际 |
|------|----------|----------|------------|
| images | ⚠️ 类型不匹配 | JSONTYPE () | json () |
| tags | ⚠️ 类型不匹配 | JSONTYPE () | json () |
| min_price | ⚠️ 默认值不匹配 | 0 | 0.00 |
| max_price | ⚠️ 默认值不匹配 | 0 | 0.00 |
| is_featured | ⚠️ 默认值不匹配 | false | 0 |
| is_hot | ⚠️ 默认值不匹配 | false | 0 |

### party_featured (1 处差异)

| 字段 | 问题类型 | 模型定义 | 数据库实际 |
|------|----------|----------|------------|
| weight | ⚠️ 默认值不匹配 | 1 | 1.0 |

### payments (1 处差异)

| 字段 | 问题类型 | 模型定义 | 数据库实际 |
|------|----------|----------|------------|
| callback_data | ⚠️ 类型不匹配 | JSONTYPE () | json () |

### posts (4 处差异)

| 字段 | 问题类型 | 模型定义 | 数据库实际 |
|------|----------|----------|------------|
| images | ⚠️ 类型不匹配 | JSONTYPE () | json () |
| location | ⚠️ 类型不匹配 | JSONTYPE () | json () |
| created_at | ⚠️ 可空性不匹配 | 非空 | 可空 |
| updated_at | ⚠️ 可空性不匹配 | 非空 | 可空 |

### push_messages (9 处差异)

| 字段 | 问题类型 | 模型定义 | 数据库实际 |
|------|----------|----------|------------|
| title | ⚠️ 类型不匹配 | STRING (200) | varchar (255) |
| content | ⚠️ 可空性不匹配 | 非空 | 可空 |
| type | ⚠️ 可空性不匹配 | 非空 | 可空 |
| data | 🔴 缺失 | JSONTYPE | ❌ 不存在 |
| status | 🔴 缺失 | STRING | ❌ 不存在 |
| sent_at | 🔴 缺失 | DATE | ❌ 不存在 |
| created_at | ⚠️ 可空性不匹配 | 非空 | 可空 |
| updated_at | ⚠️ 可空性不匹配 | 非空 | 可空 |
| is_read | 🟡 多余 | ❌ 未定义 | tinyint |

### push_settings (11 处差异)

| 字段 | 问题类型 | 模型定义 | 数据库实际 |
|------|----------|----------|------------|
| order_notification | ⚠️ 可空性不匹配 | 非空 | 可空 |
| order_notification | ⚠️ 默认值不匹配 | true | 1 |
| party_notification | ⚠️ 可空性不匹配 | 非空 | 可空 |
| party_notification | ⚠️ 默认值不匹配 | true | 1 |
| message_notification | ⚠️ 可空性不匹配 | 非空 | 可空 |
| message_notification | ⚠️ 默认值不匹配 | true | 1 |
| system_notification | ⚠️ 可空性不匹配 | 非空 | 可空 |
| system_notification | ⚠️ 默认值不匹配 | true | 1 |
| created_at | ⚠️ 可空性不匹配 | 非空 | 可空 |
| updated_at | ⚠️ 可空性不匹配 | 非空 | 可空 |
| marketing_notification | 🟡 多余 | ❌ 未定义 | tinyint |

### roles (1 处差异)

| 字段 | 问题类型 | 模型定义 | 数据库实际 |
|------|----------|----------|------------|
| permissions | ⚠️ 类型不匹配 | JSONTYPE () | json () |

### wallets (4 处差异)

| 字段 | 问题类型 | 模型定义 | 数据库实际 |
|------|----------|----------|------------|
| balance | ⚠️ 默认值不匹配 | 0 | 0.00 |
| frozen_balance | ⚠️ 默认值不匹配 | 0 | 0.00 |
| total_income | ⚠️ 默认值不匹配 | 0 | 0.00 |
| total_expense | ⚠️ 默认值不匹配 | 0 | 0.00 |

## 📋 完整数据库表结构

### admins

> 管理员表

**字段**:

| 字段名 | 类型 | 长度/精度 | 可空 | 默认值 | 注释 |
|--------|------|-----------|------|--------|------|
| id | int(10,0) | 否 | - | - |
| username | varchar(50) | 否 | - | 用户名 |
| password | varchar(100) | 否 | - | 密码（加密） |
| real_name | varchar(50) | 是 | - | 真实姓名 |
| phone | varchar(20) | 是 | - | 手机号 |
| email | varchar(100) | 是 | - | 邮箱 |
| avatar | varchar(500) | 是 | - | 头像URL |
| role_id | int(10,0) | 否 | - | 角色ID |
| status | tinyint(3,0) | 否 | 1 | 状态：0-禁用，1-正常 |
| last_login_at | datetime | 是 | - | 最后登录时间 |
| last_login_ip | varchar(50) | 是 | - | 最后登录IP |
| created_at | datetime | 否 | - | - |
| updated_at | datetime | 否 | - | - |

**索引**:

| 索引名 | 类型 | 字段 |
|--------|------|------|
| admins_role_id | 普通 | role_id |
| admins_status | 普通 | status |
| admins_username | 普通 | username |
| PRIMARY | 主键 | id |
| username | 唯一 | username |

**外键**:

| 字段 | 引用表 | 引用字段 |
|------|--------|----------|
| role_id | roles | id |

---

### announcements

**字段**:

| 字段名 | 类型 | 长度/精度 | 可空 | 默认值 | 注释 |
|--------|------|-----------|------|--------|------|
| id | int(10,0) | 否 | - | - |
| title | varchar(200) | 否 | - | 标题 |
| content | text(65535) | 否 | - | 内容 |
| type | enum(11) | 否 | system | 类型：system-系统公告, activity-活动公告, maintenance-维护公告, update-更新公告, help-帮助文档 |
| status | enum(9) | 否 | draft | 状态 |
| created_at | datetime | 否 | - | - |
| updated_at | datetime | 否 | - | - |
| category | enum(15) | 是 | - | 帮助文档分类 |
| published_at | datetime | 是 | - | 发布时间 |
| created_by | varchar(100) | 是 | - | - |
| tags | text(65535) | 是 | - | - |

**索引**:

| 索引名 | 类型 | 字段 |
|--------|------|------|
| announcements_category | 普通 | category |
| announcements_created_at | 普通 | created_at |
| announcements_status | 普通 | status |
| announcements_type | 普通 | type |
| PRIMARY | 主键 | id |

---

### app_versions

> App版本表

**字段**:

| 字段名 | 类型 | 长度/精度 | 可空 | 默认值 | 注释 |
|--------|------|-----------|------|--------|------|
| id | int(10,0) | 否 | - | - |
| platform | varchar(20) | 否 | - | 平台：ios, android |
| version | varchar(20) | 否 | - | 版本号 |
| version_code | int(10,0) | 否 | - | 版本代码 |
| download_url | varchar(500) | 否 | - | 下载URL |
| file_size | bigint(19,0) | 是 | - | 文件大小 |
| update_type | varchar(20) | 否 | optional | 更新类型：optional, force |
| description | text(65535) | 是 | - | 更新说明 |
| status | tinyint(3,0) | 否 | 1 | 状态：0-禁用，1-启用 |
| created_at | datetime | 否 | - | - |
| updated_at | datetime | 否 | - | - |

**索引**:

| 索引名 | 类型 | 字段 |
|--------|------|------|
| app_versions_platform | 普通 | platform |
| app_versions_status | 普通 | status |
| app_versions_version_code | 普通 | version_code |
| PRIMARY | 主键 | id |

---

### audit_logs

> 审计日志表

**字段**:

| 字段名 | 类型 | 长度/精度 | 可空 | 默认值 | 注释 |
|--------|------|-----------|------|--------|------|
| id | int(10,0) | 否 | - | - |
| user_id | int(10,0) | 否 | - | 操作人ID |
| action | varchar(50) | 否 | - | 操作类型 |
| entity_type | varchar(50) | 否 | - | 实体类型 |
| entity_id | int(10,0) | 否 | - | 实体ID |
| old_value | text(65535) | 是 | - | 旧值 |
| new_value | text(65535) | 是 | - | 新值 |
| reason | varchar(500) | 是 | - | 操作原因 |
| ip_address | varchar(50) | 是 | - | IP地址 |
| user_agent | varchar(500) | 是 | - | 用户代理 |
| created_at | datetime | 否 | - | - |

**索引**:

| 索引名 | 类型 | 字段 |
|--------|------|------|
| audit_logs_action | 普通 | action |
| audit_logs_created_at | 普通 | created_at |
| audit_logs_entity_id | 普通 | entity_id |
| audit_logs_entity_type | 普通 | entity_type |
| audit_logs_user_id | 普通 | user_id |
| PRIMARY | 主键 | id |

---

### bank_cards

> 银行卡表

**字段**:

| 字段名 | 类型 | 长度/精度 | 可空 | 默认值 | 注释 |
|--------|------|-----------|------|--------|------|
| id | int(10,0) | 否 | - | - |
| user_id | int(10,0) | 否 | - | 用户ID |
| bank_name | varchar(50) | 否 | - | 银行名称 |
| card_number | varchar(50) | 否 | - | 卡号（加密存储） |
| card_holder | varchar(50) | 否 | - | 持卡人姓名 |
| card_type | varchar(20) | 否 | - | 卡类型：debit, credit |
| is_default | tinyint(3,0) | 否 | 0 | 是否默认 |
| status | tinyint(3,0) | 否 | 1 | 状态：0-禁用，1-正常 |
| created_at | datetime | 否 | - | - |
| updated_at | datetime | 否 | - | - |

**索引**:

| 索引名 | 类型 | 字段 |
|--------|------|------|
| bank_cards_status | 普通 | status |
| bank_cards_user_id | 普通 | user_id |
| PRIMARY | 主键 | id |

**外键**:

| 字段 | 引用表 | 引用字段 |
|------|--------|----------|
| user_id | users | id |

---

### banners

**字段**:

| 字段名 | 类型 | 长度/精度 | 可空 | 默认值 | 注释 |
|--------|------|-----------|------|--------|------|
| id | int(10,0) | 否 | - | - |
| title | varchar(255) | 否 | - | - |
| image | varchar(500) | 否 | - | - |
| link | varchar(500) | 是 | - | - |
| position | int(10,0) | 是 | 0 | - |
| status | tinyint(3,0) | 是 | 1 | - |
| created_at | timestamp | 是 | CURRENT_TIMESTAMP | - |
| updated_at | timestamp | 是 | CURRENT_TIMESTAMP | - |
| start_date | datetime | 是 | - | - |
| end_date | datetime | 是 | - | - |

**索引**:

| 索引名 | 类型 | 字段 |
|--------|------|------|
| PRIMARY | 主键 | id |

---

### comments

> 评论表

**字段**:

| 字段名 | 类型 | 长度/精度 | 可空 | 默认值 | 注释 |
|--------|------|-----------|------|--------|------|
| id | bigint(20,0) | 否 | - | - |
| user_id | bigint(20,0) | 否 | - | 评论者ID |
| post_id | bigint(20,0) | 是 | - | 动态ID |
| party_id | bigint(20,0) | 是 | - | 聚会ID |
| content | text(65535) | 否 | - | 评论内容 |
| reply_to | bigint(20,0) | 是 | - | 回复的评论ID |
| like_count | int(10,0) | 否 | 0 | 点赞数 |
| status | tinyint(3,0) | 否 | 1 | 状态：0-删除，1-正常 |
| created_at | datetime | 是 | CURRENT_TIMESTAMP | - |
| updated_at | datetime | 是 | CURRENT_TIMESTAMP | - |

**索引**:

| 索引名 | 类型 | 字段 |
|--------|------|------|
| idx_created_at | 普通 | created_at |
| idx_party_id | 普通 | party_id |
| idx_post_id | 普通 | post_id |
| idx_reply_to | 普通 | reply_to |
| idx_status | 普通 | status |
| idx_user_id | 普通 | user_id |
| PRIMARY | 主键 | id |

---

### conversations

**字段**:

| 字段名 | 类型 | 长度/精度 | 可空 | 默认值 | 注释 |
|--------|------|-----------|------|--------|------|
| id | int(10,0) | 否 | - | - |
| user_id_1 | int(10,0) | 否 | - | - |
| user_id_2 | int(10,0) | 否 | - | - |
| last_message | text(65535) | 是 | - | - |
| last_message_time | timestamp | 是 | CURRENT_TIMESTAMP | - |
| created_at | timestamp | 是 | CURRENT_TIMESTAMP | - |
| updated_at | timestamp | 是 | CURRENT_TIMESTAMP | - |

**索引**:

| 索引名 | 类型 | 字段 |
|--------|------|------|
| PRIMARY | 主键 | id |

---

### favorites

> 收藏表

**字段**:

| 字段名 | 类型 | 长度/精度 | 可空 | 默认值 | 注释 |
|--------|------|-----------|------|--------|------|
| id | int(10,0) | 否 | - | - |
| user_id | int(10,0) | 否 | - | 用户ID |
| party_id | int(10,0) | 否 | - | 聚会ID |
| created_at | datetime | 否 | - | - |
| updated_at | datetime | 否 | - | - |

**索引**:

| 索引名 | 类型 | 字段 |
|--------|------|------|
| favorites_party_id | 普通 | party_id |
| favorites_user_id | 普通 | user_id |
| favorites_user_id_party_id | 唯一 | user_id, party_id |
| PRIMARY | 主键 | id |

**外键**:

| 字段 | 引用表 | 引用字段 |
|------|--------|----------|
| user_id | users | id |
| party_id | parties | id |

---

### follows

> 关注关系表

**字段**:

| 字段名 | 类型 | 长度/精度 | 可空 | 默认值 | 注释 |
|--------|------|-----------|------|--------|------|
| id | bigint(20,0) | 否 | - | - |
| follower_id | bigint(20,0) | 否 | - | 关注者ID |
| following_id | bigint(20,0) | 否 | - | 被关注者ID |
| status | tinyint(3,0) | 否 | 1 | 状态：0-取消关注，1-关注中 |
| created_at | datetime | 是 | CURRENT_TIMESTAMP | - |
| updated_at | datetime | 是 | CURRENT_TIMESTAMP | - |

**索引**:

| 索引名 | 类型 | 字段 |
|--------|------|------|
| idx_follower_id | 普通 | follower_id |
| idx_following_id | 普通 | following_id |
| PRIMARY | 主键 | id |
| uk_follower_following | 唯一 | follower_id, following_id |

---

### group_members

**字段**:

| 字段名 | 类型 | 长度/精度 | 可空 | 默认值 | 注释 |
|--------|------|-----------|------|--------|------|
| id | int(10,0) | 否 | - | - |
| group_id | int(10,0) | 否 | - | - |
| user_id | int(10,0) | 否 | - | - |
| role | varchar(20) | 是 | member | - |
| created_at | timestamp | 是 | CURRENT_TIMESTAMP | - |
| updated_at | timestamp | 是 | CURRENT_TIMESTAMP | - |

**索引**:

| 索引名 | 类型 | 字段 |
|--------|------|------|
| PRIMARY | 主键 | id |

---

### group_messages

**字段**:

| 字段名 | 类型 | 长度/精度 | 可空 | 默认值 | 注释 |
|--------|------|-----------|------|--------|------|
| id | int(10,0) | 否 | - | - |
| group_id | int(10,0) | 否 | - | - |
| sender_id | int(10,0) | 否 | - | - |
| content | text(65535) | 是 | - | - |
| type | varchar(20) | 是 | text | - |
| status | varchar(20) | 是 | sent | - |
| created_at | timestamp | 是 | CURRENT_TIMESTAMP | - |
| updated_at | timestamp | 是 | CURRENT_TIMESTAMP | - |

**索引**:

| 索引名 | 类型 | 字段 |
|--------|------|------|
| PRIMARY | 主键 | id |

---

### groups

**字段**:

| 字段名 | 类型 | 长度/精度 | 可空 | 默认值 | 注释 |
|--------|------|-----------|------|--------|------|
| id | int(10,0) | 否 | - | - |
| name | varchar(255) | 否 | - | - |
| description | text(65535) | 是 | - | - |
| avatar | varchar(500) | 是 | - | - |
| owner_id | int(10,0) | 否 | - | - |
| last_message | text(65535) | 是 | - | - |
| last_message_time | timestamp | 是 | CURRENT_TIMESTAMP | - |
| created_at | timestamp | 是 | CURRENT_TIMESTAMP | - |
| updated_at | timestamp | 是 | CURRENT_TIMESTAMP | - |

**索引**:

| 索引名 | 类型 | 字段 |
|--------|------|------|
| PRIMARY | 主键 | id |

---

### likes

> 点赞表

**字段**:

| 字段名 | 类型 | 长度/精度 | 可空 | 默认值 | 注释 |
|--------|------|-----------|------|--------|------|
| id | bigint(20,0) | 否 | - | - |
| user_id | bigint(20,0) | 否 | - | 点赞者ID |
| post_id | bigint(20,0) | 是 | - | 动态ID |
| party_id | bigint(20,0) | 是 | - | 聚会ID |
| comment_id | bigint(20,0) | 是 | - | 评论ID |
| created_at | datetime | 是 | CURRENT_TIMESTAMP | - |
| updated_at | datetime | 是 | CURRENT_TIMESTAMP | - |

**索引**:

| 索引名 | 类型 | 字段 |
|--------|------|------|
| idx_comment_id | 普通 | comment_id |
| idx_party_id | 普通 | party_id |
| idx_post_id | 普通 | post_id |
| idx_user_id | 普通 | user_id |
| PRIMARY | 主键 | id |
| uk_user_comment | 唯一 | user_id, comment_id |
| uk_user_party | 唯一 | user_id, party_id |
| uk_user_post | 唯一 | user_id, post_id |

---

### messages

**字段**:

| 字段名 | 类型 | 长度/精度 | 可空 | 默认值 | 注释 |
|--------|------|-----------|------|--------|------|
| id | int(10,0) | 否 | - | - |
| conversation_id | int(10,0) | 是 | - | - |
| group_id | int(10,0) | 是 | - | - |
| sender_id | int(10,0) | 否 | - | - |
| content | text(65535) | 是 | - | - |
| type | varchar(20) | 是 | text | - |
| status | varchar(20) | 是 | sent | - |
| created_at | timestamp | 是 | CURRENT_TIMESTAMP | - |
| updated_at | timestamp | 是 | CURRENT_TIMESTAMP | - |

**索引**:

| 索引名 | 类型 | 字段 |
|--------|------|------|
| PRIMARY | 主键 | id |

---

### notifications

> 通知表

**字段**:

| 字段名 | 类型 | 长度/精度 | 可空 | 默认值 | 注释 |
|--------|------|-----------|------|--------|------|
| id | int(10,0) | 否 | - | - |
| user_id | int(10,0) | 否 | - | 用户ID |
| type | varchar(50) | 否 | - | 类型：order, payment, refund, system, etc. |
| title | varchar(200) | 否 | - | 标题 |
| content | text(65535) | 是 | - | 内容 |
| data | json | 是 | - | 附加数据 |
| is_read | tinyint(3,0) | 否 | 0 | 是否已读 |
| read_at | datetime | 是 | - | 阅读时间 |
| created_at | datetime | 否 | - | - |
| updated_at | datetime | 否 | - | - |

**索引**:

| 索引名 | 类型 | 字段 |
|--------|------|------|
| notifications_created_at | 普通 | created_at |
| notifications_is_read | 普通 | is_read |
| notifications_type | 普通 | type |
| notifications_user_id | 普通 | user_id |
| PRIMARY | 主键 | id |

**外键**:

| 字段 | 引用表 | 引用字段 |
|------|--------|----------|
| user_id | users | id |

---

### order_items

> 订单项表

**字段**:

| 字段名 | 类型 | 长度/精度 | 可空 | 默认值 | 注释 |
|--------|------|-----------|------|--------|------|
| id | int(10,0) | 否 | - | - |
| order_id | int(10,0) | 否 | - | 订单ID |
| ticket_type_id | int(10,0) | 否 | - | 票型ID |
| ticket_type_name | varchar(100) | 否 | - | 票型名称 |
| price | decimal(10,2) | 否 | - | 单价 |
| quantity | int(10,0) | 否 | - | 数量 |
| total_amount | decimal(10,2) | 否 | - | 小计 |
| created_at | datetime | 否 | - | - |
| updated_at | datetime | 否 | - | - |

**索引**:

| 索引名 | 类型 | 字段 |
|--------|------|------|
| order_items_order_id | 普通 | order_id |
| order_items_ticket_type_id | 普通 | ticket_type_id |
| PRIMARY | 主键 | id |

**外键**:

| 字段 | 引用表 | 引用字段 |
|------|--------|----------|
| order_id | orders | id |
| ticket_type_id | ticket_types | id |

---

### orders

> 订单表

**字段**:

| 字段名 | 类型 | 长度/精度 | 可空 | 默认值 | 注释 |
|--------|------|-----------|------|--------|------|
| id | int(10,0) | 否 | - | - |
| user_id | int(10,0) | 否 | - | 用户ID |
| order_no | varchar(50) | 否 | - | 订单号 |
| party_id | int(10,0) | 否 | - | 聚会ID |
| total_amount | decimal(10,2) | 否 | - | 总金额 |
| discount_amount | decimal(10,2) | 否 | 0.00 | 优惠金额 |
| final_amount | decimal(10,2) | 否 | - | 实付金额 |
| payment_method | varchar(20) | 是 | - | 支付方式：wechat, alipay, wallet |
| payment_status | tinyint(3,0) | 否 | 0 | 支付状态：0-待支付，1-已支付，2-已取消，3-已退款 |
| payment_time | datetime | 是 | - | 支付时间 |
| paid_at | datetime | 是 | - | - |
| cancelled_at | datetime | 是 | - | - |
| refunded_at | datetime | 是 | - | - |
| status | tinyint(3,0) | 否 | 0 | 订单状态：0-待支付，1-已支付，2-已完成，3-已取消，4-已退款 |
| cancel_reason | varchar(500) | 是 | - | 取消原因 |
| cancel_time | datetime | 是 | - | 取消时间 |
| remark | varchar(500) | 是 | - | 备注 |
| created_at | datetime | 否 | - | - |
| updated_at | datetime | 否 | - | - |
| participant_completed | tinyint(3,0) | 是 | 0 | 参与者是否点击完成按钮 |
| settlement_status | tinyint(3,0) | 是 | 0 | 结算状态 |

**索引**:

| 索引名 | 类型 | 字段 |
|--------|------|------|
| idx_orders_participant_completed | 普通 | participant_completed |
| idx_orders_party_status_created | 普通 | party_id, status, created_at |
| idx_orders_payment_status_created | 普通 | payment_status, created_at |
| idx_orders_settlement_status | 普通 | settlement_status |
| idx_orders_user_status_created | 普通 | user_id, status, created_at |
| order_no | 唯一 | order_no |
| orders_created_at | 普通 | created_at |
| orders_order_no | 普通 | order_no |
| orders_party_id | 普通 | party_id |
| orders_payment_status | 普通 | payment_status |
| orders_status | 普通 | status |
| orders_user_id | 普通 | user_id |
| PRIMARY | 主键 | id |

**外键**:

| 字段 | 引用表 | 引用字段 |
|------|--------|----------|
| user_id | users | id |
| party_id | parties | id |

---

### parties

> 聚会表

**字段**:

| 字段名 | 类型 | 长度/精度 | 可空 | 默认值 | 注释 |
|--------|------|-----------|------|--------|------|
| id | int(10,0) | 否 | - | - |
| user_id | int(10,0) | 否 | - | 创建者ID |
| title | varchar(200) | 否 | - | 聚会标题 |
| description | text(65535) | 是 | - | 聚会描述 |
| cover_image | varchar(500) | 是 | - | 封面图片URL |
| images | json | 是 | - | 图片列表 |
| category | varchar(50) | 否 | - | 分类 |
| start_time | datetime | 否 | - | 开始时间 |
| end_time | datetime | 否 | - | 结束时间 |
| location | varchar(200) | 否 | - | 地点 |
| address | varchar(500) | 是 | - | 详细地址 |
| latitude | decimal(10,7) | 是 | - | 纬度 |
| longitude | decimal(10,7) | 是 | - | 经度 |
| max_participants | int(10,0) | 否 | 0 | 最大参与人数 |
| min_age | int(10,0) | 是 | - | 最小年龄限制 |
| max_age | int(10,0) | 是 | - | 最大年龄限制 |
| gender_restriction | tinyint(3,0) | 是 | - | 性别限制：0-不限，1-男，2-女 |
| current_participants | int(10,0) | 否 | 0 | 当前参与人数 |
| min_price | decimal(10,2) | 否 | 0.00 | 最低价格 |
| max_price | decimal(10,2) | 否 | 0.00 | 最高价格 |
| status | tinyint(3,0) | 是 | -1 | 状态 |
| audit_status | tinyint(3,0) | 否 | 0 | 审核状态：0-待审核，1-审核通过，2-审核拒绝 |
| audit_reason | varchar(500) | 是 | - | 审核拒绝原因 |
| view_count | int(10,0) | 否 | 0 | 浏览次数 |
| favorite_count | int(10,0) | 否 | 0 | 收藏次数 |
| is_featured | tinyint(3,0) | 否 | 0 | 是否精选 |
| is_hot | tinyint(3,0) | 否 | 0 | 是否热门 |
| created_at | datetime | 否 | - | - |
| updated_at | datetime | 否 | - | - |
| like_count | int(10,0) | 否 | 0 | 点赞数 |
| comment_count | int(10,0) | 否 | 0 | 评论数 |
| share_count | int(10,0) | 否 | 0 | 分享数 |
| tags | json | 是 | - | 标签列表（1-3个） |
| city | varchar(50) | 是 | - | 城市 |
| registration_deadline | datetime | 是 | - | 报名截止时间 |
| min_participants | int(10,0) | 是 | - | 最少参与人数（VIP专属） |
| draft_status | tinyint(3,0) | 是 | -1 | 草稿状态 |

**索引**:

| 索引名 | 类型 | 字段 |
|--------|------|------|
| idx_parties_category_status_created | 普通 | category, status, created_at |
| idx_parties_city | 普通 | city |
| idx_parties_start_end_status | 普通 | start_time, end_time, status |
| idx_parties_user_status_created | 普通 | user_id, status, created_at |
| parties_audit_status | 普通 | audit_status |
| parties_category | 普通 | category |
| parties_created_at | 普通 | created_at |
| parties_start_time | 普通 | start_time |
| parties_status | 普通 | status |
| parties_user_id | 普通 | user_id |
| PRIMARY | 主键 | id |

**外键**:

| 字段 | 引用表 | 引用字段 |
|------|--------|----------|
| user_id | users | id |

---

### party_audits

> 聚会审核记录表

**字段**:

| 字段名 | 类型 | 长度/精度 | 可空 | 默认值 | 注释 |
|--------|------|-----------|------|--------|------|
| id | int(10,0) | 否 | - | - |
| party_id | int(10,0) | 否 | - | 聚会ID |
| audit_status | int(10,0) | 否 | - | 审核状态: 0-待审核, 1-已通过, 2-已拒绝 |
| audit_reason | varchar(500) | 是 | - | 审核原因/备注 |
| auditor_id | int(10,0) | 是 | - | 审核人ID |
| created_at | datetime | 否 | CURRENT_TIMESTAMP | - |

**索引**:

| 索引名 | 类型 | 字段 |
|--------|------|------|
| idx_audit_status | 普通 | audit_status |
| idx_auditor_id | 普通 | auditor_id |
| idx_created_at | 普通 | created_at |
| idx_party_id | 普通 | party_id |
| PRIMARY | 主键 | id |

---

### party_featured

> 聚会推荐表

**字段**:

| 字段名 | 类型 | 长度/精度 | 可空 | 默认值 | 注释 |
|--------|------|-----------|------|--------|------|
| id | int(10,0) | 否 | - | - |
| party_id | int(10,0) | 否 | - | 聚会ID |
| weight | decimal(3,1) | 否 | 1.0 | 推荐权重 |
| start_time | datetime | 是 | - | 开始时间 |
| end_time | datetime | 是 | - | 结束时间 |
| created_at | datetime | 否 | - | - |
| updated_at | datetime | 否 | - | - |

**索引**:

| 索引名 | 类型 | 字段 |
|--------|------|------|
| party_featured_end_time | 普通 | end_time |
| party_featured_party_id | 唯一 | party_id |
| party_featured_start_time | 普通 | start_time |
| party_featured_weight | 普通 | weight |
| party_id | 唯一 | party_id |
| PRIMARY | 主键 | id |

**外键**:

| 字段 | 引用表 | 引用字段 |
|------|--------|----------|
| party_id | parties | id |

---

### party_stats

> 聚会统计表

**字段**:

| 字段名 | 类型 | 长度/精度 | 可空 | 默认值 | 注释 |
|--------|------|-----------|------|--------|------|
| id | int(10,0) | 否 | - | - |
| party_id | int(10,0) | 否 | - | 聚会ID |
| view_count | int(10,0) | 否 | 0 | 浏览次数 |
| favorite_count | int(10,0) | 否 | 0 | 收藏次数 |
| created_at | datetime | 否 | - | - |
| updated_at | datetime | 否 | - | - |

**索引**:

| 索引名 | 类型 | 字段 |
|--------|------|------|
| party_id | 唯一 | party_id |
| party_stats_party_id | 唯一 | party_id |
| PRIMARY | 主键 | id |

**外键**:

| 字段 | 引用表 | 引用字段 |
|------|--------|----------|
| party_id | parties | id |

---

### payments

> 支付表

**字段**:

| 字段名 | 类型 | 长度/精度 | 可空 | 默认值 | 注释 |
|--------|------|-----------|------|--------|------|
| id | int(10,0) | 否 | - | - |
| order_id | int(10,0) | 否 | - | 订单ID |
| user_id | int(10,0) | 否 | - | 用户ID |
| payment_no | varchar(50) | 否 | - | 支付单号 |
| transaction_id | varchar(100) | 是 | - | 第三方交易号 |
| payment_method | varchar(20) | 否 | - | 支付方式：wechat, alipay, wallet |
| amount | decimal(10,2) | 否 | - | 支付金额 |
| status | tinyint(3,0) | 否 | 0 | 状态：0-待支付，1-支付成功，2-支付失败，3-已退款 |
| payment_time | datetime | 是 | - | 支付时间 |
| callback_data | json | 是 | - | 回调数据 |
| created_at | datetime | 否 | - | - |
| updated_at | datetime | 否 | - | - |
| bank_card_id | int(10,0) | 是 | - | 银行卡ID（银行卡支付时使用） |

**索引**:

| 索引名 | 类型 | 字段 |
|--------|------|------|
| idx_payments_bank_card_id | 普通 | bank_card_id |
| idx_payments_order_status_created | 普通 | order_id, status, created_at |
| idx_payments_user_status_created | 普通 | user_id, status, created_at |
| payment_no | 唯一 | payment_no |
| payments_order_id | 普通 | order_id |
| payments_payment_no | 普通 | payment_no |
| payments_status | 普通 | status |
| payments_transaction_id | 普通 | transaction_id |
| payments_user_id | 普通 | user_id |
| PRIMARY | 主键 | id |

**外键**:

| 字段 | 引用表 | 引用字段 |
|------|--------|----------|
| order_id | orders | id |
| user_id | users | id |

---

### permissions

> 权限表

**字段**:

| 字段名 | 类型 | 长度/精度 | 可空 | 默认值 | 注释 |
|--------|------|-----------|------|--------|------|
| id | int(10,0) | 否 | - | - |
| name | varchar(100) | 否 | - | 权限名称 |
| code | varchar(100) | 否 | - | 权限代码 |
| description | varchar(200) | 是 | - | 权限描述 |
| module | varchar(50) | 否 | - | 所属模块 |
| status | tinyint(3,0) | 否 | 1 | 状态：0-禁用，1-正常 |
| created_at | datetime | 否 | - | - |
| updated_at | datetime | 否 | - | - |

**索引**:

| 索引名 | 类型 | 字段 |
|--------|------|------|
| code | 唯一 | code |
| name | 唯一 | name |
| permissions_code | 普通 | code |
| permissions_module | 普通 | module |
| permissions_name | 普通 | name |
| permissions_status | 普通 | status |
| PRIMARY | 主键 | id |

---

### posts

> 动态表

**字段**:

| 字段名 | 类型 | 长度/精度 | 可空 | 默认值 | 注释 |
|--------|------|-----------|------|--------|------|
| id | bigint(20,0) | 否 | - | - |
| user_id | bigint(20,0) | 否 | - | 发布者ID |
| content | text(65535) | 是 | - | 动态内容 |
| images | json | 是 | - | 图片列表JSON数组 |
| party_id | bigint(20,0) | 是 | - | 关联的聚会ID |
| location | json | 是 | - | 位置信息JSON{name, address, latitude, longitude} |
| visibility | enum(7) | 否 | public | 可见性：public-公开，friends-仅好友 |
| like_count | int(10,0) | 否 | 0 | 点赞数 |
| comment_count | int(10,0) | 否 | 0 | 评论数 |
| share_count | int(10,0) | 否 | 0 | 分享数 |
| status | tinyint(3,0) | 否 | 1 | 状态：0-删除，1-正常 |
| created_at | datetime | 是 | CURRENT_TIMESTAMP | - |
| updated_at | datetime | 是 | CURRENT_TIMESTAMP | - |

**索引**:

| 索引名 | 类型 | 字段 |
|--------|------|------|
| idx_created_at | 普通 | created_at |
| idx_party_id | 普通 | party_id |
| idx_status | 普通 | status |
| idx_user_id | 普通 | user_id |
| idx_visibility | 普通 | visibility |
| PRIMARY | 主键 | id |

---

### push_messages

**字段**:

| 字段名 | 类型 | 长度/精度 | 可空 | 默认值 | 注释 |
|--------|------|-----------|------|--------|------|
| id | int(10,0) | 否 | - | - |
| user_id | int(10,0) | 否 | - | - |
| title | varchar(255) | 否 | - | - |
| content | text(65535) | 是 | - | - |
| type | varchar(50) | 是 | - | - |
| is_read | tinyint(3,0) | 是 | 0 | - |
| created_at | timestamp | 是 | CURRENT_TIMESTAMP | - |
| updated_at | timestamp | 是 | CURRENT_TIMESTAMP | - |

**索引**:

| 索引名 | 类型 | 字段 |
|--------|------|------|
| PRIMARY | 主键 | id |

---

### push_settings

**字段**:

| 字段名 | 类型 | 长度/精度 | 可空 | 默认值 | 注释 |
|--------|------|-----------|------|--------|------|
| id | int(10,0) | 否 | - | - |
| user_id | int(10,0) | 否 | - | - |
| party_notification | tinyint(3,0) | 是 | 1 | - |
| order_notification | tinyint(3,0) | 是 | 1 | - |
| message_notification | tinyint(3,0) | 是 | 1 | - |
| system_notification | tinyint(3,0) | 是 | 1 | - |
| marketing_notification | tinyint(3,0) | 是 | 0 | - |
| created_at | timestamp | 是 | CURRENT_TIMESTAMP | - |
| updated_at | timestamp | 是 | CURRENT_TIMESTAMP | - |

**索引**:

| 索引名 | 类型 | 字段 |
|--------|------|------|
| PRIMARY | 主键 | id |
| uk_user_id | 唯一 | user_id |

---

### refunds

> 退款表

**字段**:

| 字段名 | 类型 | 长度/精度 | 可空 | 默认值 | 注释 |
|--------|------|-----------|------|--------|------|
| id | int(10,0) | 否 | - | - |
| order_id | int(10,0) | 否 | - | 订单ID |
| payment_id | int(10,0) | 否 | - | 支付ID |
| user_id | int(10,0) | 否 | - | 用户ID |
| refund_no | varchar(50) | 否 | - | 退款单号 |
| refund_id | varchar(100) | 是 | - | 第三方退款号 |
| amount | decimal(10,2) | 否 | - | 退款金额 |
| reason | varchar(500) | 是 | - | 退款原因 |
| status | tinyint(3,0) | 否 | 0 | 状态：0-待审核，1-审核通过，2-审核拒绝，3-退款成功，4-退款失败 |
| audit_status | tinyint(3,0) | 否 | 0 | 审核状态：0-待审核，1-审核通过，2-审核拒绝 |
| audit_reason | varchar(500) | 是 | - | 审核拒绝原因 |
| refund_time | datetime | 是 | - | 退款时间 |
| created_at | datetime | 否 | - | - |
| updated_at | datetime | 否 | - | - |

**索引**:

| 索引名 | 类型 | 字段 |
|--------|------|------|
| PRIMARY | 主键 | id |
| refund_no | 唯一 | refund_no |
| refunds_audit_status | 普通 | audit_status |
| refunds_order_id | 普通 | order_id |
| refunds_payment_id | 普通 | payment_id |
| refunds_refund_no | 普通 | refund_no |
| refunds_status | 普通 | status |
| refunds_user_id | 普通 | user_id |

**外键**:

| 字段 | 引用表 | 引用字段 |
|------|--------|----------|
| order_id | orders | id |
| payment_id | payments | id |
| user_id | users | id |

---

### roles

> 角色表

**字段**:

| 字段名 | 类型 | 长度/精度 | 可空 | 默认值 | 注释 |
|--------|------|-----------|------|--------|------|
| id | int(10,0) | 否 | - | - |
| name | varchar(50) | 否 | - | 角色名称 |
| description | varchar(200) | 是 | - | 角色描述 |
| permissions | json | 是 | - | 权限列表 |
| status | tinyint(3,0) | 否 | 1 | 状态：0-禁用，1-正常 |
| created_at | datetime | 否 | - | - |
| updated_at | datetime | 否 | - | - |

**索引**:

| 索引名 | 类型 | 字段 |
|--------|------|------|
| name | 唯一 | name |
| PRIMARY | 主键 | id |
| roles_name | 普通 | name |
| roles_status | 普通 | status |

---

### system_configs

> 系统配置表

**字段**:

| 字段名 | 类型 | 长度/精度 | 可空 | 默认值 | 注释 |
|--------|------|-----------|------|--------|------|
| id | int(10,0) | 否 | - | - |
| key | varchar(100) | 否 | - | 配置键 |
| value | text(65535) | 是 | - | 配置值 |
| description | varchar(200) | 是 | - | 配置描述 |
| type | varchar(20) | 否 | string | 类型：string, number, boolean, json |
| status | tinyint(3,0) | 否 | 1 | 状态：0-禁用，1-启用 |
| created_at | datetime | 否 | - | - |
| updated_at | datetime | 否 | - | - |

**索引**:

| 索引名 | 类型 | 字段 |
|--------|------|------|
| key | 唯一 | key |
| PRIMARY | 主键 | id |
| system_configs_key | 普通 | key |
| system_configs_status | 普通 | status |

---

### ticket_types

> 票型表

**字段**:

| 字段名 | 类型 | 长度/精度 | 可空 | 默认值 | 注释 |
|--------|------|-----------|------|--------|------|
| id | int(10,0) | 否 | - | - |
| party_id | int(10,0) | 否 | - | 聚会ID |
| name | varchar(100) | 否 | - | 票型名称 |
| description | text(65535) | 是 | - | 票型描述 |
| type | tinyint(3,0) | 是 | 1 | 票型类型：1-普通,2-早鸟,3-男性,4-女性,5-男性早鸟,6-女性早鸟 |
| price | decimal(10,2) | 否 | - | 价格 |
| original_price | decimal(10,2) | 是 | - | 原价 |
| available_count | int(10,0) | 否 | 0 | 可用数量 |
| sold_count | int(10,0) | 否 | 0 | 已售数量 |
| max_per_user | int(10,0) | 否 | 0 | 每人限购数量，0表示不限 |
| sale_start_time | datetime | 是 | - | 开售时间 |
| sale_end_time | datetime | 是 | - | 停售时间 |
| early_bird_deadline | datetime | 是 | - | 早鸟票截止时间 |
| status | tinyint(3,0) | 否 | 1 | 状态：0-下架，1-上架 |
| sort_order | int(10,0) | 否 | 0 | 排序 |
| created_at | datetime | 否 | - | - |
| updated_at | datetime | 否 | - | - |

**索引**:

| 索引名 | 类型 | 字段 |
|--------|------|------|
| PRIMARY | 主键 | id |
| ticket_types_party_id | 普通 | party_id |
| ticket_types_sort_order | 普通 | sort_order |
| ticket_types_status | 普通 | status |
| ticket_types_type | 普通 | type |

**外键**:

| 字段 | 引用表 | 引用字段 |
|------|--------|----------|
| party_id | parties | id |

---

### tickets

> 票券表

**字段**:

| 字段名 | 类型 | 长度/精度 | 可空 | 默认值 | 注释 |
|--------|------|-----------|------|--------|------|
| id | int(10,0) | 否 | - | - |
| user_id | int(10,0) | 否 | - | 用户ID |
| order_id | int(10,0) | 否 | - | 订单ID |
| ticket_type_id | int(10,0) | 否 | - | 票型ID |
| party_id | int(10,0) | 否 | - | 聚会ID |
| ticket_code | varchar(50) | 否 | - | 票码 |
| qr_code | varchar(500) | 是 | - | 二维码URL |
| status | tinyint(3,0) | 否 | 0 | 状态：0-未使用，1-已使用，2-已过期，3-已退款 |
| used_at | datetime | 是 | - | 使用时间 |
| expires_at | datetime | 是 | - | 过期时间 |
| created_at | datetime | 否 | - | - |
| updated_at | datetime | 否 | - | - |

**索引**:

| 索引名 | 类型 | 字段 |
|--------|------|------|
| PRIMARY | 主键 | id |
| ticket_code | 唯一 | ticket_code |
| tickets_expires_at | 普通 | expires_at |
| tickets_order_id | 普通 | order_id |
| tickets_party_id | 普通 | party_id |
| tickets_status | 普通 | status |
| tickets_ticket_code | 普通 | ticket_code |
| tickets_ticket_type_id | 普通 | ticket_type_id |
| tickets_user_id | 普通 | user_id |

**外键**:

| 字段 | 引用表 | 引用字段 |
|------|--------|----------|
| user_id | users | id |
| order_id | orders | id |
| ticket_type_id | ticket_types | id |
| party_id | parties | id |

---

### users

> 用户表

**字段**:

| 字段名 | 类型 | 长度/精度 | 可空 | 默认值 | 注释 |
|--------|------|-----------|------|--------|------|
| id | int(10,0) | 否 | - | - |
| openid | varchar(100) | 是 | - | 微信OpenID |
| unionid | varchar(100) | 是 | - | 微信UnionID |
| phone | varchar(20) | 是 | - | 手机号 |
| email | varchar(100) | 是 | - | 邮箱 |
| nickname | varchar(50) | 否 | - | 昵称 |
| avatar | varchar(500) | 是 | - | 头像URL |
| gender | tinyint(3,0) | 是 | 0 | 性别：0-未知，1-男，2-女 |
| birthday | datetime | 是 | - | 生日 |
| province | varchar(50) | 是 | - | 省份 |
| city | varchar(50) | 是 | - | 城市 |
| country | varchar(50) | 是 | - | 国家 |
| language | varchar(20) | 是 | zh_CN | 语言 |
| status | tinyint(3,0) | 否 | 1 | 状态：0-禁用，1-正常 |
| is_vip | tinyint(3,0) | 否 | 0 | 是否VIP |
| vip_level | enum(9) | 是 | - | VIP等级：monthly-月卡, quarterly-季卡, yearly-年卡 |
| vip_expires_at | datetime | 是 | - | VIP过期时间 |
| participated_count | int(10,0) | 否 | 0 | 参与聚会次数 |
| created_count | int(10,0) | 否 | 0 | 创建聚会次数 |
| favorite_count | int(10,0) | 否 | 0 | 收藏聚会次数 |
| last_login_at | datetime | 是 | - | 最后登录时间 |
| last_login_ip | varchar(50) | 是 | - | 最后登录IP |
| created_at | datetime | 否 | - | - |
| updated_at | datetime | 否 | - | - |
| bio | varchar(500) | 是 | - | 个人简介 |
| following_count | int(10,0) | 否 | 0 | 关注数 |
| followers_count | int(10,0) | 否 | 0 | 粉丝数 |

**索引**:

| 索引名 | 类型 | 字段 |
|--------|------|------|
| email | 唯一 | email |
| openid | 唯一 | openid |
| phone | 唯一 | phone |
| PRIMARY | 主键 | id |
| unionid | 唯一 | unionid |
| users_email | 普通 | email |
| users_is_vip | 普通 | is_vip |
| users_openid | 普通 | openid |
| users_phone | 普通 | phone |
| users_status | 普通 | status |
| users_unionid | 普通 | unionid |
| users_vip_level | 普通 | vip_level |

---

### vip_memberships

> VIP会员表

**字段**:

| 字段名 | 类型 | 长度/精度 | 可空 | 默认值 | 注释 |
|--------|------|-----------|------|--------|------|
| id | int(10,0) | 否 | - | - |
| user_id | int(10,0) | 否 | - | 用户ID |
| membership_type | varchar(20) | 否 | - | 会员类型：monthly, quarterly, yearly |
| start_date | datetime | 否 | - | 开始日期 |
| end_date | datetime | 否 | - | 结束日期 |
| status | tinyint(3,0) | 否 | 1 | 状态：0-已过期，1-生效中 |
| payment_id | int(10,0) | 是 | - | 支付ID |
| created_at | datetime | 否 | - | - |
| updated_at | datetime | 否 | - | - |

**索引**:

| 索引名 | 类型 | 字段 |
|--------|------|------|
| payment_id | 普通 | payment_id |
| PRIMARY | 主键 | id |
| vip_memberships_end_date | 普通 | end_date |
| vip_memberships_status | 普通 | status |
| vip_memberships_user_id | 普通 | user_id |

**外键**:

| 字段 | 引用表 | 引用字段 |
|------|--------|----------|
| user_id | users | id |
| payment_id | payments | id |

---

### wallet_transactions

> 钱包交易记录表

**字段**:

| 字段名 | 类型 | 长度/精度 | 可空 | 默认值 | 注释 |
|--------|------|-----------|------|--------|------|
| id | int(10,0) | 否 | - | - |
| user_id | int(10,0) | 否 | - | 用户ID |
| wallet_id | int(10,0) | 否 | - | 钱包ID |
| type | enum(8) | 否 | - | 类型：recharge-充值, withdraw-提现, payment-支付, refund-退款, income-收入 |
| amount | decimal(10,2) | 否 | - | 金额 |
| balance | decimal(10,2) | 否 | - | 余额 |
| description | varchar(500) | 是 | - | 描述 |
| related_order_id | int(10,0) | 是 | - | 关联订单ID |
| status | tinyint(3,0) | 否 | 1 | 状态：0-失败，1-成功 |
| created_at | datetime | 否 | - | - |
| updated_at | datetime | 否 | - | - |

**索引**:

| 索引名 | 类型 | 字段 |
|--------|------|------|
| PRIMARY | 主键 | id |
| wallet_transactions_created_at | 普通 | created_at |
| wallet_transactions_related_order_id | 普通 | related_order_id |
| wallet_transactions_type | 普通 | type |
| wallet_transactions_user_id | 普通 | user_id |
| wallet_transactions_wallet_id | 普通 | wallet_id |

**外键**:

| 字段 | 引用表 | 引用字段 |
|------|--------|----------|
| user_id | users | id |
| wallet_id | wallets | id |

---

### wallets

> 钱包表

**字段**:

| 字段名 | 类型 | 长度/精度 | 可空 | 默认值 | 注释 |
|--------|------|-----------|------|--------|------|
| id | int(10,0) | 否 | - | - |
| user_id | int(10,0) | 否 | - | 用户ID |
| balance | decimal(10,2) | 否 | 0.00 | 余额 |
| frozen_balance | decimal(10,2) | 否 | 0.00 | 冻结余额 |
| total_income | decimal(10,2) | 否 | 0.00 | 总收入 |
| total_expense | decimal(10,2) | 否 | 0.00 | 总支出 |
| password | varchar(100) | 是 | - | 支付密码 |
| status | tinyint(3,0) | 否 | 1 | 状态：0-禁用，1-正常 |
| created_at | datetime | 否 | - | - |
| updated_at | datetime | 否 | - | - |

**索引**:

| 索引名 | 类型 | 字段 |
|--------|------|------|
| PRIMARY | 主键 | id |
| user_id | 唯一 | user_id |
| wallets_status | 普通 | status |
| wallets_user_id | 普通 | user_id |

**外键**:

| 字段 | 引用表 | 引用字段 |
|------|--------|----------|
| user_id | users | id |

---

