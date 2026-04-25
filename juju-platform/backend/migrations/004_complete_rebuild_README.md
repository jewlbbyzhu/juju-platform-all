# 数据库重建脚本说明

## 概述

本脚本（`004_complete_rebuild.sql`）按照 `data-models-final.md` 最终设计文档完全重建数据库结构。

## 脚本特点

### 1. 完全重建策略
- 先删除所有表（按外键依赖逆序）
- 然后创建所有表（按外键依赖顺序）
- 确保外键约束正确建立

### 2. 符合最终设计

#### 数据库配置
- 数据库类型：MySQL 8.0+
- 字符集：utf8mb4
- 排序规则：utf8mb4_general_ci
- 存储引擎：InnoDB

#### 19个核心业务模型
1. users - 用户模型
2. wallets - 钱包模型
3. bank_cards - 银行卡模型
4. parties - 聚会模型
5. ticket_types - 票型模型
6. orders - 订单模型
7. order_items - 订单项模型
8. payments - 支付模型
9. refunds - 退款模型
10. tickets - 票券模型
11. wallet_transactions - 钱包交易记录模型
12. favorites - 收藏模型
13. notifications - 通知模型
14. vip_memberships - VIP会员模型
15. admins - 管理员模型
16. roles - 角色模型
17. permissions - 权限模型
18. app_versions - App版本模型
19. system_configs - 系统配置模型

### 3. 数据类型规范
- ID字段：BIGINT UNSIGNED
- 金额字段：DECIMAL(10, 2)
- 数量字段：INT UNSIGNED
- 状态字段：TINYINT
- 时间字段：DATETIME
- JSON字段：JSON

### 4. 外键约束
- ON DELETE CASCADE：级联删除
- ON DELETE RESTRICT：限制删除
- 所有外键都正确建立

### 5. 索引优化
- 主键索引
- 唯一索引
- 普通索引
- 复合索引

### 6. 初始数据
- 3个默认角色
- 18个默认权限
- 11个系统配置

## 与旧脚本的区别

### 003_complete_restructure.sql 的问题
1. 使用存储过程来修改表结构，不够直接
2. 没有完全删除所有表，只是添加/修改列
3. 外键约束可能不完整
4. 索引可能不完整

### 004_complete_rebuild.sql 的改进
1. 完全删除所有表，确保干净重建
2. 按照最终设计文档创建所有表
3. 所有外键约束完整建立
4. 所有索引完整创建
5. 包含初始数据

## 使用方法

### 方法1：使用MySQL命令行
```bash
mysql -h 122.51.255.13 -u hfparty_user -p hfparty_db_new < 004_complete_rebuild.sql
```

### 方法2：使用MySQL客户端
1. 连接到MySQL数据库
2. 选择数据库：`USE hfparty_db_new;`
3. 执行脚本：`source d:\小程序项目\聚聚项目\backend\migrations\004_complete_rebuild.sql`

### 方法3：使用数据库管理工具
1. 打开Navicat/MySQL Workbench等工具
2. 连接到数据库
3. 打开SQL文件并执行

## 验证步骤

### 1. 检查表数量
```sql
SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'hfparty_db_new';
```
应该返回：19

### 2. 检查所有表
```sql
SHOW TABLES;
```
应该显示19个表名

### 3. 检查表结构
```sql
DESCRIBE users;
DESCRIBE parties;
DESCRIBE orders;
-- ... 检查其他表
```

### 4. 检查外键约束
```sql
SELECT
  TABLE_NAME,
  CONSTRAINT_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME
FROM
  INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE
  TABLE_SCHEMA = 'hfparty_db_new'
  AND REFERENCED_TABLE_NAME IS NOT NULL;
```

### 5. 检查初始数据
```sql
SELECT * FROM roles;
SELECT * FROM permissions;
SELECT * FROM system_configs;
```

## 注意事项

### ⚠️ 重要警告
1. **此脚本会删除所有现有数据**，请谨慎执行
2. 执行前务必备份数据库
3. 建议在测试环境先验证

### 备份数据库
```bash
mysqldump -h 122.51.255.13 -u hfparty_user -p hfparty_db_new > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 恢复数据库
```bash
mysql -h 122.51.255.13 -u hfparty_user -p hfparty_db_new < backup_20260115_120000.sql
```

## 脚本执行时间

- 删除表：约1-2秒
- 创建表：约3-5秒
- 插入初始数据：约1秒
- 总计：约5-8秒

## 常见问题

### Q1: 执行时报错"Foreign key constraint is incorrectly formed"
A: 确保表的创建顺序正确，先创建被引用的表，再创建引用表

### Q2: 执行时报错"Table doesn't exist"
A: 确保所有表都正确删除，重新执行脚本

### Q3: 外键约束没有生效
A: 检查表的数据类型是否一致，特别是外键字段和被引用字段

### Q4: 索引没有创建成功
A: 检查索引名称是否重复，确保索引名称唯一

## 后续步骤

1. 执行重建脚本
2. 验证表结构和数据
3. 更新Sequelize模型定义
4. 测试API接口
5. 部署到生产环境

## 相关文件

- 最终设计文档：`.kiro/specs/backend-optimization/data-models-final.md`
- 重建脚本：`backend/migrations/004_complete_rebuild.sql`
- 执行说明：`backend/migrations/004_complete_rebuild_readme.sql`
- 旧脚本：`backend/migrations/003_complete_restructure.sql`

## 版本历史

- v4.0.0 (2026-01-15): 完全重建脚本，符合最终设计
- v3.0.0 (2026-01-15): 重构脚本，使用存储过程
- v2.0.0: 初始版本

## 联系方式

如有问题，请联系开发团队。
