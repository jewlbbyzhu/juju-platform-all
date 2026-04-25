#!/usr/bin/env python3
"""
Kimi智能开发Agent
使用Kimi API进行智能代码生成和重构
"""

import os
import re
import json
import subprocess
from datetime import datetime
from pathlib import Path

# 尝试导入hermes_tools来调用API
import sys
sys.path.insert(0, '/Users/mac/.openclaw.pre-migration/workspace/openclaw-main')

try:
    from hermes_tools import terminal
except:
    terminal = None

APP_DIR = Path("/Users/mac/.openclaw.pre-migration/workspace/juju-platform-all/JujuApp")
SCREEN_DIR = APP_DIR / "src/screens"
LOG_DIR = APP_DIR / "logs/agents"

def log(message):
    timestamp = datetime.now().isoformat()
    print(f"[{timestamp}] {message}")
    Path(LOG_DIR).mkdir(parents=True, exist_ok=True)
    with open(f"{LOG_DIR}/kimi-dev-{datetime.now().strftime('%Y%m%d')}.log", 'a') as f:
        f.write(f"[{timestamp}] {message}\n")

class KimiDevAgent:
    """Kimi开发Agent - 智能重构React Native页面"""
    
    def __init__(self):
        self.fixed_count = 0
        self.skipped_count = 0
        
    def analyze_all_screens(self):
        """分析所有屏幕文件"""
        screens = []
        for screen_file in SCREEN_DIR.glob("*.tsx"):
            content = screen_file.read_text(encoding='utf-8')
            
            # 检查状态
            has_theme_import = "from '../theme'" in content or 'from "../theme"' in content
            uses_colors = 'colors.' in content and has_theme_import
            has_hardcoded = re.search(r'#[0-9a-fA-F]{3,6}', content) is not None
            has_dark = any(x in content.lower() for x in ['#000', '#0a0a0a', '#121212', '#1a1a1a'])
            
            screens.append({
                'name': screen_file.name,
                'path': screen_file,
                'content': content,
                'uses_theme': uses_colors,
                'has_hardcoded': has_hardcoded,
                'has_dark': has_dark,
                'needs_fix': not uses_colors or has_dark
            })
        
        return screens
    
    def quick_fix_screen(self, screen_info):
        """快速修复单个屏幕"""
        content = screen_info['content']
        original = content
        
        # 检查是否已有colors导入（避免重复）
        has_colors_import = "from '../theme/colors'" in content or 'from "../theme/colors"' in content
        has_theme_import = "from '../theme'" in content or 'from "../theme"' in content
        
        # 添加Theme导入（如果还没有）
        if not has_colors_import and not has_theme_import:
            # 找到最后一个import语句
            import_match = list(re.finditer(r'^import .*$|^from .* import .*$', content, re.MULTILINE))
            if import_match:
                last_import = import_match[-1]
                insert_pos = last_import.end()
                content = content[:insert_pos] + "\nimport { colors } from '../theme/colors';" + content[insert_pos:]
        
        # 修复深色背景
        content = content.replace('backgroundColor: "#000"', 'backgroundColor: colors.background.secondary')
        content = content.replace("backgroundColor: '#000'", 'backgroundColor: colors.background.secondary')
        content = content.replace('backgroundColor: "#0a0a0a"', 'backgroundColor: colors.background.secondary')
        content = content.replace('backgroundColor: "#1a1a1a"', 'backgroundColor: colors.background.card')
        content = content.replace('backgroundColor: "#2a2a2a"', 'backgroundColor: colors.gray[100]')
        
        # 修复文字颜色
        content = content.replace('color: "#fff"', 'color: colors.text.primary')
        content = content.replace("color: '#fff'", 'color: colors.text.primary')
        content = content.replace('color: "#ffffff"', 'color: colors.text.primary')
        
        if content != original:
            screen_info['path'].write_text(content, encoding='utf-8')
            return True
        return False
    
    def run(self):
        """执行开发任务"""
        log("=" * 60)
        log("🚀 Kimi智能开发Agent启动")
        log("=" * 60)
        
        # 分析
        screens = self.analyze_all_screens()
        need_fix = [s for s in screens if s['needs_fix']]
        
        log(f"\n📊 分析结果:")
        log(f"  总页面数: {len(screens)}")
        log(f"  需要修复: {len(need_fix)}")
        log(f"  已完成: {len(screens) - len(need_fix)}")
        
        if not need_fix:
            log("\n✅ 所有页面已完成重构！")
            return
        
        # 修复
        log(f"\n🔧 开始修复...")
        for i, screen in enumerate(need_fix[:5], 1):  # 每次最多5个
            log(f"\n[{i}/{min(5, len(need_fix))}] {screen['name']}")
            log(f"      问题: {'无Theme' if not screen['uses_theme'] else ''} {'深色残留' if screen['has_dark'] else ''}")
            
            try:
                if self.quick_fix_screen(screen):
                    self.fixed_count += 1
                    log(f"      ✅ 已修复")
                    
                    # Git提交
                    subprocess.run(['git', 'add', str(screen['path'])], cwd=APP_DIR, capture_output=True)
                else:
                    self.skipped_count += 1
                    log(f"      ⚠️ 无需修改")
                    
            except Exception as e:
                log(f"      ❌ 错误: {e}")
        
        # 提交
        if self.fixed_count > 0:
            result = subprocess.run(
                ['git', 'commit', '-m', f'fix(ui): Kimi自动修复{self.fixed_count}个页面主题问题'],
                cwd=APP_DIR, capture_output=True, text=True
            )
            if result.returncode == 0:
                log(f"\n✅ Git提交成功")
            else:
                log(f"\n⚠️ Git提交: {result.stderr}")
        
        log("\n" + "=" * 60)
        log(f"🎉 任务完成: 修复{self.fixed_count}个, 跳过{self.skipped_count}个")
        log("=" * 60)

if __name__ == "__main__":
    agent = KimiDevAgent()
    agent.run()
