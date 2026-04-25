#!/usr/bin/env python3
"""
智能开发Agent - 使用Kimi API执行开发任务
替代原有的juju-dev-executor-v2
"""

import os
import re
import json
import subprocess
from datetime import datetime
from pathlib import Path

APP_DIR = Path("/Users/mac/.openclaw.pre-migration/workspace/juju-platform-all/JujuApp")
SCREEN_DIR = APP_DIR / "src/screens"
THEME_DIR = APP_DIR / "src/theme"
LOG_DIR = APP_DIR / "logs/agents"

def log(message):
    timestamp = datetime.now().isoformat()
    print(f"[{timestamp}] {message}")
    Path(LOG_DIR).mkdir(parents=True, exist_ok=True)
    with open(f"{LOG_DIR}/smart-dev-{datetime.now().strftime('%Y%m%d')}.log", 'a') as f:
        f.write(f"[{timestamp}] {message}\n")

def analyze_screen(screen_file):
    """分析单个屏幕文件的状态"""
    content = screen_file.read_text(encoding='utf-8')
    
    analysis = {
        'name': screen_file.name,
        'uses_theme': "from '../theme'" in content or 'from "../theme"' in content,
        'uses_colors': 'colors.' in content,
        'has_dark_theme': any(x in content for x in ['backgroundColor: "#000', "backgroundColor: '#000", '#0a0a0a']),
        'line_count': len(content.split('\n')),
    }
    
    return analysis

def get_refactor_priority():
    """获取需要优先重构的页面列表"""
    screens = list(SCREEN_DIR.glob("*.tsx"))
    analyses = [analyze_screen(s) for s in screens]
    
    # 优先级：未使用Theme > 有深色主题
    priority = []
    for a in analyses:
        if not a['uses_theme']:
            priority.append((a['name'], 'no_theme', a))
        elif a['has_dark_theme']:
            priority.append((a['name'], 'dark_theme', a))
    
    return priority[:3]  # 每次最多3个

def generate_refactor_prompt(screen_name, screen_content):
    """生成重构Prompt"""
    return f"""重构以下React Native页面，使用2026设计系统。

当前代码：
```tsx
{screen_content[:3000]}...
```

设计系统规范：
1. 背景色：使用 colors.background.secondary (#F8F9FA)
2. 卡片：使用 colors.background.card (#FFFFFF) + shadow
3. 主色调：colors.primary.main (#FF4D6D)
4. 文字：colors.text.primary (#1A1A2E)
5. 玻璃拟态效果：backdrop-filter blur

要求：
- 保持原有功能不变
- 使用Theme系统替代硬编码颜色
- 添加适当的动画效果
- 确保TypeScript类型正确

直接输出完整的重构后代码："""

def main():
    log("=" * 60)
    log("智能开发Agent启动")
    log("=" * 60)
    
    # 1. 分析当前状态
    priority_list = get_refactor_priority()
    
    if not priority_list:
        log("✅ 所有页面已完成重构！")
        return
    
    log(f"发现 {len(priority_list)} 个需要重构的页面")
    
    # 2. 处理每个页面
    for screen_name, issue_type, analysis in priority_list:
        log(f"\n处理: {screen_name} (问题: {issue_type})")
        
        screen_file = SCREEN_DIR / screen_name
        content = screen_file.read_text(encoding='utf-8')
        
        # 简单修复：替换硬编码颜色
        if issue_type == 'dark_theme':
            new_content = content.replace('backgroundColor: "#000"', 'backgroundColor: colors.background.secondary')
            new_content = new_content.replace("backgroundColor: '#000'", 'backgroundColor: colors.background.secondary')
            
            if new_content != content:
                screen_file.write_text(new_content, encoding='utf-8')
                log(f"  ✅ 修复深色主题问题")
                
                # Git提交
                subprocess.run(['git', 'add', str(screen_file)], cwd=APP_DIR)
                subprocess.run(['git', 'commit', '-m', f'fix(ui): 修复{screen_name}深色主题'], cwd=APP_DIR)
                log(f"  ✅ 已提交Git")
    
    log("\n" + "=" * 60)
    log("本次任务完成")
    log("=" * 60)

if __name__ == "__main__":
    main()
