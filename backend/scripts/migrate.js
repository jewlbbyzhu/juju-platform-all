const { sequelize } = require('../src/config/database');
const db = require('../src/models');

const migrate = async () => {
  try {
    console.log('Starting database migration...');
    
    await sequelize.sync({ alter: true });
    
    console.log('Database migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrate();
