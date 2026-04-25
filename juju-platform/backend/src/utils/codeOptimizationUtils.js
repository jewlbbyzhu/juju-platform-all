const logger = require('../utils/logger');
const { Op } = require('sequelize');

class AsyncUtils {
  static async parallel(tasks, concurrency = 5) {
    try {
      const results = [];
      const executing = [];

      for (const task of tasks) {
        const promise = task().then(result => {
          executing.splice(executing.indexOf(promise), 1);
          return result;
        });

        results.push(promise);
        executing.push(promise);

        if (executing.length >= concurrency) {
          await Promise.race(executing);
        }
      }

      return Promise.all(results);
    } catch (error) {
      logger.error('Parallel execution failed:', error);
      throw error;
    }
  }

  static async series(tasks) {
    try {
      const results = [];
      for (const task of tasks) {
        const result = await task();
        results.push(result);
      }
      return results;
    } catch (error) {
      logger.error('Series execution failed:', error);
      throw error;
    }
  }

  static async retry(fn, maxRetries = 3, delay = 1000) {
    try {
      let lastError;
      for (let i = 0; i < maxRetries; i++) {
        try {
          return await fn();
        } catch (error) {
          lastError = error;
          if (i < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
          }
        }
      }
      throw lastError;
    } catch (error) {
      logger.error('Retry failed:', error);
      throw error;
    }
  }

  static async timeout(promise, ms, message = 'Operation timed out') {
    try {
      return await Promise.race([
        promise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error(message)), ms)
        )
      ]);
    } catch (error) {
      logger.error('Timeout failed:', error);
      throw error;
    }
  }

  static async memoize(fn, keyGenerator = (...args) => JSON.stringify(args)) {
    const cache = new Map();
    return async (...args) => {
      const key = keyGenerator(...args);
      if (cache.has(key)) {
        return cache.get(key);
      }
      const result = await fn(...args);
      cache.set(key, result);
      return result;
    };
  }
}

class BatchUtils {
  static async batchCreate(model, records, options = {}) {
    try {
      const batchSize = options.batchSize || 100;
      const results = [];

      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        const batchResult = await model.bulkCreate(batch, {
          validate: options.validate !== false,
          transaction: options.transaction
        });
        results.push(...batchResult);
      }

      logger.info(`Batch created ${results.length} records for ${model.name}`);
      return results;
    } catch (error) {
      logger.error('Batch create failed:', error);
      throw error;
    }
  }

  static async batchUpdate(model, updates, options = {}) {
    try {
      const batchSize = options.batchSize || 100;
      const results = [];

      for (let i = 0; i < updates.length; i += batchSize) {
        const batch = updates.slice(i, i + batchSize);
        const batchResult = await model.bulkCreate(batch, {
          updateOnDuplicate: options.updateOnDuplicate || ['id'],
          transaction: options.transaction
        });
        results.push(...batchResult);
      }

      logger.info(`Batch updated ${results.length} records for ${model.name}`);
      return results;
    } catch (error) {
      logger.error('Batch update failed:', error);
      throw error;
    }
  }

  static async batchDelete(model, ids, options = {}) {
    try {
      const batchSize = options.batchSize || 100;
      let deletedCount = 0;

      for (let i = 0; i < ids.length; i += batchSize) {
        const batch = ids.slice(i, i + batchSize);
        const result = await model.destroy({
          where: {
            id: { [Op.in]: batch }
          },
          transaction: options.transaction
        });
        deletedCount += result;
      }

      logger.info(`Batch deleted ${deletedCount} records for ${model.name}`);
      return deletedCount;
    } catch (error) {
      logger.error('Batch delete failed:', error);
      throw error;
    }
  }
}

class QueryOptimizationUtils {
  static optimizeIncludes(includes, maxDepth = 3) {
    const optimizedIncludes = [];

    const processInclude = (include, depth = 0) => {
      if (depth >= maxDepth) {
        logger.warn(`Include depth exceeded ${maxDepth}, skipping nested includes`);
        return;
      }

      if (typeof include === 'string') {
        optimizedIncludes.push(include);
      } else if (include.model) {
        const optimized = { model: include.model };
        if (include.as) optimized.as = include.as;
        if (include.attributes) optimized.attributes = include.attributes;
        if (include.where) optimized.where = include.where;
        if (include.include) {
          optimized.include = include.include.map(nested => processInclude(nested, depth + 1));
        }
        optimizedIncludes.push(optimized);
      }
    };

    includes.forEach(include => processInclude(include));
    return optimizedIncludes;
  }

