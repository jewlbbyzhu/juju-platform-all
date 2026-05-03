const { sequelize } = require('../config/database');
const logger = require('../utils/logger');
const { QueryTypes } = require('sequelize');

class DatabaseOptimizationService {
  constructor() {
    this.queryStats = new Map();
    this.slowQueryThreshold = 100;
    this.slowQueryLog = [];
    this.maxSlowQueryLogSize = 1000;
  }

  async analyzeSlowQueries() {
    try {
      const [results] = await sequelize.query(
        `SELECT 
          query_time,
          rows_examined,
          rows_sent,
          lock_time,
          rows_affected,
          digest_text,
          query
        FROM pg_stat_statements 
        WHERE query_time > ${this.slowQueryThreshold}
        ORDER BY query_time DESC 
        LIMIT 100`,
        { type: QueryTypes.SELECT }
      );

      this.slowQueryLog = results.map(row => ({
        query_time: row.query_time,
        rows_examined: row.rows_examined,
        rows_sent: row.rows_sent,
        lock_time: row.lock_time,
        rows_affected: row.rows_affected,
        digest_text: row.digest_text,
        query: row.query
      }));

      logger.info(`Found ${results.length} slow queries`);
      return results;
    } catch (error) {
      logger.error('Analyze slow queries failed:', error);
      return [];
    }
  }

  async getTableStats() {
    try {
      const [results] = await sequelize.query(
        `SELECT 
          schemaname,
          tablename,
          seq_scan,
          seq_tup_read,
          idx_scan,
          idx_tup_fetch,
          n_tup_ins,
          n_tup_upd,
          n_tup_del,
          n_tup_hot_upd,
          n_live_tup,
          n_dead_tup,
          last_vacuum,
          last_autovacuum,
          vacuum_count,
          autovacuum_count,
          analyze_count
        FROM pg_stat_user_tables 
        ORDER BY n_live_tup DESC`,
        { type: QueryTypes.SELECT }
      );

      const tableStats = results.map(row => ({
        schema: row.schemaname,
        table: row.tablename,
        sequential_scans: row.seq_scan,
        sequential_reads: row.seq_tup_read,
        index_scans: row.idx_scan,
        index_reads: row.idx_tup_fetch,
        inserts: row.n_tup_ins,
        updates: row.n_tup_upd,
        deletes: row.n_tup_del,
        hot_updates: row.n_tup_hot_upd,
        live_tuples: row.n_live_tup,
        dead_tuples: row.n_dead_tup,
        last_vacuum: row.last_vacuum,
        last_autovacuum: row.last_autovacuum,
        vacuum_count: row.vacuum_count,
        autovacuum_count: row.autovacuum_count,
        analyze_count: row.analyze_count
      }));

      logger.info(`Retrieved stats for ${results.length} tables`);
      return tableStats;
    } catch (error) {
      logger.error('Get table stats failed:', error);
      return [];
    }
  }

  async getIndexStats() {
    try {
      const [results] = await sequelize.query(
        `SELECT 
          schemaname,
          tablename,
          indexname,
          idx_scan,
          idx_tup_read,
          idx_tup_fetch,
          idx_scan,
          idx_tup_fetch
        FROM pg_stat_user_indexes 
        ORDER BY idx_scan DESC`,
        { type: QueryTypes.SELECT }
      );

      const indexStats = results.map(row => ({
        schema: row.schemaname,
        table: row.tablename,
        index: row.indexname,
        scans: row.idx_scan,
        tuples_read: row.idx_tup_read,
        tuples_fetched: row.idx_tup_fetch
      }));

      logger.info(`Retrieved stats for ${results.length} indexes`);
      return indexStats;
    } catch (error) {
      logger.error('Get index stats failed:', error);
      return [];
    }
  }

  async analyzeMissingIndexes() {
    try {
      const tableStats = await this.getTableStats();
      const missingIndexes = [];

      for (const table of tableStats) {
        const sequentialScanRatio = table.sequential_scans / (table.sequential_scans + table.index_scans);
        const sequentialReadRatio = table.sequential_reads / (table.sequential_reads + table.index_reads);

        if (sequentialScanRatio > 0.1 && sequentialReadRatio > 0.1) {
          missingIndexes.push({
            table: table.table,
            schema: table.schema,
            sequential_scan_ratio: sequentialScanRatio.toFixed(2),
            sequential_read_ratio: sequentialReadRatio.toFixed(2),
            recommendation: 'Consider adding indexes on frequently queried columns'
          });
        }
      }

      logger.info(`Found ${missingIndexes.length} tables potentially missing indexes`);
      return missingIndexes;
    } catch (error) {
      logger.error('Analyze missing indexes failed:', error);
      return [];
    }
  }

