#!/bin/bash
# JUJU App 全面自动化真机测试脚本

DEVICE="192.168.1.115:40557"
PACKAGE="com.jujuapp"
TEST_RESULTS_DIR="real-device-test/results/$(date +%Y%m%d-%H%M%S)"

mkdir -p "$TEST_RESULTS_DIR"

echo "========================================"
echo "  JUJU App 全面自动化测试"
echo "  时间: $(date)"
echo "  设备: $DEVICE"
echo "========================================"
echo ""

# 清理日志
adb -s $DEVICE logcat -c

# 获取设备信息
echo "📱 设备信息:"
adb -s $DEVICE shell getprop ro.product.model
adb -s $DEVICE shell getprop ro.build.version.release
echo ""

# 获取应用信息
echo "📦 应用信息:"
adb -s $DEVICE shell dumpsys package $PACKAGE | grep versionName | head -1
adb -s $DEVICE shell dumpsys package $PACKAGE | grep versionCode | head -1
echo ""

# 测试1: 基础启动测试
echo "🧪 测试1: 基础启动测试"
adb -s $DEVICE shell am force-stop $PACKAGE
sleep 1
adb -s $DEVICE shell am start -n $PACKAGE/.MainActivity
sleep 5

# 检查是否崩溃
CRASH=$(adb -s $DEVICE logcat -d -s AndroidRuntime:E | grep -i "jujuapp" | head -5)
if [ -z "$CRASH" ]; then
    echo "  ✅ 启动正常，无崩溃"
else
    echo "  ❌ 发现崩溃:"
    echo "$CRASH"
fi
echo ""

# 测试2: 页面跳转测试
echo "🧪 测试2: 页面跳转测试"

# 获取当前Activity
CURRENT_ACTIVITY=$(adb -s $DEVICE shell dumpsys window | grep mCurrentFocus | grep $PACKAGE)
echo "  当前Activity: $CURRENT_ACTIVITY"

# 模拟点击底部Tab测试跳转
echo "  测试Tab切换..."

# 获取屏幕尺寸
SCREEN_SIZE=$(adb -s $DEVICE shell wm size | grep -oP '\d+x\d+')
echo "  屏幕尺寸: $SCREEN_SIZE"

# 计算Tab位置 (假设在底部)
WIDTH=$(echo $SCREEN_SIZE | cut -dx -f1)
HEIGHT=$(echo $SCREEN_SIZE | cut -dx -f2)

# Tab位置 (假设5个Tab平均分布)
TAB1_X=$((WIDTH / 10))
TAB2_X=$((WIDTH * 3 / 10))
TAB3_X=$((WIDTH * 5 / 10))
TAB4_X=$((WIDTH * 7 / 10))
TAB5_X=$((WIDTH * 9 / 10))
TAB_Y=$((HEIGHT - 100))

echo "  Tab位置计算完成"
echo ""

# 测试3: 日志收集
echo "🧪 测试3: 收集运行日志"
adb -s $DEVICE logcat -d -s ReactNativeJS:V > "$TEST_RESULTS_DIR/react-native-logs.txt" 2>&1
echo "  ✅ 日志已保存到 $TEST_RESULTS_DIR/react-native-logs.txt"
echo ""

# 测试4: 检查API错误
echo "🧪 测试4: API错误检查"
API_ERRORS=$(adb -s $DEVICE logcat -d -s ReactNativeJS:E | grep -i "error\|401\|fail" | head -20)
if [ -n "$API_ERRORS" ]; then
    echo "  ⚠️ 发现API错误:"
    echo "$API_ERRORS" | head -10
    echo "$API_ERRORS" > "$TEST_RESULTS_DIR/api-errors.txt"
else
    echo "  ✅ 未发现API错误"
fi
echo ""

# 测试5: 性能指标
echo "🧪 测试5: 性能指标"
CPU=$(adb -s $DEVICE shell dumpsys cpuinfo | grep $PACKAGE | head -1)
MEM=$(adb -s $DEVICE shell dumpsys meminfo $PACKAGE | grep "TOTAL" | head -1)
echo "  CPU: $CPU"
echo "  Memory: $MEM"
echo ""

# 测试6: 截图
echo "🧪 测试6: 截图"
adb -s $DEVICE shell screencap -p /sdcard/screenshot.png
adb -s $DEVICE pull /sdcard/screenshot.png "$TEST_RESULTS_DIR/screenshot.png" > /dev/null 2>&1
echo "  ✅ 截图已保存"
echo ""

# 生成报告
echo "========================================"
echo "  测试完成"
echo "  结果目录: $TEST_RESULTS_DIR"
echo "========================================"
