#!/usr/bin/env python3
"""
JUJU 页面重构守护进程
连续执行 OpenCode 重构任务，自动提交 Git，记录进度
"""

import os
import sys
import time
import json
import subprocess
from datetime import datetime

PROJECT_DIR = os.path.expanduser("~/.openclaw.pre-migration/workspace/juju-platform-all/JujuApp")
LOG_DIR = os.path.expanduser("~/.openclaw.pre-migration/workspace/juju-platform-all/logs/daemon")
STATE_FILE = os.path.join(LOG_DIR, "refactor-state.json")

os.makedirs(LOG_DIR, exist_ok=True)

# 页面列表：按优先级排序（核心页面优先，已重构过的跳过或做二次优化）
PAGES = [
    # P0 核心页面（做精细化增强）
    ("PartyDetailScreen.tsx", "enhance", "增强版：完善2026设计系统、添加更多微交互和错误边界"),
    ("HomeScreen.tsx", "enhance", "增强版：优化Feed卡片动画、添加Skeleton加载态"),
    ("ProfileScreen.tsx", "enhance", "增强版：统一菜单图标风格、添加数据刷新动画"),
    ("LoginScreen.tsx", "enhance", "增强版：社交登录按钮动效、表单验证提示优化"),

    # P1 主要业务页面
    ("TicketSelectScreen.tsx", "refactor", "2026设计系统、组件拆分、动画优化、统一colors引用"),
    ("CommunityScreen.tsx", "refactor", "2026设计系统、大组件拆分、动画优化、统一colors引用"),
    ("VIPScreen.tsx", "refactor", "2026设计系统、组件拆分、动画优化、统一colors引用"),
    ("VIPCenterScreen.tsx", "refactor", "2026设计系统、组件拆分、动画优化、统一colors引用"),
    ("MyTicketsScreen.tsx", "refactor", "2026设计系统、组件拆分、动画优化、统一colors引用"),
    ("MyPartiesScreen.tsx", "refactor", "2026设计系统、组件拆分、动画优化、统一colors引用"),

    # P2 功能页面
    ("PaymentScreen.tsx", "refactor", "2026设计系统、组件拆分、动画优化、统一colors引用"),
    ("WalletScreen.tsx", "refactor", "2026设计系统、组件拆分、动画优化、统一colors引用"),
    ("OrderDetailScreen.tsx", "refactor", "2026设计系统、组件拆分、动画优化、统一colors引用"),
    ("MyOrdersScreen.tsx", "refactor", "2026设计系统、组件拆分、动画优化、统一colors引用"),
    ("OrderSuccessScreen.tsx", "refactor", "2026设计系统、组件拆分、动画优化、统一colors引用"),
    ("ChatListScreen.tsx", "refactor", "2026设计系统、组件拆分、动画优化、统一colors引用"),
    ("PrivateChatScreen.tsx", "refactor", "2026设计系统、组件拆分、动画优化、统一colors引用"),
    ("GroupChatScreen.tsx", "refactor", "2026设计系统、组件拆分、动画优化、统一colors引用"),
    ("GroupChatListScreen.tsx", "refactor", "2026设计系统、组件拆分、动画优化、统一colors引用"),
    ("SocialScreen.tsx", "refactor", "2026设计系统、组件拆分、动画优化、统一colors引用"),
    ("UserProfileScreen.tsx", "refactor", "2026设计系统、组件拆分、动画优化、统一colors引用"),
    ("FansScreen.tsx", "refactor", "2026设计系统、组件拆分、动画优化、统一colors引用"),
    ("FollowingScreen.tsx", "refactor", "2026设计系统、组件拆分、动画优化、统一colors引用"),
    ("FavoritesScreen.tsx", "refactor", "2026设计系统、组件拆分、动画优化、统一colors引用"),
    ("CreatePartyScreen.tsx", "refactor", "2026设计系统、组件拆分、动画优化、统一colors引用"),
    ("CreatePostScreen.tsx", "refactor", "2026设计系统、组件拆分、动画优化、统一colors引用"),
    ("CreateGroupScreen.tsx", "refactor", "2026设计系统、组件拆分、动画优化、统一colors引用"),
    ("NotificationsScreen.tsx", "refactor", "2026设计系统、组件拆分、动画优化、统一colors引用"),
    ("PushMessagesScreen.tsx", "refactor", "2026设计系统、组件拆分、动画优化、统一colors引用"),
    ("PushSettingsScreen.tsx", "refactor", "2026设计系统、组件拆分、动画优化、统一colors引用"),
    ("LocationPickerScreen.tsx", "refactor", "2026设计系统、组件拆分、动画优化、统一colors引用"),
    ("MapScreen.tsx", "refactor", "2026设计系统、组件拆分、动画优化、统一colors引用"),
    ("InviteCodeScreen.tsx", "refactor", "2026设计系统、组件拆分、动画优化、统一colors引用"),
    ("CustomerServiceScreen.tsx", "refactor", "2026设计系统、组件拆分、动画优化、统一colors引用"),
    ("ReviewScreen.tsx", "refactor", "2026设计系统、组件拆分、动画优化、统一colors引用"),
    ("ScanTicketScreen.tsx", "refactor", "2026设计系统、组件拆分、动画优化、统一colors引用"),
    ("ScanHistoryScreen.tsx", "refactor", "2026设计系统、组件拆分、动画优化、统一colors引用"),
    ("TicketInventoryScreen.tsx", "refactor", "2026设计系统、组件拆分、动画优化、统一colors引用"),
    ("TicketSelectionScreen.tsx", "refactor", "2026设计系统、组件拆分、动画优化、统一colors引用"),
    ("TicketStatsScreen.tsx", "refactor", "2026设计系统、组件拆分、动画优化、统一colors引用"),
    ("TicketStatsDetailScreen.tsx", "refactor", "2026设计系统、组件拆分、动画优化、统一colors引用"),
    ("RefundApplyScreen.tsx", "refactor", "2026设计系统、组件拆分、动画优化、统一colors引用"),
    ("SharePosterScreen.tsx", "refactor", "2026设计系统、组件拆分、动画优化、统一colors引用"),
    ("TagManageScreen.tsx", "refactor", "2026设计系统、组件拆分、动画优化、统一colors引用"),
    ("ThemePreviewScreen.tsx", "refactor", "2026设计系统、组件拆分、动画优化、统一colors引用"),
    ("DownloadScreen.tsx", "refactor", "2026设计系统、组件拆分、动画优化、统一colors引用"),
    ("VIPEventsScreen.tsx", "refactor", "2026设计系统、组件拆分、动画优化、统一colors引用"),
    ("VIPHistoryScreen.tsx", "refactor", "2026设计系统、组件拆分、动画优化、统一colors引用"),
    ("VIPLevelsScreen.tsx", "refactor", "2026设计系统、组件拆分、动画优化、统一colors引用"),
    ("VIPPointsScreen.tsx", "refactor", "2026设计系统、组件拆分、动画优化、统一colors引用"),
    ("VIPPrivilegesScreen.tsx", "refactor", "2026设计系统、组件拆分、动画优化、统一colors引用"),
    ("VIPStatsScreen.tsx", "refactor", "2026设计系统、组件拆分、动画优化、统一colors引用"),

    # P3 可删除/忽略的页面
    ("EvoMapDemoScreen.tsx", "skip", "Demo页面，无需重构"),
    ("TestNewScreen.tsx", "skip", "测试页面，无需重构"),
]


