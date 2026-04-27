#!/bin/bash
# Maestro E2E Test Runner for JUJU App

set -e

APP_ID="com.jujuapp"
MAESTRO_DIR=".maestro"
REPORTS_DIR="e2e_test/reports"
SCREENSHOTS_DIR="e2e_test/maestro-screenshots"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🎭 JUJU App Maestro E2E Test Suite"
echo "=================================="

# 检查Maestro是否安装
if ! command -v maestro &> /dev/null; then
    echo -e "${YELLOW}Maestro not found. Installing...${NC}"
    curl -Ls "https://get.maestro.mobile.dev" | bash
    export PATH="$PATH:$HOME/.maestro/bin"
fi

# 创建报告目录
mkdir -p "$REPORTS_DIR" "$SCREENSHOTS_DIR"

# 获取当前时间戳
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_FILE="$REPORTS_DIR/maestro_report_$TIMESTAMP.json"

# 测试用例列表
TESTS=(
    "01_launch_app.yaml:应用启动"
    "02_login_flow.yaml:登录流程"
    "03_home_navigation.yaml:首页导航"
    "04_bottom_tabs.yaml:底部Tab切换"
    "05_create_party.yaml:创建聚会"
    "06_vip_features.yaml:VIP功能"
    "07_wallet_flow.yaml:钱包功能"
    "08_search_party.yaml:搜索功能"
)

TOTAL=${#TESTS[@]}
PASSED=0
FAILED=0

# 运行测试
echo ""
echo "开始运行 $TOTAL 个E2E测试..."
echo ""

for test in "${TESTS[@]}"; do
    IFS=':' read -r file desc <<< "$test"
    
    echo -n "测试: $desc ... "
    
    if maestro test "$MAESTRO_DIR/flows/$file" --format json > /tmp/maestro_output.json 2>&1; then
        echo -e "${GREEN}✓ 通过${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ 失败${NC}"
        ((FAILED++))
        echo "  错误日志: /tmp/maestro_output.json"
    fi
done

# 生成报告
echo ""
echo "=================================="
echo "📊 测试报告"
echo "=================================="
echo "总测试数: $TOTAL"
echo -e "通过: ${GREEN}$PASSED${NC}"
echo -e "失败: ${RED}$FAILED${NC}"
echo "通过率: $(( PASSED * 100 / TOTAL ))%"
echo ""

# 保存JSON报告
cat > "$REPORT_FILE" << EOF
{
  "timestamp": "$(date -Iseconds)",
  "total": $TOTAL,
  "passed": $PASSED,
  "failed": $FAILED,
  "pass_rate": $(( PASSED * 100 / TOTAL )),
  "screenshots_dir": "$SCREENSHOTS_DIR"
}
EOF

echo "详细报告: $REPORT_FILE"

# 返回状态码
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 所有E2E测试通过！${NC}"
    exit 0
else
    echo -e "${RED}⚠️  有 $FAILED 个测试失败${NC}"
    exit 1
fi
