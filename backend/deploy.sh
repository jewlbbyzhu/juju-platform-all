#!/bin/bash
set -e

echo "=== JUJU Backend Deployment Script ==="
echo "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"

# 1. 本地打包
echo "[1/6] 打包本地代码..."
cd ~/.hermes/workspace/juju-platform-all/backend
tar czf /tmp/juju-backend-deploy.tar.gz \
  --exclude='node_modules' \
  --exclude='logs' \
  --exclude='uploads' \
  --exclude='.git' \
  src/ \
  package.json \
  Dockerfile \
  .env.production \
  cert/ \
  scripts/

echo "[2/6] 传输到服务器..."
ssh -i cert/hfparty_ssh_key.pem \
  -o StrictHostKeyChecking=no \
  ubuntu@122.51.255.13 \
  "sudo mkdir -p /var/www/juju-platform/backend-backup-$(date +%Y%m%d-%H%M%S)"

cat /tmp/juju-backend-deploy.tar.gz | ssh -i cert/hfparty_ssh_key.pem \
  -o StrictHostKeyChecking=no \
  ubuntu@122.51.255.13 \
  "cat > /tmp/juju-backend-deploy.tar.gz"

echo "[3/6] 服务器端部署..."
ssh -i cert/hfparty_ssh_key.pem \
  -o StrictHostKeyChecking=no \
  ubuntu@122.51.255.13 \
  "
cd /var/www/juju-platform/backend
# 备份当前代码
cp -r src ../backend-backup-$(date +%Y%m%d-%H%M%S)/

# 解压新代码
cd /var/www/juju-platform
tar xzf /tmp/juju-backend-deploy.tar.gz -C backend --overwrite

# 安装依赖
cd /var/www/juju-platform/backend
npm ci --production

# 重启服务
pm2 restart server

# 健康检查
sleep 3
curl -s http://localhost:18789/api/v1/health | head -c 200
"

echo "[6/6] 部署完成"