def log(msg):
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line, flush=True)
    with open(os.path.join(LOG_DIR, "refactor-daemon.log"), "a") as f:
        f.write(line + "\n")


def load_state():
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE, "r") as f:
            return json.load(f)
    return {"current_index": 0, "completed": 0, "failed": 0, "history": []}


def save_state(state):
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=2)


def run_cmd(cmd, cwd=None, timeout=1200):
    log(f"RUN: {cmd}")
    try:
        result = subprocess.run(
            cmd, shell=True, cwd=cwd, capture_output=True, text=True, timeout=timeout
        )
        return result.returncode, result.stdout, result.stderr
    except subprocess.TimeoutExpired:
        return -1, "", "TIMEOUT"


def kill_zombies():
    ret, out, _ = run_cmd("pgrep -f 'opencode run'")
    if ret == 0 and out.strip():
        pids = " ".join(out.strip().split("\n"))
        log(f"Killing zombie opencode processes: {pids}")
        run_cmd(f"kill -9 {pids}")


def git_commit(page):
    run_cmd("git add -A", cwd=PROJECT_DIR)
    ret, _, err = run_cmd(
        f'git commit -m "refactor: 深度重构{page} - 2026设计系统、组件拆分、动画优化、统一colors引用"',
        cwd=PROJECT_DIR,
    )
    if ret != 0:
        log(f"Git commit warning: {err}")
        return False
    return True


