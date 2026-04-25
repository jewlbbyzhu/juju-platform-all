#!/bin/bash
# JUJU Platform 安卓云打包脚本
# DCloud账号: 17261036274

echo "=== JUJU Platform 安卓云打包 ==="
echo "时间: $(date)"
echo ""

PROJECT_PATH="/Users/mac/.openclaw/workspace/juju-platform-all/uni-app-mobile"
DCLOUD_USER="17261036274"
DCLOUD_PASS="zaqzzh.521"

echo "项目路径: $PROJECT_PATH"
echo "DCloud账号: $DCLOUD_USER"
echo ""

# 检查项目
echo "1. 检查项目配置..."
cd $PROJECT_PATH

if [ ! -f "src/manifest.json" ]; then
    echo "❌ 错误: manifest.json不存在"
    exit 1
fi

echo "✅ 项目配置正常"
echo ""

# 显示打包信息
echo "2. 打包信息:"
echo "   应用名称: 聚聚"
echo "   AppID: __UNI__F311F19"
echo "   版本: 1.0.0"
echo "   包名: uni.app.UNIJujuParty"
echo "   证书: juju-release-key.jks"
echo ""

# 由于DCloud CLI限制，提供手动打包步骤
echo "=== 手动云打包步骤 ==="
echo ""
echo "请按以下步骤操作:"
echo ""
echo "1. 下载并打开HBuilderX"
echo "   https://www.dcloud.io/hbuilderx.html"
echo ""
echo "2. 导入项目"
echo "   文件 → 导入 → 从本地目录导入"
echo "   选择: $PROJECT_PATH"
echo ""
echo "3. 登录DCloud账号"
echo "   账号: $DCLOUD_USER"
echo "   密码: $DCLOUD_PASS"
echo ""
echo "4. 执行云打包"
echo "   点击: 发行 → 原生App-云打包"
echo "   选择: Android(apk)"
echo "   证书: 使用自有证书"
echo "   证书路径: android-project/app/juju-release-key.jks"
echo ""
echo "5. 等待打包完成"
echo "   预计时间: 5-10分钟"
echo "   输出: unpackage/release/apk/"
echo ""

echo "=== 打包完成后 ==="
echo "1. 测试APK安装"
echo "2. 准备应用商店上架材料"
echo "3. 提交应用商店审核"
echo ""

echo "$(date) - 打包准备完成"
