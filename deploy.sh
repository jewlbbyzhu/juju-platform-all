#!/bin/bash
# JUJU Platform 自动化部署脚本
# 创建时间: 2026-03-18

SERVER_IP="122.51.255.13"
SERVER_USER="ubuntu"
SSH_KEY="~/.ssh/hfparty_ssh_key.pem"
DEPLOY_DIR="/opt/juju-platform"

echo "=== JUJU Platform 自动化部署 ==="
echo "时间: $(date)"

# 1. 构建代码
echo "1. 构建代码..."
cd backend && npm install && cd ..
cd admin-web && npm run build && cd ..
cd uni-app-mobile && npm run build:h5 && cd ..

# 2. 创建部署包
echo "2. 创建部署包..."
tar -czf /tmp/juju-deploy.tar.gz \
    --exclude='node_modules' \
    --exclude='.git' \
    backend/ \
    admin-web/dist/ \
    uni-app-mobile/dist/build/h5/

# 3. 上传并部署
echo "3. 上传并部署..."
scp -i $SSH_KEY /tmp/juju-deploy.tar.gz $SERVER_USER@$SERVER_IP:/tmp/

ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP "
    cd /tmp &&
    tar -xzf juju-deploy.tar.gz &&
    sudo cp -r backend/* $DEPLOY_DIR/backend/ &&
    cd $DEPLOY_DIR/backend &&
    npm install &&
    pm2 restart server
"

# 4. 验证部署
echo "4. 验证部署..."
ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP "pm2 show server"

echo "✅ 部署完成!"
echo "时间: $(date)"
