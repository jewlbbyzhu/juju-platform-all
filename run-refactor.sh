#!/bin/bash
set -e

PROJECT="$HOME/.openclaw.pre-migration/workspace/juju-platform-all/JujuApp"
LOG="$HOME/.openclaw.pre-migration/workspace/juju-platform-all/logs/daemon/refactor-run.log"
STATE="$HOME/.openclaw.pre-migration/workspace/juju-platform-all/logs/daemon/refactor-progress.txt"
mkdir -p "$(dirname "$LOG")"

log() {
  echo "[$(date '+%H:%M:%S')] $1" | tee -a "$LOG"
}

PAGES=(
  "PaymentScreen.tsx"
  "OrderSuccessScreen.tsx"
  "ScanHistoryScreen.tsx"
  "TicketSelectionScreen.tsx"
  "TicketStatsScreen.tsx"
  "TicketStatsDetailScreen.tsx"
  "TicketInventoryScreen.tsx"
  "ReviewScreen.tsx"
  "SharePosterScreen.tsx"
  "TagManageScreen.tsx"
  "ThemePreviewScreen.tsx"
  "DownloadScreen.tsx"
  "PushMessagesScreen.tsx"
  "PushSettingsScreen.tsx"
  "CreatePostScreen.tsx"
  "CreateGroupScreen.tsx"
  "FansScreen.tsx"
  "FollowingScreen.tsx"
  "UserProfileScreen.tsx"
  "InviteCodeScreen.tsx"
  "LocationPickerScreen.tsx"
  "VIPEventsScreen.tsx"
  "VIPHistoryScreen.tsx"
  "VIPLevelsScreen.tsx"
  "VIPPrivilegesScreen.tsx"
  "VIPStatsScreen.tsx"
)

IDX=0
if [ -f "$STATE" ]; then
  IDX=$(cat "$STATE")
fi

log "=== START idx=$IDX / ${#PAGES[@]} ==="

while [ $IDX -lt ${#PAGES[@]} ]; do
  PAGE="${PAGES[$IDX]}"
  NAME="${PAGE%.tsx}"
  log "[$((IDX+1))/${#PAGES[@]}] $PAGE"

  # kill zombies
  Z=$(pgrep -f "opencode run" | tr '\n' ' ')
  [ -n "$Z" ] && kill -9 $Z 2>/dev/null && log "killed zombies: $Z"

  cd "$PROJECT"
  TASK_LOG="$HOME/.openclaw.pre-migration/workspace/juju-platform-all/logs/daemon/task-$NAME.log"

  PROMPT="深度重构src/screens/$PAGE：2026设计系统、组件拆分、动画优化、统一colors引用。必须使用react-native-reanimated动画效果，保持TypeScript严格类型正确。"

  if opencode run "$PROMPT" > "$TASK_LOG" 2>&1; then
    ERRS=$(./node_modules/.bin/tsc --noEmit 2>&1 | grep -c "error TS" || echo "0")
    if [ "$ERRS" = "0" ]; then
      git add -A
      git commit -m "refactor: 深度重构$NAME - 2026设计系统、组件拆分、动画优化、统一colors引用" || true
      log "SUCCESS $PAGE"
    else
      log "VERIFY_FAIL $PAGE ($ERRS TS errors)"
    fi
  else
    log "FAIL $PAGE (see $TASK_LOG)"
  fi

  IDX=$((IDX+1))
  echo "$IDX" > "$STATE"
  sleep 10
done

log "=== ALL DONE ==="
