# JuJu Party Platform 监控和运维指南

## 目录

- [MySQL主从复制](#mysql主从复制)
- [Prometheus监控](#prometheus监控)
- [Grafana仪表盘](#grafana仪表盘)
- [集群模式监控](#集群模式监控)
- [告警规则](#告警规则)
- [运维脚本](#运维脚本)
- [故障排查](#故障排查)

---

## MySQL主从复制

### 配置文件

#### 主库配置

**文件**: `config/mysql-master.cnf`

```ini
[mysqld]
server-id=1
log-bin=mysql-bin
binlog-format=ROW
binlog-do-db=juju_platform
binlog-do-db=juju_test
max_binlog_size=100M
expire_logs_days=7
sync_binlog=1
binlog_cache_size=4M

# InnoDB配置
innodb_flush_log_at_trx_commit=2
innodb_flush_method=O_DIRECT
innodb_buffer_pool_size=1G
innodb_log_file_size=256M
innodb_log_buffer_size=16M

# 连接配置
max_connections=500
max_connect_errors=100000
connect_timeout=10
wait_timeout=28800
interactive_timeout=28800

# 慢查询日志
slow_query_log=1
slow_query_log_file=/var/log/mysql/slow-query.log
long_query_time=2

# 字符集
character-set-server=utf8mb4
collation-server=utf8mb4_unicode_ci

# 时区
default-time-zone='+08:00'

# 网络配置
bind-address=0.0.0.0
port=3306
skip-name-resolve
```

#### 从库配置

**文件**: `config/mysql-slave.cnf`

```ini
[mysqld]
server-id=2
relay-log=relay-bin
read-only=1
relay-log-index=relay-bin.index
relay_log_recovery=1

# 主库连接信息
master-host=localhost
master-port=3306
master-user=repl
master-password=repl_password
master-connect-retry=60

# 复制过滤
replicate-do-db=juju_platform
replicate-do-db=juju_test

# 并行复制
slave_parallel_workers=4
slave_parallel_type=LOGICAL_CLOCK

# 中继日志
max_relay_log_size=100M
relay_log_purge=1

# InnoDB配置
innodb_flush_log_at_trx_commit=2
innodb_flush_method=O_DIRECT
innodb_buffer_pool_size=1G
innodb_log_file_size=256M
innodb_log_buffer_size=16M

# 连接配置
max_connections=500
max_connect_errors=100000
connect_timeout=10
wait_timeout=28800
interactive_timeout=28800

# 慢查询日志
slow_query_log=1
slow_query_log_file=/var/log/mysql/slow-query.log
long_query_time=2

# 字符集
character-set-server=utf8mb4
collation-server=utf8mb4_unicode_ci

# 时区
default-time-zone='+08:00'

# 网络配置
bind-address=0.0.0.0
port=3307
skip-name-resolve
```

### 设置脚本

**文件**: `scripts/setup-replication.js`

```javascript
const { setupMasterSlaveReplication, checkReplicationStatus, stopReplication, startReplication } = require('./scripts/setup-replication');

// 设置主从复制
await setupMasterSlaveReplication();

// 检查复制状态
const status = await checkReplicationStatus();
console.log('Replication status:', status);

// 停止复制
await stopReplication();

// 启动复制
await startReplication();
```

### 使用方法

```bash
# 1. 配置主库
sudo cp config/mysql-master.cnf /etc/mysql/mysql.conf.d/master.cnf
sudo systemctl restart mysql

# 2. 配置从库
sudo cp config/mysql-slave.cnf /etc/mysql/mysql.conf.d/slave.cnf
sudo systemctl restart mysql

# 3. 运行设置脚本
node scripts/setup-replication.js

# 4. 检查复制状态
node -e "const { checkReplicationStatus } = require('./scripts/setup-replication'); checkReplicationStatus().then(console.log);"
```

### 监控指标

- **Slave_IO_Running**: Yes/No - IO线程是否运行
- **Slave_SQL_Running**: Yes/No - SQL线程是否运行
- **Seconds_Behind_Master**: 延迟秒数
- **Last_Error**: 最后错误信息

### 故障排查

```sql
-- 查看主库状态
SHOW MASTER STATUS;

-- 查看从库状态
SHOW SLAVE STATUS\G;

-- 查看复制错误
SHOW SLAVE STATUS\G;

-- 重置从库
STOP SLAVE;
RESET SLAVE;
START SLAVE;
```

---

## Prometheus监控

### 配置文件

**文件**: `config/prometheus.yml`

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    monitor: 'juju-backend'
    environment: '${NODE_ENV:development}'

scrape_configs:
  - job_name: 'juju-backend'
    static_configs:
      - targets: ['localhost:3010']
    metrics_path: '/metrics'
    scrape_interval: 10s
    scrape_timeout: 10s

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['localhost:9100']
    scrape_interval: 10s

  - job_name: 'mysql-exporter'
    static_configs:
      - targets: ['localhost:9104']
    scrape_interval: 10s

  - job_name: 'redis-exporter'
    static_configs:
      - targets: ['localhost:9121']
    scrape_interval: 10s

alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - 'localhost:9093'

rule_files:
  - '/etc/prometheus/rules/*.yml'
```

### 中间件集成

**文件**: `src/middleware/prometheus.js`

```javascript
const prometheus = require('./middleware/prometheus');
const { startMetricsCollection } = prometheus;

// 在app.js中集成
app.use(prometheus.prometheusMiddleware);

// 启动指标收集
startMetricsCollection(15000);

// 暴露metrics端点
app.get('/metrics', (req, res) => {
  res.set('Content-Type', prometheus.register.contentType);
  res.end(prometheus.register.metrics());
});
```

### 指标说明

#### HTTP指标

- `http_request_duration_seconds`: HTTP请求持续时间（直方图）
- `http_requests_total`: HTTP请求总数（计数器）
- `http_request_size_bytes`: HTTP请求大小（直方图）
- `http_response_size_bytes`: HTTP响应大小（直方图）
- `http_active_connections`: 活跃连接数（仪表盘）

#### 系统指标

- `process_cpu_seconds_total`: CPU使用时间（计数器）
- `process_resident_memory_bytes`: 常驻内存（仪表盘）
- `process_heap_memory_bytes`: 堆内存（仪表盘）
- `nodejs_eventloop_lag_seconds`: 事件循环延迟（仪表盘）

### 使用方法

```bash
# 1. 安装Prometheus
wget https://github.com/prometheus/prometheus/releases/download/v2.45.0/prometheus-2.45.0.linux-amd64.tar.gz
tar xvfz prometheus-2.45.0.linux-amd64.tar.gz
cd prometheus-2.45.0.linux-amd64
sudo cp prometheus promtool /usr/local/bin/

# 2. 配置Prometheus
sudo cp config/prometheus.yml /etc/prometheus/prometheus.yml
sudo cp config/prometheus-alerts.yml /etc/prometheus/rules/alerts.yml

# 3. 启动Prometheus
sudo prometheus --config.file=/etc/prometheus/prometheus.yml --web.listen-address=:9090

# 4. 访问Prometheus UI
open http://localhost:9090
```

---

## Grafana仪表盘

### 仪表盘配置

**文件**: `config/grafana-dashboard.json`

导入方法：
1. 打开Grafana：http://localhost:3000
2. 登录（默认：admin/admin）
3. 进入 Dashboards → Import
4. 上传 `grafana-dashboard.json` 文件
5. 选择Prometheus数据源

### 仪表盘面板

#### 1. Request Rate
- **类型**: Graph
- **指标**: `rate(http_requests_total[5m])`
- **说明**: 每秒请求数

#### 2. Response Time (P95)
- **类型**: Graph
- **指标**: `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))`
- **说明**: 95分位响应时间

#### 3. Error Rate
- **类型**: Graph
- **指标**: `rate(http_requests_total{status_code=~"5.."}[5m])`
- **说明**: 每秒错误数

#### 4. CPU Usage
- **类型**: Graph
- **指标**: `rate(process_cpu_seconds_total[5m]) * 100`
- **说明**: CPU使用率

#### 5. Memory Usage
- **类型**: Graph
- **指标**: 
  - `process_resident_memory_bytes / 1024 / 1024 / 1024` (RSS)
  - `process_heap_memory_bytes / 1024 / 1024 / 1024` (Heap)
- **说明**: 内存使用量

#### 6. Active Connections
- **类型**: Stat
- **指标**: `http_active_connections`
- **说明**: 当前活跃连接数

#### 7. Event Loop Lag
- **类型**: Graph
- **指标**: `nodejs_eventloop_lag_seconds`
- **说明**: 事件循环延迟

#### 8. Database Connections
- **类型**: Graph
- **指标**: `mysql_global_status_threads_connected`
- **说明**: 数据库连接数

#### 9. Redis Connections
- **类型**: Graph
- **指标**: `redis_connected_clients`
- **说明**: Redis连接数

#### 10. Replication Lag
- **类型**: Graph
- **指标**: `mysql_slave_lag_seconds`
- **说明**: 主从复制延迟

### 使用方法

```bash
# 1. 安装Grafana
sudo apt-get install grafana

# 2. 启动Grafana
sudo systemctl start grafana-server

# 3. 访问Grafana
open http://localhost:3000

# 4. 配置数据源
# Configuration → Data Sources → Add → Prometheus
# URL: http://localhost:9090

# 5. 导入仪表盘
# Dashboards → Import → Upload grafana-dashboard.json
```

---

## 集群模式监控

### 监控脚本

**文件**: `src/utils/clusterMonitor.js`

```javascript
const clusterMonitor = require('./utils/clusterMonitor');

// 在server.js中集成
if (process.env.CLUSTER_ENABLED === 'true' && cluster.isMaster) {
  clusterMonitor.startMonitoring(5000);
}

// 获取集群摘要
const summary = clusterMonitor.getSummary();
console.log('Cluster summary:', summary);

// 检查Worker健康状态
const issues = clusterMonitor.checkWorkerHealth();
console.log('Health issues:', issues);

// 重启死掉的Worker
const restarted = clusterMonitor.restartDeadWorkers();
console.log(`Restarted ${restarted} workers`);
```

### 监控指标

#### 集群摘要

- **uptime**: 集群运行时间
- **totalRequests**: 总请求数
- **requestsPerSecond**: 每秒请求数
- **totalErrors**: 总错误数
- **errorRate**: 错误率
- **totalSlowRequests**: 总慢请求数
- **slowRequestRate**: 慢请求率

#### Worker指标

- **pid**: Worker进程ID
- **state**: Worker状态（online/disconnected/dead）
- **connected**: 是否连接
- **uptime**: Worker运行时间
- **requests**: Worker处理请求数
- **errors**: Worker错误数
- **slowRequests**: Worker慢请求数

#### 系统指标

- **cpu**: CPU信息
  - count: CPU核心数
  - loadAverage: 负载平均值
  - usagePercent: 使用率
- **memory**: 内存信息
  - total: 总内存
  - used: 已用内存
  - free: 空闲内存
  - usagePercent: 使用率

### 使用方法

```bash
# 集群监控会自动启动（在server.js中集成）

# 查看集群状态
node -e "const clusterMonitor = require('./src/utils/clusterMonitor'); console.log(clusterMonitor.getSummary());"

# 检查Worker健康
node -e "const clusterMonitor = require('./src/utils/clusterMonitor'); console.log(clusterMonitor.checkWorkerHealth());"
```

---

## 告警规则

### 告警配置

**文件**: `config/prometheus-alerts.yml`

### 告警规则

#### 1. HighErrorRate (Warning)
- **条件**: `rate(http_requests_total{status=~"5.."}[5m]) > 0.1`
- **持续时间**: 5分钟
- **说明**: 错误率超过0.1次/秒

#### 2. CriticalErrorRate (Critical)
- **条件**: `rate(http_requests_total{status=~"5.."}[5m]) > 0.5`
- **持续时间**: 2分钟
- **说明**: 错误率超过0.5次/秒

#### 3. HighResponseTime (Warning)
- **条件**: `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1`
- **持续时间**: 5分钟
- **说明**: 95分位响应时间超过1秒

#### 4. CriticalResponseTime (Critical)
- **条件**: `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 3`
- **持续时间**: 2分钟
- **说明**: 95分位响应时间超过3秒

#### 5. HighMemoryUsage (Warning)
- **条件**: `process_resident_memory_bytes / 1024 / 1024 / 1024 > 1024`
- **持续时间**: 5分钟
- **说明**: 内存使用超过1GB

#### 6. CriticalMemoryUsage (Critical)
- **条件**: `process_resident_memory_bytes / 1024 / 1024 / 1024 > 2048`
- **持续时间**: 2分钟
- **说明**: 内存使用超过2GB

#### 7. HighCPUUsage (Warning)
- **条件**: `rate(process_cpu_seconds_total[5m]) * 100 > 80`
- **持续时间**: 5分钟
- **说明**: CPU使用率超过80%

#### 8. CriticalCPUUsage (Critical)
- **条件**: `rate(process_cpu_seconds_total[5m]) * 100 > 95`
- **持续时间**: 2分钟
- **说明**: CPU使用率超过95%

#### 9. ServiceDown (Critical)
- **条件**: `up{job="juju-backend"} == 0`
- **持续时间**: 1分钟
- **说明**: 服务不可用

#### 10. DatabaseConnectionFailed (Critical)
- **条件**: `mysql_up == 0`
- **持续时间**: 1分钟
- **说明**: 数据库连接失败

#### 11. RedisConnectionFailed (Critical)
- **条件**: `redis_up == 0`
- **持续时间**: 1分钟
- **说明**: Redis连接失败

#### 12. ReplicationLag (Warning)
- **条件**: `mysql_slave_lag_seconds > 30`
- **持续时间**: 5分钟
- **说明**: 主从复制延迟超过30秒

#### 13. CriticalReplicationLag (Critical)
- **条件**: `mysql_slave_lag_seconds > 60`
- **持续时间**: 2分钟
- **说明**: 主从复制延迟超过60秒

#### 14. SlowQueryRate (Warning)
- **条件**: `rate(mysql_global_status_slow_queries[5m]) > 10`
- **持续时间**: 5分钟
- **说明**: 慢查询率超过10次/秒

#### 15. DiskSpaceLow (Warning)
- **条件**: `(node_filesystem_avail_bytes / node_filesystem_size_bytes) * 100 < 20`
- **持续时间**: 5分钟
- **说明**: 磁盘空间低于20%

#### 16. CriticalDiskSpace (Critical)
- **条件**: `(node_filesystem_avail_bytes / node_filesystem_size_bytes) * 100 < 10`
- **持续时间**: 2分钟
- **说明**: 磁盘空间低于10%

### 告警通知配置

```yaml
# config/alertmanager.yml
global:
  resolve_timeout: 5m
  slack_api_url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'

route:
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h
  receiver: 'slack'

receivers:
  - name: 'slack'
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'
        channel: '#alerts'
        title: 'JuJu Backend Alert'
        text: '{{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'
```

---

## 运维脚本

### 1. 数据库备份脚本

```bash
#!/bin/bash
# scripts/backup-database.sh

BACKUP_DIR="/backups/mysql"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="juju_platform"
DB_USER="root"
DB_PASSWORD="your_password"

mkdir -p $BACKUP_DIR

mysqldump -u$DB_USER -p$DB_PASSWORD $DB_NAME | gzip > $BACKUP_DIR/$DB_NAME_$DATE.sql.gz

# 保留最近7天的备份
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/$DB_NAME_$DATE.sql.gz"
```

### 2. 日志清理脚本

```bash
#!/bin/bash
# scripts/cleanup-logs.sh

LOG_DIR="/var/log/juju-backend"
DAYS_TO_KEEP=30

find $LOG_DIR -name "*.log" -mtime +$DAYS_TO_KEEP -delete

echo "Cleaned logs older than $DAYS_TO_KEEP days"
```

### 3. 健康检查脚本

```bash
#!/bin/bash
# scripts/health-check.sh

HEALTH_URL="http://localhost:3010/health"
TIMEOUT=10

RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT $HEALTH_URL)

if [ $RESPONSE -eq 200 ]; then
    echo "Health check passed"
    exit 0
else
    echo "Health check failed: HTTP $RESPONSE"
    exit 1
fi
```

### 4. 部署脚本

```bash
#!/bin/bash
# scripts/deploy.sh

ENV=$1
if [ -z "$ENV" ]; then
    echo "Usage: ./deploy.sh [development|staging|production]"
    exit 1
fi

echo "Deploying to $ENV..."

# 拉取最新代码
git pull origin main

# 安装依赖
npm install

# 运行测试
npm test

# 构建项目
npm run build

# 重启服务
pm2 restart juju-backend

echo "Deployment to $ENV completed"
```

---

## 故障排查

### 常见问题

#### 1. 服务无法启动

```bash
# 检查端口占用
netstat -ano | findstr :3010

# 检查进程
ps aux | findstr node

# 查看日志
tail -f logs/app.log

# 检查环境变量
echo $NODE_ENV
echo $PORT
```

#### 2. 数据库连接失败

```bash
# 检查MySQL状态
systemctl status mysql

# 查看MySQL日志
tail -f /var/log/mysql/error.log

# 测试连接
mysql -h localhost -u root -p

# 检查连接数
mysql -e "SHOW PROCESSLIST;"
```

#### 3. Redis连接失败

```bash
# 检查Redis状态
systemctl status redis

# 查看Redis日志
tail -f /var/log/redis/redis.log

# 测试连接
redis-cli ping

# 检查内存使用
redis-cli INFO memory
```

#### 4. Worker进程崩溃

```bash
# 查看Worker进程
ps aux | findstr "node.*worker"

# 查看集群日志
tail -f logs/cluster.log

# 检查内存使用
top -p $(pgrep -d',' node)

# 重启集群
pm2 restart juju-backend
```

#### 5. 主从复制延迟

```bash
# 检查复制状态
mysql -e "SHOW SLAVE STATUS\G;"

# 查看延迟
mysql -e "SHOW SLAVE STATUS\G" | findstr Seconds_Behind_Master

# 重启复制
mysql -e "STOP SLAVE; START SLAVE;"

# 重置复制
mysql -e "STOP SLAVE; RESET SLAVE; START SLAVE;"
```

#### 6. 监控告警过多

```bash
# 查看Prometheus告警
curl http://localhost:9090/api/v1/alerts

# 查看Alertmanager日志
tail -f /var/log/alertmanager/alertmanager.log

# 临时禁用告警
# 编辑 prometheus-alerts.yml，注释掉相关规则
# 重启Prometheus
systemctl restart prometheus
```

### 性能优化建议

#### 数据库优化

```sql
-- 添加索引
CREATE INDEX idx_user_id ON orders(user_id);
CREATE INDEX idx_party_id ON tickets(party_id);
CREATE INDEX idx_created_at ON parties(created_at);

-- 优化慢查询
EXPLAIN SELECT * FROM orders WHERE user_id = 123;

-- 清理旧数据
DELETE FROM logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
```

#### Redis优化

```bash
# 设置最大内存
redis-cli CONFIG SET maxmemory 2gb

# 设置淘汰策略
redis-cli CONFIG SET maxmemory-policy allkeys-lru

# 查看慢查询
redis-cli SLOWLOG GET 10
```

#### 应用优化

```javascript
// 启用缓存
app.use(cacheMiddleware);

// 使用连接池
const pool = mysql.createPool({ connectionLimit: 20 });

// 异步处理
await Promise.all([task1, task2, task3]);

// 批量操作
await User.bulkCreate(users);
```

---

## 总结

本文档涵盖了JuJu Party平台的完整监控和运维指南，包括：

- ✅ MySQL主从复制配置
- ✅ Prometheus监控配置
- ✅ Grafana仪表盘配置
- ✅ 集群模式监控
- ✅ 告警规则配置
- ✅ 运维脚本示例
- ✅ 故障排查指南

遵循本文档的指导，可以确保系统的稳定运行和高效运维。