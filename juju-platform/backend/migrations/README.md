# 数据库迁移执行指南

## 执行时间
- **日期**: 2026-01-15
- **数据库**: hfparty_db_new
- **设计文档**: data-models-final.md

---

## 迁移脚本说明

### 1. 000_backup_database.sql - 数据库备份脚本

**功能**: 在执行迁移前备份现有数据库

**备份的表**:
- users
- parties
- ticket_type
- orders
- tickets
- order_items
- favorites
- transactions
- party_participants
- party_settlements
- vip_applications

**备份表命名**: `{table_name}_backup`

**执行方式**:
```bash
mysql -u username -p database_name < migrations/000_backup_database.sql
```

### 2. 003_complete_restructure.sql - 完全重构数据库结构

**功能**: 完全重构数据库结构，按照 data-models-final.md 设计文档

**主要操作**:
1. 创建存储过程（3个）
   - `add_column_if_not_exists` - 安全添加列
   - `modify_column_if_exists` - 安全修改列
   - `drop_column_if_exists` - 安全删除列

2. 创建缺失的表（11个）
   - wallets
   - bank_cards
   - payments
   - refunds
   - wallet_transactions
   - vip_memberships
   - notifications
   - admins
   - roles
   - permissions
   - app_versions
   - system_configs

3. 重构现有表结构（4个）
   - users - 添加缺失字段，删除不应该存在的字段
   - parties - 完全重构
   - ticket_type - 完全重构为 ticket_types
   - orders - 添加缺失字段，删除不应该存在的字段
   - tickets - 添加缺失字段，删除不应该存在的字段
   - favorites - 修改字段属性

4. 添加外键约束（所有表）
   - 为所有表添加外键约束

5. 添加索引（所有表）
   - 为所有表添加索引

6. 插入初始数据
   - 3 个默认角色
   - 18 个默认权限
   - 11 个默认系统配置

7. 清理存储过程
   - 删除所有临时存储过程

**执行方式**:
```bash
mysql -u username -p database_name < migrations/003_complete_restructure.sql
```

---

## 执行步骤

### 步骤 1: 备份数据库

```bash
# 连接到数据库
mysql -u username -p database_name

# 执行备份脚本
source migrations/000_backup_database.sql

# 或者直接执行
mysql -u username -p database_name < migrations/000_backup_database.sql
```

**验证备份**:
```sql
-- 检查备份表是否存在
SHOW TABLES LIKE '%_backup';

-- 验证备份表数据
SELECT COUNT(*) FROM users_backup;
SELECT COUNT(*) FROM parties_backup;
SELECT COUNT(*) FROM orders_backup;
```

### 步骤 2: 执行重构迁移

```bash
# 连接到数据库
mysql -u username -p database_name

# 执行重构迁移脚本
source migrations/003_complete_restructure.sql

# 或者直接执行
mysql -u username -p database_name < migrations/003_complete_restructure.sql
```

**注意事项**:
- 迁移脚本会自动处理字段/索引/外键的添加和删除
- 如果某个操作失败，后续操作会继续执行
- 建议在测试环境先执行

### 步骤 3: 验证迁移结果

```sql
-- 检查所有表是否存在
SHOW TABLES;

-- 检查 users 表结构
DESCRIBE users;

-- 检查 parties 表结构
DESCRIBE parties;

-- 检查 ticket_types 表结构
DESCRIBE ticket_types;

-- 检查 orders 表结构
DESCRIBE orders;

-- 检查 tickets 表结构
DESCRIBE tickets;

-- 检查外键约束
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    REFERENCED_TABLE_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
AND REFERENCED_TABLE_NAME IS NOT NULL;

-- 检查初始数据
SELECT COUNT(*) AS roles_count FROM roles;
SELECT COUNT(*) AS permissions_count FROM permissions;
SELECT COUNT(*) AS system_configs_count FROM system_configs;
```

---

## 数据迁移策略

### 1. users 表

**保留数据**:
- 所有现有用户数据

**新增字段默认值**:
- unionid: NULL
- phone: NULL
- email: NULL
- province: NULL
- city: NULL
- country: NULL
- language: 'zh_CN'
- status: 1
- vip_expires_at: NULL
- last_login_ip: NULL

