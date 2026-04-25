#!/bin/bash
# Android 离线打包脚本
# 使用已有的 Android 项目模板

set -e

HBX_SDK="/mnt/d/workspace/uni-app-mobile/offline-sdk"
PROJECT_DIR="/mnt/d/workspace/uni-app-mobile"
BUILD_DIR="$PROJECT_DIR/dist/build/app-plus"
APP_ID="__UNI__F311F19"

echo "=========================================="
echo "Android 离线打包脚本"
echo "=========================================="
echo ""

# 检查是否已有离线 SDK
if [ ! -d "$HBX_SDK" ]; then
    echo "[1/4] 下载离线打包 SDK..."
    mkdir -p "$HBX_SDK"
    cd "$HBX_SDK"
    
    # 下载 Android 离线打包 SDK
    SDK_URL="https://native-res.dcloud.net.cn/Android-SDK@4.36.1.zip"
    echo "正在下载 SDK..."
    wget -q --show-progress "$SDK_URL" -O android-sdk.zip || {
        echo "❌ SDK 下载失败，请手动下载:"
        echo "   https://nativesupport.dcloud.net.cn/AppDocs/download/android.html"
        exit 1
    }
    
    echo "解压 SDK..."
    unzip -q android-sdk.zip
    echo "✅ SDK 准备完成"
else
    echo "[1/4] 离线 SDK 已存在"
fi

echo ""
echo "[2/4] 复制构建资源..."

# 找到 SDK 中的模板项目
TEMPLATE_DIR=$(find "$HBX_SDK" -name "UniPlugin-Hello-AS" -type d | head -1)

if [ -z "$TEMPLATE_DIR" ]; then
    echo "❌ 未找到模板项目"
    exit 1
fi

echo "模板项目: $TEMPLATE_DIR"

# 复制资源到 Android 项目
ASSETS_DIR="$TEMPLATE_DIR/app/src/main/assets/apps/$APP_ID/www"
mkdir -p "$ASSETS_DIR"

echo "复制资源到: $ASSETS_DIR"
cp -r "$BUILD_DIR/"* "$ASSETS_DIR/"

echo "✅ 资源复制完成"

echo ""
echo "[3/4] 修改 Android 配置..."

# 修改 AndroidManifest.xml
MANIFEST="$TEMPLATE_DIR/app/src/main/AndroidManifest.xml"
if [ -f "$MANIFEST" ]; then
    # 替换 appid
    sed -i "s/__UNI__[A-Z0-9]*/$APP_ID/g" "$MANIFEST" 2>/dev/null || true
    echo "✅ AndroidManifest.xml 已更新"
fi

echo ""
echo "[4/4] 构建 APK..."
echo ""
echo "请在 Android Studio 中打开项目并构建:"
echo "  $TEMPLATE_DIR"
echo ""
echo "或者使用 Gradle 命令:"
echo "  cd $TEMPLATE_DIR"
echo "  ./gradlew assembleRelease"
echo ""
echo "=========================================="
