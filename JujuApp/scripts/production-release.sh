#!/bin/bash
# JUJU App 生产发布脚本 v1.0.5

set -e  # 遇到错误立即退出

echo "🚀 JUJU App 生产发布脚本"
echo "========================="
echo ""

# 配置
PACKAGE_NAME="com.jujuapp"
APK_NAME="JujuApp-v1.0.5-release.apk"
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "📁 项目目录: $PROJECT_DIR"
echo "📦 包名: $PACKAGE_NAME"
echo "📱 APK名称: $APK_NAME"
echo ""

# 步骤1: 检查环境
echo "🔍 步骤1: 检查环境..."
if ! command -v adb &> /dev/null; then
    echo "❌ 未找到adb命令"
    echo "   请安装Android SDK并添加到PATH"
    exit 1
fi
echo "   ✅ adb可用"

# 步骤2: 版本确认
echo ""
echo "🔍 步骤2: 版本确认..."
cd "$PROJECT_DIR/android/app"
VERSION_CODE=$(grep "versionCode" build.gradle | head -1 | grep -o '[0-9]\+')
VERSION_NAME=$(grep "versionName" build.gradle | head -1 | grep -o '"[^"]*"' | tr -d '"')
echo "   版本号: $VERSION_CODE"
echo "   版本名: $VERSION_NAME"

if [ "$VERSION_CODE" != "5" ]; then
    echo "❌ 版本号不正确，期望是5"
    exit 1
fi
echo "   ✅ 版本号正确"

# 步骤3: 检查代码修改
echo ""
echo "🔍 步骤3: 检查关键配置..."

# 检查TEST_MODE
cd "$PROJECT_DIR"
if grep -q "TEST_MODE = false" App.tsx; then
    echo "   ✅ TEST_MODE已关闭"
else
    echo "❌ TEST_MODE未关闭，请检查App.tsx"
    exit 1
fi

# 检查OFFLINE_MODE
if grep -q "OFFLINE_MODE = true" src/api/index.ts; then
    echo "   ✅ OFFLINE_MODE已启用"
else
    echo "⚠️  OFFLINE_MODE未启用，应用可能无法正常工作"
fi

echo ""
echo "✅ 所有检查通过！"
echo ""

# 步骤4: 构建APK
echo "🔨 步骤4: 构建Release APK..."
echo "   请手动执行以下命令构建:"
echo ""
echo "   cd $PROJECT_DIR/android"
echo "   ./gradlew assembleRelease"
echo ""
echo "   或者使用Android Studio:"
echo "   Build → Generate Signed Bundle/APK → APK"
echo ""

# 步骤5: 验证APK
echo "🔍 步骤5: APK验证..."
APK_PATH="$PROJECT_DIR/android/app/build/outputs/apk/release/app-release.apk"

if [ ! -f "$APK_PATH" ]; then
    echo "⚠️  APK不存在: $APK_PATH"
    echo "   请先构建APK"
    exit 1
fi

echo "   ✅ APK存在"
echo "   大小: $(du -h "$APK_PATH" | cut -f1)"

# 复制并重命名
cp "$APK_PATH" "$PROJECT_DIR/$APK_NAME"
echo "   ✅ 已复制到: $PROJECT_DIR/$APK_NAME"

# 步骤6: 安装测试
echo ""
echo "🔧 步骤6: 安装测试..."
echo "   请连接测试设备，然后执行:"
echo ""
echo "   adb install -r $PROJECT_DIR/$APK_NAME"
echo ""

# 步骤7: 生成发布说明
echo ""
echo "📝 步骤7: 生成发布说明..."
cat > "$PROJECT_DIR/RELEASE_NOTES_v1.0.5.txt" << 'EOF'
JUJU App v1.0.5 发布说明
=========================

【版本信息】
- 版本号: 1.0.5
- 版本代码: 5
- 发布时间: 2026-04-07

【更新内容】
✨ 新增功能:
- 社区Tab正式上线，支持查看和互动

🔧 问题修复:
- 修复网络错误导致的数据加载失败
- 修复个人中心信息无法加载问题
- 优化应用稳定性

【系统要求】
- Android 7.0 或更高版本
- 网络连接 (WiFi/4G/5G)

【反馈渠道】
- 应用内: 设置 → 意见反馈
- 邮箱: support@jujuapp.com

感谢使用JUJU App！
EOF

echo "   ✅ 发布说明已生成: RELEASE_NOTES_v1.0.5.txt"

# 步骤8: 发布检查清单
echo ""
echo "📋 步骤8: 发布检查清单"
echo "   发布前请确认以下事项:"
echo ""
echo "   [ ] APK已签名"
echo "   [ ] 应用商店截图已准备"
echo "   [ ] 应用描述已更新"
echo "   [ ] 客服团队已通知"
echo "   [ ] 监控已配置"
echo "   [ ] 回滚方案已准备"
echo ""

# 完成
echo "🎉 发布准备完成！"
echo ""
echo "下一步操作:"
echo "   1. 上传到应用商店"
echo "   2. 或分发给用户"
echo "   3. 监控运行情况"
echo ""
echo "祝发布顺利！🚀"
