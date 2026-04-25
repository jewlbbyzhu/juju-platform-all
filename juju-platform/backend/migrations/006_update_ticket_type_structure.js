const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.development') });
const { sequelize } = require('../src/config/database');
const logger = require('../src/utils/logger');

async function migrate() {
  try {
    console.log('开始迁移TicketType表结构...');

    const [columns] = await sequelize.query('SHOW COLUMNS FROM ticket_types LIKE "type"');
    if (columns.length === 0) {
      await sequelize.query(`
        ALTER TABLE ticket_types
        ADD COLUMN type TINYINT NULL DEFAULT 1 COMMENT '票型类型：1-普通,2-早鸟,3-男性,4-女性,5-男性早鸟,6-女性早鸟' AFTER description
      `);
      console.log('✓ 添加type字段');
    } else {
      console.log('⚠ type字段已存在,跳过');
    }

    const [earlyBirdColumns] = await sequelize.query('SHOW COLUMNS FROM ticket_types LIKE "early_bird_deadline"');
    if (earlyBirdColumns.length === 0) {
      await sequelize.query(`
        ALTER TABLE ticket_types
        ADD COLUMN early_bird_deadline DATETIME NULL COMMENT '早鸟票截止时间' AFTER sale_end_time
      `);
      console.log('✓ 添加early_bird_deadline字段');
    } else {
      console.log('⚠ early_bird_deadline字段已存在,跳过');
    }

    const [quantityColumns] = await sequelize.query('SHOW COLUMNS FROM ticket_types LIKE "available_count"');
    if (quantityColumns.length === 0) {
      await sequelize.query(`
        ALTER TABLE ticket_types
        CHANGE COLUMN quantity available_count INT NOT NULL DEFAULT 0 COMMENT '可用数量'
      `);
      console.log('✓ 重命名quantity为available_count');
    } else {
      console.log('⚠ available_count字段已存在,跳过');
    }

    const [soldQuantityColumns] = await sequelize.query('SHOW COLUMNS FROM ticket_types LIKE "sold_count"');
    if (soldQuantityColumns.length === 0) {
      await sequelize.query(`
        ALTER TABLE ticket_types
        CHANGE COLUMN sold_quantity sold_count INT NOT NULL DEFAULT 0 COMMENT '已售数量'
      `);
      console.log('✓ 重命名sold_quantity为sold_count');
    } else {
      console.log('⚠ sold_count字段已存在,跳过');
    }

    const [typeIndexes] = await sequelize.query('SHOW INDEX FROM ticket_types WHERE Key_name = "idx_type"');
    if (typeIndexes.length === 0) {
      await sequelize.query(`
        ALTER TABLE ticket_types
        ADD INDEX idx_type (type)
      `);
      console.log('✓ 添加type字段索引');
    } else {
      console.log('⚠ idx_type索引已存在,跳过');
    }

    console.log('✓ TicketType表结构迁移完成!');
  } catch (error) {
    console.error('✗ 迁移失败:', error.message);
    throw error;
  }
}

async function rollback() {
  try {
    console.log('开始回滚TicketType表结构...');

    const [typeColumns] = await sequelize.query('SHOW COLUMNS FROM ticket_types LIKE "type"');
    if (typeColumns.length > 0) {
      await sequelize.query(`
        ALTER TABLE ticket_types
        DROP COLUMN type
      `);
      console.log('✓ 删除type字段');
    } else {
      console.log('⚠ type字段不存在,跳过');
    }

    const [earlyBirdColumns] = await sequelize.query('SHOW COLUMNS FROM ticket_types LIKE "early_bird_deadline"');
    if (earlyBirdColumns.length > 0) {
      await sequelize.query(`
        ALTER TABLE ticket_types
        DROP COLUMN early_bird_deadline
      `);
      console.log('✓ 删除early_bird_deadline字段');
    } else {
      console.log('⚠ early_bird_deadline字段不存在,跳过');
    }

    const [availableCountColumns] = await sequelize.query('SHOW COLUMNS FROM ticket_types LIKE "available_count"');
    if (availableCountColumns.length > 0) {
      await sequelize.query(`
        ALTER TABLE ticket_types
        CHANGE COLUMN available_count quantity INT NOT NULL DEFAULT 0 COMMENT '数量'
      `);
      console.log('✓ 回退available_count为quantity');
    } else {
      console.log('⚠ available_count字段不存在,跳过');
    }

    const [soldCountColumns] = await sequelize.query('SHOW COLUMNS FROM ticket_types LIKE "sold_count"');
    if (soldCountColumns.length > 0) {
      await sequelize.query(`
        ALTER TABLE ticket_types
        CHANGE COLUMN sold_count sold_quantity INT NOT NULL DEFAULT 0 COMMENT '已售数量'
      `);
      console.log('✓ 回退sold_count为sold_quantity');
    } else {
      console.log('⚠ sold_count字段不存在,跳过');
    }

    const [typeIndexes] = await sequelize.query('SHOW INDEX FROM ticket_types WHERE Key_name = "idx_type"');
    if (typeIndexes.length > 0) {
      await sequelize.query(`
        ALTER TABLE ticket_types
        DROP INDEX idx_type
      `);
      console.log('✓ 删除type字段索引');
    } else {
      console.log('⚠ idx_type索引不存在,跳过');
    }

    console.log('✓ TicketType表结构回滚完成!');
  } catch (error) {
    console.error('✗ 回滚失败:', error.message);
    throw error;
  }
}

module.exports = { migrate, rollback };
