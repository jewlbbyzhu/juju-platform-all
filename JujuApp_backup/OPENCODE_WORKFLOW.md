# OpenCode 开发推进 Workflow

## 目标
使用OpenCode完成JUJU App所有54个页面的2026设计系统重构

---

## 阶段1: 批量重构剩余页面 (今天-明天)

### 执行策略
- **频率**: 每2小时执行一次 (juju-dev-executor-v2)
- **每次任务**: 使用OpenCode重构3-5个页面
- **任务Prompt**:
  ```
  opencode run "重构[src/screens/页面1.tsx, src/screens/页面2.tsx...] 
  使用Theme系统colors，替换所有硬编码颜色为colors值"
  ```

### 待重构页面清单 (约5个)
- [ ] GroupChatScreen.tsx
- [ ] TicketSelectionScreen.tsx  
- [ ] WalletScreen.tsx
- [ ] VIPLevelsScreen.tsx
- [ ] ChatListScreen.tsx

---

## 阶段2: 质量检查与优化 (明天)

### OpenCode质量检查
```bash
opencode run "检查src/screens/所有文件，找出：
1. 仍未使用Theme系统的文件
2. 有硬编码颜色残留的文件  
3. 颜色使用不规范的文件"
```

### 优化迭代
- 发现问题 → OpenCode修复 → Git提交
- 循环直到90%+页面达标

---

## 阶段3: 高级重构 (后天)

### 使用OpenCode进行高级优化
```bash
# 优化代码结构
opencode run "优化src/screens/下的组件代码结构，
提取重复样式到theme，优化性能"

# 添加动画效果
opencode run "为src/screens/下的关键页面添加
2026设计系统的动画效果"
```

---

## 定时任务配置

### 任务1: juju-dev-executor-v2 (每2小时)
```yaml
schedule: every 120m
timeout: 1800 (30分钟)
prompt: 使用OpenCode重构3-5个页面
deliver: local
```

### 任务2: juju-master-orchestrator (每30分钟)
```yaml
schedule: */30 * * * *
timeout: 900 (15分钟)
prompt: 
  1. 使用OpenCode分析进度
  2. 分配下一步任务
  3. 生成进度报告
deliver: origin
```

### 任务3: daily-health-check-10pm (每天22:00)
```yaml
schedule: 0 22 * * *
prompt:
  1. 对比OpenCode vs 直接开发效果
  2. 生成优化建议
  3. 调整workflow
deliver: origin
```

---

## OpenCode使用规范

### 标准Prompt模板
```
opencode run "检查并重构[文件列表]：
1. 确保已导入 import { colors } from '../theme/colors'
2. 替换所有硬编码颜色：
   - #000, #000000 → colors.background.secondary
   - #1a1a1a → colors.background.card
   - #fff, #ffffff → colors.text.primary
   - rgba(26, 26, 46, x) → colors.gray[xxx]
3. 保持原有功能不变
4. 保持TypeScript类型正确"
```

### Git提交规范
```bash
git commit -m "refactor(ui): OpenCode重构XXX页面使用Theme系统

- 替换X处硬编码颜色
- 使用colors.xxx替代rgba和十六进制
- 保持功能不变"
```

---

## 效果评估指标

| 指标 | 直接开发 | OpenCode | 目标 |
|------|---------|----------|------|
| 重构速度 | 33页/4小时 | 待测 | 更快 |
| 准确率 | 90% | 待测 | 95%+ |
| 遗漏率 | 10% | 待测 | <5% |
| 复杂度处理 | 低 | 高 | 高 |

---

## 风险控制

### OpenCode失败处理
- 如果OpenCode超时 → 切换到本地脚本
- 如果OpenCode报错 → 记录错误，人工检查
- 如果质量不达标 → 回滚 + 重新执行

### 备用方案
- 始终保持本地脚本可用
- 关键页面人工Review
- 定期Git备份

---

## 成功标准

- [ ] 所有54个页面使用Theme系统
- [ ] 无硬编码颜色残留
- [ ] 构建通过无错误
- [ ] Git历史清晰

---

**制定时间**: 2026-04-13
**预计完成**: 2026-04-15
