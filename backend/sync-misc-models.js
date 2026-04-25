// 首先加载环境变量
const path = require('path');
const dotenv = require('dotenv');
const env = process.env.NODE_ENV || 'development';
const envPath = path.resolve(__dirname, `.env.${env}`);
dotenv.config({ path: envPath });

const { sequelize } = require('./src/config/database');
const { 
  ScanRecord, 
  UserPreference, 
  InviteRecord 
} = require('./src/models');

async function syncMiscModels() {
  try {
    console.log('开始同步杂项模型...');
    
    console.log('1. 同步 ScanRecord 模型...');
    await ScanRecord.sync({ alter: true });
    console.log('✓ ScanRecord 模型同步成功');
    
    console.log('2. 同步 UserPreference 模型...');
    await UserPreference.sync({ alter: true });
    console.log('✓ UserPreference 模型同步成功');
    
    console.log('3. 同步 InviteRecord 模型...');
    await InviteRecord.sync({ alter: true });
    console.log('✓ InviteRecord 模型同步成功');
    
    console.log('\n✅ 所有杂项模型同步完成！');
    process.exit(0);
  } catch (error) {
    console.error('❌ 同步模型时出错:', error);
    process.exit(1);
  }
}

syncMiscModels();
