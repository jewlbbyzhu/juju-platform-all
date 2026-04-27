#!/usr/bin/env python3
"""
OpenCode 小任务执行器
将大任务分割成小任务逐个执行，避免超时
"""

import os
import subprocess
from datetime import datetime
from pathlib import Path

APP_DIR = Path("/Users/mac/.openclaw.pre-migration/workspace/juju-platform-all/JujuApp")
SCREEN_DIR = APP_DIR / "src/screens"
LOG_DIR = APP_DIR / "logs/agents/opencode"

def log(message):
    timestamp = datetime.now().isoformat()
    print(f"[{timestamp}] {message}")
    Path(LOG_DIR).mkdir(parents=True, exist_ok=True)
    with open(f"{LOG_DIR}/runner-{datetime.now().strftime('%Y%m%d')}.log", 'a') as f:
        f.write(f"[{timestamp}] {message}\n")

def run_opencode(prompt, file_list):
    """执行单个OpenCode小任务"""
    files_str = ', '.join([f'src/screens/{f}' for f in file_list])
    full_prompt = f"{prompt}: {files_str}"
    
    log(f"🚀 OpenCode任务: {files_str}")
    
    cmd = [
        'opencode', 'run',
        full_prompt
    ]
    
    try:
        result = subprocess.run(
            cmd,
            cwd=APP_DIR,
            capture_output=True,
            text=True,
            timeout=900  # 15分钟单个任务超时
        )
        
        if result.returncode == 0 or 'Edit' in result.stdout:
            log(f"  ✅ 成功")
            return True, result.stdout
        else:
            log(f"  ⚠️ 可能失败: {result.stderr[:200]}")
            return False, result.stderr
            
    except subprocess.TimeoutExpired:
        log(f"  ❌ 超时 (15分钟)")
        return False, "timeout"
    except Exception as e:
        log(f"  ❌ 错误: {e}")
        return False, str(e)

def find_screens_need_fix():
    """找出需要修复的页面"""
    screens = []
    for screen_file in SCREEN_DIR.glob("*.tsx"):
        content = screen_file.read_text(encoding='utf-8')
        has_colors = 'colors.' in content
        has_import = "from '../theme/colors'" in content or 'from "../theme/colors"' in content
        has_theme = "from '../theme'" in content or 'from "../theme"' in content
        
        if has_colors and not (has_import or has_theme):
            screens.append(screen_file.name)
    
    return screens[:2]  # 每次最多2个

def main():
    log("=" * 60)
    log("OpenCode小任务执行器启动")
    log("=" * 60)
    
    # 找出需要修复的页面
    screens = find_screens_need_fix()
    
    if not screens:
        log("✅ 所有页面已正确导入Theme")
        return
    
    log(f"发现 {len(screens)} 个页面需要修复: {screens}")
    
    # 逐个执行（每次1个，确保不超时的最保险方式）
    for screen in screens:
        success, output = run_opencode(
            "重构以下文件使用Theme系统colors，确保正确导入import { colors } from '../theme/colors'，替换所有硬编码颜色",
            [screen]
        )
        
        if not success:
            log(f"  切换到本地脚本修复: {screen}")
            # 本地快速修复
            fpath = SCREEN_DIR / screen
            content = fpath.read_text(encoding='utf-8')
            
            # 添加导入
            imports = list(__import__('re').finditer(r'^(import|from)\s+.*$', content, __import__('re').MULTILINE))
            if imports and "from '../theme/colors'" not in content:
                last = imports[-1]
                insert_pos = last.end()
                content = content[:insert_pos] + "\nimport { colors } from '../theme/colors';" + content[insert_pos:]
                fpath.write_text(content, encoding='utf-8')
                log(f"  ✅ 本地修复完成")
    
    # Git提交
    result = subprocess.run(
        ['git', 'status', '--short'],
        cwd=APP_DIR,
        capture_output=True,
        text=True
    )
    
    if result.stdout.strip():
        subprocess.run(['git', 'add', 'src/screens/'], cwd=APP_DIR)
        subprocess.run(
            ['git', 'commit', '-m', f'fix(ui): OpenCode/本地修复页面导入问题'],
            cwd=APP_DIR,
            capture_output=True
        )
        log("✅ Git提交完成")
    
    log("=" * 60)

if __name__ == "__main__":
    main()
