// 首先加载环境变量，必须在任何其他模块之前
const path = require('path');
const fs = require('fs');

// 临时绕过dotenv，直接读取.env文件
try {
  const envFile = fs.readFileSync(path.resolve(__dirname, '../.env'), 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim();
    }
  });
} catch (e) {
  console.log('Warning: Could not load .env file');
}

const env = process.env.NODE_ENV || 'development';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const http = require('http');

const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const clientIdentifier = require('./middleware/clientIdentifier');
const { requestLogger } = require('./middleware/requestLogger');
const { createSanitizationMiddleware } = require('./utils/logSanitizer');
const { createAuditMiddleware } = require('./utils/auditLogger');
const { createEncryptionMiddleware } = require('./utils/encryption');
const { createDataMaskingMiddleware } = require('./utils/dataMasking');
const { dataAdapter } = require('./middleware/dataAdapter');
const { distributedTracing } = require('./middleware/distributedTracing');
const { canaryRelease } = require('./middleware/canaryRelease');
const { prometheusMiddleware } = require('./middleware/prometheus');
const webSocketService = require('./services/webSocketService');

const app = express();

app.use(helmet({
  contentSecurityPolicy: false
}));
const corsOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : (process.env.NODE_ENV === 'production' ? [] : ['*']);
// 生产环境禁止使用通配符CORS
if (process.env.NODE_ENV === 'production' && corsOrigins.length === 0) {
  console.warn('WARNING: CORS_ORIGIN not configured for production! API may be insecure.');
}
app.use(cors({
  origin: corsOrigins,
  credentials: process.env.CORS_CREDENTIALS === 'true'
}));
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later'
});
app.use(limiter);
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// 安全中间件集成
app.use(createSanitizationMiddleware({
  logRequests: process.env.NODE_ENV === 'development',
  logResponses: false
}));
app.use(createAuditMiddleware({
  logAllRequests: process.env.NODE_ENV === 'development',
  logSensitiveOperations: true
}));
app.use(createEncryptionMiddleware());

if (process.env.NODE_ENV !== 'test') {
  app.use(createDataMaskingMiddleware());
}

app.use(requestLogger);
app.use(distributedTracing);
app.use(clientIdentifier);

app.use(canaryRelease('newFeatures', 0.1));

app.use(dataAdapter);

app.use(prometheusMiddleware);

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'JuJu Party API',
      version: '1.0.0',
      description: 'JuJu Party 聚聚平台统一后端API文档'
    },
    servers: [
      {
        url: `http://${process.env.APP_HOST || 'localhost'}:${process.env.PORT || 3000}`,
        description: `${process.env.NODE_ENV || 'development'} server`
      }
    ]
  },
  apis: ['./src/routes/**/*.js']
};
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to JuJu Party API',
    version: '1.0.0',
    client: req.client
  });
});

app.get('/health', async (req, res) => {
  try {
    const { testConnection } = require('./config/database');
    const dbConnection = await testConnection();
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: '1.0.0',
      services: {
        database: dbConnection ? 'connected' : 'disconnected',
        redis: 'connected'
      },
      system: {
        platform: process.platform,
        nodeVersion: process.version,
        memory: process.memoryUsage(),
        cpu: process.cpuUsage()
      }
    };
    
    res.status(200).json(healthStatus);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      services: {
        database: 'disconnected',
        redis: 'unknown'
      }
    });
  }
});

app.get('/health/ready', async (req, res) => {
  try {
    const { testConnection } = require('./config/database');
    await testConnection();
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

app.get('/health/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/metrics', (req, res) => {
  const { metrics } = require('./middleware/prometheus');
  res.set('Content-Type', 'text/plain');
  res.end(metrics);
});

app.use('/api/v1', require('./routes/v1'));
app.use('/api/v2', require('./routes/v2'));
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
const gracefulShutdown = require('./utils/gracefulShutdown');

if (process.env.NODE_ENV !== 'test' || process.env.START_SERVER_IN_TEST === 'true') {
  const server = http.createServer(app);
  
  webSocketService.initialize(server);
  
  // 启动订单超时自动取消服务
  if (process.env.ENABLE_ORDER_TIMEOUT !== 'false') {
    const { orderTimeoutService } = require('./services/orderTimeoutService');
    orderTimeoutService.start();
  }
  
  if (process.env.CLUSTER_ENABLED === 'true') {
    const cluster = require('cluster');
    const numCPUs = require('os').cpus().length;
    const numWorkers = parseInt(process.env.CLUSTER_WORKERS) || numCPUs;

    if (cluster.isMaster) {
      logger.info(`Master ${process.pid} is running`);
      logger.info(`Starting ${numWorkers} workers...`);

      for (let i = 0; i < numWorkers; i++) {
        cluster.fork();
      }

      cluster.on('exit', (worker, code, signal) => {
        logger.info(`Worker ${worker.process.pid} died with code ${code} and signal ${signal}`);
        logger.info('Starting a new worker...');
        cluster.fork();
      });
    } else {
      server.listen(PORT, '0.0.0.0', () => {
        logger.info(`Worker ${process.pid} started on port ${PORT}`);
        logger.info(`Environment: ${process.env.NODE_ENV}`);
        logger.info(`API Documentation: http://localhost:${PORT}/api-docs`);
        
        gracefulShutdown.registerServer(server);
      });
    }
  } else {
    server.listen(PORT, '0.0.0.0', () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      logger.info(`API Documentation: http://localhost:${PORT}/api-docs`);
      
      gracefulShutdown.registerServer(server);
    });
  }
}
module.exports = app;

