/**
 * 执行数据库同步SQL脚本
 */

const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

// 数据库连接配置
const sequelize = new Sequelize('hfparty_db_new', 'hfparty_user', 'Zaqzzh.521', {
  host: '122.51.255.13',
  port: 3306,
  dialect: 'mysql',
  logging: console.log
});

async function executeSQL() {
  try {
    console.log('🔌 连接数据库...');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功！\n');

    // 读取SQL文件
    const sqlFile = path.join(__dirname, '..', 'migrations', '012_sync_models_to_database.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');

    // 分割SQL语句（按分号分割，但忽略注释和字符串中的分号）
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

    console.log(`📄 发现 ${statements.length} 条SQL语句\n`);

    // 执行每条SQL
    for (let i = 0; i < statements.length; i++) {
      const sql = statements[i] + ';';
      const sqlPreview = sql.substring(0, 100).replace(/\n/g, ' ');
      
      try {
        await sequelize.query(sql);
        console.log(`✅ [${i + 1}/${statements.length}] 执行成功: ${sqlPreview}...`);
      } catch (error) {
        console.error(`❌ [${i + 1}/${statements.length}] 执行失败: ${sqlPreview}...`);
        console.error(`   错误: ${error.message}`);
        
        // 如果是"表已存在"或"列已存在"的错误，继续执行
        if (error.message.includes('ER_TABLE_EXISTS') || 
            error.message.includes('ER_DUP_FIELDNAME') ||
            error.message.includes('already exists')) {
          console.log(`   ⚠️  忽略已存在的对象，继续执行...`);
          continue;
        }
        
        // 其他错误询问是否继续
        console.error(`   遇到错误，停止执行`);
        throw error;
      }
    }

    console.log('\n✅ 所有SQL语句执行完成！');
    
  } catch (error) {
    console.error('\n❌ 执行失败:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

executeSQL();
