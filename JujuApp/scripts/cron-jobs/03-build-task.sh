#!/bin/bash
# JUJU APP - 构建任务 (每6小时)
# 整合: auto-build + build-android

set -e

APP_DIR="/Users/mac/.openclaw.pre-migration/workspace/juju-platform-all/JujuApp"
LOG_DIR="$APP_DIR/logs/cron"
LOG_FILE="$LOG_DIR/build-task-$(date +%Y%m%d-%H%M%S).log"
RESULT_FILE="$LOG_DIR/build-task-latest.json"
BUILD_LOG="/tmp/juju-build-$(date +%Y%m%d-%H%M%S).log"
PID_FILE="/tmp/juju-build.pid"

mkdir -p "$LOG_DIR"

echo "[{\"time\": \"$(date -Iseconds)\"}] 开始构建任务..." >> "$LOG_FILE"

# 检查是否已有进行中的构建
if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat "$PID_FILE")
    if ps -p "$OLD_PID" > /dev/null 2>&1; then
        echo "已有构建在进行中 (PID: $OLD_PID)，跳过本次" >> "$LOG_FILE"
        cat > "$RESULT_FILE" << EOF
{
  "task": "build",
  "time": "$(date -Iseconds)",
  "status": "skipped",
  "reason": "已有构建在进行中",
  "pid": "$OLD_PID"
}
EOF
        exit 0
    fi
fi

# 记录PID
echo $$ > "$PID_FILE"

# 设置环境
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export ANDROID_HOME=/Users/mac/Library/Android/sdk
export PATH=$JAVA_HOME/bin:$PATH

cd "$APP_DIR/android"

# 清理
echo "[1/3] 清理..." >> "$LOG_FILE"
./gradlew clean >> "$BUILD_LOG" 2>&1 || true

# 构建Release
echo "[2/3] 构建Release APK..." >> "$LOG_FILE"
START_TIME=$(date +%s)

if ./gradlew assembleRelease >> "$BUILD_LOG" 2>&1; then
    BUILD_STATUS="success"
    echo "✅ 构建成功" >> "$LOG_FILE"
    
    # 查找并复制APK
    UNIVERSAL_APK=$(find app/build/outputs/apk/release -name "*release*.apk" -type f | head -1)
    if [ -n "$UNIVERSAL_APK" ] && [ -f "$UNIVERSAL_APK" ]; then
        APK_SIZE=$(du -h "$UNIVERSAL_APK" | cut -f1)
        APK_SIZE_BYTES=$(stat -f%z "$UNIVERSAL_APK" 2>/dev/null || stat -c%s "$UNIVERSAL_APK" 2>/dev/null || echo "0")
        
        # 复制到builds目录
        mkdir -p "$APP_DIR/builds"
        OUTPUT_NAME="juju-v$(date +%Y%m%d-%H%M)-release.apk"
        cp "$UNIVERSAL_APK" "$APP_DIR/builds/$OUTPUT_NAME"
        
        # 创建latest链接
        ln -sf "$OUTPUT_NAME" "$APP_DIR/builds/juju-latest.apk"
        
        echo "APK已保存: builds/$OUTPUT_NAME ($APK_SIZE)" >> "$LOG_FILE"
    else
        APK_SIZE="N/A"
        APK_SIZE_BYTES=0
    fi
else
    BUILD_STATUS="failed"
    echo "❌ 构建失败" >> "$LOG_FILE"
    tail -30 "$BUILD_LOG" | grep -i "error\|fail\|exception" >> "$LOG_FILE" || true
    APK_SIZE="N/A"
    APK_SIZE_BYTES=0
fi

END_TIME=$(date +%s)
BUILD_DURATION=$((END_TIME - START_TIME))

# 清理旧APK（保留最近5个）
echo "[3/3] 清理旧构建..." >> "$LOG_FILE"
ls -t "$APP_DIR/builds"/juju-v*-release.apk 2>/dev/null | tail -n +6 | xargs -r rm -f

# 生成报告
cat > "$RESULT_FILE" << EOF
{
  "task": "build",
  "time": "$(date -Iseconds)",
  "status": "$BUILD_STATUS",
  "duration_seconds": $BUILD_DURATION,
  "apk": {
    "size_human": "$APK_SIZE",
    "size_bytes": $APK_SIZE_BYTES,
    "path": "$([ "$BUILD_STATUS" = "success" ] && echo "builds/$OUTPUT_NAME" || echo "null")"
  },
  "build_log": "$BUILD_LOG"
}
EOF

rm -f "$PID_FILE"
echo "✅ 构建任务完成" >> "$LOG_FILE"
