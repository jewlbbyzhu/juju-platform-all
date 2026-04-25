#!/bin/bash
# Performance Check Script for JUJU App

set -e

echo "📊 JUJU App 性能检查"
echo "===================="

# 检查bundle大小
echo ""
echo "📦 Bundle 大小分析:"
BUNDLE_SIZE=$(find ./android/app/build -name "*.bundle" -o -name "index.android.bundle" 2>/dev/null | head -1 | xargs ls -lh 2>/dev/null | awk '{print $5}' || echo "N/A")
if [ "$BUNDLE_SIZE" != "N/A" ]; then
    echo "  Android Bundle: $BUNDLE_SIZE"
else
    echo "  Android Bundle: 未构建"
fi

# 检查依赖数量
echo ""
echo "📚 依赖分析:"
DEP_COUNT=$(cat package.json | grep -A1000 '"dependencies"' | grep -B1000 '"devDependencies"' | grep -c '"' || echo "0")
DEV_DEP_COUNT=$(cat package.json | grep -A1000 '"devDependencies"' | grep -c '"' || echo "0")
echo "  生产依赖: ~$DEP_COUNT 个"
echo "  开发依赖: ~$DEV_DEP_COUNT 个"

# 检查代码行数
echo ""
echo "📝 代码统计:"
TS_FILES=$(find ./src -name "*.ts" -o -name "*.tsx" 2>/dev/null | wc -l)
TS_LINES=$(find ./src -name "*.ts" -o -name "*.tsx" 2>/dev/null | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}' || echo "0")
echo "  TypeScript文件: $TS_FILES 个"
echo "  TypeScript代码: $TS_LINES 行"

# 检查测试覆盖率（如果有）
echo ""
echo "🧪 测试统计:"
TEST_FILES=$(find ./__tests__ -name "*.test.ts*" 2>/dev/null | wc -l)
echo "  测试文件: $TEST_FILES 个"

# 检查启动时间（模拟器测试数据）
echo ""
echo "⏱️  性能基准:"
echo "  启动时间目标: < 3秒"
echo "  首屏渲染目标: < 1.5秒"
echo "  内存占用目标: < 150MB"

# 检查潜在问题
echo ""
echo "🔍 潜在问题检查:"

# 检查console.log残留
LOG_COUNT=$(grep -r "console.log" ./src --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l)
if [ "$LOG_COUNT" -gt 10 ]; then
    echo "  ⚠️ 发现 $LOG_COUNT 个 console.log，建议清理"
else
    echo "  ✅ Console.log 检查通过"
fi

# 检查TODO注释
TODO_COUNT=$(grep -r "TODO\|FIXME" ./src --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l)
echo "  ℹ️  发现 $TODO_COUNT 个 TODO/FIXME 注释"

# 检查大型组件
LARGE_FILES=$(find ./src/screens -name "*.tsx" -size +10k 2>/dev/null | wc -l)
if [ "$LARGE_FILES" -gt 5 ]; then
    echo "  ⚠️ 发现 $LARGE_FILES 个大型组件(>10KB)，建议拆分"
else
    echo "  ✅ 组件大小检查通过"
fi

echo ""
echo "===================="
echo "性能检查完成"