def run_opencode(page, task_desc):
    prompt = (
        f"深度重构src/screens/{page}：{task_desc}。"
        "必须使用2026设计系统（colors/spacing/layout/animation），"
        "统一所有颜色引用为colors.xxx，优化组件结构，提取可复用子组件到src/components/，"
        "添加适当的react-native-reanimated动画效果，保持TypeScript严格类型正确。"
    )
    cmd = f'cd {PROJECT_DIR} && opencode run "{prompt}"'
    return run_cmd(cmd, timeout=1500)  # 25 minutes max


def verify_ts():
    tsc_path = os.path.join(PROJECT_DIR, "node_modules", ".bin", "tsc")
    ret, out, _ = run_cmd(f"{tsc_path} --noEmit", cwd=PROJECT_DIR, timeout=120)
    if ret != 0:
        error_count = out.count("error TS")
        log(f"TypeScript check FAILED: {error_count} errors")
        return False, error_count
    log("TypeScript check PASSED (0 errors)")
    return True, 0


def main():
    log("=== JUJU Refactor Daemon Started ===")
    state = load_state()
    log(f"Resuming from index {state['current_index']}, completed={state['completed']}, failed={state['failed']}")

    while state["current_index"] < len(PAGES):
        page, action, desc = PAGES[state["current_index"]]

        if action == "skip":
            log(f"SKIP {page}: {desc}")
            state["current_index"] += 1
            save_state(state)
            continue

        log(f"START [{state['current_index'] + 1}/{len(PAGES)}] {page} - {desc}")

        # Pre-cleanup
        kill_zombies()

        # Run OpenCode
        ret, out, err = run_opencode(page, desc)

        if ret == -1:
            log(f"TIMEOUT on {page}")
            state["failed"] += 1
            state["history"].append({"page": page, "status": "timeout", "time": datetime.now().isoformat()})
        elif ret != 0:
            log(f"FAIL on {page}: {err[:500]}")
            state["failed"] += 1
            state["history"].append({"page": page, "status": "fail", "error": err[:500], "time": datetime.now().isoformat()})
        else:
            # Verify
            ok, err_count = verify_ts()
            if ok:
                git_commit(page)
                log(f"SUCCESS {page}")
                state["completed"] += 1
                state["history"].append({"page": page, "status": "success", "time": datetime.now().isoformat()})
            else:
                log(f"VERIFY_FAIL on {page}: {err_count} TS errors")
                state["failed"] += 1
                state["history"].append({"page": page, "status": "verify_fail", "errors": err_count, "time": datetime.now().isoformat()})

        state["current_index"] += 1
        save_state(state)

        # Brief rest
        log("Sleeping 30s before next task...")
        time.sleep(30)

    log("=== ALL PAGES PROCESSED ===")


if __name__ == "__main__":
    main()