  async optimizeTable(tableName) {
    try {
      // 白名单校验：只允许已知的系统表名，防止SQL注入
      const ALLOWED_TABLES = [
        'users', 'parties', 'orders', 'tickets', 'payments', 'refunds',
        'categories', 'tags', 'reviews', 'messages', 'notifications',
        'user_follows', 'social_posts', 'comments', 'chat_groups',
        'chat_messages', 'wallets', 'transactions', 'ui_themes',
        'announcements', 'banners', 'articles', 'configs'
      ];
      
      // 提取纯表名（去除schema前缀）
      const pureTableName = tableName.includes('.') ? tableName.split('.').pop() : tableName;
      
      if (!ALLOWED_TABLES.includes(pureTableName)) {
        logger.warn(`optimizeTable rejected: table "${pureTableName}" not in whitelist`);
        return false;
      }
      
      await sequelize.query(`ANALYZE \`${pureTableName}\``, { type: QueryTypes.RAW });
      await sequelize.query(`VACUUM ANALYZE \`${pureTableName}\``, { type: QueryTypes.RAW });
      logger.info(`Table ${pureTableName} optimized`);
      return true;
    } catch (error) {
      logger.error(`Optimize table ${tableName} failed:`, error);
      return false;
    }
  }

  async optimizeAllTables() {
    try {
      const tableStats = await this.getTableStats();
      let optimizedCount = 0;

      for (const table of tableStats) {
        const needsOptimization = 
          table.dead_tuples > table.live_tuples * 0.1 ||
          table.last_vacuum < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        if (needsOptimization) {
          const success = await this.optimizeTable(`${table.schema}.${table.table}`);
          if (success) optimizedCount++;
        }
      }

      logger.info(`Optimized ${optimizedCount} tables`);
      return { optimized_count: optimizedCount, total_tables: tableStats.length };
    } catch (error) {
      logger.error('Optimize all tables failed:', error);
      return { optimized_count: 0, total_tables: 0 };
    }
  }

  async getConnectionPoolStats() {
    try {
      const pool = sequelize.connectionManager.pool;
      const stats = {
        total: pool.max,
        active: pool.used,
        idle: pool.waiting,
        available: pool.max - pool.used,
        utilization: ((pool.used / pool.max) * 100).toFixed(2) + '%'
      };

      logger.info('Connection pool stats:', stats);
      return stats;
    } catch (error) {
      logger.error('Get connection pool stats failed:', error);
      return null;
    }
  }

  async optimizeConnectionPool(config = {}) {
    try {
      const currentConfig = sequelize.config.pool;
      const newConfig = {
        max: config.max || Math.max(10, currentConfig.max),
        min: config.min || Math.max(2, Math.floor(currentConfig.max * 0.1)),
        idle: config.idle || 10000,
        acquire: config.acquire || 30000
      };

      logger.info('Optimizing connection pool:', newConfig);
      return newConfig;
    } catch (error) {
      logger.error('Optimize connection pool failed:', error);
      return null;
    }
  }

  async getQueryPerformanceReport() {
    try {
      const slowQueries = await this.analyzeSlowQueries();
      const tableStats = await this.getTableStats();
      const indexStats = await this.getIndexStats();
      const missingIndexes = await this.analyzeMissingIndexes();
      const poolStats = await this.getConnectionPoolStats();

      const report = {
        generated_at: new Date().toISOString(),
        slow_queries: {
          count: slowQueries.length,
          threshold_ms: this.slowQueryThreshold,
          top_queries: slowQueries.slice(0, 10)
        },
        table_stats: {
          total_tables: tableStats.length,
          tables_needing_optimization: tableStats.filter(t => 
            t.dead_tuples > t.live_tuples * 0.1
          ).length,
          tables_needing_vacuum: tableStats.filter(t => 
            t.last_vacuum < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          ).length
        },
        index_stats: {
          total_indexes: indexStats.length,
          indexes_needing_review: missingIndexes.length,
          recommendations: missingIndexes.slice(0, 5)
        },
        connection_pool: poolStats,
        recommendations: this.generateRecommendations(slowQueries, tableStats, indexStats, poolStats)
      };

      logger.info('Query performance report generated');
      return report;
    } catch (error) {
      logger.error('Generate query performance report failed:', error);
      return null;
    }
  }

