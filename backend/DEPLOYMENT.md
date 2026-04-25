# JuJu Party Platform 部署文档

## 目录

- [环境配置](#环境配置)
- [端口配置策略](#端口配置策略)
- [集群模式部署](#集群模式部署)
- [数据库读写分离](#数据库读写分离)
- [Redis配置](#redis配置)
- [分布式追踪](#分布式追踪)
- [灰度发布](#灰度发布)
- [Token黑名单](#token黑名单)
- [优雅关闭](#优雅关闭)
- [监控和日志](#监控和日志)
- [故障排查](#故障排查)

---

## 环境配置

### 环境变量文件

项目支持三种环境：

- **开发环境**: `.env.development`
- **测试环境**: `.env.test`
- **生产环境**: `.env.production`

### 环境切换

```bash
# 开发环境
NODE_ENV=development npm start

# 测试环境
NODE_ENV=test npm test

# 生产环境
NODE_ENV=production npm start
```

### 核心环境变量

```env
# 服务器配置
NODE_ENV=development
PORT=3010
APP_HOST=192.168.3.13

# 集群配置
CLUSTER_ENABLED=true
CLUSTER_WORKERS=4

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=juju_platform_dev
DB_USER=root
DB_PASSWORD=your_secure_password
DB_CHARSET=utf8mb4
DB_TIMEZONE=+08:00
DB_POOL_MIN=5
DB_POOL_MAX=20
DB_POOL_ACQUIRE_TIMEOUT=60000
DB_POOL_TIMEOUT=30000
DB_SSL=false

# 数据库读写分离
DB_READ_HOST=localhost
DB_READ_PORT=3306
DB_READ_NAME=juju_platform_dev
DB_READ_USER=root
DB_READ_PASSWORD=your_secure_password
DB_READ_POOL_MIN=2
DB_READ_POOL_MAX=10

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
REDIS_DB=0
REDIS_KEY_PREFIX=miniprogram:
REDIS_CONNECT_TIMEOUT=10000
REDIS_COMMAND_TIMEOUT=5000

# JWT配置
JWT_SECRET=your_jwt_secret_key_at_least_32_characters
JWT_EXPIRES_IN=7d
JWT_ALGORITHM=HS256

# 加密配置
ENCRYPTION_MASTER_KEY=your_encryption_key_at_least_32_characters

# CORS配置
CORS_ORIGIN=*
CORS_CREDENTIALS=false

# 限流配置
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_SKIP_SUCCESS_REQUESTS=false

# 缓存配置
CACHE_DEFAULT_TTL=300
CACHE_USER_TTL=180
CACHE_PARTY_TTL=300
CACHE_ORDER_TTL=180

# 分页配置
PAGINATION_DEFAULT_SIZE=10
PAGINATION_MAX_SIZE=50

# 支付配置
WECHAT_APP_ID=wx_your_app_id
WECHAT_APP_SECRET=your_app_secret
WECHAT_MCH_ID=your_mch_id
WECHAT_PAY_SERIAL_NO=your_serial_no
WECHAT_API_KEY=your_api_key
WECHAT_PAY_PUBLIC_KEY=./certs/pub_key.pem
WECHAT_PAY_API_V3_KEY=your_api_v3_key
WECHAT_NOTIFY_URL=https://your-domain.com/api/v1/payments/notify

# 上传配置
UPLOAD_MAX_SIZE=5242880
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/gif,image/webp
UPLOAD_PATH=./uploads
UPLOAD_BASE_URL=https://your-domain.com/uploads

# 性能配置
PERFORMANCE_THRESHOLD_MS=2000
SLOW_QUERY_THRESHOLD_MS=3000

# 监控配置
ERROR_ALERT_ENABLED=true
ERROR_ALERT_WEBHOOK=https://your-webhook-url
MEMORY_ALERT_THRESHOLD=90
CPU_ALERT_THRESHOLD=90

# 健康检查配置
HEALTH_CHECK_ENABLED=true
METRICS_ENABLED=true
API_DOCS_ENABLED=true

# 调试配置
DEBUG=false
PERFORMANCE_MONITORING=true

# 灰度发布配置
CANARY_NEWFEATURES_RATIO=0.1
```

---

## 端口配置策略

### 端口分配

| 环境 | 端口 | 用途 | 说明 |
|------|------|------|------|
| 开发环境 | 3010 | 开发服务器 | 本地开发使用 |
| 测试环境 | 3001 | 测试服务器 | API测试使用 |
| 生产环境 | 3000 | 生产服务器 | 正式环境使用 |
| Nginx Upstream | 3000-3003 | 负载均衡 | 支持多实例 |

### Nginx负载均衡配置

```nginx
upstream juju_platform_api {
    least_conn;
    server 127.0.0.1:3000 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:3001 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:3002 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:3003 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://juju_platform_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 端口配置最佳实践

1. **开发环境**: 使用3010端口，避免与生产环境冲突
2. **测试环境**: 使用3001端口，独立测试环境
3. **生产环境**: 使用3000端口，标准生产端口
4. **多实例部署**: 使用3000-3003端口，配合Nginx负载均衡

---

## 集群模式部署

### 启用集群模式

```env
# .env.development
CLUSTER_ENABLED=true
CLUSTER_WORKERS=4
```

### Worker数量配置

```javascript
// 自动根据CPU核心数配置
const numCPUs = require('os').cpus().length;
const numWorkers = parseInt(process.env.CLUSTER_WORKERS) || numCPUs;
```

### 集群模式优势

- **性能提升**: 充分利用多核CPU，性能提升30-50%
- **高可用性**: Worker崩溃自动重启，不影响服务
- **负载均衡**: 请求自动分配到不同worker
- **扩展性**: 支持水平扩展

### 集群模式监控

```bash
# 查看进程
ps aux | grep node

# 查看worker状态
curl http://localhost:3010/health

# 查看系统资源
top -p $(pgrep -d',' node)
```

### 集群模式注意事项

1. **测试环境**: 关闭集群模式（`CLUSTER_ENABLED=false`）
2. **开发环境**: 根据CPU核心数配置worker数量
3. **生产环境**: 建议配置worker数量 = CPU核心数
4. **内存管理**: 每个worker独立内存，注意内存使用

---

## 数据库读写分离

### 配置读写分离

```env
# 主库配置（写操作）
DB_HOST=master-db-host
DB_PORT=3306
DB_NAME=juju_platform
DB_USER=juju_user
DB_PASSWORD=secure_password

# 从库配置（读操作）
DB_READ_HOST=slave-db-host
DB_READ_PORT=3306
DB_READ_NAME=juju_platform
DB_READ_USER=juju_readonly_user
DB_READ_PASSWORD=readonly_password
```

### 使用读写分离

```javascript
const { readWrite, readOnly } = require('./config/databaseReadWrite');

// 写操作使用主库
const user = await readWrite.models.User.create({ name: 'test' });

// 读操作使用从库
const users = await readOnly.models.User.findAll();
```

### MySQL主从复制配置

**主库配置** (`mysql-master.cnf`):

```ini
[mysqld]
server-id=1
log-bin=mysql-bin
binlog-format=ROW
binlog-do-db=juju_platform
```

**从库配置** (`mysql-slave.cnf`):

```ini
[mysqld]
server-id=2
relay-log=relay-bin
read-only=1
```

### 读写分离优势

- **性能提升**: 读操作分散到从库，减轻主库压力
- **高可用性**: 从库故障不影响写操作
- **扩展性**: 可以添加多个从库
- **数据安全**: 主从备份，数据更安全

### 读写分离注意事项

1. **主从延迟**: 注意主从同步延迟
2. **事务处理**: 事务内读操作使用主库
3. **实时数据**: 需要实时数据的查询使用主库
4. **监控告警**: 监控主从同步状态

---

## Redis配置

### Redis单机配置

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
REDIS_DB=0
```

### Redis集群配置

```env
REDIS_CLUSTER_ENABLED=true
REDIS_CLUSTER_NODES=127.0.0.1:7000,127.0.0.1:7001,127.0.0.1:7002
```

### Redis集群部署

**Redis 7000配置** (`redis-7000.conf`):

```conf
port 7000
cluster-enabled yes
cluster-config-file nodes-7000.conf
cluster-node-timeout 5000
appendonly yes
appendfilename "appendonly-7000.aof"
maxmemory 2gb
maxmemory-policy allkeys-lru
```

**启动Redis集群**:

```bash
# 启动Redis实例
redis-server redis-7000.conf
redis-server redis-7001.conf
redis-server redis-7002.conf

# 创建集群
redis-cli --cluster create 127.0.0.1:7000 127.0.0.1:7001 127.0.0.1:7002 --cluster-replicas 1
```

### Redis使用场景

1. **缓存**: 用户数据、聚会信息、订单数据
2. **会话**: 用户会话存储
3. **分布式锁**: 防止并发冲突
4. **Token黑名单**: 失效Token管理
5. **限流**: API请求限流

### Redis监控

```bash
# 查看Redis信息
redis-cli INFO

# 查看内存使用
redis-cli INFO memory

# 查看连接数
redis-cli INFO clients

# 查看慢查询
redis-cli SLOWLOG GET 10
```

---

## 分布式追踪

### 启用分布式追踪

分布式追踪中间件已在 `server.js` 中默认启用：

```javascript
const { distributedTracing } = require('./middleware/distributedTracing');
app.use(distributedTracing);
```

### Trace数据结构

每个请求会自动生成：

- **traceId**: 全局追踪ID
- **spanId**: 当前请求span ID
- **parentSpanId**: 父span ID（如果有）
- **startTime**: 请求开始时间
- **endTime**: 请求结束时间
- **duration**: 请求持续时间

### Trace数据访问

```javascript
// 在请求中访问trace数据
app.get('/api/v1/data', (req, res) => {
  console.log('Trace ID:', req.traceId);
  console.log('Span ID:', req.spanId);
  console.log('Parent Span ID:', req.parentSpanId);
});
```

### 慢请求告警

默认阈值：1000ms

超过阈值的请求会自动记录警告日志：

```javascript
logger.warn('Slow request detected:', {
  traceId,
  spanId,
  path: req.path,
  method: req.method,
  duration: `${duration}ms`,
  threshold: '1000ms'
});
```

### Trace数据查询

```javascript
const { getTraceData, getAllActiveTraces } = require('./middleware/distributedTracing');

// 获取单个trace数据
const trace = getTraceData(spanId);

// 获取所有活跃trace
const allTraces = getAllActiveTraces();
```

### Trace数据清理

Trace数据会在60秒后自动清理，也可以手动清理：

```javascript
const { clearOldTraces } = require('./middleware/distributedTracing');

// 清理5分钟前的trace
clearOldTraces(300000);
```

---

## 灰度发布

### 启用灰度发布

灰度发布中间件已在 `server.js` 中启用：

```javascript
const { canaryRelease } = require('./middleware/canaryRelease');

// 10%的流量使用新功能
app.use(canaryRelease('newFeatures', 0.1));
```

### 灰度发布配置

```env
# 通过环境变量配置灰度比例
CANARY_NEWFEATURES_RATIO=0.1
CANARY_FEATUREA_RATIO=0.2
CANARY_FEATUREB_RATIO=0.05
```

### 单功能灰度

```javascript
const { canaryRelease } = require('./middleware/canaryRelease');

// 10%流量使用新功能
app.use('/api/v1/new-feature', canaryRelease('newFeature', 0.1));

// 在路由中使用
app.get('/api/v1/new-feature', (req, res) => {
  if (req.canaryFeatures.newFeature) {
    // 新版本逻辑
    return res.json({ version: 'v2' });
  } else {
    // 旧版本逻辑
    return res.json({ version: 'v1' });
  }
});
```

### 多功能灰度

```javascript
const { multiFeatureCanary } = require('./middleware/canaryRelease');

app.use(multiFeatureCanary({
  featureA: 0.1,  // 10%流量
  featureB: 0.2,  // 20%流量
  featureC: 0.05  // 5%流量
}));

// 在路由中使用
app.get('/api/v1/data', (req, res) => {
  if (req.canaryFeatures.featureA) {
    // featureA新版本
  }
  if (req.canaryFeatures.featureB) {
    // featureB新版本
  }
});
```

### 白名单灰度

```javascript
const { whitelistCanary } = require('./middleware/canaryRelease');

// 只有白名单用户使用新功能
app.use('/api/v1/new-feature', whitelistCanary('newFeature', ['user123', 'user456']));
```

### 灰度统计

```javascript
const { getCanaryStats, updateCanaryStats } = require('./middleware/canaryRelease');

// 获取灰度统计
const stats = getCanaryStats('newFeature');
console.log('Total:', stats.total);
console.log('Canary:', stats.canary);
console.log('Stable:', stats.stable);
console.log('Ratio:', stats.canaryRatio);

// 更新统计
updateCanaryStats('newFeature', true);  // 用户路由到灰度版本
updateCanaryStats('newFeature', false); // 用户路由到稳定版本
```

### 灰度缓存管理

```javascript
const { clearCanaryCache, setCanaryRatio } = require('./middleware/canaryRelease');

// 清除特定功能的灰度缓存
clearCanaryCache('newFeature');

// 清除所有灰度缓存
clearCanaryCache();

// 动态设置灰度比例
setCanaryRatio('newFeature', 0.2);
```

### 灰度发布最佳实践

1. **渐进式发布**: 从5%开始，逐步增加到100%
2. **监控指标**: 密切监控错误率、响应时间、用户反馈
3. **快速回滚**: 发现问题立即回滚（设置比例为0）
4. **用户一致性**: 同一用户始终路由到同一版本
5. **白名单测试**: 先让内部用户测试新功能

---

## Token黑名单

### 启用Token黑名单

Token黑名单已在 `auth.js` 中自动集成：

```javascript
const TokenBlacklist = require('../utils/tokenBlacklist');

// 在认证中间件中检查黑名单
const isBlacklisted = await TokenBlacklist.isBlacklisted(token);
if (isBlacklisted) {
  return res.status(401).json({
    success: false,
    message: 'Token已失效，请重新登录',
    code: 'TOKEN_INVALIDATED'
  });
}
```

### 添加Token到黑名单

```javascript
const TokenBlacklist = require('../utils/tokenBlacklist');

// 登出时添加到黑名单
await TokenBlacklist.addToBlacklist(token, 3600, 'user_logout');
```

### 检查Token状态

```javascript
const TokenBlacklist = require('../utils/tokenBlacklist');

// 检查Token是否在黑名单
const isBlacklisted = await TokenBlacklist.isBlacklisted(token);

// 获取黑名单信息
const info = await TokenBlacklist.getBlacklistInfo(token);
console.log('Reason:', info.reason);
console.log('Added At:', info.addedAt);
```

### 移除Token从黑名单

```javascript
const TokenBlacklist = require('../utils/tokenBlacklist');

// 移除Token（一般不需要，自动过期）
await TokenBlacklist.removeFromBlacklist(token);
```

### 黑名单统计

```javascript
const TokenBlacklist = require('../utils/tokenBlacklist');

// 获取黑名单统计
const stats = await TokenBlacklist.getBlacklistStats();
console.log('Total blacklisted tokens:', stats.total);
console.log('By reason:', stats.byReason);
```

### 清理黑名单

```javascript
const TokenBlacklist = require('../utils/tokenBlacklist');

// 清理所有黑名单Token
const count = await TokenBlacklist.clearAllBlacklistedTokens();
console.log('Cleared tokens:', count);

// 清理过期Token（自动执行）
const cleanedCount = await TokenBlacklist.cleanupExpiredTokens();
console.log('Cleaned expired tokens:', cleanedCount);
```

### Token黑名单使用场景

1. **用户登出**: 登出后Token立即失效
2. **密码修改**: 修改密码后所有Token失效
3. **账号封禁**: 封禁账号后所有Token失效
4. **安全策略**: 定期清理过期Token
5. **强制登出**: 管理员强制用户登出

---

## 优雅关闭

### 优雅关闭机制

系统实现了完善的优雅关闭机制：

1. **信号处理**: SIGTERM, SIGINT, SIGHUP
2. **HTTP服务器关闭**: 停止接受新请求
3. **数据库连接关闭**: 关闭所有数据库连接
4. **Redis连接关闭**: 关闭Redis连接
5. **超时控制**: 30秒超时保护

### 触发优雅关闭

```bash
# 发送SIGTERM信号（推荐）
kill -TERM <pid>

# 发送SIGINT信号
kill -INT <pid>

# Ctrl+C（开发环境）
```

### 优雅关闭流程

```
1. 接收关闭信号
2. 停止接受新请求
3. 等待现有请求完成（最多30秒）
4. 执行关闭回调
5. 关闭HTTP服务器
6. 关闭数据库连接
7. 关闭Redis连接
8. 退出进程
```

### 自定义关闭回调

```javascript
const gracefulShutdown = require('./utils/gracefulShutdown');

// 注册关闭回调
gracefulShutdown.registerCallback(async () => {
  console.log('Cleaning up resources...');
  // 清理自定义资源
  await cleanupCustomResources();
});
```

### 设置关闭超时

```javascript
const gracefulShutdown = require('./utils/gracefulShutdown');

// 设置关闭超时为60秒
gracefulShutdown.setShutdownTimeout(60000);
```

### 优雅关闭日志

```
[INFO] Received SIGTERM, starting graceful shutdown...
[INFO] Executing shutdown callbacks...
[INFO] Cleaning up resources...
[INFO] Closing HTTP server...
[INFO] HTTP server closed successfully
[INFO] Closing database connections...
[INFO] Database connection closed
[INFO] Database read-write connections closed
[INFO] Closing Redis connection...
[INFO] Redis connection closed
[INFO] Graceful shutdown completed
```

---

## 监控和日志

### 健康检查端点

```bash
# 健康检查
curl http://localhost:3010/health

# 就绪检查
curl http://localhost:3010/health/ready

# 存活检查
curl http://localhost:3010/health/live
```

### 健康检查响应

```json
{
  "status": "healthy",
  "timestamp": "2026-01-27T10:00:00.000Z",
  "uptime": 3600,
  "environment": "development",
  "version": "1.0.0",
  "services": {
    "database": "connected",
    "redis": "connected"
  },
  "system": {
    "platform": "win32",
    "nodeVersion": "v18.0.0",
    "memory": {
      "rss": 123456789,
      "heapTotal": 98765432,
      "heapUsed": 54321098
    },
    "cpu": {
      "user": 1234567,
      "system": 987654
    }
  }
}
```

### 日志级别

```env
LOG_LEVEL=debug  # debug, info, warn, error
LOG_CONSOLE=true
LOG_FILE=true
```

### 日志文件

日志文件位置：`logs/`

- `app.log`: 应用日志
- `error.log`: 错误日志
- `access.log`: 访问日志
- `audit.log`: 审计日志

### 性能监控

```env
PERFORMANCE_MONITORING=true
PERFORMANCE_THRESHOLD_MS=2000
SLOW_QUERY_THRESHOLD_MS=3000
```

### 错误告警

```env
ERROR_ALERT_ENABLED=true
ERROR_ALERT_WEBHOOK=https://your-webhook-url
```

### 系统资源监控

```env
MEMORY_ALERT_THRESHOLD=90  # 内存使用超过90%告警
CPU_ALERT_THRESHOLD=90     # CPU使用超过90%告警
```

---

## 故障排查

### 常见问题

#### 1. 端口被占用

```bash
# 查看端口占用
netstat -ano | findstr :3010

# Windows下杀死进程
taskkill /PID <pid> /F

# Linux/Mac下杀死进程
kill -9 <pid>
```

#### 2. 数据库连接失败

```bash
# 检查数据库连接
mysql -h localhost -u root -p

# 检查数据库状态
systemctl status mysql

# 查看数据库日志
tail -f /var/log/mysql/error.log
```

#### 3. Redis连接失败

```bash
# 检查Redis连接
redis-cli ping

# 检查Redis状态
systemctl status redis

# 查看Redis日志
tail -f /var/log/redis/redis.log
```

#### 4. Worker进程崩溃

```bash
# 查看worker进程
ps aux | grep node

# 查看worker日志
tail -f logs/app.log | grep Worker

# 检查内存使用
top -p $(pgrep -d',' node)
```

#### 5. 灰度发布不生效

```bash
# 检查灰度配置
echo $CANARY_NEWFEATURES_RATIO

# 清除灰度缓存
# 在代码中调用 clearCanaryCache()

# 查看灰度日志
tail -f logs/app.log | grep canary
```

#### 6. Token黑名单不生效

```bash
# 检查Redis连接
redis-cli ping

# 查看黑名单数据
redis-cli KEYS "blacklist:*"

# 查看Token信息
redis-cli GET "blacklist:<token>"
```

### 性能优化建议

1. **数据库优化**
   - 添加适当的索引
   - 优化慢查询
   - 使用连接池
   - 启用查询缓存

2. **Redis优化**
   - 设置合适的maxmemory
   - 选择合适的淘汰策略
   - 使用Pipeline批量操作
   - 监控内存使用

3. **应用优化**
   - 启用集群模式
   - 使用读写分离
   - 优化数据适配器
   - 实现缓存策略

4. **网络优化**
   - 使用CDN加速
   - 启用Gzip压缩
   - 优化Nginx配置
   - 使用HTTP/2

---

## 总结

本文档涵盖了JuJu Party平台的完整部署和运维指南，包括：

- ✅ 环境配置和端口策略
- ✅ 集群模式部署
- ✅ 数据库读写分离
- ✅ Redis配置和集群
- ✅ 分布式追踪
- ✅ 灰度发布
- ✅ Token黑名单
- ✅ 优雅关闭
- ✅ 监控和日志
- ✅ 故障排查

遵循本文档的指导，可以确保系统的稳定运行和高效运维。