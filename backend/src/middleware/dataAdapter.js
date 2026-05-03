const AdapterFactory = require('../utils/adapters');
const logger = require('../utils/logger');

const adapterCache = new Map();
const performanceThreshold = 50;

function dataAdapter(req, res, next) {
  const originalJson = res.json.bind(res);
  
  res.json = function(data) {
    try {
      const clientType = mapClientType(req.client || 'unknown');
      
      // 调试日志
      logger.info(`DEBUG dataAdapter: clientType=${clientType}, path=${req.path}, hasData=${!!(data && data.data)}`);
      
      if (clientType === 'web') {
        logger.info('DEBUG dataAdapter: skipping web client');
        return originalJson(data);
      }
      
      const cacheKey = `${clientType}_${req.adaptType || 'default'}`;
      let adapter = adapterCache.get(cacheKey);
      
      if (!adapter) {
        adapter = AdapterFactory.getAdapter(clientType);
        if (adapter) {
          adapterCache.set(cacheKey, adapter);
          if (adapterCache.size > 100) {
            const firstKey = adapterCache.keys().next().value;
            adapterCache.delete(firstKey);
          }
        }
      }
      
      logger.info(`DEBUG dataAdapter: adapter=${adapter ? adapter.constructor.name : 'null'}`);
      
      if (data && typeof data === 'object' && adapter) {
        if (data.success !== undefined && data.data !== undefined) {
          const startTime = Date.now();
          
          let adaptedData = data.data;
          
          if (data.data && typeof data.data === 'object') {
            if (data.data.list !== undefined) {
              const { list, ...paginationInfo } = data.data;
              const pagination = {
                page: paginationInfo.page || 1,
                pageSize: paginationInfo.pageSize || 20,
                total: paginationInfo.total || 0
              };
              adaptedData = adapter.adaptPagination(list, pagination);
            } else if (data.data.items !== undefined && data.data.pagination !== undefined) {
              adaptedData = adapter.adaptPagination(data.data.items, data.data.pagination);
            } else {
              logger.info(`DEBUG dataAdapter: calling adaptResponse with data type: ${typeof data.data}, isArray: ${Array.isArray(data.data)}`);
              adaptedData = adapter.adaptResponse(data.data, req.adaptType);
            }
          } else {
            adaptedData = adapter.adaptResponse(data.data, req.adaptType);
          }
          
          const duration = Date.now() - startTime;
          
          if (duration > performanceThreshold) {
            logger.warn('Data adapter performance warning:', {
              clientType,
              adaptType: req.adaptType || 'default',
              duration: `${duration}ms`,
              threshold: `${performanceThreshold}ms`,
              path: req.path
            });
          }
          
          return originalJson({
            ...data,
            data: adaptedData,
            ...(process.env.NODE_ENV === 'development' && {
              _adapter: {
                clientType,
                adapterClass: adapter.constructor.name,
                adaptType: req.adaptType || 'default',
                duration: `${duration}ms`
              }
            })
          });
        } else {
          const startTime = Date.now();
          const adaptedData = adapter.adaptResponse(data, req.adaptType);
          const duration = Date.now() - startTime;
          
          if (duration > performanceThreshold) {
            logger.warn('Data adapter performance warning:', {
              clientType,
              adaptType: req.adaptType || 'default',
              duration: `${duration}ms`,
              threshold: `${performanceThreshold}ms`,
              path: req.path
            });
          }
          
          return originalJson(adaptedData);
        }
      }
      
      return originalJson(data);
      
    } catch (error) {
      logger.error('Data adapter error:', {
        error: error.message,
        clientType: req.client,
        path: req.path,
        method: req.method
      });
      
      return originalJson(data);
    }
  };
  
  next();
}

/**
 * 映射旧的客户端标识到新的标识
 */
function mapClientType(oldClientType) {
  const clientTypeMap = {
    'wechat-miniprogram': 'miniprogram',
    'uni-app': 'app',
    'app': 'app',
    'web-admin': 'web',
    'official-website': 'website',
    'website': 'website',
    'web': 'web',
    'unknown': 'website'
  };
  
  return clientTypeMap[oldClientType] || 'website';
}

/**
 * 设置适配类型的辅助函数
 * 在路由中使用，指定特定的适配类型
 */
function setAdaptType(type) {
  return (req, res, next) => {
    req.adaptType = type;
    next();
  };
}

/**
 * 跳过数据适配的中间件
 * 用于某些不需要适配的接口
 */
function skipAdapter(req, res, next) {
  // 保存原始的 json 方法，跳过适配
  const originalJson = res.json.bind(res);
  res.json = originalJson;
  next();
}

/**
 * 强制使用指定适配器的中间件
 */
function forceAdapter(clientType) {
  return (req, res, next) => {
    // 临时覆盖客户端类型
    req.client = clientType;
    next();
  };
}

module.exports = {
  dataAdapter,
  setAdaptType,
  skipAdapter,
  forceAdapter
};