  generateRecommendations(slowQueries, tableStats, indexStats, poolStats) {
    const recommendations = [];

    if (slowQueries.length > 10) {
      recommendations.push({
        priority: 'high',
        category: 'query_performance',
        message: 'High number of slow queries detected',
        action: 'Review and optimize slow queries, add appropriate indexes'
      });
    }

    const tablesNeedingOptimization = tableStats.filter(t => 
      t.dead_tuples > t.live_tuples * 0.1
    );

    if (tablesNeedingOptimization.length > 5) {
      recommendations.push({
        priority: 'medium',
        category: 'maintenance',
        message: 'Multiple tables need VACUUM',
        action: 'Schedule regular VACUUM operations for tables with high dead tuple ratio'
      });
    }

    if (poolStats && parseFloat(poolStats.utilization) > 80) {
      recommendations.push({
        priority: 'high',
        category: 'connection_pool',
        message: 'High connection pool utilization',
        action: 'Consider increasing pool size or optimizing query performance'
      });
    }

    const tablesWithHighSequentialScans = tableStats.filter(t => {
      const ratio = t.sequential_scans / (t.sequential_scans + t.index_scans);
      return ratio > 0.3;
    });

    if (tablesWithHighSequentialScans.length > 3) {
      recommendations.push({
        priority: 'medium',
        category: 'indexing',
        message: 'High sequential scan ratio detected',
        action: 'Review and add indexes for frequently accessed columns'
      });
    }

    return recommendations;
  }

  async executeOptimizationPlan(plan = {}) {
    try {
      const results = {
        optimize_tables: plan.optimize_tables !== false,
        analyze_queries: plan.analyze_queries !== false,
        optimize_pool: plan.optimize_pool !== false
      };

      if (results.optimize_tables) {
        const tableResult = await this.optimizeAllTables();
        results.tables_optimized = tableResult.optimized_count;
      }

      if (results.analyze_queries) {
        const report = await this.getQueryPerformanceReport();
        results.performance_report = report;
      }

      if (results.optimize_pool) {
        const poolConfig = await this.optimizeConnectionPool(plan.pool_config);
        results.pool_config = poolConfig;
      }

      logger.info('Optimization plan executed:', results);
      return results;
    } catch (error) {
      logger.error('Execute optimization plan failed:', error);
      return null;
    }
  }

  async setupReadReplication(config = {}) {
    try {
      const masterConfig = {
        host: config.master_host || process.env.DB_MASTER_HOST || 'localhost',
        port: config.master_port || process.env.DB_MASTER_PORT || 3306,
        database: config.database || process.env.DB_NAME || 'juju_platform',
        username: config.username || process.env.DB_USER || 'root',
        password: config.password || process.env.DB_PASSWORD || '',
        replication: {
          role: 'master',
          binlog_format: 'ROW',
          binlog_do_db: config.database || 'juju_platform',
          binlog_expire_logs_seconds: 7 * 24 * 60 * 60
        }
      };

      const slaveConfig = {
        host: config.slave_host || process.env.DB_SLAVE_HOST || 'localhost',
        port: config.slave_port || process.env.DB_SLAVE_PORT || 3307,
        database: config.database || process.env.DB_NAME || 'juju_platform',
        username: config.username || process.env.DB_USER || 'root',
        password: config.password || process.env.DB_PASSWORD || '',
        replication: {
          role: 'slave',
          master_host: config.master_host || process.env.DB_MASTER_HOST || 'localhost',
          master_port: config.master_port || process.env.DB_MASTER_PORT || 3306,
          master_user: config.username || process.env.DB_USER || 'root',
          master_password: config.password || process.env.DB_PASSWORD || '',
          read_only: 1
        }
      };

      logger.info('Read replication configuration generated');
      return { master: masterConfig, slave: slaveConfig };
    } catch (error) {
      logger.error('Setup read replication failed:', error);
      return null;
    }
  }

  async getReplicationStatus() {
    try {
      const [results] = await sequelize.query(
        'SHOW SLAVE STATUS',
        { type: QueryTypes.SELECT }
      );

      const status = {
        is_replicating: results.length > 0,
        master_host: results[0]?.Master_Host || null,
        master_port: results[0]?.Master_Port || null,
        master_log_file: results[0]?.Master_Log_File || null,
        read_master_log_pos: results[0]?.Read_Master_Log_Pos || null,
        relay_log_file: results[0]?.Relay_Log_File || null,
        relay_log_pos: results[0]?.Relay_Log_Pos || null,
        relay_master_log_file: results[0]?.Relay_Master_Log_File || null,
        exec_master_log_pos: results[0]?.Exec_Master_Log_Pos || null,
        seconds_behind_master: results[0]?.Seconds_Behind_Master || null
      };

      logger.info('Replication status:', status);
      return status;
    } catch (error) {
      logger.error('Get replication status failed:', error);
      return null;
    }
  }
}

module.exports = new DatabaseOptimizationService();
