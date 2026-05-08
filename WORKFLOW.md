# 聚聚 (JUJU) 项目 — 开发流程编排文档

> 版本: v1.0  
> 日期: 2026-05-04  
> 用途: 规范开发流程、定时任务设计、工作流编排  

---

## 1. 文档体系说明

### 1.1 三文档结构

每个项目必须维护以下三份文档：

| 文档 | 用途 | 更新时机 |
|------|------|---------|
| **项目大纲** (PROJECT_OUTLINE.md) | 业务全景、技术架构、完成度 | 里程碑/重大变更 |
| **业务流程** (BUSINESS_FLOW.md) | 精准业务规则、状态机、代码位置 | 业务逻辑变更 |
| **工作流设计** (WORKFLOW.md) | 开发流程、定时任务、自检清单 | 流程优化/任务调整 |

### 1.2 文档关系

```
项目大纲 ──→ 业务流程 ──→ 工作流设计
   ↓            ↓            ↓
 做什么        怎么做        谁来做/何时做
```

---

## 2. 开发流程编排

### 2.1 开发阶段定义

| 阶段 | 目标 | 交付物 | 验收标准 |
|------|------|--------|---------|
| **P0 基础架构** | 搭建项目骨架 | 代码框架、数据库设计 | 能跑通Hello World |
| **P1 核心功能** | 实现MVP | 核心API、核心页面 | 端到端流程跑通 |
| **P2 完整功能** | 功能补全 | 所有API、所有页面 | 测试用例全部通过 |
| **P3 优化打磨** | 体验优化 | 性能优化、UI优化 | 性能指标达标 |
| **P4 上线运维** | 稳定运行 | 监控、告警、备份 | 7x24稳定 |

### 2.2 当前聚聚项目阶段

**当前阶段: P3 → P4 过渡期**

| 端 | 阶段 | 完成度 | 阻塞项 |
|----|------|--------|--------|
| 后端API | P4 | 95% | schema drift修复 |
| APP | P3 | 90% | **v1.0.8测试收尾** |
| 管理后台 | P4 | 95% | - |
| 官网 | P4 | 100% | - |
| 微信小程序 | P2 | 80% | appid/商户号 |

---

## 3. 定时任务设计原则

### 3.1 任务分类

| 类型 | 频率 | 目的 | 交付方式 |
|------|------|------|---------|
| **监控类** | 每30分钟 | 系统健康、僵尸进程 | local |
| **审查类** | 每6小时 | 代码审查、安全扫描 | origin |
| **测试类** | 每6小时 | UX测试、自动化测试 | origin |
| **开发类** | 每6小时 | 检查变更、增量开发 | local |
| **部署类** | 每30分钟 | 检查部署状态 | origin |
| **维护类** | 每天1次 | 系统自检、报告汇总 | origin |

### 3.2 任务设计规则

**必须遵守**:
1. **无变更不打扰**: 开发类任务无代码变更时输出 `[SILENT]`
2. **错峰执行**: 同类型任务分散时间，避免资源峰值
3. **local优先**: 非紧急任务输出到本地，减少飞书打扰
4. **频率合理**: 根据实际产出调整，避免空转
5. **自检机制**: 每次执行前检查前置条件，失败则跳过

---

## 4. 当前定时任务配置

### 4.1 任务清单

| 任务名 | 频率 | 类型 | 交付 | 状态 |
|--------|------|------|------|------|
| zombie-process-monitor | */30 | 监控 | local | ✅ |
| juju-code-review | 0 */6 | 审查 | origin | ✅ |
| juju-qa-testing | 0 */6 | 测试 | origin | ✅ |
| juju-bug-fix | 0 */6 | 审查 | origin | ✅ |
| juju-frontend-dev | 0 */6 | 开发 | local | ✅ |
| juju-admin-web-dev | 0 */6 | 开发 | local | ✅ |
| juju-mp-weixin-dev | 0 */6 | 开发 | local | ✅ |
| juju-website-dev | 0 */6 | 开发 | local | ✅ |
| juju-deploy-render | 25,55 | 部署 | origin | ✅ |
| novel-chapter-writing | 0 */2 | 内容 | origin | ✅ |
| project-daily-report | 0 9 | 维护 | origin | ✅ |
| hermes-self-maintenance | 0 14 | 维护 | origin | ✅ |
| juju-backend-dev | 0 */6 | 开发 | local | ✅ |
| juju-build-apk | 0 */6 | 构建 | local | ✅ |
| **juju-app-testing** | **0 */6** | **测试** | **origin** | **⏳ 待创建** |

### 4.2 调度时间表

