// 首先加载环境变量
const path = require('path');
const dotenv = require('dotenv');
const env = process.env.NODE_ENV || 'development';
const envPath = path.resolve(__dirname, `.env.${env}`);
dotenv.config({ path: envPath });

const { sequelize } = require('./src/config/database');

async function verifyTables() {
  try {
    console.log('验证新创建的表...\n');
    
    const tables = [
      'vip_packages',
      'vip_subscriptions',
      'vip_levels',
      'vip_benefits',
      'blocked_users'
    ];
    
    for (const tableName of tables) {
      try {
        const [results] = await sequelize.query(`
          SELECT COUNT(*) as count 
          FROM information_schema.tables 
          WHERE table_schema = DATABASE() 
          AND table_name = '${tableName}'
        `);
        
        const exists = results[0].count > 0;
        if (exists) {
          console.log(`✅ ${tableName}: 表已存在`);
          
          // 获取表结构
          const [columns] = await sequelize.query(`
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_COMMENT
            FROM information_schema.columns
            WHERE table_schema = DATABASE()
            AND table_name = '${tableName}'
            ORDER BY ORDINAL_POSITION
          `);
          
          console.log(`   字段数: ${columns.length}`);
          console.log(`   字段: ${columns.map(c => c.COLUMN_NAME).join(', ')}\n`);
        } else {
          console.log(`❌ ${tableName}: 表不存在\n`);
        }
      } catch (err) {
        console.log(`❌ ${tableName}: 查询失败 - ${err.message}\n`);
      }
    }
    
    console.log('验证完成！');
    process.exit(0);
  } catch (error) {
    console.error('验证失败:', error);
    process.exit(1);
  }
}

verifyTables();
