#!/bin/bash
# 后台构建脚本 - 避免cron超时

set -e

APP_DIR="/Users/mac/.openclaw.pre-migration/workspace/juju-platform-all/JujuApp"
LOG_FILE="/tmp/juju-build-$(date +%Y%m%d-%H%M%S).log"
PID_FILE="/tmp/juju-build.pid"

echo "[$(date)] 开始后台构建..." >> "$LOG_FILE"

# 检查是否有正在进行的构建
if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat "$PID_FILE")
    if ps -p "$OLD_PID" > /dev/null 2>&1; then
        echo "[$(date)] 已有构建在进行中 (PID: $OLD_PID)" >> "$LOG_FILE"
        exit 0
    fi
fi

# 记录PID
echo $$ > "$PID_FILE"

# 设置环境
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export ANDROID_HOME=/Users/mac/Library/Android/sdk
export PATH=$JAVA_HOME/bin:$PATH

cd "$APP_DIR"

# 检查签名配置
if ! grep -q "signingConfigs.release" android/app/build.gradle; then
    echo "[$(date)] 配置Debug签名..." >> "$LOG_FILE"
    # 创建签名配置
    mkdir -p ~/.android
    if [ ! -f ~/.android/debug.keystore ]; then
        keytool -genkey -v -keystore ~/.android/debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US" 2>/dev/null || true
    fi
fi

# 执行构建
echo "[$(date)] 开始Gradle构建..." >> "$LOG_FILE"
cd android

# Clean
./gradlew clean >> "$LOG_FILE" 2>&1 || true

# Build Release
if ./gradlew assembleRelease >> "$LOG_FILE" 2>&1; then
    echo "[$(date)] ✅ Release构建成功!" >> "$LOG_FILE"
    
    # 获取APK信息 (支持通用APK和分离APK)
    APK_PATH="app/build/outputs/apk/release/app-release.apk"
    UNIVERSAL_APK=$(find app/build/outputs/apk/release -name "*-release.apk" -type f | head -1)
    
    if [ -f "$APK_PATH" ]; then
        FINAL_APK="$APK_PATH"
    elif [ -n "$UNIVERSAL_APK" ]; then
        FINAL_APK="$UNIVERSAL_APK"
    else
        echo "[$(date)] ⚠️ 未找到APK文件" >> "$LOG_FILE"
        FINAL_APK=""
    fi
    
    if [ -n "$FINAL_APK" ] && [ -f "$FINAL_APK" ]; then
        APK_SIZE=$(du -h "$FINAL_APK" | cut -f1)
        echo "[$(date)] APK路径: $FINAL_APK" >> "$LOG_FILE"
        echo "[$(date)] APK大小: $APK_SIZE" >> "$LOG_FILE"
        
        # 复制到可访问位置，使用统一命名
        OUTPUT_NAME="juju-universal-release.apk"
        cp "$FINAL_APK" "$APP_DIR/builds/$OUTPUT_NAME"
        echo "[$(date)] ✅ APK已复制到: $APP_DIR/builds/$OUTPUT_NAME ($APK_SIZE)" >> "$LOG_FILE"
        
        # 同时列出所有生成的APK
        echo "[$(date)] 📦 所有生成文件:" >> "$LOG_FILE"
        ls -lh app/build/outputs/apk/release/ >> "$LOG_FILE"
    fi
else
    echo "[$(date)] ❌ Release构建失败" >> "$LOG_FILE"
    tail -50 "$LOG_FILE" | grep -i "error\|fail\|exception" >> "$LOG_FILE" || true
fi

# 清理PID文件
rm -f "$PID_FILE"
echo "[$(date)] 构建完成" >> "$LOG_FILE"
