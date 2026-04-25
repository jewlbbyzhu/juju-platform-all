#!/bin/bash
set -e

PROJECT_DIR="$HOME/.openclaw.pre-migration/workspace/juju-platform-all/JujuApp"
LOG_DIR="$HOME/.openclaw.pre-migration/workspace/juju-platform-all/logs/daemon"
STATE_FILE="$LOG_DIR/refactor-bash-state.txt"
mkdir -p "$LOG_DIR"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_DIR/refactor-loop.log"
}

# Pages array: filename|action|description
declare -a PAGES=(
  "PartyDetailScreen.tsx|enhance|增强版：完善2026设计系统、添加更多微交互和错误边界"
  "HomeScreen.tsx|enhance|增强版：优化Feed卡片动画、添加Skeleton加载态"
  "ProfileScreen.tsx|enhance|增强版：统一菜单图标风格、添加数据刷新动画"
  "LoginScreen.tsx|enhance|增强版：社交登录按钮动效、表单验证提示优化"
  "TicketSelectScreen.tsx|refactor|2026设计系统、组件拆分、动画优化、统一colors引用"
  "CommunityScreen.tsx|refactor|2026设计系统、大组件拆分、动画优化、统一colors引用"
  "VIPScreen.tsx|refactor|2026设计系统、组件拆分、动画优化、统一colors引用"
  "VIPCenterScreen.tsx|refactor|2026设计系统、组件拆分、动画优化、统一colors引用"
  "MyTicketsScreen.tsx|refactor|2026设计系统、组件拆分、动画优化、统一colors引用"
  "MyPartiesScreen.tsx|refactor|2026设计系统、组件拆分、动画优化、统一colors引用"
  "PaymentScreen.tsx|refactor|2026设计系统、组件拆分、动画优化、统一colors引用"
  "WalletScreen.tsx|refactor|2026设计系统、组件拆分、动画优化、统一colors引用"
  "OrderDetailScreen.tsx|refactor|2026设计系统、组件拆分、动画优化、统一colors引用"
  "MyOrdersScreen.tsx|refactor|2026设计系统、组件拆分、动画优化、统一colors引用"
  "OrderSuccessScreen.tsx|refactor|2026设计系统、组件拆分、动画优化、统一colors引用"
  "ChatListScreen.tsx|refactor|2026设计系统、组件拆分、动画优化、统一colors引用"
  "PrivateChatScreen.tsx|refactor|2026设计系统、组件拆分、动画优化、统一colors引用"
  "GroupChatScreen.tsx|refactor|2026设计系统、组件拆分、动画优化、统一colors引用"
  "GroupChatListScreen.tsx|refactor|2026设计系统、组件拆分、动画优化、统一colors引用"
  "SocialScreen.tsx|refactor|2026设计系统、组件拆分、动画优化、统一colors引用"
  "UserProfileScreen.tsx|refactor|2026设计系统、组件拆分、动画优化、统一colors引用"
  "FansScreen.tsx|refactor|2026设计系统、组件拆分、动画优化、统一colors引用"
  "FollowingScreen.tsx|refactor|2026设计系统、组件拆分、动画优化、统一colors引用"
  "FavoritesScreen.tsx|refactor|2026设计系统、组件拆分、动画优化、统一colors引用"
  "CreatePartyScreen.tsx|refactor|2026设计系统、组件拆分、动画优化、统一colors引用"
  "CreatePostScreen.tsx|refactor|2026设计系统、组件拆分、动画优化、统一colors引用"
  "CreateGroupScreen.tsx|refactor|2026设计系统、组件拆分、动画优化、统一colors引用"
  "NotificationsScreen.tsx|refactor|2026设计系统、组件拆分、动画优化、统一colors引用"
  "PushMessagesScreen.tsx|refactor|2026设计系统、组件拆分、动画优化、统一colors引用"
  "PushSettingsScreen.tsx|refactor|2026设计系统、组件拆分、动画优化、统一colors引用"
  "LocationPickerScreen.tsx|refactor|2026设计系统、组件拆分、动画优化、统一colors引用"
  "MapScreen.tsx|refactor|2026设计系统、组件拆分、动画优化、统一colors引用"
  "InviteCodeScreen.tsx|refactor|2026设计系统、组件拆分、动画优化、统一colors引用"
  "CustomerServiceScreen.tsx|refactor|2026设计系统、组件拆分、动画优化、统一colors引用"
  "ReviewScreen.tsx|refactor|2026设计系统、组件拆分、动画优化、统一colors引用"
  "ScanTicketScreen.tsx|refactor|2026设计系统、组件拆分、动画优化、统一colors引用"
  "ScanHistoryScreen.tsx|refactor|2026设计系统、组件拆分、动画优化、统一colors引用"
  "TicketInventoryScreen.tsx|refactor|2026设计系统、组件拆分、动画优化、统一colors引用"
  "TicketSelectionScreen.tsx|refactor|2026设计系统、组件拆分、动画优化、统一colors引用"
  "TicketStatsScreen.tsx|refactor|2026设计系统、组件拆分、动画优化、统一colors引用"
  "TicketStatsDetailScreen.tsx|refactor|2026设计系统、组件拆分、动画优化、统一colors引用"
  "RefundApplyScreen.tsx|refactor|2026设计系统、组件拆分、动画优化、统一colors引用"
  "SharePosterScreen.tsx|refactor|2026设计系统、组件拆分、动画优化、统一colors引用"
  "TagManageScreen.tsx|refactor|2026设计系统、组件拆分、动画优化、统一colors引用"
  "ThemePreviewScreen.tsx|refactor|2026设计系统、组件拆分、动画优化、统一colors引用"
  "DownloadScreen.tsx|refactor|2026设计系统、组件拆分、动画优化、统一colors引用"
  "VIPEventsScreen.tsx|refactor|2026设计系统、组件拆分、动画优化、统一colors引用"
  "VIPHistoryScreen.tsx|refactor|2026设计系统、组件拆分、动画优化、统一colors引用"
  "VIPLevelsScreen.tsx|refactor|2026设计系统、组件拆分、动画优化、统一colors引用"
  "VIPPointsScreen.tsx|refactor|2026设计系统、组件拆分、动画优化、统一colors引用"
  "VIPPrivilegesScreen.tsx|refactor|2026设计系统、组件拆分、动画优化、统一colors引用"
  "VIPStatsScreen.tsx|refactor|2026设计系统、组件拆分、动画优化、统一colors引用"
)

