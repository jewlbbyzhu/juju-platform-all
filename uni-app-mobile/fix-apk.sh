#!/bin/bash
# APK 快速修复脚本
# 替换 manifest.json 并重新签名

set -e

PROJECT_DIR="/mnt/d/workspace/uni-app-mobile"
APK_DIR="$PROJECT_DIR/dist/release/apk"
ORIGINAL_APK="$APK_DIR/__UNI__F311F19__20260216215903.apk"
FIXED_APK="$APK_DIR/__UNI__F311F19__FIXED.apk"
APP_ID="__UNI__F311F19"

echo "=========================================="
echo "APK 快速修复脚本"
echo "=========================================="
echo ""

# 创建新的 manifest.json（修复版）
mkdir -p /tmp/apk_fix/assets/apps/$APP_ID/www

cat > /tmp/apk_fix/assets/apps/$APP_ID/www/manifest.json << 'EOF'
{
    "id": "__UNI__F311F19",
    "name": "聚聚",
    "version": {
        "name": "1.0.0",
        "code": "100"
    },
    "description": "发现精彩聚会，结识志同道合的朋友",
    "permissions": {
        "Payment": {"description": "Payment"},
        "Share": {"description": "Share"},
        "Push": {"description": "Push"},
        "Maps": {"description": "Maps"},
        "OAuth": {"description": "OAuth"},
        "UniNView": {"description": "UniNView"}
    },
    "plus": {
        "useragent": {"value": "uni-app", "concatenate": true},
        "splashscreen": {"autoclose": true, "delay": 0, "target": "id:1", "waiting": true},
        "popGesture": "close",
        "launchwebview": {"id": "1", "kernel": "system"},
        "usingComponents": true,
        "renderer": "native",
        "nvueStyleCompiler": "uni-app",
        "compilerVersion": 3,
        "uni-app": {
            "control": "uni-v3",
            "vueVersion": "3",
            "compilerVersion": "4.87",
            "nvueCompiler": "uni-app",
            "renderer": "native"
        },
        "weex": {
            "multiprocess": false
        }
    },
    "launch_path": "__uniappview.html"
}
EOF

echo "[1/3] 新的 manifest.json 已创建（已修复配置）"
echo "  - kernel: system (原 WKWebview)"
echo "  - renderer: native (原 auto)"
echo "  - weex.multiprocess: false"
echo ""

# 解压原 APK
echo "[2/3] 解压 APK..."
cd /tmp/apk_fix
unzip -q "$ORIGINAL_APK" -d ./extracted

# 替换 manifest.json
cp assets/apps/$APP_ID/www/manifest.json ./extracted/assets/apps/$APP_ID/www/
echo "✅ manifest.json 已替换"

# 重新打包（无签名）
echo ""
echo "[3/3] 重新打包..."
cd ./extracted
zip -rq "$FIXED_APK" . -x "META-INF/*"
echo "✅ 未签名 APK 已创建: $FIXED_APK"

echo ""
echo "=========================================="
echo "下一步: 签名 APK"
echo "=========================================="
echo ""
echo "请使用以下命令签名:"
echo ""
echo "cd $APK_DIR"
echo ""
echo "# 使用 apksigner (Android SDK)"
echo "apksigner sign --ks $PROJECT_DIR/android.keystore \\"
echo "  --ks-key-alias juju \\"
echo "  --ks-pass pass:abcd1234 \\"
echo "  --key-pass pass:abcd1234 \\"
echo "  --out __UNI__F311F19__SIGNED.apk \\"
echo "  __UNI__F311F19__FIXED.apk"
echo ""
echo "或手动在 Android Studio 中签名"
echo ""
echo "=========================================="
