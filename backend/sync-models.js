const { sequelize } = require('./src/config/database');
const { PartyAudit } = require('./src/models');

async function syncModels() {
  try {
    console.log('Syncing PartyAudit model...');
    await PartyAudit.sync({ alter: true });
    console.log('PartyAudit model synced successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error syncing models:', error);
    process.exit(1);
  }
}

syncModels();
