const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.development') });
const { sequelize } = require('../src/config/database');
const logger = require('../src/utils/logger');

async function migrate() {
  try {
    console.log('开始迁移WalletTransaction表结构...');

    await sequelize.query(`
      ALTER TABLE wallet_transactions
      CHANGE COLUMN type type ENUM('recharge', 'withdraw', 'payment', 'refund', 'income') NOT NULL COMMENT '类型：recharge-充值, withdraw-提现, payment-支付, refund-退款, income-收入'
    `);
    console.log('✓ 更新type字段为ENUM类型');

    const [balanceBeforeColumns] = await sequelize.query('SHOW COLUMNS FROM wallet_transactions LIKE "balance_before"');
    if (balanceBeforeColumns.length > 0) {
      await sequelize.query(`
        ALTER TABLE wallet_transactions
          DROP COLUMN balance_before
      `);
      console.log('✓ 删除balance_before字段');
    } else {
      console.log('⚠ balance_before字段不存在,跳过');
    }

    const [balanceAfterColumns] = await sequelize.query('SHOW COLUMNS FROM wallet_transactions LIKE "balance_after"');
    if (balanceAfterColumns.length > 0) {
      await sequelize.query(`
        ALTER TABLE wallet_transactions
          DROP COLUMN balance_after
      `);
      console.log('✓ 删除balance_after字段');
    } else {
      console.log('⚠ balance_after字段不存在,跳过');
    }

    const [balanceColumns] = await sequelize.query('SHOW COLUMNS FROM wallet_transactions LIKE "balance"');
    if (balanceColumns.length === 0) {
      await sequelize.query(`
        ALTER TABLE wallet_transactions
          ADD COLUMN balance DECIMAL(10, 2) NOT NULL COMMENT '余额' AFTER amount
      `);
      console.log('✓ 添加balance字段');
    } else {
      console.log('⚠ balance字段已存在,跳过');
    }

    const [transactionTypeColumns] = await sequelize.query('SHOW COLUMNS FROM wallet_transactions LIKE "transaction_type"');
    if (transactionTypeColumns.length > 0) {
      await sequelize.query(`
        ALTER TABLE wallet_transactions
          DROP COLUMN transaction_type
      `);
      console.log('✓ 删除transaction_type字段');
    } else {
      console.log('⚠ transaction_type字段不存在,跳过');
    }

    const [relatedIdColumns] = await sequelize.query('SHOW COLUMNS FROM wallet_transactions LIKE "related_order_id"');
    if (relatedIdColumns.length === 0) {
      await sequelize.query(`
        ALTER TABLE wallet_transactions
          CHANGE COLUMN related_id related_order_id INT NULL COMMENT '关联订单ID'
      `);
      console.log('✓ 重命名related_id为related_order_id');
    } else {
      console.log('⚠ related_order_id字段已存在,跳过');
    }

    const [transactionTypeIndexes] = await sequelize.query('SHOW INDEX FROM wallet_transactions WHERE Key_name = "idx_transaction_type"');
    if (transactionTypeIndexes.length > 0) {
      await sequelize.query(`
        ALTER TABLE wallet_transactions
          DROP INDEX idx_transaction_type
      `);
      console.log('✓ 删除transaction_type索引');
    } else {
      console.log('⚠ idx_transaction_type索引不存在,跳过');
    }

    const [relatedOrderIdIndexes] = await sequelize.query('SHOW INDEX FROM wallet_transactions WHERE Key_name = "idx_related_order_id"');
    if (relatedOrderIdIndexes.length === 0) {
      await sequelize.query(`
        ALTER TABLE wallet_transactions
          ADD INDEX idx_related_order_id (related_order_id)
      `);
      console.log('✓ 添加related_order_id字段索引');
    } else {
      console.log('⚠ idx_related_order_id索引已存在,跳过');
    }

    console.log('✓ WalletTransaction表结构迁移完成!');
  } catch (error) {
    console.error('✗ 迁移失败:', error.message);
    throw error;
  }
}

