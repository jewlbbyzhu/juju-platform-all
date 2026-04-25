const { sequelize } = require('../src/config/database');
const logger = require('../src/utils/logger');

class DatabaseVerification {
  constructor() {
    this.results = [];
  }

  async runAllTests() {
    logger.info('开始数据库验证测试...');
    
    try {
      await this.testConnection();
      await this.testBasicQueries();
      await this.testIndexUsage();
      await this.testPerformance();
      
      this.printResults();
      return this.allTestsPassed();
    } catch (error) {
      logger.error('数据库验证测试失败:', error);
      throw error;
    }
  }

  async testConnection() {
    logger.info('测试1: 数据库连接');
    const startTime = Date.now();
    
    try {
      await sequelize.authenticate();
      const duration = Date.now() - startTime;
      
      this.addResult('数据库连接', true, `连接成功，耗时 ${duration}ms`);
      logger.info(`✓ 数据库连接测试通过 (${duration}ms)`);
    } catch (error) {
      this.addResult('数据库连接', false, error.message);
      logger.error(`✗ 数据库连接测试失败: ${error.message}`);
      throw error;
    }
  }

  async testBasicQueries() {
    logger.info('测试2: 基本查询功能');
    
    const tests = [
      {
        name: '查询用户表',
        query: 'SELECT COUNT(*) as count FROM users',
        expectedMin: 0
      },
      {
        name: '查询聚会表',
        query: 'SELECT COUNT(*) as count FROM parties',
        expectedMin: 0
      },
      {
        name: '查询订单表',
        query: 'SELECT COUNT(*) as count FROM orders',
        expectedMin: 0
      },
      {
        name: '查询支付表',
        query: 'SELECT COUNT(*) as count FROM payments',
        expectedMin: 0
      },
      {
        name: '查询钱包表',
        query: 'SELECT COUNT(*) as count FROM wallets',
        expectedMin: 0
      }
    ];

    for (const test of tests) {
      try {
        const startTime = Date.now();
        const [results] = await sequelize.query(test.query);
        const duration = Date.now() - startTime;
        
        const count = results[0].count;
        const passed = count >= test.expectedMin;
        
        this.addResult(test.name, passed, `记录数: ${count}, 耗时: ${duration}ms`);
        
        if (passed) {
          logger.info(`✓ ${test.name} - 通过 (${duration}ms, ${count}条记录)`);
        } else {
          logger.warn(`⚠ ${test.name} - 警告 (${duration}ms, ${count}条记录)`);
        }
      } catch (error) {
        this.addResult(test.name, false, error.message);
        logger.error(`✗ ${test.name} - 失败: ${error.message}`);
      }
    }
  }

  async testIndexUsage() {
    logger.info('测试3: 索引使用情况');
    
    const tests = [
      {
        name: 'orders表索引',
        query: `SHOW INDEX FROM orders`
      },
      {
        name: 'parties表索引',
        query: `SHOW INDEX FROM parties`
      },
      {
        name: 'payments表索引',
        query: `SHOW INDEX FROM payments`
      }
    ];

    for (const test of tests) {
      try {
        const startTime = Date.now();
        const [results] = await sequelize.query(test.query);
        const duration = Date.now() - startTime;
        
        const hasCompositeIndex = results.some(index => 
          index.Key_name.startsWith('idx_') && 
          index.Key_name.includes('_') && 
          index.Key_name !== 'PRIMARY'
        );
        
        this.addResult(test.name, true, `索引数: ${results.length}, 包含复合索引: ${hasCompositeIndex}, 耗时: ${duration}ms`);
        
        if (hasCompositeIndex) {
          logger.info(`✓ ${test.name} - 复合索引已创建 (${duration}ms)`);
        } else {
          logger.warn(`⚠ ${test.name} - 未发现复合索引 (${duration}ms)`);
        }
      } catch (error) {
        this.addResult(test.name, false, error.message);
        logger.error(`✗ ${test.name} - 失败: ${error.message}`);
      }
    }
  }

  async testPerformance() {
    logger.info('测试4: 性能测试');
    
    const tests = [
      {
        name: '用户查询性能',
        query: `SELECT * FROM users WHERE status = 1 LIMIT 10`,
        maxDuration: 500
      },
      {
        name: '聚会查询性能',
        query: `SELECT * FROM parties WHERE status = 1 ORDER BY created_at DESC LIMIT 10`,
        maxDuration: 500
      },
      {
        name: '订单查询性能',
        query: `SELECT * FROM orders WHERE status = 1 ORDER BY created_at DESC LIMIT 10`,
        maxDuration: 500
      },
      {
        name: '复合索引查询性能',
        query: `SELECT * FROM orders WHERE user_id = 1 AND status = 1 ORDER BY created_at DESC LIMIT 10`,
        maxDuration: 300
      }
    ];

    for (const test of tests) {
      try {
        const startTime = Date.now();
        await sequelize.query(test.query);
        const duration = Date.now() - startTime;
        
        const passed = duration <= test.maxDuration;
        
        this.addResult(test.name, passed, `耗时: ${duration}ms, 阈值: ${test.maxDuration}ms`);
        
        if (passed) {
          logger.info(`✓ ${test.name} - 通过 (${duration}ms)`);
        } else {
          logger.warn(`⚠ ${test.name} - 性能警告 (${duration}ms > ${test.maxDuration}ms)`);
        }
      } catch (error) {
        this.addResult(test.name, false, error.message);
        logger.error(`✗ ${test.name} - 失败: ${error.message}`);
      }
    }
  }

  addResult(name, passed, message) {
    this.results.push({
      name,
      passed,
      message,
      timestamp: new Date().toISOString()
    });
  }

  allTestsPassed() {
    return this.results.every(result => result.passed);
  }

  printResults() {
    logger.info('\n========== 数据库验证测试结果 ==========');
    
    const passedCount = this.results.filter(r => r.passed).length;
    const failedCount = this.results.filter(r => !r.passed).length;
    const totalCount = this.results.length;
    
    logger.info(`总测试数: ${totalCount}`);
    logger.info(`通过: ${passedCount}`);
    logger.info(`失败: ${failedCount}`);
    logger.info(`通过率: ${((passedCount / totalCount) * 100).toFixed(2)}%`);
    
    logger.info('\n详细结果:');
    this.results.forEach((result, index) => {
      const status = result.passed ? '✓ 通过' : '✗ 失败';
      logger.info(`${index + 1}. ${result.name}: ${status}`);
      logger.info(`   ${result.message}`);
    });
    
    logger.info('==========================================\n');
  }

  getResults() {
    return {
      total: this.results.length,
      passed: this.results.filter(r => r.passed).length,
      failed: this.results.filter(r => !r.passed).length,
      passRate: ((this.results.filter(r => r.passed).length / this.results.length) * 100).toFixed(2),
      results: this.results
    };
  }
}

module.exports = DatabaseVerification;
