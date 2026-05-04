# JujuApp 部署状态报告

**部署时间**: 2026-05-04 07:26 CST
**执行Agent**: devops-deploy (Profile)
**任务指定目标**: 47.239.136.22:8080
**项目实际运行**: 122.51.255.13 (腾讯云)

---

## 📋 部署概览

| 组件 | 状态 | 说明 |
|------|------|------|
| 后端API | ⚠️ 运行中但有错误 | PM2 online，但核心API存在Schema Drift |
| 管理后台 | ✅ 正常 | 公网HTTP 200 |
| 官网 | ✅ 正常 | 公网HTTP 200 |

---

## 🔍 检查结果详情

### 1. 执行环境
- ✅ 项目路径存在: `~/.hermes/workspace/juju-platform-all/`
- ✅ SSH密钥存在: `backend/cert/hfparty_ssh_key.pem`

### 2. IP地址一致性 ⚠️
| 来源 | IP地址 |
|------|--------|
| 任务描述 | 47.239.136.22:8080 |
| 项目配置 | 122.51.255.13 |
| **状态** | **❌ IP_MISMATCH** |

> **说明**: 任务指定的部署目标 `47.239.136.22:8080` 与项目实际运行服务器 `122.51.255.13` 不一致。本次检查使用项目配置IP（122.51.255.13）进行，未对47.239.136.22执行任何操作。

### 3. SSH连接
- ✅ SSH连接成功
- 服务器时间: Mon May 4 07:26:01 CST 2026
- 运行时长: 78天 7小时23分
- 负载: 0.00, 0.00, 0.00 (空闲)

### 4. 构建产物
| 组件 | 状态 | 最新提交 |
|------|------|----------|
| 后端代码 | ✅ | d7f84948 - fix: 统一后端所有console.*为logger.* |
| 管理后台 dist/ | ✅ | 存在 |
| 官网 website/ | ✅ | 存在 |
| 官网 official-website/dist/ | ❌ | 不存在 |

### 5. 服务器状态

**PM2进程**
```
┌────┬───────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┐
│ id │ name      │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │
├────┼───────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┤
│ 0  │ server    │ default     │ 1.0.0   │ fork    │ 986198   │ 29m    │ 23   │ online    │
└────┴───────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┘
```
- 内存占用: 97.1MB
- CPU: 0%
- 重启次数: 23次（需关注）

**端口监听**
| 端口 | 服务 | 状态 |
|------|------|------|
| 3000 | Node.js (PM2) | ✅ 监听 0.0.0.0 |
| 80 | Nginx | ✅ 监听 0.0.0.0 |
| 443 | Nginx (SSL) | ✅ 监听 0.0.0.0 |
| 3306 | MySQL | ✅ 监听 0.0.0.0 |
| 6379 | Redis | ✅ 监听 0.0.0.0 |
| 8080 | python3 | ✅ 监听 0.0.0.0 |

**磁盘空间**
- 总容量: 40G
- 已用: 26G (69%)
- 可用: 12G
- ⚠️ 磁盘使用率69%，建议关注

**内存**
- 总内存: 3.6Gi
- 已用: 2.0Gi
- 可用: 1.6Gi
- Swap: 1.9Gi (已用852Mi)

### 6. 公网健康检查
| 端点 | HTTP状态 | 结果 |
|------|----------|------|
| https://api.hfparty.asia/api/v1/health | 200 | ✅ |
| https://api.hfparty.asia/ | 200 | ✅ |
| https://admin.hfparty.asia | 200 | ✅ |
| https://hfparty.asia | 200 | ✅ |

### 7. 核心业务API探测（服务器内部）
| 端点 | 状态 | 响应 |
|------|------|------|
| /api/v1/health | ✅ | `{"success":true,"data":{"status":"healthy"...` |
| /api/v1/parties | ❌ **SCHEMA_DRIFT** | `Unknown column 'Party.last_report_time' in 'field list'` |
| /api/v1/categories | ⚠️ | `{"success":false,"message":"获取分类失败"}` |
| /api/v1/users | ✅ (需认证) | `UNAUTHORIZED` - 正常，路由已注册 |

