#!/bin/bash
# JuJu 平台全自动构建脚本
# 使用 CLI 方式构建，无需 HBuilderX GUI

set -e

echo "=========================================="
echo "JuJu 平台全自动构建脚本"
echo "=========================================="
echo ""

PROJECT_DIR="/mnt/d/workspace/uni-app-mobile"
BUILD_DIR="$PROJECT_DIR/dist/build/app-plus"
APK_OUTPUT="$PROJECT_DIR/dist/release/apk"

echo "[1/6] 清理旧构建..."
cd "$PROJECT_DIR"
rm -rf dist/build
rm -rf dist/release
mkdir -p "$APK_OUTPUT"

echo "[2/6] 安装依赖..."
npm install 2>/dev/null || echo "依赖已安装"

echo "[3/6] 构建 App 资源..."
npm run build:app

echo "[4/6] 检查构建结果..."
if [ -f "$BUILD_DIR/app-service.js" ]; then
    echo "✅ 构建成功"
    ls -lh "$BUILD_DIR/"
else
    echo "❌ 构建失败"
    exit 1
fi

echo ""
echo "[5/6] 准备 APK 打包..."
echo "构建的资源位于: $BUILD_DIR"
echo ""

echo "[6/6] 下一步操作指南:"
echo ""
echo "由于需要 Android 签名和打包，请使用以下方式之一:"
echo ""
echo "方式 A - HBuilderX 云打包:"
echo "  1. 打开 HBuilderX"
echo "  2. 导入项目: D:\\workspace\\uni-app-mobile"
echo "  3. 点击 [发行] → [原生App-云打包]"
echo "  4. 选择 Android，使用证书 juju/android.keystore"
echo ""
echo "方式 B - Android Studio 离线打包:"
echo "  1. 下载 uni-app 离线打包 SDK"
echo "  2. 将 $BUILD_DIR 复制到 Android 项目的 assets/apps/__UNI__F311F19/www/"
echo "  3. 使用 Android Studio 构建 APK"
echo ""
echo "=========================================="
echo "构建完成！"
echo "=========================================="
