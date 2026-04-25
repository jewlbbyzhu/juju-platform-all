#!/bin/bash
# JUJU App 开发环境 - 完全信任模式配置
# 执行后无需再手动确认任何操作

echo "🔧 配置 Hermes Agent 完全信任模式..."

# 添加到 ~/.zshrc (或 ~/.bash_profile)
SHELL_RC="$HOME/.zshrc"
if [ ! -f "$SHELL_RC" ]; then
    SHELL_RC="$HOME/.bash_profile"
fi

# 检查是否已经配置
if grep -q "HERMES_AGENT_DANGER_MODE" "$SHELL_RC" 2>/dev/null; then
    echo "⚠️ 完全信任模式已配置"
else
    echo "" >> "$SHELL_RC"
    echo "# Hermes Agent 完全信任模式 (JUJU开发)" >> "$SHELL_RC"
    echo "export HERMES_AGENT_DANGER_MODE=true" >> "$SHELL_RC"
    echo "export HERMES_AGENT_SKIP_CONFIRM=true" >> "$SHELL_RC"
    echo "export HERMES_CRON_CONFIRM=false" >> "$SHELL_RC"
    echo "" >> "$SHELL_RC"
    echo "✅ 已添加到 $SHELL_RC"
fi

# 立即生效
export HERMES_AGENT_DANGER_MODE=true
export HERMES_AGENT_SKIP_CONFIRM=true
export HERMES_CRON_CONFIRM=false

echo ""
echo "🎉 配置完成！现在可以："
echo "   • 无需确认直接执行任何命令"
echo "   • 定时任务自动运行无需批准"
echo "   • 文件修改、构建、部署全自动"
echo ""
echo "⚠️ 注意：此模式授予Agent完全权限，请确保信任此环境"
echo ""
echo "如需恢复确认模式，请删除 ~/.zshrc 中的相关配置"
