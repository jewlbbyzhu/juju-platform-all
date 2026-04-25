require('dotenv').config({ path: '.env.development' });
const { sequelize } = require('../src/config/database');

async function migrate() {
  try {
    console.log('Starting database migration...');

    await sequelize.transaction(async (t) => {
      console.log('Step 1: Migrating users table...');
      await sequelize.query(`
        ALTER TABLE users
          ADD COLUMN IF NOT EXISTS unionid VARCHAR(100) UNIQUE COMMENT '微信UnionID',
          ADD COLUMN IF NOT EXISTS phone VARCHAR(20) UNIQUE COMMENT '手机号',
          ADD COLUMN IF NOT EXISTS email VARCHAR(100) UNIQUE COMMENT '邮箱',
          ADD COLUMN IF NOT EXISTS province VARCHAR(50) COMMENT '省份',
          ADD COLUMN IF NOT EXISTS city VARCHAR(50) COMMENT '城市',
          ADD COLUMN IF NOT EXISTS country VARCHAR(50) COMMENT '国家',
          ADD COLUMN IF NOT EXISTS language VARCHAR(20) DEFAULT 'zh_CN' COMMENT '语言',
          ADD COLUMN IF NOT EXISTS status TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-正常',
          ADD COLUMN IF NOT EXISTS last_login_ip VARCHAR(50) COMMENT '最后登录IP',
          MODIFY COLUMN gender TINYINT DEFAULT 0 COMMENT '性别：0-未知，1-男，2-女',
          DROP COLUMN IF EXISTS is_vip,
          DROP COLUMN IF EXISTS vip_expires_at,
          DROP COLUMN IF EXISTS role,
          DROP COLUMN IF EXISTS region,
          DROP COLUMN IF EXISTS partyCount,
          DROP COLUMN IF EXISTS rating
      `, { transaction: t });

      console.log('Step 2: Migrating parties table...');
      await sequelize.query(`
        ALTER TABLE parties
          ADD COLUMN IF NOT EXISTS user_id BIGINT UNSIGNED NOT NULL COMMENT '创建者ID',
          ADD COLUMN IF NOT EXISTS cover_image VARCHAR(500) COMMENT '封面图片URL',
          ADD COLUMN IF NOT EXISTS images JSON COMMENT '图片列表',
          ADD COLUMN IF NOT EXISTS category VARCHAR(50) NOT NULL COMMENT '分类',
          ADD COLUMN IF NOT EXISTS audit_status TINYINT DEFAULT 0 COMMENT '审核状态：0-待审核，1-审核通过，2-审核拒绝',
          ADD COLUMN IF NOT EXISTS audit_reason VARCHAR(500) COMMENT '审核拒绝原因',
          MODIFY COLUMN status TINYINT DEFAULT 0 COMMENT '状态：0-待审核，1-已发布，2-进行中，3-已结束，4-已取消',
          MODIFY COLUMN max_participants INT DEFAULT 0 COMMENT '最大参与人数',
          MODIFY COLUMN current_participants INT DEFAULT 0 COMMENT '当前参与人数',
          DROP COLUMN IF EXISTS min_price,
          DROP COLUMN IF EXISTS max_price,
          DROP COLUMN IF EXISTS service_fee,
          DROP COLUMN IF EXISTS view_count,
          DROP COLUMN IF EXISTS favorite_count,
          DROP COLUMN IF EXISTS is_featured,
          DROP COLUMN IF EXISTS is_hot,
          DROP COLUMN IF EXISTS organizer_id,
          DROP COLUMN IF EXISTS vip_id,
          DROP COLUMN IF EXISTS ticket_type_id,
          DROP COLUMN IF EXISTS image1_path,
          DROP COLUMN IF EXISTS image2_path,
          DROP COLUMN IF EXISTS image3_path,
          DROP COLUMN IF EXISTS image4_path,
          DROP COLUMN IF EXISTS image5_path,
          DROP COLUMN IF EXISTS earlybird_deadline,
          DROP COLUMN IF EXISTS registration_deadline,
          DROP COLUMN IF EXISTS gender_restriction,
          DROP COLUMN IF EXISTS min_age,
          DROP COLUMN IF EXISTS max_age,
          DROP COLUMN IF EXISTS tags
      `, { transaction: t });

      console.log('Step 3: Migrating ticket_type table...');
      await sequelize.query(`
        ALTER TABLE ticket_type
        ADD COLUMN IF NOT EXISTS name VARCHAR(100) NOT NULL COMMENT '票型名称',
        ADD COLUMN IF NOT EXISTS description TEXT COMMENT '票型描述',
        ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) NOT NULL COMMENT '价格',
        ADD COLUMN IF NOT EXISTS original_price DECIMAL(10,2) COMMENT '原价',
        ADD COLUMN IF NOT EXISTS quantity INT DEFAULT 0 COMMENT '数量',
        ADD COLUMN IF NOT EXISTS sold_quantity INT DEFAULT 0 COMMENT '已售数量',
        ADD COLUMN IF NOT EXISTS max_per_user INT DEFAULT 0 COMMENT '每人限购数量，0表示不限',
        ADD COLUMN IF NOT EXISTS sale_start_time DATETIME COMMENT '开售时间',
        ADD COLUMN IF NOT EXISTS sale_end_time DATETIME COMMENT '停售时间',
        ADD COLUMN IF NOT EXISTS status TINYINT DEFAULT 1 COMMENT '状态：0-下架，1-上架',
        ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0 COMMENT '排序',
        ADD COLUMN IF NOT EXISTS created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN IF NOT EXISTS updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        DROP COLUMN IF EXISTS ticket_type,
        DROP COLUMN IF EXISTS normal_ticket,
        DROP COLUMN IF EXISTS man_ticket,
        DROP COLUMN IF EXISTS woman_ticket,
        DROP COLUMN IF EXISTS early_ticket,
        DROP COLUMN IF EXISTS early_man,
        DROP COLUMN IF EXISTS early_woman
      `, { transaction: t });

      console.log('Step 4: Migrating tickets table...');
      await sequelize.query(`
        ALTER TABLE tickets
        ADD COLUMN IF NOT EXISTS ticket_type_id BIGINT UNSIGNED NOT NULL COMMENT '票型ID',
        ADD COLUMN IF NOT EXISTS ticket_code VARCHAR(50) NOT NULL UNIQUE COMMENT '票码',
        ADD COLUMN IF NOT EXISTS expires_at DATETIME COMMENT '过期时间',
        MODIFY COLUMN status TINYINT DEFAULT 0 COMMENT '状态：0-未使用，1-已使用，2-已过期，3-已退款',
        MODIFY COLUMN used_at DATETIME COMMENT '使用时间',
        DROP COLUMN IF EXISTS ticket_no,
        DROP COLUMN IF EXISTS code
      `, { transaction: t });

      console.log('Step 5: Migrating orders table...');
      await sequelize.query(`
        ALTER TABLE orders
        ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2) NOT NULL COMMENT '总金额',
        ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0 COMMENT '优惠金额',
        ADD COLUMN IF NOT EXISTS final_amount DECIMAL(10,2) NOT NULL COMMENT '实付金额',
        ADD COLUMN IF NOT EXISTS payment_status TINYINT DEFAULT 0 COMMENT '支付状态：0-待支付，1-已支付，2-已取消，3-已退款',
        ADD COLUMN IF NOT EXISTS payment_time DATETIME COMMENT '支付时间',
        ADD COLUMN IF NOT EXISTS status TINYINT DEFAULT 0 COMMENT '订单状态：0-待支付，1-已支付，2-已完成，3-已取消，4-已退款',
        ADD COLUMN IF NOT EXISTS cancel_reason VARCHAR(500) COMMENT '取消原因',
        ADD COLUMN IF NOT EXISTS cancel_time DATETIME COMMENT '取消时间',
        ADD COLUMN IF NOT EXISTS remark VARCHAR(500) COMMENT '备注',
        ADD COLUMN IF NOT EXISTS created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN IF NOT EXISTS updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        DROP COLUMN IF EXISTS order_type,
        DROP COLUMN IF EXISTS order_name,
        DROP COLUMN IF EXISTS quantity,
        DROP COLUMN IF EXISTS unit_price,
        DROP COLUMN IF EXISTS registration_at,
        DROP COLUMN IF EXISTS paid_at,
        DROP COLUMN IF EXISTS cancelled_at
      `, { transaction: t });

      console.log('Step 6: Migrating refunds table...');
      await sequelize.query(`
        ALTER TABLE refunds
        ADD COLUMN IF NOT EXISTS payment_id BIGINT UNSIGNED NOT NULL COMMENT '支付ID',
        ADD COLUMN IF NOT EXISTS refund_id VARCHAR(100) COMMENT '第三方退款号',
        ADD COLUMN IF NOT EXISTS reason VARCHAR(500) COMMENT '退款原因',
        ADD COLUMN IF NOT EXISTS status TINYINT DEFAULT 0 COMMENT '状态：0-待审核，1-审核通过，2-审核拒绝，3-退款成功，4-退款失败',
        ADD COLUMN IF NOT EXISTS audit_status TINYINT DEFAULT 0 COMMENT '审核状态：0-待审核，1-审核通过，2-审核拒绝',
        ADD COLUMN IF NOT EXISTS audit_reason VARCHAR(500) COMMENT '审核拒绝原因',
        ADD COLUMN IF NOT EXISTS refund_time DATETIME COMMENT '退款时间',
        ADD COLUMN IF NOT EXISTS created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN IF NOT EXISTS updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        DROP COLUMN IF EXISTS refund_amount
      `, { transaction: t });

      console.log('Step 7: Migrating wallet table...');
      await sequelize.query(`
        ALTER TABLE wallet
        ADD COLUMN IF NOT EXISTS password VARCHAR(100) COMMENT '支付密码',
        ADD COLUMN IF NOT EXISTS status TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-正常',
        ADD COLUMN IF NOT EXISTS created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN IF NOT EXISTS updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        MODIFY COLUMN balance DECIMAL(10,2) DEFAULT 0 COMMENT '余额',
        MODIFY COLUMN frozen_balance DECIMAL(10,2) DEFAULT 0 COMMENT '冻结余额',
        MODIFY COLUMN total_income DECIMAL(10,2) DEFAULT 0 COMMENT '总收入',
        MODIFY COLUMN total_expense DECIMAL(10,2) DEFAULT 0 COMMENT '总支出',
        DROP COLUMN IF EXISTS has_bank_card,
        DROP COLUMN IF EXISTS card_count
      `, { transaction: t });

      console.log('Step 8: Migrating transactions table...');
      await sequelize.query(`
        ALTER TABLE transactions
        ADD COLUMN IF NOT EXISTS wallet_id BIGINT UNSIGNED NOT NULL COMMENT '钱包ID',
        ADD COLUMN IF NOT EXISTS balance_before DECIMAL(10,2) NOT NULL COMMENT '交易前余额',
        ADD COLUMN IF NOT EXISTS balance_after DECIMAL(10,2) NOT NULL COMMENT '交易后余额',
        ADD COLUMN IF NOT EXISTS transaction_type VARCHAR(50) NOT NULL COMMENT '交易类型：recharge, refund, payment, withdrawal, etc.',
        ADD COLUMN IF NOT EXISTS related_id BIGINT UNSIGNED COMMENT '关联ID（订单ID、退款ID等）',
        ADD COLUMN IF NOT EXISTS status TINYINT DEFAULT 1 COMMENT '状态：0-失败，1-成功',
        ADD COLUMN IF NOT EXISTS created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN IF NOT EXISTS updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        MODIFY COLUMN type VARCHAR(20) NOT NULL COMMENT '类型：income, expense',
        MODIFY COLUMN amount DECIMAL(10,2) NOT NULL COMMENT '金额',
        DROP COLUMN IF EXISTS category,
        DROP COLUMN IF EXISTS title
      `, { transaction: t });

      console.log('Step 9: Migrating bank_cards table...');
      await sequelize.query(`
        ALTER TABLE bank_cards
        ADD COLUMN IF NOT EXISTS card_number VARCHAR(50) NOT NULL COMMENT '卡号（加密存储）',
        ADD COLUMN IF NOT EXISTS card_holder VARCHAR(50) NOT NULL COMMENT '持卡人姓名',
        ADD COLUMN IF NOT EXISTS card_type VARCHAR(20) NOT NULL COMMENT '卡类型：debit, credit',
        ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT FALSE COMMENT '是否默认',
        ADD COLUMN IF NOT EXISTS status TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-正常',
        ADD COLUMN IF NOT EXISTS created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN IF NOT EXISTS updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        DROP COLUMN IF EXISTS card_no,
        DROP COLUMN IF EXISTS real_name,
        DROP COLUMN IF EXISTS phone,
        DROP COLUMN IF EXISTS id_card
      `, { transaction: t });

      console.log('Step 10: Migrating favorites table...');
      await sequelize.query(`
        ALTER TABLE favorites
        ADD COLUMN IF NOT EXISTS created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN IF NOT EXISTS updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      `, { transaction: t });

      console.log('Step 11: Creating new tables...');

      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS party_stats (
          id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          party_id BIGINT UNSIGNED NOT NULL UNIQUE COMMENT '聚会ID',
          view_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '浏览次数',
          favorite_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '收藏次数',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_party_id (party_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='聚会统计表'
      `, { transaction: t });

      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS party_featured (
          id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          party_id BIGINT UNSIGNED NOT NULL UNIQUE COMMENT '聚会ID',
          weight DECIMAL(3,1) NOT NULL DEFAULT 1.0 COMMENT '推荐权重',
          start_time DATE NULL COMMENT '开始时间',
          end_time DATE NULL COMMENT '结束时间',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_party_id (party_id),
          INDEX idx_start_time (start_time),
          INDEX idx_end_time (end_time),
          INDEX idx_weight (weight)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='聚会推荐表'
      `, { transaction: t });

      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS order_items (
          id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          order_id BIGINT UNSIGNED NOT NULL COMMENT '订单ID',
          ticket_type_id BIGINT UNSIGNED NOT NULL COMMENT '票型ID',
          price DECIMAL(10,2) NOT NULL COMMENT '单价',
          quantity INT NOT NULL COMMENT '数量',
          total_amount DECIMAL(10,2) NOT NULL COMMENT '小计',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_order_id (order_id),
          INDEX idx_ticket_type_id (ticket_type_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单项表'
      `, { transaction: t });

      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS payments (
          id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          order_id BIGINT UNSIGNED NOT NULL COMMENT '订单ID',
          user_id BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
          payment_no VARCHAR(50) NOT NULL UNIQUE COMMENT '支付单号',
          transaction_id VARCHAR(100) COMMENT '第三方交易号',
          payment_method VARCHAR(20) NOT NULL COMMENT '支付方式：wechat, alipay, wallet',
          amount DECIMAL(10,2) NOT NULL COMMENT '支付金额',
          status TINYINT DEFAULT 0 COMMENT '状态：0-待支付，1-支付成功，2-支付失败，3-已退款',
          payment_time DATETIME COMMENT '支付时间',
          callback_data JSON COMMENT '回调数据',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_order_id (order_id),
          INDEX idx_user_id (user_id),
          INDEX idx_payment_no (payment_no),
          INDEX idx_transaction_id (transaction_id),
          INDEX idx_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='支付表'
      `, { transaction: t });

      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS notifications (
          id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          user_id BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
          type VARCHAR(50) NOT NULL COMMENT '类型：order, payment, refund, system, etc.',
          title VARCHAR(200) NOT NULL COMMENT '标题',
          content TEXT COMMENT '内容',
          data JSON COMMENT '附加数据',
          is_read BOOLEAN DEFAULT FALSE COMMENT '是否已读',
          read_at DATETIME COMMENT '阅读时间',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_user_id (user_id),
          INDEX idx_type (type),
          INDEX idx_is_read (is_read),
          INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='通知表'
      `, { transaction: t });

      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS vip_memberships (
          id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          user_id BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
          membership_type VARCHAR(20) NOT NULL COMMENT '会员类型：monthly, quarterly, yearly',
          start_date DATE NOT NULL COMMENT '开始日期',
          end_date DATE NOT NULL COMMENT '结束日期',
          status TINYINT DEFAULT 1 COMMENT '状态：0-已过期，1-生效中',
          payment_id BIGINT UNSIGNED COMMENT '支付ID',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_user_id (user_id),
          INDEX idx_status (status),
          INDEX idx_end_date (end_date)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='VIP会员表'
      `, { transaction: t });

      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS admins (
          id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
          password VARCHAR(100) NOT NULL COMMENT '密码（加密）',
          real_name VARCHAR(50) COMMENT '真实姓名',
          phone VARCHAR(20) COMMENT '手机号',
          email VARCHAR(100) COMMENT '邮箱',
          avatar VARCHAR(500) COMMENT '头像URL',
          role_id BIGINT UNSIGNED NOT NULL COMMENT '角色ID',
          status TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-正常',
          last_login_at DATETIME COMMENT '最后登录时间',
          last_login_ip VARCHAR(50) COMMENT '最后登录IP',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_username (username),
          INDEX idx_role_id (role_id),
          INDEX idx_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员表'
      `, { transaction: t });

      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS roles (
          id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(50) NOT NULL UNIQUE COMMENT '角色名称',
          description VARCHAR(200) COMMENT '角色描述',
          permissions JSON COMMENT '权限列表',
          status TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-正常',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_name (name),
          INDEX idx_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色表'
      `, { transaction: t });

      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS permissions (
          id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL UNIQUE COMMENT '权限名称',
          code VARCHAR(100) NOT NULL UNIQUE COMMENT '权限代码',
          description VARCHAR(200) COMMENT '权限描述',
          module VARCHAR(50) NOT NULL COMMENT '所属模块',
          status TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-正常',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_name (name),
          INDEX idx_code (code),
          INDEX idx_module (module),
          INDEX idx_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='权限表'
      `, { transaction: t });

      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS app_versions (
          id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          platform VARCHAR(20) NOT NULL COMMENT '平台：ios, android',
          version VARCHAR(20) NOT NULL COMMENT '版本号',
          version_code INT NOT NULL COMMENT '版本代码',
          download_url VARCHAR(500) NOT NULL COMMENT '下载URL',
          file_size BIGINT COMMENT '文件大小',
          update_type VARCHAR(20) DEFAULT 'optional' COMMENT '更新类型：optional, force',
          description TEXT COMMENT '更新说明',
          status TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_platform (platform),
          INDEX idx_version_code (version_code),
          INDEX idx_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='App版本表'
      `, { transaction: t });

      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS system_configs (
          id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          key VARCHAR(100) NOT NULL UNIQUE COMMENT '配置键',
          value TEXT COMMENT '配置值',
          description VARCHAR(200) COMMENT '配置描述',
          type VARCHAR(20) DEFAULT 'string' COMMENT '类型：string, number, boolean, json',
          status TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_key (key),
          INDEX idx_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统配置表'
      `, { transaction: t });

      console.log('Step 12: Dropping deprecated tables...');
      await sequelize.query(`DROP TABLE IF EXISTS vip_applications`, { transaction: t });
      await sequelize.query(`DROP TABLE IF EXISTS party_participants`, { transaction: t });
      await sequelize.query(`DROP TABLE IF EXISTS party_settlements`, { transaction: t });
    });

    console.log('Database migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
