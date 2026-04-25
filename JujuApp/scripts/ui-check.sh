#!/bin/bash
# UI Consistency Check Script for JUJU App
# Checks UI components, colors, fonts, and design system compliance

set -e

echo "🎨 JUJU App UI 一致性检查"
echo "========================"

cd ~/.openclaw.pre-migration/workspace/juju-platform-all/JujuApp

# 颜色定义检查
echo ""
echo "🎨 颜色系统检查:"
if [ -f "src/theme/colors.ts" ]; then
  COLOR_VARS=$(grep -c "export const" src/theme/colors.ts 2>/dev/null || echo "0")
  echo "  ✅ 颜色定义文件存在 ($COLOR_VARS 个颜色变量)"
else
  echo "  ⚠️ 未找到统一的颜色定义文件"
fi

# 检查硬编码颜色
echo ""
echo "🔍 硬编码颜色检查:"
HARDCODED_COLORS=$(grep -r "#[0-9A-Fa-f]\{6\}" ./src --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "theme/colors" | wc -l)
if [ "$HARDCODED_COLORS" -gt 20 ]; then
  echo "  ⚠️ 发现 $HARDCODED_COLORS 处硬编码颜色，建议使用主题系统"
else
  echo "  ✅ 硬编码颜色较少 ($HARDCODED_COLORS 处)"
fi

# 字体大小检查
echo ""
echo "📏 字体系统检查:"
FONT_SIZES=$(grep -r "fontSize:" ./src --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l)
UNIQUE_SIZES=$(grep -r "fontSize:" ./src --include="*.ts" --include="*.tsx" 2>/dev/null | grep -o "fontSize: [0-9]*" | sort -u | wc -l)
echo "  字体大小定义: $FONT_SIZES 处"
echo "  唯一字体大小: $UNIQUE_SIZES 个"

if [ "$UNIQUE_SIZES" -gt 10 ]; then
  echo "  ⚠️ 字体大小种类较多，建议统一为设计系统规范"
else
  echo "  ✅ 字体大小较规范"
fi

# 检查StyleSheet使用
echo ""
echo "📱 StyleSheet使用检查:"
INLINE_STYLES=$(grep -r "style={{" ./src --include="*.tsx" 2>/dev/null | wc -l)
STYLESHEET_USAGE=$(grep -r "StyleSheet.create" ./src --include="*.tsx" 2>/dev/null | wc -l)
echo "  内联样式: $INLINE_STYLES 处"
echo "  StyleSheet: $STYLESHEET_USAGE 处"

if [ "$INLINE_STYLES" -gt "$STYLESHEET_USAGE" ]; then
  echo "  ⚠️ 内联样式过多，建议优先使用StyleSheet"
else
  echo "  ✅ StyleSheet使用良好"
fi

# 检查图片资源
echo ""
echo "🖼️  图片资源检查:"
IMAGE_COUNT=$(find ./src -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.svg" 2>/dev/null | wc -l)
echo "  本地图片: $IMAGE_COUNT 个"

# 检查Icon使用
echo ""
echo "🔣 Icon组件检查:"
ICON_USAGE=$(grep -r "<Icon" ./src --include="*.tsx" 2>/dev/null | wc -l)
echo "  Icon组件使用: $ICON_USAGE 次"

# 检查组件复杂度（文件大小）
echo ""
echo "🏗️  组件复杂度检查:"
LARGE_SCREENS=$(find ./src/screens -name "*.tsx" -size +15k 2>/dev/null | wc -l)
if [ "$LARGE_SCREENS" -gt 3 ]; then
  echo "  ⚠️ 发现 $LARGE_SCREENS 个大型Screen组件(>15KB)，建议拆分"
  find ./src/screens -name "*.tsx" -size +15k 2>/dev/null | head -5 | sed 's/^/    - /'
else
  echo "  ✅ 组件大小合理"
fi

# UI一致性检查
echo ""
echo "✨ UI一致性检查:"

# 检查重复的margin/padding值
MARGIN_VALUES=$(grep -r "margin:" ./src --include="*.ts" --include="*.tsx" 2>/dev/null | grep -o "margin: [0-9]*" | sort | uniq -c | sort -rn | head -5)
if [ -n "$MARGIN_VALUES" ]; then
  echo "  常用margin值:"
  echo "$MARGIN_VALUES" | sed 's/^/    /'
fi

PADDING_VALUES=$(grep -r "padding:" ./src --include="*.ts" --include="*.tsx" 2>/dev/null | grep -o "padding: [0-9]*" | sort | uniq -c | sort -rn | head -5)
if [ -n "$PADDING_VALUES" ]; then
  echo "  常用padding值:"
  echo "$PADDING_VALUES" | sed 's/^/    /'
fi

# 截图对比（如果存在基线）
echo ""
echo "📸 视觉回归检查:"
SCREENSHOT_DIR="e2e_test/maestro-screenshots"
if [ -d "$SCREENSHOT_DIR" ]; then
  SCREENSHOT_COUNT=$(ls $SCREENSHOT_DIR/*.png 2>/dev/null | wc -l)
  echo "  已有截图: $SCREENSHOT_COUNT 张"
else
  echo "  暂无基准截图"
fi

# 生成UI报告
echo ""
echo "========================"
echo "UI检查完成"
echo "========================"

# 保存报告
cat > "$HOME/.hermes/cron/output/juju-ui-report.json" << EOF
{
  "timestamp": "$(date -Iseconds)",
  "hardcoded_colors": $HARDCODED_COLORS,
  "font_size_variations": $UNIQUE_SIZES,
  "inline_styles": $INLINE_STYLES,
  "stylesheet_usage": $STYLESHEET_USAGE,
  "large_screens": $LARGE_SCREENS,
  "local_images": $IMAGE_COUNT,
  "icon_usage": $ICON_USAGE
}
EOF

echo "报告已保存: $HOME/.hermes/cron/output/juju-ui-report.json"
