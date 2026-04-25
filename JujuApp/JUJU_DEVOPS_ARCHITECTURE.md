# JUJU App DevOps架构 v2.0

## 完整CI/CD流水线架构

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        JUJU App DevOps Pipeline v2.0                         │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   代码质量    │───→│   测试阶段    │───→│   构建打包    │───→│   部署发布    │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│• TypeScript  │    │• 单元测试     │    │• Android构建  │    │• 内部测试    │
│• ESLint      │    │• E2E测试     │    │• 包大小检查   │    │• 灰度发布    │
│• 代码规范    │    │• UI截图走查   │    │• 性能测试     │    │• 生产发布    │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
```

---

## 定时任务清单 (17个任务)

### 🔥 高频率任务 (持续监控)

| 任务名 | 频率 | 下次运行 | 职责 |
|--------|------|----------|------|
| **juju-code-quality** | 每2小时 | 自动 | TypeScript/ESLint检查+自动修复 |
| **juju-pipeline-health** | 每2小时 | 自动 | 项目健康检查 |
| **juju-e2e-maestro** | 每4小时 | 自动 | Maestro自动化测试9个flows |
| **juju-task-monitor** | 每6小时 | 自动 | 监控所有JUJU任务状态 |

### 📅 每日任务 (日常维护)

| 任务名 | 时间 | 职责 |
|--------|------|------|
| **juju-auto-fix** | 01:00,05:00,09:00,13:00,17:00,21:00 | 自动修复代码问题 |
| **juju-pipeline-daily** | 09:00 | 每日综合报告 |
| **juju-daily-pipeline** | 09:00,15:00,21:00 | 每日优化流水线 |
| **juju-build-android** | 09:00,21:00 | Android APK构建 |
| **juju-ui-screenshot** | 10:00,22:00 | UI截图走查 |
| **juju-performance-test** | 03:00 | 性能基准测试 |
| **juju-codex-review** | 04:00 | AI代码审查 |

### 📆 周期性任务 (深度工作)

| 任务名 | 频率 | 职责 |
|--------|------|------|
| **juju-design-analysis** | 每周一 03:00 | 竞品UI分析 |
| **juju-weekly-deep** | 每周日 02:00 | 每周深度优化 |
| **juju-mvp-generator** | 每月1号 05:00 | MVP功能开发 |

### ⏸️ 暂停任务 (待恢复)

| 任务名 | 状态 | 原因 |
|--------|------|------|
| **juju-pipeline-main** | ❌ 暂停 | 已拆分为daily-pipeline |
| **juju-e2e-tests** | ❌ 暂停 | 已替换为e2e-maestro |
| **juju-ui-tests** | ❌ 暂停 | 已合并到screenshot任务 |

---

## E2E测试架构

### 9个测试Flows覆盖场景

```
01_launch_app.yaml      → 应用启动检查
02_login_flow.yaml      → 登录流程验证
03_home_navigation.yaml → 首页瀑布流+分类
04_bottom_tabs.yaml     → 底部导航切换
05_create_party.yaml    → 创建聚会表单
06_vip_features.yaml    → VIP会员功能
07_wallet_flow.yaml     → 钱包余额管理
08_search_party.yaml    → 搜索聚会功能
09_performance_test.yaml → 性能基准测试
```

### 测试结果输出

```
~/.maestro/tests/
├── 2026-04-09_005436/
│   ├── screenshot-⚠️-xxx.png    ← 警告截图
│   ├── screenshot-❌-xxx.png    ← 失败截图
│   ├── maestro.log              ← 详细日志
│   └── ai-report.html           ← AI分析报告
```

---

## 技术栈环境

### 开发环境
```bash
# Java
JAVA_HOME=/opt/homebrew/opt/openjdk@17

# Android
ANDROID_HOME=/Users/mac/Library/Android/sdk

# Maestro E2E
MAESTRO_HOME=$HOME/.maestro

# Node.js (项目自带)
Node.js v20+ + npm 10+
```

### 关键依赖版本
| 工具 | 版本 | 用途 |
|------|------|------|
| React Native | 0.76+ | 跨平台框架 |
| TypeScript | 5.3+ | 类型安全 |
| Maestro | 2.4.0 | E2E测试 |
| OpenJDK | 17.0.18 | 构建依赖 |
| Android SDK | API 36 | Android开发 |

---

## 任务执行时间表

```
00:00 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
01:00 ━━● juju-auto-fix
02:00 ━━● juju-pipeline-health
       ━━● juju-weekly-deep (每周日)
03:00 ━━● juju-performance-test
04:00 ━━● juju-codex-review
05:00 ━━● juju-auto-fix
06:00 ━━● juju-task-monitor
07:00 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
08:00 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
09:00 ━━● juju-pipeline-daily
       ━━● juju-daily-pipeline
       ━━● juju-build-android
       ━━● juju-code-quality
10:00 ━━● juju-ui-screenshot
       ━━● juju-code-quality
11:00 ━━● juju-code-quality
12:00 ━━● juju-e2e-maestro
13:00 ━━● juju-auto-fix
14:00 ━━● juju-code-quality
15:00 ━━● juju-daily-pipeline
16:00 ━━● juju-e2e-maestro
17:00 ━━● juju-auto-fix
18:00 ━━● juju-task-monitor
19:00 ━━● juju-code-quality
20:00 ━━● juju-e2e-maestro
21:00 ━━● juju-daily-pipeline
       ━━● juju-build-android
       ━━● juju-auto-fix
22:00 ━━● juju-ui-screenshot
23:00 ━━● juju-code-quality
```

---

## 监控告警规则

### juju-task-monitor 监控项

| 检查项 | 阈值 | 告警级别 |
|--------|------|----------|
| 任务失败率 | >20% | 🔴 严重 |
| 任务超时 | >2次/天 | 🟡 警告 |
| 未运行任务 | >24小时 | 🔴 严重 |
| 磁盘空间 | >80% | 🟡 警告 |
| 输出文件大小 | >1GB | 🟡 警告 |

### 自动修复行为

当任务失败时:
1. **juju-auto-fix**: 自动修复ESLint/TypeScript问题
2. **juju-code-quality**: 自动格式化代码
3. **juju-task-monitor**: 自动重启失败任务

---

## Token消耗预估

| 任务类型 | 频率 | 单次消耗 | 月消耗 |
|----------|------|----------|--------|
| 代码质量检查 | 12次/天 | ~5K tokens | ~180K |
| E2E测试分析 | 6次/天 | ~10K tokens | ~180K |
| 深度优化 | 1次/周 | ~50K tokens | ~200K |
| 监控报告 | 4次/天 | ~3K tokens | ~36K |
| **总计** | - | - | **~600K tokens/月** |

---

## 快速命令

```bash
# 手动运行所有E2E测试
export JAVA_HOME=/opt/homebrew/opt/openjdk@17
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$HOME/.maestro/bin:$PATH
cd ~/.openclaw.pre-migration/workspace/juju-platform-all/JujuApp
for f in .maestro/flows/*.yaml; do maestro test "$f"; done

# 手动构建APK
npx react-native run-android --active-arch-only

# 查看定时任务状态
hermes cron list

# 查看E2E截图
open ~/.maestro/tests/$(ls -t ~/.maestro/tests/ | head -1)
```

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| v1.0 | 2026-04-01 | 初始定时任务架构 |
| v2.0 | 2026-04-09 | 添加E2E测试、监控、构建流水线 |

---

*Generated by Hermes Agent - JUJU DevOps Automation*