```
00:00  code-review + qa-testing + bug-fix + frontend-dev + admin-web + mp-weixin + website + backend-dev + build-apk + **app-testing**
00:25  deploy-render
00:30  zombie-monitor
00:55  deploy-render

06:00  同上（开发类任务）
06:25  deploy-render
06:30  zombie-monitor
06:55  deploy-render

09:00  daily-report

12:00  同上（开发类任务）
12:25  deploy-render
12:30  zombie-monitor
12:55  deploy-render

14:00  self-maintenance

18:00  同上（开发类任务）
18:25  deploy-render
18:30  zombie-monitor
18:55  deploy-render
```

---

## 5. 自检机制

### 5.1 任务执行前自检

每个任务启动前必须执行：

```
1. 检查是否有实际工作可做
   - 开发类: git diff HEAD~5 --stat
   - 审查类: 检查上次审查时间 vs 最新提交时间
   - 测试类: 检查环境是否就绪

2. 判断是否有意义执行
   - 无变更 → [SILENT]
   - 环境不满足 → 记录原因，跳过
   - 有变更 → 继续执行

3. 执行后验证
   - 检查输出是否符合预期
   - 检查是否有错误
   - 记录执行结果
```

### 5.2 系统健康自检（self-maintenance）

每天14:00执行：

```
1. 检查所有定时任务状态
   - hermes cron list
   - 识别 error/timeout/paused

2. 检查系统资源
   - 磁盘空间 > 20%
   - 内存使用 < 80%
   - 端口监听正常

3. 检查日志文件
   - gateway.error.log 大小
   - 是否有新错误

4. 检查记忆系统
   - memory/YYYY-MM-DD.md 是否存在
   - hindsight 状态

5. 检查APP测试状态
   - 最新APK版本号
   - 测试报告是否存在
   - 未解决问题数量

6. 生成报告
   - 汇总到 memory/YYYY-MM-DD.md
   - 包含APP测试进度
   - 正常情况 [SILENT]
```

---

## 6. 新项目启动流程

### 6.1 启动清单

启动新项目时，按以下顺序执行：

```
1. 创建项目目录
2. 编写项目大纲 (PROJECT_OUTLINE.md)
   - 项目概述
   - 技术架构
   - 核心业务模块（预估）
   - 待办清单

3. 编写业务流程 (BUSINESS_FLOW.md)
   - 核心业务流程
   - 状态机
   - 规则表

4. 编写工作流设计 (WORKFLOW.md)
   - 开发阶段定义
   - 定时任务设计
   - 自检机制

5. 配置定时任务
   - 根据阶段配置频率
   - 设置交付方式
   - 设置自检条件

6. 执行自检
   - 验证任务配置
   - 验证文档完整性
   - 修复问题

7. 开始迭代开发
```

### 6.2 新项目模板

模板位置: `~/.hermes/templates/PROJECT_TEMPLATE.md`

包含：
- 大纲模板
- 业务流程模板
- 工作流设计模板
- 定时任务配置模板

---

## 7. 文档维护规则

### 7.1 更新触发条件

| 事件 | 更新文档 |
|------|---------|
| 新功能完成 | 大纲 + 业务流程 |
| Bug修复 | 业务流程 + 工作流 |
| 部署变更 | 工作流 |
| 安全修复 | 大纲 + 业务流程 |
| 定时任务调整 | 工作流 |
| 里程碑达成 | 大纲 + 版本历史 |

### 7.2 文档版本控制

- 所有文档纳入git版本控制
- 重大变更需commit说明
- 定期归档旧版本

---

## 8. 附录

### 8.1 快速命令

```bash
# 查看所有定时任务
hermes cron list

# 查看任务输出
ls ~/.hermes/cron/output/

# 查看系统日志
tail -f ~/.hermes/logs/gateway.log

# 检查系统资源
df -h && free -m

# 重启gateway
hermes gateway restart
```

### 8.2 相关文档

| 文档 | 路径 |
|------|------|
| 项目大纲 | juju-platform-all/PROJECT_OUTLINE.md |
| 业务流程 | juju-platform-all/BUSINESS_FLOW.md |
| 工作流设计 | juju-platform-all/WORKFLOW.md |
| 后端报告 | backend/reports/ |
| 前端报告 | JujuApp_new/frontend-dev-report-*.md |
| APP测试报告 | JujuApp/e2e_test/reports/ |
| APP UI测试截图 | JujuApp/screenshots_ui_test_*/ |

---

> **维护者**: Hermes (扎克)  
> **更新规则**: 每次里程碑/重大变更时更新  
> **审核周期**: 每周自检时审查文档完整性  
> **APP测试跟踪**: 每次构建APK后更新测试状态
