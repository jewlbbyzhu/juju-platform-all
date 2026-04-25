#!/bin/bash
# JUJU APP - UI优化任务 (每天1次，凌晨2点)
# 整合: ui-polish + ui-screenshot + 全面页面验证

set -e

APP_DIR="/Users/mac/.openclaw.pre-migration/workspace/juju-platform-all/JujuApp"
LOG_DIR="$APP_DIR/logs/cron"
LOG_FILE="$LOG_DIR/ui-optimize-$(date +%Y%m%d-%H%M%S).log"
RESULT_FILE="$LOG_DIR/ui-optimize-latest.json"
SCREENSHOT_DIR="$APP_DIR/screenshots/$(date +%Y%m%d)"

mkdir -p "$LOG_DIR" "$SCREENSHOT_DIR"

echo "[{\"time\": \"$(date -Iseconds)\"}] 开始UI优化任务..." >> "$LOG_FILE"

cd "$APP_DIR"

# 1. 检查深色背景问题
echo "[1/6] 检查UI一致性..." >> "$LOG_FILE"
DARK_BG_COUNT=$(grep -r "backgroundColor.*#000\|backgroundColor.*black\|background.*dark" src/screens/*.tsx 2>/dev/null | wc -l | xargs)
INCONSISTENT_COLORS=$(grep -r "#FF6B35\|#667eea" src/screens/*.tsx 2>/dev/null | wc -l | xargs)

# 2. 修复简单UI问题
echo "[2/6] 自动修复UI问题..." >> "$LOG_FILE"
FIXED_FILES=0

# 统一主题色 (谨慎修复)
if [ "$INCONSISTENT_COLORS" -gt 0 ]; then
    find src/screens -name "*.tsx" -exec sed -i '' 's/#FF6B35/#FF6B6B/g' {} \; 2>/dev/null || true
    find src/screens -name "*.tsx" -exec sed -i '' 's/#667eea/#FF6B6B/g' {} \; 2>/dev/null || true
    FIXED_FILES=$((FIXED_FILES + INCONSISTENT_COLORS))
fi

# 3. 验证所有52个页面
echo "[3/6] 验证52个页面完整性..." >> "$LOG_FILE"
SCREEN_FILES=$(ls src/screens/*Screen.tsx 2>/dev/null)
SCREEN_COUNT=$(echo "$SCREEN_FILES" | wc -l | xargs)

# 检查每个页面的导出
EXPORT_ERRORS=0
for screen in $SCREEN_FILES; do
    SCREEN_NAME=$(basename "$screen" .tsx)
    if ! grep -q "export.*$SCREEN_NAME\|export default" "$screen"; then
        echo "  ⚠️ $SCREEN_NAME 可能缺少导出" >> "$LOG_FILE"
        EXPORT_ERRORS=$((EXPORT_ERRORS + 1))
    fi
done

# 4. 检查导航配置
echo "[4/6] 检查导航配置..." >> "$LOG_FILE"
NAV_CONFIG="src/navigation/AppNavigator.tsx"
NAV_SCREENS=0
if [ -f "$NAV_CONFIG" ]; then
    NAV_SCREENS=$(grep -o "Screen.*name=" "$NAV_CONFIG" 2>/dev/null | wc -l | xargs)
fi

# 5. Maestro截图 (如果可用)
echo "[5/6] 生成UI截图..." >> "$LOG_FILE"
SCREENSHOT_COUNT=0
if command -v maestro &> /dev/null && [ -f ".maestro/flows/10_ui_screenshot_audit.yaml" ]; then
    export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
    export ANDROID_HOME=/Users/mac/Library/Android/sdk
    export PATH=$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$HOME/.maestro/bin:$PATH
    
    if maestro test .maestro/flows/10_ui_screenshot_audit.yaml 2>&1 | tee -a "$LOG_FILE"; then
        # 复制截图
        if [ -d "~/.maestro/tests/latest/screenshots" ]; then
            cp ~/.maestro/tests/latest/screenshots/*.png "$SCREENSHOT_DIR/" 2>/dev/null || true
            SCREENSHOT_COUNT=$(ls "$SCREENSHOT_DIR"/*.png 2>/dev/null | wc -l | xargs)
        fi
    fi
else
    echo "  Maestro不可用，跳过截图" >> "$LOG_FILE"
fi

# 6. 生成UI报告
echo "[6/6] 生成UI报告..." >> "$LOG_FILE"

cat > "$RESULT_FILE" << EOF
{
  "task": "ui-optimize",
  "time": "$(date -Iseconds)",
  "status": "ok",
  "results": {
    "ui_consistency": {
      "dark_bg_issues": $DARK_BG_COUNT,
      "inconsistent_colors": $INCONSISTENT_COLORS,
      "fixed_files": $FIXED_FILES
    },
    "screens": {
      "total": $SCREEN_COUNT,
      "export_errors": $EXPORT_ERRORS,
      "nav_configured": $NAV_SCREENS
    },
    "screenshots": {
      "count": $SCREENSHOT_COUNT,
      "path": "$SCREENSHOT_DIR"
    }
  },
  "actions_taken": [
    $([ "$FIXED_FILES" -gt 0 ] && echo '"统一了主题色"' || echo ''),
    $([ "$EXPORT_ERRORS" -eq 0 ] && echo '"所有页面导出正确"' || echo '"发现导出错误"')
  ]
}
EOF

echo "✅ UI优化任务完成" >> "$LOG_FILE"
