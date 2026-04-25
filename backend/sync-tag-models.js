// 首先加载环境变量
const path = require('path');
const dotenv = require('dotenv');
const env = process.env.NODE_ENV || 'development';
const envPath = path.resolve(__dirname, `.env.${env}`);
dotenv.config({ path: envPath });

const { sequelize } = require('./src/config/database');
const { 
  Tag, 
  UserTag, 
  PartyTag 
} = require('./src/models');

async function syncTagModels() {
  try {
    console.log('开始同步标签相关模型...');
    
    console.log('1. 同步 Tag 模型...');
    await Tag.sync({ alter: true });
    console.log('✓ Tag 模型同步成功');
    
    console.log('2. 同步 UserTag 模型...');
    await UserTag.sync({ alter: true });
    console.log('✓ UserTag 模型同步成功');
    
    console.log('3. 同步 PartyTag 模型...');
    await PartyTag.sync({ alter: true });
    console.log('✓ PartyTag 模型同步成功');
    
    console.log('\n✅ 所有标签模型同步完成！');
    process.exit(0);
  } catch (error) {
    console.error('❌ 同步模型时出错:', error);
    process.exit(1);
  }
}

syncTagModels();