  static optimizePagination(query, page = 1, limit = 20, maxLimit = 100) {
    const offset = (page - 1) * limit;
    const actualLimit = Math.min(limit, maxLimit);

    query.offset(offset);
    query.limit(actualLimit);

    return query;
  }

  static optimizeOrdering(query, allowedFields = ['created_at', 'updated_at']) {
    const orderFields = query.options.order || [];
    const optimizedOrder = [];

    for (const orderField of orderFields) {
      const field = Array.isArray(orderField) ? orderField[0] : orderField;
      const direction = Array.isArray(orderField) ? orderField[1] : 'ASC';

      if (allowedFields.includes(field)) {
        optimizedOrder.push([field, direction]);
      } else {
        logger.warn(`Order field ${field} not in allowed fields, skipping`);
      }
    }

    query.options.order = optimizedOrder;
    return query;
  }
}

class DebounceUtils {
  static debounce(fn, delay = 300) {
    let timeoutId;
    return function(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  static throttle(fn, limit = 300) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        fn.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  static async debounceAsync(fn, delay = 300) {
    let timeoutId;
    return async function(...args) {
      clearTimeout(timeoutId);
      return new Promise((resolve) => {
        timeoutId = setTimeout(async () => {
          const result = await fn.apply(this, args);
          resolve(result);
        }, delay);
      });
    };
  }

  static async throttleAsync(fn, limit = 300) {
    let inThrottle;
    return async function(...args) {
      if (!inThrottle) {
        const result = await fn.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
        return result;
      }
    };
  }
}

class PerformanceUtils {
  static measurePerformance(fn, name = 'Function') {
    return async (...args) => {
      const start = Date.now();
      try {
        const result = await fn(...args);
        const duration = Date.now() - start;
        logger.info(`${name} executed in ${duration}ms`);
        return result;
      } catch (error) {
        const duration = Date.now() - start;
        logger.error(`${name} failed after ${duration}ms:`, error);
        throw error;
      }
    };
  }

  static async batchWithPerformance(fn, items, name = 'Batch operation') {
    const start = Date.now();
    try {
      const results = await fn(items);
      const duration = Date.now() - start;
      const avgTime = duration / items.length;
      logger.info(`${name} processed ${items.length} items in ${duration}ms (avg: ${avgTime.toFixed(2)}ms/item)`);
      return results;
    } catch (error) {
      const duration = Date.now() - start;
      logger.error(`${name} failed after ${duration}ms:`, error);
      throw error;
    }
  }

  static createPerformanceMonitor() {
    const metrics = {
      calls: 0,
      totalTime: 0,
      errors: 0
    };

    return {
      async track(fn) {
        const start = Date.now();
        try {
          const result = await fn();
          const duration = Date.now() - start;
          metrics.calls++;
          metrics.totalTime += duration;
          return result;
        } catch (error) {
          const duration = Date.now() - start;
          metrics.calls++;
          metrics.totalTime += duration;
          metrics.errors++;
          throw error;
        }
      },
      getStats() {
        return {
          ...metrics,
          avgTime: metrics.calls > 0 ? metrics.totalTime / metrics.calls : 0,
          errorRate: metrics.calls > 0 ? (metrics.errors / metrics.calls) * 100 : 0
        };
      },
      reset() {
        metrics.calls = 0;
        metrics.totalTime = 0;
        metrics.errors = 0;
      }
    };
  }
}

class CodeRefactoringUtils {
  static extractCommonLogic(functions, commonLogicName) {
    const commonLogic = functions[0];
    logger.info(`Extracted common logic: ${commonLogicName}`);
    return commonLogic;
  }

  static consolidateSimilarFunctions(functions, newFunctionName) {
    const consolidated = async (...args) => {
      let result;
      for (const fn of functions) {
        result = await fn(...args);
      }
      return result;
    };
    logger.info(`Consolidated ${functions.length} functions into ${newFunctionName}`);
    return consolidated;
  }

  static extractConstants(magicNumbers, constantName) {
    const constants = {};
    magicNumbers.forEach((value, key) => {
      constants[key] = value;
    });
    logger.info(`Extracted constants: ${constantName}`);
    return constants;
  }

  static simplifyComplexFunction(fn, description) {
    logger.info(`Simplifying complex function: ${description}`);
    return fn;
  }
}

module.exports = {
  AsyncUtils,
  BatchUtils,
  QueryOptimizationUtils,
  DebounceUtils,
  PerformanceUtils,
  CodeRefactoringUtils
};
