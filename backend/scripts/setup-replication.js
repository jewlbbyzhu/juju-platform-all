const mysql = require('mysql2/promise');
const logger = require('../utils/logger');

async function setupMasterSlaveReplication() {
  const masterConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'mysql',
    multipleStatements: true
  };

  const slaveConfig = {
    host: process.env.DB_READ_HOST || 'localhost',
    port: parseInt(process.env.DB_READ_PORT) || 3307,
    user: 'root',
    password: process.env.DB_READ_PASSWORD || '',
    database: 'mysql',
    multipleStatements: true
  };

  try {
    logger.info('Setting up MySQL master-slave replication...');

    const masterConnection = await mysql.createConnection(masterConfig);

    await masterConnection.execute(`
      CREATE USER IF NOT EXISTS 'repl'@'%' IDENTIFIED BY 'repl_password';
    `);

    await masterConnection.execute(`
      GRANT REPLICATION SLAVE ON *.* TO 'repl'@'%';
    `);

    await masterConnection.execute(`
      FLUSH PRIVILEGES;
    `);

    const [masterStatus] = await masterConnection.execute('SHOW MASTER STATUS');
    logger.info('Master status:', {
      file: masterStatus[0].File,
      position: masterStatus[0].Position,
      binlogDoDb: masterStatus[0].Binlog_Do_DB
    });

    await masterConnection.end();

    const slaveConnection = await mysql.createConnection(slaveConfig);

    await slaveConnection.execute(`
      STOP SLAVE;
    `);

    await slaveConnection.execute(`
      CHANGE MASTER TO
        MASTER_HOST='${masterConfig.host}',
        MASTER_PORT=${masterConfig.port},
        MASTER_USER='repl',
        MASTER_PASSWORD='repl_password',
        MASTER_LOG_FILE='${masterStatus[0].File}',
        MASTER_LOG_POS=${masterStatus[0].Position};
    `);

    await slaveConnection.execute(`
      START SLAVE;
    `);

    const [slaveStatus] = await slaveConnection.execute('SHOW SLAVE STATUS\\G');
    logger.info('Slave status:', {
      slaveIoRunning: slaveStatus[0].Slave_IO_Running,
      slaveSqlRunning: slaveStatus[0].Slave_SQL_Running,
      secondsBehindMaster: slaveStatus[0].Seconds_Behind_Master,
      masterLogFile: slaveStatus[0].Master_Log_File,
      readMasterLogPos: slaveStatus[0].Read_Master_Log_Pos,
      relayLogFile: slaveStatus[0].Relay_Log_File,
      relayLogPos: slaveStatus[0].Relay_Log_Pos
    });

    if (slaveStatus[0].Slave_IO_Running === 'Yes' && 
        slaveStatus[0].Slave_SQL_Running === 'Yes') {
      logger.info('Master-slave replication setup completed successfully');
    } else {
      logger.error('Master-slave replication setup failed:', {
        slaveIoRunning: slaveStatus[0].Slave_IO_Running,
        slaveSqlRunning: slaveStatus[0].Slave_SQL_Running,
        lastError: slaveStatus[0].Last_Error
      });
    }

    await slaveConnection.end();

  } catch (error) {
    logger.error('Failed to setup master-slave replication:', error);
    throw error;
  }
}

async function checkReplicationStatus() {
  const slaveConfig = {
    host: process.env.DB_READ_HOST || 'localhost',
    port: parseInt(process.env.DB_READ_PORT) || 3307,
    user: 'root',
    password: process.env.DB_READ_PASSWORD || '',
    database: 'mysql',
    multipleStatements: true
  };

  try {
    const slaveConnection = await mysql.createConnection(slaveConfig);
    const [slaveStatus] = await slaveConnection.execute('SHOW SLAVE STATUS\\G');

    const status = {
      isHealthy: slaveStatus[0].Slave_IO_Running === 'Yes' && 
                slaveStatus[0].Slave_SQL_Running === 'Yes',
      slaveIoRunning: slaveStatus[0].Slave_IO_Running,
      slaveSqlRunning: slaveStatus[0].Slave_SQL_Running,
      secondsBehindMaster: parseInt(slaveStatus[0].Seconds_Behind_Master) || 0,
      masterLogFile: slaveStatus[0].Master_Log_File,
      readMasterLogPos: parseInt(slaveStatus[0].Read_Master_Log_Pos),
      relayLogFile: slaveStatus[0].Relay_Log_File,
      relayLogPos: parseInt(slaveStatus[0].Relay_Log_Pos),
      lastError: slaveStatus[0].Last_Error,
      lastErrorNumber: parseInt(slaveStatus[0].Last_Errno) || 0
    };

    await slaveConnection.end();

    if (!status.isHealthy) {
      logger.warn('Replication status is not healthy:', status);
    } else if (status.secondsBehindMaster > 10) {
      logger.warn('Replication is behind master:', {
        secondsBehind: status.secondsBehindMaster
      });
    } else {
      logger.debug('Replication status is healthy:', {
        secondsBehind: status.secondsBehindMaster
      });
    }

    return status;
  } catch (error) {
    logger.error('Failed to check replication status:', error);
    throw error;
  }
}

async function stopReplication() {
  const slaveConfig = {
    host: process.env.DB_READ_HOST || 'localhost',
    port: parseInt(process.env.DB_READ_PORT) || 3307,
    user: 'root',
    password: process.env.DB_READ_PASSWORD || '',
    database: 'mysql',
    multipleStatements: true
  };

  try {
    logger.info('Stopping replication...');
    const slaveConnection = await mysql.createConnection(slaveConfig);

    await slaveConnection.execute('STOP SLAVE');
    await slaveConnection.execute('RESET SLAVE');

    await slaveConnection.end();
    logger.info('Replication stopped successfully');
  } catch (error) {
    logger.error('Failed to stop replication:', error);
    throw error;
  }
}

async function startReplication() {
  const slaveConfig = {
    host: process.env.DB_READ_HOST || 'localhost',
    port: parseInt(process.env.DB_READ_PORT) || 3307,
    user: 'root',
    password: process.env.DB_READ_PASSWORD || '',
    database: 'mysql',
    multipleStatements: true
  };

  try {
    logger.info('Starting replication...');
    const slaveConnection = await mysql.createConnection(slaveConfig);

    await slaveConnection.execute('START SLAVE');

    await slaveConnection.end();
    logger.info('Replication started successfully');
  } catch (error) {
    logger.error('Failed to start replication:', error);
    throw error;
  }
}

module.exports = {
  setupMasterSlaveReplication,
  checkReplicationStatus,
  stopReplication,
  startReplication
};