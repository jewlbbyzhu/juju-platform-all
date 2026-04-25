#!/bin/bash
# JUJU APP - 定时任务设置脚本
# 清理旧任务，设置新架构

echo "=== JUJU APP 定时任务重构 ==="
echo "时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 给脚本添加执行权限
chmod +x ~/.openclaw.pre-migration/workspace/juju-platform-all/JujuApp/scripts/cron-jobs/*.sh

echo "✅ 脚本权限已设置"
echo ""
echo "接下来需要使用 cronjob 工具创建新任务:"
echo ""
echo "新任务列表:"
echo "1. juju-quick-check    */30 * * * *   (每30分钟)"
echo "2. juju-deep-check     0 */4 * * *    (每4小时)"
echo "3. juju-build          0 */6 * * *    (每6小时)"
echo "4. juju-ui-optimize    0 2 * * *      (每天2点)"
echo "5. juju-orchestrator   */30 * * * *   (每30分钟 - 监控协调)"
echo ""
echo "请使用以下命令创建:"
echo "  cronjob create --name juju-quick-check --schedule '*/30 * * * *' --script scripts/cron-jobs/01-quick-check.sh"
echo "  ..."