**删除字段**:
- role (ENUM 类型）
- region
- partyCount
- rating

**修改字段**:
- avatar: VARCHAR(500)
- is_vip: BOOLEAN

### 2. parties 表

**保留数据**:
- 所有现有聚会数据

**字段映射**:
- organizer_id -> user_id（需要手动映射）

**删除字段**:
- organizer_id
- vip_id
- ticket_type_id
- image1_path, image2_path, image3_path, image4_path, image5_path
- province
- city
- earlybird_deadline
- registration_deadline
- gender_restriction
- min_age
- max_age

**新增字段默认值**:
- description: NULL
- cover_image: NULL
- images: NULL
- location: 需要从 province + city 生成
- address: 需要从现有 address 字段生成
- min_price: 0.00
- max_price: 0.00
- audit_status: 0
- audit_reason: NULL
- view_count: 0
- favorite_count: 0
- is_featured: FALSE
- is_hot: FALSE

**修改字段**:
- title: VARCHAR(200)
- address: VARCHAR(500)
- category: VARCHAR(50)
- status: TINYINT

### 3. ticket_type 表

**完全重构**:
- 删除旧表
- 创建新表 ticket_types

**数据迁移**:
- 需要手动迁移现有数据到新结构

### 4. orders 表

**保留数据**:
- 所有现有订单数据

**删除字段**:
- refund_id
- order_type
- order_name
- quantity
- unit_price
- amount
- registration_at
- paid_at
- cancelled_at

**新增字段默认值**:
- total_amount: 需要从现有字段计算
- discount_amount: 0.00
- final_amount: 需要从现有字段计算
- payment_status: 0
- payment_time: NULL
- cancel_reason: NULL
- cancel_time: NULL
- remark: NULL
- created_at: CURRENT_TIMESTAMP
- updated_at: CURRENT_TIMESTAMP

**修改字段**:
- status: TINYINT

### 5. tickets 表

**保留数据**:
- 所有现有票券数据

**字段映射**:
- ticket_no -> ticket_code

**删除字段**:
- ticket_no
- code

**新增字段默认值**:
- ticket_type_id: 需要从现有数据映射
- ticket_code: 需要从 ticket_no 映射
- qr_code: NULL
- expires_at: NULL
- created_at: CURRENT_TIMESTAMP
- updated_at: CURRENT_TIMESTAMP

**修改字段**:
- qr_code: VARCHAR(500)
- status: TINYINT

---

## 回滚方案

### 回滚步骤

如果迁移失败，可以按以下步骤回滚：

1. **恢复备份表**:
```sql
-- 删除现有表
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS parties;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS tickets;

-- 恢复备份表
RENAME TABLE users_backup TO users;
RENAME TABLE parties_backup TO parties;
RENAME TABLE orders_backup TO orders;
RENAME TABLE tickets_backup TO tickets;
```

2. **删除新创建的表**:
```sql
DROP TABLE IF EXISTS wallets;
DROP TABLE IF EXISTS bank_cards;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS refunds;
DROP TABLE IF EXISTS wallet_transactions;
DROP TABLE IF EXISTS vip_memberships;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS admins;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS app_versions;
DROP TABLE IF EXISTS system_configs;
DROP TABLE IF EXISTS ticket_types;
```

---

## 注意事项

### 1. 数据备份
- ⚠️ **必须先备份数据库**
- 建议使用 mysqldump 完整备份
- 建议在测试环境先执行

### 2. 数据迁移
- ⚠️ **需要手动数据迁移**
- parties 表的 organizer_id 需要映射到 user_id
- orders 表的金额字段需要重新计算
- tickets 表的 ticket_no 需要映射到 ticket_code

### 3. 执行时间
- ⚠️ **预计执行时间较长**
- 建议在低峰期执行
- 建议分批次执行

### 4. 错误处理
- ⚠️ **某些错误可以忽略**
- 存储过程删除时的错误可以忽略
- 表已存在的错误可以忽略
- 索引重复的错误可以忽略

### 5. 验证
- ⚠️ **必须验证迁移结果**
- 检查所有表是否存在
- 检查表结构是否正确
- 检查外键约束是否正确
- 检查初始数据是否正确

---

## 执行命令

### 完整执行流程

```bash
# 1. 备份数据库
mysqldump -u username -p database_name > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. 执行备份脚本
mysql -u username -p database_name < migrations/000_backup_database.sql

# 3. 验证备份
mysql -u username -p database_name -e "SHOW TABLES LIKE '%_backup';"

# 4. 执行重构迁移
mysql -u username -p database_name < migrations/003_complete_restructure.sql

# 5. 验证迁移结果
mysql -u username -p database_name -e "SHOW TABLES;"

# 6. 检查表结构
mysql -u username -p database_name -e "DESCRIBE users;"
mysql -u username -p database_name -e "DESCRIBE parties;"
mysql -u username -p database_name -e "DESCRIBE ticket_types;"
mysql -u username -p database_name -e "DESCRIBE orders;"
mysql -u username -p database_name -e "DESCRIBE tickets;"
```

---

## 总结

### 迁移脚本
- ✅ 000_backup_database.sql - 数据库备份脚本
- ✅ 003_complete_restructure.sql - 完全重构数据库结构

### 主要操作
1. ✅ 创建存储过程（3个）
2. ✅ 创建缺失的表（11个）
3. ✅ 重构现有表结构（4个）
4. ✅ 添加外键约束（所有表）
5. ✅ 添加索引（所有表）
6. ✅ 插入初始数据
7. ✅ 清理存储过程

### 执行建议
1. ⚠️ 必须先备份数据库
2. ⚠️ 建议在测试环境先执行
3. ⚠️ 需要手动数据迁移
4. ⚠️ 必须验证迁移结果
5. ⚠️ 准备回滚方案

### 预期结果
- ✅ 数据库结构完全符合 data-models-final.md 设计文档
- ✅ 所有表、字段、索引、外键约束都正确
- ✅ 初始数据已插入
- ✅ 数据库可以正常使用
