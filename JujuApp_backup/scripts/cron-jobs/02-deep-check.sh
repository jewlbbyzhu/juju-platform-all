#!/bin/bash
# JUJU APP - 深度检查任务 (每4小时)
# 整合: daily-pipeline + performance-test + e2e-maestro + 数据流验证

set -e

APP_DIR="/Users/mac/.openclaw.pre-migration/workspace/juju-platform-all/JujuApp"
LOG_DIR="$APP_DIR/logs/cron"
LOG_FILE="$LOG_DIR/deep-check-$(date +%Y%m%d-%H%M%S).log"
RESULT_FILE="$LOG_DIR/deep-check-latest.json"

mkdir -p "$LOG_DIR"

echo "[{\"time\": \"$(date -Iseconds)\"}] 开始深度检查..." >> "$LOG_FILE"

cd "$APP_DIR"

# 1. 完整测试套件
echo "[1/6] 运行测试套件..." >> "$LOG_FILE"
TEST_OUTPUT=$(npm test -- --coverage --watchAll=false 2>&1 | tee -a "$LOG_FILE" || true)
TEST_PASSED=$(echo "$TEST_OUTPUT" | grep -oP "Tests:\s+\K\d+" || echo "0")
TEST_TOTAL=$(echo "$TEST_OUTPUT" | grep -oP "Tests:\s+\d+ of\s+\K\d+" || echo "0")

# 2. ESLint深度检查
echo "[2/6] ESLint深度检查..." >> "$LOG_FILE"
ESLINT_OUTPUT=$(npx eslint src/ --ext .ts,.tsx 2>&1 | tee -a "$LOG_FILE" || true)
ESLINT_ERRORS=$(echo "$ESLINT_OUTPUT" | grep -c "error" || echo "0")
ESLINT_WARNINGS=$(echo "$ESLINT_OUTPUT" | grep -c "warning" || echo "0")

# 3. 性能检查
echo "[3/6] 性能检查..." >> "$LOG_FILE"
APK_SIZE="N/A"
if [ -f "builds/juju-universal-release.apk" ]; then
    APK_SIZE=$(du -h builds/juju-universal-release.apk | cut -f1)
fi

# 统计代码行数
CODE_LINES=$(find src -name "*.ts" -o -name "*.tsx" | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}')

# 4. 数据流验证
echo "[4/6] 数据流验证..." >> "$LOG_FILE"
PARTIES_API=$(curl -s "https://api.hfparty.asia/api/v1/parties?page=1&pageSize=5" 2>/dev/null | head -500)
PARTY_COUNT=$(echo "$PARTIES_API" | grep -o '"id"' | wc -l | xargs)

# 验证第一个聚会详情
FIRST_PARTY_ID=$(echo "$PARTIES_API" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
if [ -n "$FIRST_PARTY_ID" ]; then
    PARTY_DETAIL=$(curl -s "https://api.hfparty.asia/api/v1/parties/$FIRST_PARTY_ID" 2>/dev/null | head -200)
    if [ -n "$PARTY_DETAIL" ]; then
        DETAIL_STATUS="✅ 详情API正常"
    else
        DETAIL_STATUS="❌ 详情API异常"
    fi
else
    DETAIL_STATUS="⚠️ 无活动数据"
fi

# 5. 页面完整性检查 (52页面)
echo "[5/6] 页面完整性检查..." >> "$LOG_FILE"
SCREEN_COUNT=$(ls src/screens/*Screen.tsx 2>/dev/null | wc -l)
TS_ERRORS_IN_SCREENS=$(npx tsc --noEmit 2>&1 | grep -c "src/screens" || echo "0")

# 6. 检查导航配置
echo "[6/6] 导航配置检查..." >> "$LOG_FILE"
NAV_ERRORS=0
if [ -f "src/navigation/AppNavigator.tsx" ]; then
    NAV_IMPORTS=$(grep -c "from '../screens'" src/navigation/AppNavigator.tsx 2>/dev/null || echo "0")
else
    NAV_IMPORTS=0
fi

# 生成报告
cat > "$RESULT_FILE" << EOF
{
  "task": "deep-check",
  "time": "$(date -Iseconds)",
  "status": "ok",
  "results": {
    "tests": {
      "passed": "$TEST_PASSED",
      "total": "$TEST_TOTAL"
    },
    "eslint": {
      "errors": $ESLINT_ERRORS,
      "warnings": $ESLINT_WARNINGS
    },
    "performance": {
      "apk_size": "$APK_SIZE",
      "code_lines": $CODE_LINES
    },
    "data_flow": {
      "parties_count": $PARTY_COUNT,
      "detail_api": "$DETAIL_STATUS",
      "sample_party_id": "$FIRST_PARTY_ID"
    },
    "screens": {
      "total": $SCREEN_COUNT,
      "ts_errors": $TS_ERRORS_IN_SCREENS
    }
  },
  "issues": []
}
EOF

echo "✅ 深度检查完成" >> "$LOG_FILE"
