#!/usr/bin/env python3
"""
JUJU Orchestrator Agent - 多Agent协作总指挥
职责：
1. 检查系统状态
2. 诊断问题
3. 委派任务给其他Agent（通过创建子任务文件）
4. 监控任务执行
5. 向上级报告

关键设计：协调器不直接执行耗时操作，而是创建任务让其他Agent执行
"""

import json
import os
import sys
import subprocess
from datetime import datetime
from pathlib import Path

APP_DIR = "/Users/mac/.openclaw.pre-migration/workspace/juju-platform-all/JujuApp"
AGENT_DIR = f"{APP_DIR}/agents"
BUS_FILE = f"{AGENT_DIR}/shared/agent-bus.json"
LOG_DIR = f"{APP_DIR}/logs/agents"

class OrchestratorAgent:
    def __init__(self):
        self.name = "orchestrator"
        self.status = "running"
        Path(LOG_DIR).mkdir(parents=True, exist_ok=True)
        self.log_file = f"{LOG_DIR}/orchestrator-{datetime.now().strftime('%Y%m%d-%H%M%S')}.log"
        self.actions_taken = []
        
    def log(self, message):
        timestamp = datetime.now().isoformat()
        log_line = f"[{timestamp}] {message}"
        print(log_line)
        with open(self.log_file, 'a') as f:
            f.write(log_line + '\n')
    
    def quick_check(self):
        """快速检查 - 必须在30秒内完成"""
        self.log("[QUICK-CHECK] 快速系统检查...")
        
        issues = []
        
        # 1. 检查TS编译（快速模式，只检查关键文件）
        result = subprocess.run(
            ["npx", "tsc", "--noEmit", "--skipLibCheck"],
            cwd=APP_DIR,
            capture_output=True,
            timeout=15
        )
        if result.returncode != 0:
            ts_errors = len((result.stdout + result.stderr).decode().split("error TS")) - 1
            issues.append({
                "type": "ts_compile_error",
                "severity": "high",
                "agent": "code-quality",
                "message": f"TypeScript有 {ts_errors} 个错误"
            })
        
        # 2. 检查API（快速ping）
        import urllib.request
        try:
            urllib.request.urlopen(
                "https://api.hfparty.asia/api/v1/parties?page=1&pageSize=1", 
                timeout=5
            )
        except:
            issues.append({
                "type": "api_unavailable",
                "severity": "critical",
                "agent": "data-validation",
                "message": "API服务不可用"
            })
        
        # 3. 检查APK状态
        latest_apk = f"{APP_DIR}/builds/juju-latest.apk"
        if os.path.exists(latest_apk):
            size_mb = os.path.getsize(latest_apk) / (1024 * 1024)
            if size_mb < 30:
                issues.append({
                    "type": "apk_too_small",
                    "severity": "high",
                    "agent": "build",
                    "message": f"APK大小异常: {size_mb:.1f}MB"
                })
        else:
            issues.append({
                "type": "no_apk",
                "severity": "medium",
                "agent": "build",
                "message": "缺少最新APK"
            })
        
        # 4. 检查Agent状态
        for agent_name in ["code-quality", "build", "ui-ux", "data-validation", "test-validation"]:
            pending_file = f"{AGENT_DIR}/{agent_name}/pending-tasks.json"
            if os.path.exists(pending_file):
                with open(pending_file, 'r') as f:
                    tasks = json.load(f)
                failed_tasks = [t for t in tasks if t.get("status") == "failed"]
                if failed_tasks:
                    issues.append({
                        "type": "agent_task_failed",
                        "severity": "medium",
                        "agent": agent_name,
                        "message": f"{agent_name}有 {len(failed_tasks)} 个失败任务"
                    })
        
        return issues
    
    def dispatch_to_agent(self, agent_name, task_type, priority="normal", context=None):
        """
        委派任务给Agent
        不直接执行，而是创建任务文件让Agent在下次运行时处理
        """
        self.log(f"[DISPATCH] 委派 {task_type} 给 {agent_name}")
        
        task = {
            "id": f"{task_type}-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "type": task_type,
            "priority": priority,
            "status": "pending",
            "context": context or {},
            "created": datetime.now().isoformat(),
            "dispatched_by": "orchestrator"
        }
        
        # 写入Agent的待处理队列
        pending_file = f"{AGENT_DIR}/{agent_name}/pending-tasks.json"
        pending = []
        if os.path.exists(pending_file):
            with open(pending_file, 'r') as f:
                pending = json.load(f)
        
        pending.append(task)
        
        with open(pending_file, 'w') as f:
            json.dump(pending, f, indent=2)
        
        self.actions_taken.append(f"委派 {task_type} -> {agent_name}")
        return task["id"]
    
    def run_lightweight_agents(self):
        """运行轻量级Agent（快速执行）"""
        self.log("[RUN-AGENTS] 启动轻量级Agent...")
        
        results = {}
        
        # 按优先级顺序运行Agent
        agents_to_run = [
            ("code-quality", "快速代码检查"),
            ("test-validation", "测试验证"),
            ("data-validation", "数据验证"),
        ]
        
        for agent_name, description in agents_to_run:
            script = f"{AGENT_DIR}/{agent_name}/{agent_name}-agent.py"
            if os.path.exists(script):
                self.log(f"  启动 {agent_name}...")
                try:
                    # 设置超时5分钟
                    result = subprocess.run(
                        ["python3", script],
                        capture_output=True,
                        timeout=300,
                        cwd=APP_DIR
                    )
                    results[agent_name] = {
                        "success": result.returncode == 0,
                        "description": description
                    }
                except subprocess.TimeoutExpired:
                    self.log(f"  ⚠️ {agent_name} 超时")
                    results[agent_name] = {"success": False, "error": "timeout"}
                except Exception as e:
                    self.log(f"  ❌ {agent_name} 错误: {e}")
                    results[agent_name] = {"success": False, "error": str(e)}
        
        return results
    
    def generate_report(self, issues, agent_results):
        """生成协调报告"""
        report = {
            "orchestrator": {
                "time": datetime.now().isoformat(),
                "issues_found": len(issues),
                "actions_taken": self.actions_taken,
                "agent_results": agent_results
            },
            "issues": issues,
            "needs_attention": [i for i in issues if i["severity"] in ["critical", "high"]]
        }
        
        # 保存报告
        report_file = f"{LOG_DIR}/orchestrator-report-latest.json"
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        return report
    
    def run(self):
        """主运行循环 - 必须在8分钟内完成"""
        self.log("=" * 60)
        self.log("Orchestrator Agent 启动")
        self.log("=" * 60)
        
        # Phase 1: 快速检查 (1-2分钟)
        self.log("\n[PHASE 1/3] 快速系统检查")
        issues = self.quick_check()
        self.log(f"  发现 {len(issues)} 个问题")
        
        # Phase 2: 委派任务 (1分钟)
        self.log("\n[PHASE 2/3] 任务委派")
        for issue in issues:
            if issue["severity"] in ["critical", "high"]:
                self.dispatch_to_agent(
                    agent_name=issue["agent"],
                    task_type=issue["type"],
                    priority="high",
                    context={"message": issue["message"]}
                )
        
        # Phase 3: 运行轻量级Agent (5分钟)
        self.log("\n[PHASE 3/3] 运行轻量级Agent")
        agent_results = self.run_lightweight_agents()
        
        # 生成报告
        report = self.generate_report(issues, agent_results)
        
        # 输出摘要
        self.log("\n" + "=" * 60)
        self.log("协调器报告")
        self.log("=" * 60)
        self.log(f"发现问题: {len(issues)}")
        self.log(f"委派任务: {len(self.actions_taken)}")
        self.log(f"Agent运行: {sum(1 for r in agent_results.values() if r.get('success'))}/{len(agent_results)}")
        
        if report["needs_attention"]:
            self.log("\n⚠️ 需要关注的问题:")
            for issue in report["needs_attention"]:
                self.log(f"  - [{issue['severity'].upper()}] {issue['message']}")
        
        self.log("=" * 60)
        
        return report

if __name__ == "__main__":
    agent = OrchestratorAgent()
    result = agent.run()
    print(json.dumps(result, indent=2))
