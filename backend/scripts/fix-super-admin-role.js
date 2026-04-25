require('dotenv').config({ path: '.env.development' });
const { sequelize } = require('../src/config/database');
const db = require('../src/models');

const fixSuperAdminRole = async () => {
  try {
    console.log('Fixing super_admin role permissions...');
    
    const role = await db.Role.findOne({ where: { name: 'super_admin' } });
    
    if (role) {
      console.log('Current permissions:', JSON.stringify(role.permissions));
      
      // Update permissions to ['*']
      role.permissions = ['*'];
      await role.save();
      
      console.log('Updated permissions:', JSON.stringify(role.permissions));
      console.log('Super admin role fixed successfully!');
    } else {
      console.log('Super admin role not found, creating...');
      
      await db.Role.create({
        id: 1,
        name: 'super_admin',
        display_name: '超级管理员',
        description: '拥有所有权限',
        permissions: ['*'],
        status: 1
      });
      
      console.log('Super admin role created successfully!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Failed to fix super admin role:', error);
    process.exit(1);
  }
};

fixSuperAdminRole();
