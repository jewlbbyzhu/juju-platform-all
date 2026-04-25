process.env.NODE_ENV = 'test';
process.env.ENCRYPTION_MASTER_KEY = 'test_encryption_key_for_testing_only';
process.env.JWT_SECRET = 'test_jwt_secret_for_testing_only_12345';

// Create mock transaction function
const createMockTransaction = () => ({
  commit: jest.fn().mockResolvedValue(),
  rollback: jest.fn().mockResolvedValue()
});

const mockTransaction = jest.fn().mockImplementation(async (optionsOrCallback) => {
  const mockTxn = createMockTransaction();
  
  // Handle both forms: transaction(callback) and transaction(options)
  if (typeof optionsOrCallback === 'function') {
    try {
      const result = await optionsOrCallback(mockTxn);
      await mockTxn.commit();
      return result;
    } catch (error) {
      await mockTxn.rollback();
      throw error;
    }
  } else {
    // Return transaction object for manual commit/rollback
    return mockTxn;
  }
});

// Mock the database module before it's loaded
jest.mock('../src/config/database', () => {
  const { Sequelize } = require('sequelize');
  
  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  });
  
  // Override transaction method
  sequelize.transaction = mockTransaction;
  
  return { sequelize, testConnection: jest.fn().mockResolvedValue(true) };
});

const { sequelize } = require('../src/config/database');

beforeAll(async () => {
  await sequelize.sync({ force: true });
  
  // Ensure transaction is still mocked after sync
  sequelize.transaction = mockTransaction;
});

afterAll(async () => {
  await sequelize.close();
});
