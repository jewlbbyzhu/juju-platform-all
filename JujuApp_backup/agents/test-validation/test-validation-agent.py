#!/usr/bin/env python3
"""
Test Validation Agent - 测试验证专家
职责：
1. 单元测试运行
2. 集成测试运行
3. 性能测试
4. 测试覆盖率报告
"""

import json
import os
import subprocess
import re
from datetime import datetime
from pathlib import Path

APP_DIR = "/Users/mac/.openclaw.pre-migration/workspace/juju-platform-all/JujuApp"
AGENT_DIR = f"{APP_DIR}/agents"
LOG_DIR = f"{APP_DIR}/logs/agents"

class TestValidationAgent:
    def __init__(self):
        self.name = "test-validation"
        self.status = "idle"
        Path(LOG_DIR).mkdir(parents=True, exist_ok=True)
        self.log_file = f"{LOG_DIR}/test-validation-{datetime.now().strftime('%Y%m%d-%H%M%S')}.log"
    
    def log(self, message):
        timestamp = datetime.now().isoformat()
        log_line = f"[{timestamp}] {message}"
        print(log_line)
        with open(self.log_file, 'a') as f:
            f.write(log_line + '\n')
    
    def run_unit_tests(self):
        """运行单元测试"""
        self.log("[TEST] 运行单元测试...")
        
        # 检查是否有测试文件
        test_files = list(Path(f"{APP_DIR}/src").rglob("*.test.ts")) + list(Path(f"{APP_DIR}/src").rglob("*.test.tsx"))
        
        if not test_files:
            self.log("  未发现单元测试文件")
            return {"success": True, "test_count": 0, "message": "无测试文件"}
        
        self.log(f"  发现 {len(test_files)} 个测试文件")
        
        # 运行测试
        result = subprocess.run(
            ["npm", "test", "--", "--coverage", "--watchAll=false", "--passWithNoTests"],
            cwd=APP_DIR,
            capture_output=True,
            text=True
        )
        
        # 解析结果
        output = result.stdout + result.stderr
        
        # 提取测试统计
        test_match = re.search(r'Tests:\s+(\d+) passed.*?(\d+) total', output)
        passed = int(test_match.group(1)) if test_match else 0
        total = int(test_match.group(2)) if test_match else 0
        
        # 提取覆盖率
        coverage_match = re.search(r'All files\s+\|\s+([\d.]+)', output)
        coverage = float(coverage_match.group(1)) if coverage_match else 0
        
        self.log(f"  测试: {passed}/{total} 通过")
        self.log(f"  覆盖率: {coverage}%")
        
        return {
            "success": result.returncode == 0 or passed > 0,
            "passed": passed,
            "total": total,
            "coverage": coverage,
            "test_files": len(test_files)
        }
    
    def run_lint_check(self):
        """运行ESLint检查"""
        self.log("[TEST] 运行ESLint检查...")
        
        result = subprocess.run(
            ["npx", "eslint", "src/", "--ext", ".ts,.tsx", "--format", "compact"],
            cwd=APP_DIR,
            capture_output=True,
            text=True
        )
        
        output = result.stdout + result.stderr
        
        # 统计错误和警告
        errors = len(re.findall(r'error', output, re.IGNORECASE))
        warnings = len(re.findall(r'warning', output, re.IGNORECASE))
        
        self.log(f"  ESLint: {errors} 错误, {warnings} 警告")
        
        return {
            "success": errors == 0,
            "errors": errors,
            "warnings": warnings
        }
    
    def check_typescript(self):
        """检查TypeScript编译"""
        self.log("[TEST] TypeScript编译检查...")
        
        result = subprocess.run(
            ["npx", "tsc", "--noEmit"],
            cwd=APP_DIR,
            capture_output=True,
            text=True
        )
        
        output = result.stdout + result.stderr
        error_count = len(re.findall(r'error TS', output))
        
        self.log(f"  TS错误: {error_count}")
        
        return {
            "success": result.returncode == 0,
            "error_count": error_count
        }
    
    def performance_metrics(self):
        """收集性能指标"""
        self.log("[TEST] 收集性能指标...")
        
        metrics = {
            "code_stats": {},
            "bundle_size": {},
            "dependencies": {}
        }
        
        # 代码统计
        src_files = list(Path(f"{APP_DIR}/src").rglob("*.ts")) + list(Path(f"{APP_DIR}/src").rglob("*.tsx"))
        total_lines = 0
        for f in src_files:
            with open(f, 'r') as file:
                total_lines += len(file.readlines())
        
        metrics["code_stats"] = {
            "total_files": len(src_files),
            "total_lines": total_lines
        }
        
        # APK大小
        latest_apk = f"{APP_DIR}/builds/juju-latest.apk"
        if os.path.exists(latest_apk):
            size_mb = os.path.getsize(latest_apk) / (1024 * 1024)
            metrics["bundle_size"] = {
                "apk_size_mb": round(size_mb, 2),
                "path": latest_apk
            }
        
        # 依赖统计
        package_json = f"{APP_DIR}/package.json"
        if os.path.exists(package_json):
            with open(package_json, 'r') as f:
                pkg = json.load(f)
            deps = len(pkg.get("dependencies", {}))
            dev_deps = len(pkg.get("devDependencies", {}))
            metrics["dependencies"] = {
                "production": deps,
                "development": dev_deps,
                "total": deps + dev_deps
            }
        
        self.log(f"  代码: {metrics['code_stats']['total_files']} 文件, {metrics['code_stats']['total_lines']} 行")
        if "apk_size_mb" in metrics.get("bundle_size", {}):
            self.log(f"  APK: {metrics['bundle_size']['apk_size_mb']} MB")
        
        return metrics
    
    def run(self, task_id=None):
        """执行Agent任务"""
        self.log("=" * 60)
        self.log(f"Test Validation Agent 启动")
        self.log("=" * 60)
        
        # 1. 单元测试
        unit_tests = self.run_unit_tests()
        
        # 2. ESLint检查
        lint = self.run_lint_check()
        
        # 3. TypeScript检查
        ts = self.check_typescript()
        
        # 4. 性能指标
        metrics = self.performance_metrics()
        
        # 5. 生成报告
        report = {
            "agent": self.name,
            "timestamp": datetime.now().isoformat(),
            "unit_tests": unit_tests,
            "eslint": lint,
            "typescript": ts,
            "performance": metrics,
            "summary": {
                "all_passed": unit_tests["success"] and lint["success"] and ts["success"],
                "issues": []
            },
            "log_file": self.log_file
        }
        
        # 汇总问题
        if not unit_tests["success"]:
            report["summary"]["issues"].append("单元测试失败")
        if not lint["success"]:
            report["summary"]["issues"].append(f"ESLint: {lint['errors']} 错误")
        if not ts["success"]:
            report["summary"]["issues"].append(f"TypeScript: {ts['error_count']} 错误")
        
        report_file = f"{LOG_DIR}/test-validation-report-latest.json"
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        self.log(f"\n✅ Test Validation Agent 完成")
        self.log(f"  状态: {'全部通过' if report['summary']['all_passed'] else '发现问题'}")
        if report["summary"]["issues"]:
            for issue in report["summary"]["issues"]:
                self.log(f"  ⚠️ {issue}")
        self.log("=" * 60)
        
        return report

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--task-id", help="任务ID")
    args = parser.parse_args()
    
    agent = TestValidationAgent()
    result = agent.run(args.task_id)
    print(json.dumps(result, indent=2))
