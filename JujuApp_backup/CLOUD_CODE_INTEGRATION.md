# Claude Code / Codex 集成方案

## 当前状态
- ✅ Claude Code 已安装 (v2.1.71)
- ✅ Codex 已安装 (v0.118.0)
- ❌ 需要配置 API Key / 登录

---

## 方案一：Claude Code (推荐)

### 配置步骤

```bash
# 1. 登录 (浏览器OAuth)
claude auth login

# 或 API Key方式
export ANTHROPIC_API_KEY="sk-..."
```

### 使用方式

**1. 单次任务 (Print Mode)**
```bash
# 重构一个页面
claude -p "重构 src/screens/ProfileScreen.tsx 使用2026设计系统" \
  --allowedTools "Read,Edit" \
  --max-turns 15 \
  --output-format json
```

**2. 批量任务 (Background)**
```bash
# 启动tmux会话执行
claude -p "批量重构所有未使用Theme的页面" \
  --full-auto \
  --max-turns 50
```

### 优势
- 深度代码理解
- 自动Git提交
- 多步骤规划执行
- 结构化输出

---

## 方案二：Codex

### 配置步骤

```bash
export OPENAI_API_KEY="sk-..."
```

### 使用方式

**1. 单次执行**
```bash
codex exec "修复所有深色主题页面，统一使用colors.ts"
```

**2. 批量修复 (Yolo模式)**
```bash
codex --yolo exec "重构所有54个页面使用2026设计系统"
```

### 优势
- 执行速度快
- 适合批量处理
- 自动批准文件更改

---

## 推荐集成方式

### 新建定时任务：juju-claude-developer

```yaml
name: juju-claude-developer
schedule: "0 */4 * * *"  # 每4小时执行一次
timeout: 1800  # 30分钟
prompt: |
  ## JUJU App 开发任务 - Claude Code
  
  执行Claude Code完成页面重构：
  
  ```bash
  cd ~/.openclaw.pre-migration/workspace/juju-platform-all/JujuApp
  
  # 检查进度
  claude -p "分析当前重构进度，选择下一个需要重构的页面" \
    --allowedTools "Read,Bash" \
    --max-turns 5 \
    --output-format json
  
  # 执行重构
  claude -p "重构选定的页面，应用2026设计系统" \
    --full-auto \
    --allowedTools "Read,Edit,Bash" \
    --max-turns 20
  ```
```

---

## 立即执行

### 第一步：配置API Key

```bash
# 选择一种方式

# 方式1: Claude Code (推荐)
claude auth login

# 方式2: Codex
export OPENAI_API_KEY="your-key-here"
echo "export OPENAI_API_KEY=\"sk-...\"" >> ~/.zshrc
```

### 第二步：测试

```bash
cd ~/.openclaw.pre-migration/workspace/juju-platform-all/JujuApp

# 测试Claude Code
claude -p "列出src/screens/目录下所有文件" --max-turns 1

# 或测试Codex
codex exec "git status"
```

### 第三步：创建新的Agent任务

替换现有的 `juju-dev-executor-v2` 为基于Claude Code的版本

---

## 预期效果

| 指标 | 现有Agent | Claude Code |
|------|----------|-------------|
| 代码理解 | 基础 | 深度 |
| 重构质量 | 一般 | 专业级 |
| 错误处理 | 容易超时 | 自动恢复 |
| 开发速度 | 慢 | 快 |
| 成本 | 低 | 中等(API费用) |

---

## 需要主人决定

1. **使用哪个工具？**
   - A. Claude Code (深度理解，推荐)
   - B. Codex (快速执行)
   - C. 两者都用

2. **API Key配置方式？**
   - A. 我配置 ANTHROPIC_API_KEY
   - B. 我配置 OPENAI_API_KEY
   - C. 两者都配置

3. **替换哪些Agent？**
   - A. 只替换 dev-executor
   - B. 替换 orchestrator + dev-executor
   - C. 全部替换

请告诉我选择，我立即配置！
