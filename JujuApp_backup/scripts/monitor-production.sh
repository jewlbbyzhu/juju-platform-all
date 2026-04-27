#!/bin/bash
# JUJU App 生产环境监控脚本

PACKAGE_NAME="com.jujuapp"
DEVICE=""
LOG_FILE="/tmp/juju-production-monitor.log"

echo "📊 JUJU App 生产监控" | tee -a "$LOG_FILE"
echo "=====================" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# 检查设备
if [ -z "$DEVICE" ]; then
    # 自动获取第一个设备
    DEVICE=$(adb devices | grep -v "List" | grep "device" | head -1 | awk '{print $1}')
    if [ -z "$DEVICE" ]; then
        echo "❌ 未找到连接的设备" | tee -a "$LOG_FILE"
        exit 1
    fi
fi

echo "📱 监控设备: $DEVICE" | tee -a "$LOG_FILE"
echo "📦 应用包名: $PACKAGE_NAME" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# 清理日志缓冲区
adb -s "$DEVICE" logcat -c 2>/dev/null

# 监控循环
echo "🔍 开始监控 (按 Ctrl+C 停止)..." | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# 统计
CRASH_COUNT=0
ERROR_COUNT=0
API_ERROR_COUNT=0

while true; do
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    
    # 检查应用是否在运行
    IS_RUNNING=$(adb -s "$DEVICE" shell pidof "$PACKAGE_NAME" 2>/dev/null)
    if [ -z "$IS_RUNNING" ]; then
        echo "[$TIMESTAMP] ⚠️ 应用未运行" | tee -a "$LOG_FILE"
        continue
    fi
    
    # 获取内存使用
    MEM_INFO=$(adb -s "$DEVICE" shell dumpsys meminfo "$PACKAGE_NAME" 2>/dev/null | grep "TOTAL" | head -1)
    if [ -n "$MEM_INFO" ]; then
        MEM_MB=$(echo "$MEM_INFO" | awk '{print int($2/1024)}')
        echo "[$TIMESTAMP] 💾 内存: ${MEM_MB}MB" | tee -a "$LOG_FILE"
    fi
    
    # 检查崩溃
    CRASH_LOG=$(adb -s "$DEVICE" logcat -d -s AndroidRuntime:E 2>/dev/null | grep "$PACKAGE_NAME")
    if [ -n "$CRASH_LOG" ]; then
        CRASH_COUNT=$((CRASH_COUNT + 1))
        echo "[$TIMESTAMP] 💥 发现崩溃 #$CRASH_COUNT" | tee -a "$LOG_FILE"
        echo "$CRASH_LOG" | head -5 | tee -a "$LOG_FILE"
    fi
    
    # 检查API错误
    API_ERRORS=$(adb -s "$DEVICE" logcat -d -s ReactNativeJS:E 2>/dev/null | grep -c "API Error")
    if [ "$API_ERRORS" -gt 0 ]; then
        NEW_ERRORS=$((API_ERRORS - API_ERROR_COUNT))
        if [ "$NEW_ERRORS" -gt 0 ]; then
            API_ERROR_COUNT=$API_ERRORS
            echo "[$TIMESTAMP] ⚠️ API错误: $API_ERRORS 个" | tee -a "$LOG_FILE"
        fi
    fi
    
    # 每秒检查一次
    sleep 5
done
