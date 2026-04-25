/**
 * 创建缺失的表
 */

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('hfparty_db_new', 'hfparty_user', 'Zaqzzh.521', {
  host: '122.51.255.13',
  port: 3306,
  dialect: 'mysql',
  logging: false
});

async function createTables() {
  try {
    console.log('🔌 连接数据库...');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功！\n');

    // 1. 创建 app_download_events 表
    console.log('📦 创建 app_download_events 表...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS \`app_download_events\` (
        \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
        \`user_id\` INT UNSIGNED NULL,
        \`platform\` VARCHAR(20) NOT NULL COMMENT '平台：ios, android',
        \`version\` VARCHAR(20) NULL COMMENT '版本号',
        \`source\` VARCHAR(50) NULL COMMENT '下载来源',
        \`ip_address\` VARCHAR(50) NULL COMMENT 'IP地址',
        \`user_agent\` VARCHAR(500) NULL COMMENT 'User Agent',
        \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        INDEX \`idx_user_id\` (\`user_id\`),
        INDEX \`idx_platform\` (\`platform\`),
        INDEX \`idx_created_at\` (\`created_at\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='App下载事件表'
    `);
    console.log('✅ app_download_events 表创建成功\n');

    // 2. 创建 feedbacks 表
    console.log('📦 创建 feedbacks 表...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS \`feedbacks\` (
        \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
        \`user_id\` INT UNSIGNED NOT NULL COMMENT '用户ID',
        \`type\` VARCHAR(50) NOT NULL COMMENT '反馈类型',
        \`content\` TEXT NOT NULL COMMENT '反馈内容',
        \`images\` JSON NULL COMMENT '图片列表',
        \`contact\` VARCHAR(100) NULL COMMENT '联系方式',
        \`status\` TINYINT DEFAULT 0 COMMENT '状态：0-待处理，1-已处理',
        \`reply\` TEXT NULL COMMENT '回复内容',
        \`replied_at\` DATETIME NULL COMMENT '回复时间',
        \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        INDEX \`idx_user_id\` (\`user_id\`),
        INDEX \`idx_status\` (\`status\`),
        INDEX \`idx_created_at\` (\`created_at\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='用户反馈表'
    `);
    console.log('✅ feedbacks 表创建成功\n');

    console.log('🎉 所有缺失的表创建完成！');
    
  } catch (error) {
    console.error('\n❌ 创建失败:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

createTables();
