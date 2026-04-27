#!/usr/bin/env python3
"""
Data Validation Agent - 数据验证专家
职责：
1. 52页面数据流验证
2. API数据一致性检查
3. 端到端数据测试
4. 聚会完整流程验证
"""

import json
import os
import urllib.request
import urllib.error
from datetime import datetime
from pathlib import Path

APP_DIR = "/Users/mac/.openclaw.pre-migration/workspace/juju-platform-all/JujuApp"
AGENT_DIR = f"{APP_DIR}/agents"
LOG_DIR = f"{APP_DIR}/logs/agents"
API_BASE = "https://api.hfparty.asia/api/v1"

class DataValidationAgent:
    def __init__(self):
        self.name = "data-validation"
        self.status = "idle"
        Path(LOG_DIR).mkdir(parents=True, exist_ok=True)
        self.log_file = f"{LOG_DIR}/data-validation-{datetime.now().strftime('%Y%m%d-%H%M%S')}.log"
    
    def log(self, message):
        timestamp = datetime.now().isoformat()
        log_line = f"[{timestamp}] {message}"
        print(log_line)
        with open(self.log_file, 'a') as f:
            f.write(log_line + '\n')
    
    def api_request(self, endpoint):
        """API请求辅助函数"""
        try:
            url = f"{API_BASE}{endpoint}"
            req = urllib.request.Request(url, headers={
                'User-Agent': 'JUJU-DataValidation-Agent/1.0'
            })
            with urllib.request.urlopen(req, timeout=10) as response:
                return json.loads(response.read().decode('utf-8'))
        except Exception as e:
            return {"error": str(e)}
    
    def validate_party_flow(self):
        """
        验证聚会完整数据流：
        首页列表 → 聚会详情 → 票券列表
        """
        self.log("[VALIDATE] 聚会完整数据流...")
        
        flow_result = {
            "steps": [],
            "success": True
        }
        
        # Step 1: 获取聚会列表
        self.log("  [1/3] 获取聚会列表...")
        parties = self.api_request("/parties?page=1&pageSize=5")
        
        if "error" in parties:
            flow_result["steps"].append({
                "step": "list_parties",
                "status": "failed",
                "error": parties["error"]
            })
            flow_result["success"] = False
            return flow_result
        
        party_list = parties.get("data", {}).get("list", [])
        if not party_list:
            flow_result["steps"].append({
                "step": "list_parties",
                "status": "failed",
                "error": "聚会列表为空"
            })
            flow_result["success"] = False
            return flow_result
        
        flow_result["steps"].append({
            "step": "list_parties",
            "status": "success",
            "count": len(party_list)
        })
        
        # Step 2: 获取第一个聚会详情
        self.log("  [2/3] 获取聚会详情...")
        first_party = party_list[0]
        party_id = first_party.get("id")
        
        if not party_id:
            flow_result["steps"].append({
                "step": "party_detail",
                "status": "failed",
                "error": "聚会ID缺失"
            })
            flow_result["success"] = False
            return flow_result
        
        party_detail = self.api_request(f"/parties/{party_id}")
        
        if "error" in party_detail:
            flow_result["steps"].append({
                "step": "party_detail",
                "status": "failed",
                "error": party_detail["error"]
            })
            flow_result["success"] = False
            return flow_result
        
        flow_result["steps"].append({
            "step": "party_detail",
            "status": "success",
            "party_id": party_id,
            "title": party_detail.get("data", {}).get("title", "N/A")
        })
        
        # Step 3: 获取票券信息
        self.log("  [3/3] 获取票券信息...")
        tickets = self.api_request(f"/parties/{party_id}/tickets")
        
        if "error" in tickets:
            flow_result["steps"].append({
                "step": "tickets",
                "status": "failed",
                "error": tickets["error"]
            })
        else:
            ticket_list = tickets.get("data", {}).get("list", [])
            flow_result["steps"].append({
                "step": "tickets",
                "status": "success",
                "count": len(ticket_list)
            })
        
        return flow_result
    
    def validate_api_endpoints(self):
        """验证所有关键API端点"""
        self.log("[VALIDATE] API端点...")
        
        endpoints = [
            ("/parties?page=1&pageSize=1", "GET", "聚会列表"),
            ("/parties/categories", "GET", "聚会分类"),
            ("/vip/info", "GET", "VIP信息"),
            ("/user/profile", "GET", "用户资料"),
            ("/orders?page=1&pageSize=1", "GET", "订单列表"),
            ("/tickets/my?page=1&pageSize=1", "GET", "我的票券"),
        ]
        
        results = []
        for endpoint, method, name in endpoints:
            try:
                response = self.api_request(endpoint)
                success = "error" not in response
                results.append({
                    "name": name,
                    "endpoint": endpoint,
                    "method": method,
                    "status": "success" if success else "failed",
                    "error": response.get("error") if not success else None
                })
            except Exception as e:
                results.append({
                    "name": name,
                    "endpoint": endpoint,
                    "method": method,
                    "status": "failed",
                    "error": str(e)
                })
        
        success_count = sum(1 for r in results if r["status"] == "success")
        self.log(f"  API检查: {success_count}/{len(results)} 通过")
        
        return results
    
    def validate_screen_data_mapping(self):
        """
        验证页面与数据映射关系
        检查每个页面是否能正确获取所需数据
        """
        self.log("[VALIDATE] 页面数据映射...")
        
        screen_data_map = {
            "HomeScreen": ["/parties", "/parties/categories"],
            "PartyDetailScreen": ["/parties/{id}", "/parties/{id}/tickets"],
            "TicketSelectionScreen": ["/parties/{id}/tickets"],
            "MyTicketsScreen": ["/tickets/my"],
            "OrderListScreen": ["/orders"],
            "VIPCenterScreen": ["/vip/info"],
            "ProfileScreen": ["/user/profile"],
            "CommunityScreen": ["/posts"],
            "FansScreen": ["/users/fans"],
            "FollowingScreen": ["/users/following"],
        }
        
        results = []
        for screen, endpoints in screen_data_map.items():
            screen_result = {
                "screen": screen,
                "endpoints": [],
                "all_available": True
            }
            
            for endpoint in endpoints:
                # 替换变量为测试值
                test_endpoint = endpoint.replace("{id}", "1")
                
                try:
                    response = self.api_request(test_endpoint)
                    available = "error" not in response
                    screen_result["endpoints"].append({
                        "endpoint": endpoint,
                        "available": available
                    })
                    if not available:
                        screen_result["all_available"] = False
                except Exception as e:
                    screen_result["endpoints"].append({
                        "endpoint": endpoint,
                        "available": False,
                        "error": str(e)
                    })
                    screen_result["all_available"] = False
            
            results.append(screen_result)
        
        return results
    
    def run(self, task_id=None):
        """执行Agent任务"""
        self.log("=" * 60)
        self.log(f"Data Validation Agent 启动")
        self.log("=" * 60)
        
        # 1. 验证聚会完整数据流
        party_flow = self.validate_party_flow()
        
        # 2. 验证API端点
        api_results = self.validate_api_endpoints()
        
        # 3. 验证页面数据映射
        screen_mapping = self.validate_screen_data_mapping()
        
        # 4. 生成报告
        report = {
            "agent": self.name,
            "timestamp": datetime.now().isoformat(),
            "party_flow": party_flow,
            "api_endpoints": {
                "total": len(api_results),
                "success": sum(1 for r in api_results if r["status"] == "success"),
                "failed": sum(1 for r in api_results if r["status"] == "failed"),
                "details": api_results
            },
            "screen_data_mapping": {
                "total_screens": len(screen_mapping),
                "fully_mapped": sum(1 for r in screen_mapping if r["all_available"]),
                "details": screen_mapping
            },
            "log_file": self.log_file
        }
        
        report_file = f"{LOG_DIR}/data-validation-report-latest.json"
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        self.log(f"\n✅ Data Validation Agent 完成")
        self.log(f"  聚会数据流: {'通过' if party_flow['success'] else '失败'}")
        self.log(f"  API端点: {report['api_endpoints']['success']}/{report['api_endpoints']['total']} 通过")
        self.log(f"  页面映射: {report['screen_data_mapping']['fully_mapped']}/{report['screen_data_mapping']['total_screens']} 完整")
        self.log("=" * 60)
        
        return report

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--task-id", help="任务ID")
    args = parser.parse_args()
    
    agent = DataValidationAgent()
    result = agent.run(args.task_id)
    print(json.dumps(result, indent=2))
