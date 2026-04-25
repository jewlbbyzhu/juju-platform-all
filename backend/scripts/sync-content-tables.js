#!/usr/bin/env node
/**
 * 同步内容管理相关表结构
 * 用于创建 banners 和 announcements 表
 */

const path = require('path');
const dotenv = require('dotenv');

// 加载环境变量
const env = process.env.NODE_ENV || 'development';
const envPath = path.resolve(__dirname, `../.env.${env}`);
dotenv.config({ path: envPath });

const { sequelize } = require('../src/config/database');
const logger = require('../src/utils/logger');

// 导入需要同步的模型
const Banner = require('../src/models/Banner');
const Announcement = require('../src/models/Announcement');

async function syncTables() {
  try {
    logger.info('开始同步内容管理表结构...');
    
    // 测试数据库连接
    await sequelize.authenticate();
    logger.info('数据库连接成功');
    
    // 同步 Banner 表
    logger.info('同步 banners 表...');
    await Banner.sync({ alter: true });
    logger.info('banners 表同步完成');
    
    // 同步 Announcement 表
    logger.info('同步 announcements 表...');
    await Announcement.sync({ alter: true });
    logger.info('announcements 表同步完成');
    
    logger.info('所有内容管理表同步完成！');
    process.exit(0);
  } catch (error) {
    logger.error('同步表结构失败:', error);
    process.exit(1);
  }
}

// 执行同步
syncTables();
