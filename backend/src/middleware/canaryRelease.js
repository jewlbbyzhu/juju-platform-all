const logger = require('../utils/logger');

const canaryStore = new Map();
const userCanaryCache = new Map();

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) / 0xFFFFFFFF;
}

function canaryRelease(featureName, ratio = 0) {
  return (req, res, next) => {
    const canaryRatio = parseFloat(process.env[`CANARY_${featureName.toUpperCase()}_RATIO`]) || ratio;
    
    if (canaryRatio <= 0) {
      req.canary = false;
      req.canaryFeatures = { [featureName]: false };
      return next();
    }
    
    if (canaryRatio >= 1) {
      req.canary = true;
      req.canaryFeatures = { [featureName]: true };
      return next();
    }
    
    const userId = req.user?.id || req.headers['x-user-id'] || req.ip;
    const cacheKey = `${featureName}_${userId}`;
    
    if (userCanaryCache.has(cacheKey)) {
      req.canary = userCanaryCache.get(cacheKey);
      req.canaryFeatures = { [featureName]: req.canary };
      return next();
    }
    
    const hash = userId ? simpleHash(userId.toString()) : Math.random();
    const isCanary = hash < canaryRatio;
    
    userCanaryCache.set(cacheKey, isCanary);
    
    if (userCanaryCache.size > 10000) {
      const firstKey = userCanaryCache.keys().next().value;
      userCanaryCache.delete(firstKey);
    }
    
    req.canary = isCanary;
    req.canaryFeatures = { [featureName]: isCanary };
    
    if (isCanary) {
      logger.info('User routed to canary version:', {
        featureName,
        userId: userId?.toString(),
        hash: hash.toFixed(6),
        ratio: canaryRatio
      });
    }
    
    next();
  };
}

function multiFeatureCanary(features) {
  return (req, res, next) => {
    const canaryFeatures = {};
    const userId = req.user?.id || req.headers['x-user-id'] || req.ip;
    
    for (const [featureName, ratio] of Object.entries(features)) {
      const envRatio = parseFloat(process.env[`CANARY_${featureName.toUpperCase()}_RATIO`]) || ratio;
      
      if (envRatio <= 0) {
        canaryFeatures[featureName] = false;
        continue;
      }
      
      if (envRatio >= 1) {
        canaryFeatures[featureName] = true;
        continue;
      }
      
      const cacheKey = `${featureName}_${userId}`;
      
      if (userCanaryCache.has(cacheKey)) {
        canaryFeatures[featureName] = userCanaryCache.get(cacheKey);
        continue;
      }
      
      const hash = userId ? simpleHash(userId.toString()) : Math.random();
      const isCanary = hash < envRatio;
      
      userCanaryCache.set(cacheKey, isCanary);
      canaryFeatures[featureName] = isCanary;
      
      if (isCanary) {
        logger.info('User routed to canary version:', {
          featureName,
          userId: userId?.toString(),
          hash: hash.toFixed(6),
          ratio: envRatio
        });
      }
    }
    
    if (userCanaryCache.size > 10000) {
      const firstKey = userCanaryCache.keys().next().value;
      userCanaryCache.delete(firstKey);
    }
    
    req.canary = Object.values(canaryFeatures).some(v => v);
    req.canaryFeatures = canaryFeatures;
    next();
  };
}

function whitelistCanary(featureName, whitelist = []) {
  return (req, res, next) => {
    const userId = req.user?.id || req.headers['x-user-id'];
    
    if (!userId) {
      req.canary = false;
      req.canaryFeatures = { [featureName]: false };
      return next();
    }
    
    const isWhitelisted = whitelist.includes(userId.toString());
    
    req.canary = isWhitelisted;
    req.canaryFeatures = { [featureName]: isWhitelisted };
    
    if (isWhitelisted) {
      logger.info('User in canary whitelist:', {
        featureName,
        userId: userId.toString()
      });
    }
    
    next();
  };
}

function getCanaryStats(featureName) {
  const stats = canaryStore.get(featureName) || {
    total: 0,
    canary: 0,
    stable: 0
  };
  
  return {
    ...stats,
    canaryRatio: stats.total > 0 ? (stats.canary / stats.total) : 0
  };
}

function updateCanaryStats(featureName, isCanary) {
  if (!canaryStore.has(featureName)) {
    canaryStore.set(featureName, {
      total: 0,
      canary: 0,
      stable: 0
    });
  }
  
  const stats = canaryStore.get(featureName);
  stats.total++;
  
  if (isCanary) {
    stats.canary++;
  } else {
    stats.stable++;
  }
}

function clearCanaryCache(featureName) {
  if (featureName) {
    const keysToDelete = [];
    for (const key of userCanaryCache.keys()) {
      if (key.startsWith(`${featureName}_`)) {
        keysToDelete.push(key);
      }
    }
    
    for (const key of keysToDelete) {
      userCanaryCache.delete(key);
    }
    
    logger.info(`Cleared canary cache for feature: ${featureName}`, {
      clearedCount: keysToDelete.length
    });
  } else {
    userCanaryCache.clear();
    logger.info('Cleared all canary cache');
  }
}

function setCanaryRatio(featureName, ratio) {
  canaryStore.set(featureName, {
    total: 0,
    canary: 0,
    stable: 0,
    ratio,
    updatedAt: new Date().toISOString()
  });
  
  clearCanaryCache(featureName);
  
  logger.info('Canary ratio updated:', {
    featureName,
    ratio,
    updatedAt: new Date().toISOString()
  });
}

module.exports = {
  canaryRelease,
  multiFeatureCanary,
  whitelistCanary,
  getCanaryStats,
  updateCanaryStats,
  clearCanaryCache,
  setCanaryRatio
};