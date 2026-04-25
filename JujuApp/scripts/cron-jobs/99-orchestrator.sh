#!/bin/bash
# JUJU APP - 协调器任务 (每30分钟)
# 监控所有定时任务，协调执行，处理问题

set -e

APP_DIR="/Users/mac/.openclaw.pre-migration/workspace/juju-platform-all/JujuApp"
LOG_DIR="$APP_DIR/logs/cron"
LOG_FILE="$LOG_DIR/orchestrator-$(date +%Y%m%d-%H%M%S).log"
STATE_FILE="$LOG_DIR/orchestrator-state.json"
ALERT_FILE="$LOG_DIR/alerts-$(date +%Y%m%d).log"

mkdir -p "$LOG_DIR"

echo "[{\"time\": \"$(date -Iseconds)\"}] 协调器运行中..." >> "$LOG_FILE"

# 定义任务列表
TASKS=("quick-check" "deep-check" "build-task" "ui-optimize")
TASK_SCHEDULES=("*/30 * * * *" "0 */4 * * *" "0 */6 * * *" "0 2 * * *")

# 检查每个任务的最后执行状态
check_task_health() {
    local task=$1
    local result_file="$LOG_DIR/${task}-latest.json"
    
    if [ -f "$result_file" ]; then
        local last_time=$(grep '"time"' "$result_file" | head -1 | sed 's/.*"time": "\([^"]*\)".*/\1/')
        local status=$(grep '"status"' "$result_file" | head -1 | sed 's/.*"status": "\([^"]*\)".*/\1/')
        
        # 计算时间差
        local last_epoch=$(date -j -f "%Y-%m-%dT%H:%M:%S" "${last_time%%.*}" +%s 2>/dev/null || date -d "$last_time" +%s 2>/dev/null || echo "0")
        local now_epoch=$(date +%s)
        local diff_minutes=$(( (now_epoch - last_epoch) / 60 ))
        
        echo "{\"task\": \"$task\", \"status\": \"$status\", \"last_run\": $diff_minutes}"
    else
        echo "{\"task\": \"$task\", \"status\": \"unknown\", \"last_run\": -1}"
    fi
}

# 收集所有任务状态
echo "[1/4] 收集任务状态..." >> "$LOG_FILE"
TASK_STATUSES="["
for i in "${!TASKS[@]}"; do
    [ $i -gt 0 ] && TASK_STATUSES+=","
    TASK_STATUSES+=$(check_task_health "${TASKS[$i]}")
done
TASK_STATUSES+="]"

# 检查APK构建状态
echo "[2/4] 检查构建状态..." >> "$LOG_FILE"
LATEST_APK=""
APK_SIZE="N/A"
if [ -f "$APP_DIR/builds/juju-latest.apk" ]; then
    LATEST_APK=$(readlink "$APP_DIR/builds/juju-latest.apk" 2>/dev/null || echo "unknown")
    APK_SIZE=$(du -h "$APP_DIR/builds/juju-latest.apk" 2>/dev/null | cut -f1)
    
    # 检查APK是否太小（可能构建失败）
    APK_SIZE_MB=$(du -m "$APP_DIR/builds/juju-latest.apk" 2>/dev/null | cut -f1)
    if [ "$APK_SIZE_MB" -lt 30 ]; then
        echo "⚠️ ALERT: APK大小异常 (${APK_SIZE})" >> "$ALERT_FILE"
        echo "  时间: $(date -Iseconds)" >> "$ALERT_FILE"
        echo "  可能原因: 单架构APK或构建失败" >> "$ALERT_FILE"
        echo "" >> "$ALERT_FILE"
    fi
fi

# 检查是否有任务长期失败
echo "[3/4] 检查失败任务..." >> "$LOG_FILE"
FAILED_TASKS="[]"
for task in "${TASKS[@]}"; do
    result_file="$LOG_DIR/${task}-latest.json"
    if [ -f "$result_file" ]; then
        status=$(grep '"status"' "$result_file" | head -1 | sed 's/.*"status": "\([^"]*\)".*/\1/')
        if [ "$status" = "failed" ] || [ "$status" = "error" ]; then
            echo "⚠️ 任务失败: $task" >> "$ALERT_FILE"
            FAILED_TASKS=$(echo "$FAILED_TASKS" | sed 's/\[\$/["'$task'",/; s/\[\("[^"]*"\)\$/["'$task'",\1/')
        fi
    fi
done

# 协调：如果构建失败，触发自动修复
echo "[4/4] 执行协调动作..." >> "$LOG_FILE"
ACTIONS="[]"

# 检查是否需要触发修复
BUILD_RESULT="$LOG_DIR/build-task-latest.json"
if [ -f "$BUILD_RESULT" ]; then
    BUILD_STATUS=$(grep '"status"' "$BUILD_RESULT" | head -1 | sed 's/.*"status": "\([^"]*\)".*/\1/')
    if [ "$BUILD_STATUS" = "failed" ]; then
        # 检查是否是.bak文件问题
        if [ -f "/tmp/juju-build-*.log" ]; then
            if grep -q "\.bak.*Error" /tmp/juju-build-*.log 2>/dev/null; then
                echo "🛠️ 自动修复: 删除.bak文件..." >> "$LOG_FILE"
                find "$APP_DIR/android" -name "*.bak" -delete 2>/dev/null || true
                ACTIONS='["自动删除.bak文件"]'
            fi
        fi
    fi
fi

# 保存状态
cat > "$STATE_FILE" << EOF
{
  "orchestrator_time": "$(date -Iseconds)",
  "tasks": $TASK_STATUSES,
  "build": {
    "latest_apk": "$LATEST_APK",
    "size": "$APK_SIZE"
  },
  "failed_tasks": $FAILED_TASKS,
  "actions_taken": $ACTIONS
}
EOF

# 生成简洁报告
echo "" >> "$LOG_FILE"
echo "=== 协调器报告 ===" >> "$LOG_FILE"
echo "时间: $(date '+%Y-%m-%d %H:%M:%S')" >> "$LOG_FILE"
echo "任务状态:" >> "$LOG_FILE"
echo "$TASK_STATUSES" | python3 -m json.tool 2>/dev/null >> "$LOG_FILE" || echo "$TASK_STATUSES" >> "$LOG_FILE"
echo "最新APK: $LATEST_APK ($APK_SIZE)" >> "$LOG_FILE"
echo "==================" >> "$LOG_FILE"

echo "✅ 协调器完成" >> "$LOG_FILE"

# 如果发现问题，返回非零状态码触发通知
if [ "$FAILED_TASKS" != "[]" ]; then
    exit 1
fi
