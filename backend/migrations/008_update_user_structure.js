const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.development') });
const { sequelize } = require('../src/config/database');
const logger = require('../src/utils/logger');

async function migrate() {
  try {
    console.log('开始迁移User表结构...');

    const [vipLevelColumns] = await sequelize.query('SHOW COLUMNS FROM users LIKE "vip_level"');
    if (vipLevelColumns.length === 0) {
      await sequelize.query(`
        ALTER TABLE users
          ADD COLUMN vip_level ENUM('monthly', 'quarterly', 'yearly') NULL COMMENT 'VIP等级：monthly-月卡, quarterly-季卡, yearly-年卡' AFTER is_vip
      `);
      console.log('✓ 添加vip_level字段');
    } else {
      console.log('⚠ vip_level字段已存在,跳过');
    }

    const [participatedCountColumns] = await sequelize.query('SHOW COLUMNS FROM users LIKE "participated_count"');
    if (participatedCountColumns.length === 0) {
      await sequelize.query(`
        ALTER TABLE users
          ADD COLUMN participated_count INT NOT NULL DEFAULT 0 COMMENT '参与聚会次数' AFTER vip_expires_at
      `);
      console.log('✓ 添加participated_count字段');
    } else {
      console.log('⚠ participated_count字段已存在,跳过');
    }

    const [createdCountColumns] = await sequelize.query('SHOW COLUMNS FROM users LIKE "created_count"');
    if (createdCountColumns.length === 0) {
      await sequelize.query(`
        ALTER TABLE users
          ADD COLUMN created_count INT NOT NULL DEFAULT 0 COMMENT '创建聚会次数' AFTER participated_count
      `);
      console.log('✓ 添加created_count字段');
    } else {
      console.log('⚠ created_count字段已存在,跳过');
    }

    const [favoriteCountColumns] = await sequelize.query('SHOW COLUMNS FROM users LIKE "favorite_count"');
    if (favoriteCountColumns.length === 0) {
      await sequelize.query(`
        ALTER TABLE users
          ADD COLUMN favorite_count INT NOT NULL DEFAULT 0 COMMENT '收藏聚会次数' AFTER created_count
      `);
      console.log('✓ 添加favorite_count字段');
    } else {
      console.log('⚠ favorite_count字段已存在,跳过');
    }

    const [vipLevelIndexes] = await sequelize.query('SHOW INDEX FROM users WHERE Key_name = "idx_vip_level"');
    if (vipLevelIndexes.length === 0) {
      await sequelize.query(`
        ALTER TABLE users
          ADD INDEX idx_vip_level (vip_level)
      `);
      console.log('✓ 添加vip_level字段索引');
    } else {
      console.log('⚠ idx_vip_level索引已存在,跳过');
    }

    console.log('✓ User表结构迁移完成!');
  } catch (error) {
    console.error('✗ 迁移失败:', error.message);
    throw error;
  }
}

async function rollback() {
  try {
    console.log('开始回滚User表结构...');

    const [vipLevelColumns] = await sequelize.query('SHOW COLUMNS FROM users LIKE "vip_level"');
    if (vipLevelColumns.length > 0) {
      await sequelize.query(`
        ALTER TABLE users
          DROP COLUMN vip_level
      `);
      console.log('✓ 删除vip_level字段');
    } else {
      console.log('⚠ vip_level字段不存在,跳过');
    }

    const [participatedCountColumns] = await sequelize.query('SHOW COLUMNS FROM users LIKE "participated_count"');
    if (participatedCountColumns.length > 0) {
      await sequelize.query(`
        ALTER TABLE users
          DROP COLUMN participated_count
      `);
      console.log('✓ 删除participated_count字段');
    } else {
      console.log('⚠ participated_count字段不存在,跳过');
    }

    const [createdCountColumns] = await sequelize.query('SHOW COLUMNS FROM users LIKE "created_count"');
    if (createdCountColumns.length > 0) {
      await sequelize.query(`
        ALTER TABLE users
          DROP COLUMN created_count
      `);
      console.log('✓ 删除created_count字段');
    } else {
      console.log('⚠ created_count字段不存在,跳过');
    }

    const [favoriteCountColumns] = await sequelize.query('SHOW COLUMNS FROM users LIKE "favorite_count"');
    if (favoriteCountColumns.length > 0) {
      await sequelize.query(`
        ALTER TABLE users
          DROP COLUMN favorite_count
      `);
      console.log('✓ 删除favorite_count字段');
    } else {
      console.log('⚠ favorite_count字段不存在,跳过');
    }

    const [vipLevelIndexes] = await sequelize.query('SHOW INDEX FROM users WHERE Key_name = "idx_vip_level"');
    if (vipLevelIndexes.length > 0) {
      await sequelize.query(`
        ALTER TABLE users
          DROP INDEX idx_vip_level
      `);
      console.log('✓ 删除vip_level字段索引');
    } else {
      console.log('⚠ idx_vip_level索引不存在,跳过');
    }

    console.log('✓ User表结构回滚完成!');
  } catch (error) {
    console.error('✗ 回滚失败:', error.message);
    throw error;
  }
}

module.exports = { migrate, rollback };