---

## ⚠️ 发现的问题

### 🔴 严重: Schema Drift（数据库表结构不同步）
**问题**: 代码中 `Party` 模型已添加 `last_report_time` 字段，但生产数据库表未同步。

**影响**: 
- `/api/v1/parties` 返回 500 错误，聚会列表完全不可用
- 这是核心业务功能，直接影响用户体验

**根因**: 
- 2026-05-04 后端开发新增了举报系统（Report模型），`Party` 模型添加了 `report_count` 和 `last_report_time` 字段
- 代码已部署到服务器（PM2重启），但**数据库迁移未执行**

**修复方案**:
```sql
-- 生产数据库执行
ALTER TABLE parties ADD COLUMN report_count INT NOT NULL DEFAULT 0 COMMENT '被举报次数';
ALTER TABLE parties ADD COLUMN last_report_time DATETIME NULL COMMENT '最后一次被举报时间';
```

### 🟡 警告: 分类列表API异常
**问题**: `/api/v1/categories` 返回 "获取分类失败"

**可能原因**:
- 同样存在 schema drift（categories 表结构变更）
- 或分类数据为空/查询逻辑错误

**建议**: 检查 `categories` 表结构和数据，确认是否与模型同步。

### 🟡 警告: IP地址不一致
**问题**: 任务指定 `47.239.136.22:8080`，实际运行在 `122.51.255.13`

**建议**: 
- 确认 `47.239.136.22:8080` 是否为新的部署目标
- 如果是，需要配置新的SSH密钥和部署路径
- 如果不是，更新任务描述中的目标地址

### 🟡 警告: PM2重启次数较多
**问题**: PM2进程已重启23次，运行时间仅29分钟

**可能原因**:
- 之前部署时遇到 require cache 问题，多次重启
- 或存在未处理的异常导致进程崩溃

**建议**: 检查PM2日志确认重启原因。

### 🟡 警告: 磁盘空间使用率69%
- 40G磁盘已用26G，剩余12G
- 建议定期清理日志和备份文件

---

## 📊 部署总结

**整体状态**: ⚠️ **服务运行中，但存在严重业务API故障**

| 组件 | 部署状态 | 健康状态 | 备注 |
|------|----------|----------|------|
| 后端API | ✅ 代码已部署 | ❌ 业务API故障 | Schema Drift导致 /parties 500 |
| 管理后台 | ✅ 已部署 | ✅ 正常 | HTTP 200 |
| 官网 | ✅ 已部署 | ✅ 正常 | HTTP 200 |
| Nginx | ✅ 运行中 | ✅ 正常 | 80/443监听正常 |
| MySQL | ✅ 运行中 | ⚠️ 表结构不同步 | 需执行ALTER TABLE |
| Redis | ✅ 运行中 | ✅ 正常 | 6379端口正常 |

---

## 📝 建议操作

### 立即执行（阻塞业务）
1. **修复数据库Schema Drift**:
   ```bash
   ssh -i backend/cert/hfparty_ssh_key.pem ubuntu@122.51.255.13
   mysql -u root -p
   ALTER TABLE parties ADD COLUMN report_count INT NOT NULL DEFAULT 0;
   ALTER TABLE parties ADD COLUMN last_report_time DATETIME NULL;
   ```

2. **检查categories表**:
   ```sql
   DESCRIBE categories;
   -- 确认是否有新增字段未同步
   ```

3. **验证修复**:
   ```bash
   curl -s https://api.hfparty.asia/api/v1/parties | head -c 200
   curl -s https://api.hfparty.asia/api/v1/categories | head -c 200
   ```

### 后续优化
4. **统一IP地址**: 确认 `47.239.136.22:8080` 是否为新的部署目标，更新任务配置
5. **添加数据库迁移到部署流程**: 部署脚本应检测模型变更并自动执行迁移
6. **监控PM2重启**: 检查日志找出频繁重启原因
7. **清理磁盘**: 删除旧备份和日志文件

---

*报告生成时间: 2026-05-04 07:26 CST*
*原始数据: DEPLOY_STATUS_REPORT_2026-05-04-0726.json*
