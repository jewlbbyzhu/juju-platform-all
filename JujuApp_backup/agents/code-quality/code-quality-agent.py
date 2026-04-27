#!/usr/bin/env python3
"""
Code Quality Agent - 代码质量专家
职责：
1. TS编译错误修复
2. ESLint问题修复
3. 代码规范检查
4. 简单bug自动修复
"""

import json
import os
import re
import subprocess
from datetime import datetime
from pathlib import Path

APP_DIR = "/Users/mac/.openclaw.pre-migration/workspace/juju-platform-all/JujuApp"
AGENT_DIR = f"{APP_DIR}/agents"
LOG_DIR = f"{APP_DIR}/logs/agents"

class CodeQualityAgent:
    def __init__(self):
        self.name = "code-quality"
        self.status = "idle"
        Path(LOG_DIR).mkdir(parents=True, exist_ok=True)
        self.log_file = f"{LOG_DIR}/code-quality-{datetime.now().strftime('%Y%m%d-%H%M%S')}.log"
        self.fixes = []
    
    def log(self, message):
        timestamp = datetime.now().isoformat()
        log_line = f"[{timestamp}] {message}"
        print(log_line)
        with open(self.log_file, 'a') as f:
            f.write(log_line + '\n')
    
    def load_task(self, task_id=None):
        """加载待处理任务"""
        task_file = f"{AGENT_DIR}/{self.name}/pending-tasks.json"
        if not os.path.exists(task_file):
            return None
        
        with open(task_file, 'r') as f:
            tasks = json.load(f)
        
        if task_id:
            for task in tasks:
                if task["id"] == task_id:
                    return task
            return None
        
        # 返回第一个待处理任务
        for task in tasks:
            if task["status"] in ["pending", "dispatched"]:
                return task
        return None
    
    def update_task(self, task, result):
        """更新任务状态"""
        task_file = f"{AGENT_DIR}/{self.name}/pending-tasks.json"
        completed_file = f"{AGENT_DIR}/{self.name}/completed-tasks.json"
        
        with open(task_file, 'r') as f:
            tasks = json.load(f)
        
        # 从pending中移除
        tasks = [t for t in tasks if t["id"] != task["id"]]
        with open(task_file, 'w') as f:
            json.dump(tasks, f, indent=2)
        
        # 添加到completed
        task["status"] = "completed"
        task["completed"] = datetime.now().isoformat()
        task["result"] = result
        
        completed = []
        if os.path.exists(completed_file):
            with open(completed_file, 'r') as f:
                completed = json.load(f)
        completed.append(task)
        
        with open(completed_file, 'w') as f:
            json.dump(completed, f, indent=2)
    
    def fix_ts_compile_errors(self, context=None):
        """修复TypeScript编译错误"""
        self.log("[FIX] 修复TypeScript编译错误...")
        
        # 获取错误信息
        result = subprocess.run(
            ["npx", "tsc", "--noEmit"],
            cwd=APP_DIR,
            capture_output=True,
            text=True
        )
        
        errors = result.stdout + result.stderr
        fixed_count = 0
        
        # 常见自动修复模式
        # 1. 未使用的导入
        unused_import_pattern = r"'(.*)' is declared but its value is never read"
        for match in re.finditer(unused_import_pattern, errors):
            # 需要手动处理，记录问题
            self.log(f"  [WARN] 未使用的导入: {match.group(1)}")
        
        # 2. 尝试自动修复一些简单问题
        # 运行ESLint --fix 可能会解决一些问题
        eslint_result = subprocess.run(
            ["npx", "eslint", "src/", "--ext", ".ts,.tsx", "--fix"],
            cwd=APP_DIR,
            capture_output=True
        )
        
        if eslint_result.returncode == 0:
            fixed_count += 1
            self.fixes.append("ESLint自动修复")
        
        # 重新检查TS编译
        result2 = subprocess.run(
            ["npx", "tsc", "--noEmit"],
            cwd=APP_DIR,
            capture_output=True
        )
        
        if result2.returncode == 0:
            self.log("✅ TypeScript编译错误已修复")
            return {"success": True, "fixes": self.fixes}
        else:
            remaining_errors = len((result2.stdout + result2.stderr).split("error TS")) - 1
            self.log(f"⚠️ 仍有 {remaining_errors} 个TS错误需要手动处理")
            return {"success": False, "remaining_errors": remaining_errors}
    
    def fix_eslint_errors(self, context=None):
        """修复ESLint错误"""
        self.log("[FIX] 修复ESLint错误...")
        
        # 运行ESLint并自动修复
        result = subprocess.run(
            ["npx", "eslint", "src/", "--ext", ".ts,.tsx", "--fix"],
            cwd=APP_DIR,
            capture_output=True,
            text=True
        )
        
        # 检查剩余错误
        result2 = subprocess.run(
            ["npx", "eslint", "src/", "--ext", ".ts,.tsx", "--format", "compact"],
            cwd=APP_DIR,
            capture_output=True,
            text=True
        )
        
        errors = [line for line in result2.stdout.split('\n') if 'error' in line.lower()]
        warnings = [line for line in result2.stdout.split('\n') if 'warning' in line.lower()]
        
        self.log(f"  剩余错误: {len(errors)}, 警告: {len(warnings)}")
        
        return {
            "success": len(errors) == 0,
            "errors_remaining": len(errors),
            "warnings": len(warnings)
        }
    
    def fix_simple_bugs(self, context=None):
        """修复简单bug"""
        self.log("[FIX] 修复简单bug...")
        fixes = []
        
        # 1. 删除.bak文件（常见构建问题）
        bak_files = list(Path(APP_DIR).rglob("*.bak"))
        if bak_files:
            for bak in bak_files:
                os.remove(bak)
                fixes.append(f"删除.bak文件: {bak}")
                self.log(f"  删除: {bak}")
        
        # 2. 检查并修复常见模式
        # 这里可以添加更多自动修复规则
        
        return {"success": True, "fixes": fixes}
    
    def run(self, task_id=None):
        """执行Agent任务"""
        self.log("=" * 60)
        self.log(f"Code Quality Agent 启动 (任务: {task_id or 'auto'})")
        self.log("=" * 60)
        
        task = self.load_task(task_id)
        
        if not task:
            # 没有特定任务，执行常规检查
            self.log("[MODE] 常规检查模式")
            task = {"type": "routine_check", "context": {}}
        
        self.log(f"[TASK] 类型: {task['type']}")
        
        # 根据任务类型执行不同修复
        result = {"success": True, "actions": []}
        
        if task["type"] in ["ts_compile_error", "routine_check"]:
            ts_result = self.fix_ts_compile_errors(task.get("context"))
            result["actions"].append({"type": "ts_fix", "result": ts_result})
        
        if task["type"] in ["eslint_errors", "routine_check"]:
            eslint_result = self.fix_eslint_errors(task.get("context"))
            result["actions"].append({"type": "eslint_fix", "result": eslint_result})
        
        if task["type"] == "simple_bugs":
            bug_result = self.fix_simple_bugs(task.get("context"))
            result["actions"].append({"type": "bug_fix", "result": bug_result})
        
        # 更新任务状态
        if task_id:
            self.update_task(task, result)
        
        # 生成报告
        report = {
            "agent": self.name,
            "timestamp": datetime.now().isoformat(),
            "task": task["type"],
            "result": result,
            "log_file": self.log_file
        }
        
        report_file = f"{LOG_DIR}/code-quality-report-latest.json"
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        self.log(f"\n✅ Code Quality Agent 完成")
        self.log("=" * 60)
        
        return report

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--task-id", help="任务ID")
    args = parser.parse_args()
    
    agent = CodeQualityAgent()
    result = agent.run(args.task_id)
    print(json.dumps(result, indent=2))
