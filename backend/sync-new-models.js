// 首先加载环境变量
const path = require('path');
const dotenv = require('dotenv');
const env = process.env.NODE_ENV || 'development';
const envPath = path.resolve(__dirname, `.env.${env}`);
dotenv.config({ path: envPath });

const { sequelize } = require('./src/config/database');
const { 
  VipPackage, 
  VipSubscription, 
  VipLevel, 
  VipBenefit,
  BlockedUser 
} = require('./src/models');

async function syncNewModels() {
  try {
    console.log('开始同步新创建的模型...');
    
    console.log('1. 同步 VipPackage 模型...');
    await VipPackage.sync({ alter: true });
    console.log('✓ VipPackage 模型同步成功');
    
    console.log('2. 同步 VipSubscription 模型...');
    await VipSubscription.sync({ alter: true });
    console.log('✓ VipSubscription 模型同步成功');
    
    console.log('3. 同步 VipLevel 模型...');
    await VipLevel.sync({ alter: true });
    console.log('✓ VipLevel 模型同步成功');
    
    console.log('4. 同步 VipBenefit 模型...');
    await VipBenefit.sync({ alter: true });
    console.log('✓ VipBenefit 模型同步成功');
    
    console.log('5. 同步 BlockedUser 模型...');
    await BlockedUser.sync({ alter: true });
    console.log('✓ BlockedUser 模型同步成功');
    
    console.log('\n✅ 所有新模型同步完成！');
    process.exit(0);
  } catch (error) {
    console.error('❌ 同步模型时出错:', error);
    process.exit(1);
  }
}

syncNewModels();