async function rollback() {
  try {
    console.log('开始回滚WalletTransaction表结构...');

    await sequelize.query(`
      ALTER TABLE wallet_transactions
      CHANGE COLUMN type type VARCHAR(20) NOT NULL COMMENT '类型：income, expense'
    `);
    console.log('✓ 回退type字段为VARCHAR');

    const [balanceBeforeColumns] = await sequelize.query('SHOW COLUMNS FROM wallet_transactions LIKE "balance_before"');
    if (balanceBeforeColumns.length === 0) {
      await sequelize.query(`
        ALTER TABLE wallet_transactions
          ADD COLUMN balance_before DECIMAL(10, 2) NOT NULL COMMENT '交易前余额' AFTER amount
      `);
      console.log('✓ 添加balance_before字段');
    } else {
      console.log('⚠ balance_before字段已存在,跳过');
    }

    const [balanceAfterColumns] = await sequelize.query('SHOW COLUMNS FROM wallet_transactions LIKE "balance_after"');
    if (balanceAfterColumns.length === 0) {
      await sequelize.query(`
        ALTER TABLE wallet_transactions
          ADD COLUMN balance_after DECIMAL(10, 2) NOT NULL COMMENT '交易后余额' AFTER balance_before
      `);
      console.log('✓ 添加balance_after字段');
    } else {
      console.log('⚠ balance_after字段已存在,跳过');
    }

    const [balanceColumns] = await sequelize.query('SHOW COLUMNS FROM wallet_transactions LIKE "balance"');
    if (balanceColumns.length > 0) {
      await sequelize.query(`
        ALTER TABLE wallet_transactions
          DROP COLUMN balance
      `);
      console.log('✓ 删除balance字段');
    } else {
      console.log('⚠ balance字段不存在,跳过');
    }

    const [transactionTypeColumns] = await sequelize.query('SHOW COLUMNS FROM wallet_transactions LIKE "transaction_type"');
    if (transactionTypeColumns.length === 0) {
      await sequelize.query(`
        ALTER TABLE wallet_transactions
          ADD COLUMN transaction_type VARCHAR(50) NOT NULL COMMENT '交易类型：recharge, refund, payment, withdrawal, etc.' AFTER balance_after
      `);
      console.log('✓ 添加transaction_type字段');
    } else {
      console.log('⚠ transaction_type字段已存在,跳过');
    }

    const [relatedOrderIdColumns] = await sequelize.query('SHOW COLUMNS FROM wallet_transactions LIKE "related_id"');
    if (relatedOrderIdColumns.length === 0) {
      await sequelize.query(`
        ALTER TABLE wallet_transactions
          CHANGE COLUMN related_order_id related_id INT NULL COMMENT '关联ID（订单ID、退款ID等）'
      `);
      console.log('✓ 回退related_order_id为related_id');
    } else {
      console.log('⚠ related_id字段已存在,跳过');
    }

    const [transactionTypeIndexes] = await sequelize.query('SHOW INDEX FROM wallet_transactions WHERE Key_name = "idx_transaction_type"');
    if (transactionTypeIndexes.length === 0) {
      await sequelize.query(`
        ALTER TABLE wallet_transactions
          ADD INDEX idx_transaction_type (transaction_type)
      `);
      console.log('✓ 添加transaction_type索引');
    } else {
      console.log('⚠ idx_transaction_type索引已存在,跳过');
    }

    const [relatedOrderIdIndexes] = await sequelize.query('SHOW INDEX FROM wallet_transactions WHERE Key_name = "idx_related_order_id"');
    if (relatedOrderIdIndexes.length > 0) {
      await sequelize.query(`
        ALTER TABLE wallet_transactions
          DROP INDEX idx_related_order_id
      `);
      console.log('✓ 删除related_order_id索引');
    } else {
      console.log('⚠ idx_related_order_id索引不存在,跳过');
    }

    console.log('✓ WalletTransaction表结构回滚完成!');
  } catch (error) {
    console.error('✗ 回滚失败:', error.message);
    throw error;
  }
}

module.exports = { migrate, rollback };
