#!/usr/bin/env node
/**
 * 数据库同步脚本
 * 用于同步 Sequelize 模型到数据库（创建/更新表结构）
 */

const { sequelize } = require('../src/config/database');
const logger = require('../src/utils/logger');

// 导入所有模型
const {
  AnalyticsReport,
  AnalyticsDashboard
} = require('../src/models');

async function syncDatabase() {
  try {
    logger.info('开始同步数据库...');
    
    // 测试数据库连接
    await sequelize.authenticate();
    logger.info('数据库连接成功');
    
    // 同步模型（创建表）
    // alter: true 会尝试修改现有表以匹配模型
    // force: false 不会删除现有表
    await sequelize.sync({ alter: true, force: false });
    
    logger.info('数据库同步完成！');
    logger.info('已创建/更新以下表：');
    logger.info('- analytics_reports（自定义分析报表）');
    logger.info('- analytics_dashboards（自定义分析仪表盘）');
    
    process.exit(0);
  } catch (error) {
    logger.error('数据库同步失败:', error);
    process.exit(1);
  }
}

// 运行同步
syncDatabase();