TOTAL=${#PAGES[@]}
INDEX=0
COMPLETED=0
FAILED=0

# Load state if exists
if [ -f "$STATE_FILE" ]; then
  INDEX=$(cat "$STATE_FILE" | head -1)
  COMPLETED=$(cat "$STATE_FILE" | sed -n '2p')
  FAILED=$(cat "$STATE_FILE" | sed -n '3p')
  log "Resuming from index $INDEX (completed=$COMPLETED, failed=$FAILED)"
else
  log "=== JUJU Refactor Loop Started ==="
fi

save_state() {
  echo -e "$INDEX\n$COMPLETED\n$FAILED" > "$STATE_FILE"
}

kill_zombies() {
  ZOMBIES=$(pgrep -f "opencode run" | tr '\n' ' ')
  if [ -n "$ZOMBIES" ]; then
    log "Killing zombie opencode: $ZOMBIES"
    kill -9 $ZOMBIES 2>/dev/null || true
  fi
}

verify_ts() {
  cd "$PROJECT_DIR"
  if ./node_modules/.bin/tsc --noEmit 2>&1 | grep -q "error TS"; then
    ERROR_COUNT=$(./node_modules/.bin/tsc --noEmit 2>&1 | grep -c "error TS")
    log "TypeScript FAILED: $ERROR_COUNT errors"
    return 1
  fi
  log "TypeScript PASSED (0 errors)"
  return 0
}

while [ $INDEX -lt $TOTAL ]; do
  IFS='|' read -r PAGE ACTION DESC <<< "${PAGES[$INDEX]}"
  
  if [ "$ACTION" == "skip" ]; then
    log "SKIP [$((INDEX+1))/$TOTAL] $PAGE - $DESC"
    INDEX=$((INDEX+1))
    save_state
    continue
  fi

  log "START [$((INDEX+1))/$TOTAL] $PAGE - $DESC"
  
  kill_zombies
  
  # Run opencode
  cd "$PROJECT_DIR"
  TASK_LOG="$LOG_DIR/task-${PAGE%.tsx}.log"
  PROMPT="深度重构src/screens/$PAGE：$DESC。必须使用2026设计系统（colors/spacing/animation），统一所有颜色引用为colors.xxx，优化组件结构，提取可复用子组件到src/components/，添加适当的react-native-reanimated动画效果，保持TypeScript严格类型正确。"
  
  log "Running opencode for $PAGE..."
  if opencode run "$PROMPT" > "$TASK_LOG" 2>&1; then
    if verify_ts; then
      git add -A
      if git commit -m "refactor: 深度重构$PAGE - 2026设计系统、组件拆分、动画优化、统一colors引用"; then
        log "SUCCESS $PAGE"
        COMPLETED=$((COMPLETED+1))
      else
        log "COMMIT_SKIP $PAGE (nothing to commit)"
      fi
    else
      log "VERIFY_FAIL $PAGE"
      FAILED=$((FAILED+1))
    fi
  else
    log "FAIL $PAGE (opencode exit code non-zero)"
    FAILED=$((FAILED+1))
  fi
  
  INDEX=$((INDEX+1))
  save_state
  
  log "Sleeping 15s before next task..."
  sleep 15
done

log "=== ALL $TOTAL PAGES PROCESSED. Completed=$COMPLETED, Failed=$FAILED ==="
