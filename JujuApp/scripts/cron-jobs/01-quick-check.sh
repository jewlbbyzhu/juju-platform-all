#!/bin/bash
# JUJU APP - 快速检查任务 (每30分钟)
# 整合: code-quality + pipeline-health + auto-fix

set -e

APP_DIR="/Users/mac/.openclaw.pre-migration/workspace/juju-platform-all/JujuApp"
LOG_DIR="$APP_DIR/logs/cron"
LOG_FILE="$LOG_DIR/quick-check-$(date +%Y%m%d-%H%M%S).log"
RESULT_FILE="$LOG_DIR/quick-check-latest.json"

mkdir -p "$LOG_DIR"

echo "[{\"time\": \"$(date -Iseconds)\"}] 开始快速检查..." >> "$LOG_FILE"

cd "$APP_DIR"

# 1. TypeScript编译检查
echo "[1/5] TypeScript检查..." >> "$LOG_FILE"
if npx tsc --noEmit 2>&1 | tee -a "$LOG_FILE"; then
    TS_STATUS="✅ 通过"
    TS_ERRORS=0
else
    TS_STATUS="❌ 失败"
    TS_ERRORS=$(npx tsc --noEmit 2>&1 | grep -c "error TS" || echo "1")
fi

# 2. API连通性检查
echo "[2/5] API连通性检查..." >> "$LOG_FILE"
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://api.hfparty.asia/api/v1/parties?page=1&pageSize=1" 2>/dev/null || echo "000")
if [ "$API_STATUS" = "200" ]; then
    API_HEALTH="✅ 正常 (${API_STATUS})"
else
    API_HEALTH="❌ 异常 (${API_STATUS})"
fi

# 3. 关键文件检查
echo "[3/5] 关键文件检查..." >> "$LOG_FILE"
OFFLINE_MODE=$(grep -o "OFFLINE_MODE.*=.*true" src/config/index.ts 2>/dev/null | wc -l)
if [ "$OFFLINE_MODE" -eq 0 ]; then
    OFFLINE_STATUS="✅ 生产模式"
else
    OFFLINE_STATUS="⚠️ 离线模式"
fi

# 4. 自动修复简单问题
echo "[4/5] 自动修复..." >> "$LOG_FILE"
FIX_COUNT=0

# 修复未使用的导入（简单的）
if command -v eslint &> /dev/null; then
    npx eslint --fix src/api/*.ts 2>/dev/null | tee -a "$LOG_FILE" || true
fi

# 5. 生成报告
echo "[5/5] 生成报告..." >> "$LOG_FILE"

# 检查是否有进行中的构建
BUILD_PID=""
if [ -f /tmp/juju-build.pid ]; then
    BUILD_PID=$(cat /tmp/juju-build.pid)
    if ! ps -p "$BUILD_PID" > /dev/null 2>&1; then
        BUILD_PID=""
    fi
fi

cat > "$RESULT_FILE" << EOF
{
  "task": "quick-check",
  "time": "$(date -Iseconds)",
  "status": "ok",
  "results": {
    "typescript": {
      "status": "$TS_STATUS",
      "errors": $TS_ERRORS
    },
    "api_health": {
      "status": "$API_HEALTH",
      "endpoint": "api.hfparty.asia"
    },
    "offline_mode": {
      "status": "$OFFLINE_STATUS"
    },
    "build": {
      "in_progress": $([ -n "$BUILD_PID" ] && echo "true" || echo "false"),
      "pid": "$BUILD_PID"
    }
  },
  "next_steps": []
}
EOF

echo "✅ 快速检查完成" >> "$LOG_FILE"
