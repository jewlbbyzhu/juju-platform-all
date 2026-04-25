require('dotenv').config({ path: '.env.development' });
const { sequelize } = require('../src/config/database');
const db = require('../src/models');
const bcrypt = require('bcrypt');

const seed = async () => {
  try {
    console.log('Starting database seeding...');
    
    await sequelize.sync({ force: true });
    
    const hashedPassword = await bcrypt.hash('zaqzzh.521', 10);
    
    const role = await db.Role.create({
      name: 'super_admin',
      description: '超级管理员',
      permissions: ['*'],
      status: 1
    });
    
    await db.Admin.create({
      username: 'eros1101',
      password: hashedPassword,
      real_name: '超级管理员',
      role_id: role.id,
      status: 1
    });
    
    await db.SystemConfig.create({
      key: 'site_name',
      value: '聚聚',
      description: '网站名称',
      type: 'string',
      status: 1
    });
    
    await db.SystemConfig.create({
      key: 'site_description',
      value: '发现精彩聚会，结交有趣朋友',
      description: '网站描述',
      type: 'string',
      status: 1
    });
    
    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();
