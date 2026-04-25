#!/bin/bash

# 聚聚平台后端部署脚本
# 使用方法: ./deploy.sh

set -e

echo "🚀 开始部署 JuJu 后端..."

# 配置
SERVER_USER="ubuntu"
SERVER_HOST="122.51.255.13"
SERVER_PATH="/var/www/juju-platform/backend"
LOCAL_PATH="$(pwd)"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查本地环境
echo "📋 检查本地环境..."
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ 错误: 请在 backend 目录下运行此脚本${NC}"
    exit 1
fi

# 检查依赖
echo "📦 检查依赖..."
if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modules 不存在，正在安装依赖..."
    npm install
fi

# 运行测试
echo "🧪 运行测试..."
npm test || {
    echo -e "${YELLOW}⚠️  测试未通过，是否继续部署? (y/n)${NC}"
    read -r response
    if [ "$response" != "y" ]; then
        echo "❌ 部署已取消"
        exit 1
    fi
}

# 检查代码规范
echo "🔍 检查代码规范..."
npm run lint || {
    echo -e "${YELLOW}⚠️  代码规范检查未通过，是否继续部署? (y/n)${NC}"
    read -r response
    if [ "$response" != "y" ]; then
        echo "❌ 部署已取消"
        exit 1
    fi
}

# 创建部署包
echo "📦 创建部署包..."
DEPLOY_PACKAGE="deploy-$(date +%Y%m%d-%H%M%S).tar.gz"
tar -czf "$DEPLOY_PACKAGE" \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='logs' \
    --exclude='uploads' \
    --exclude='.env' \
    --exclude='tests' \
    --exclude='*.log' \
    --exclude='.nyc_output' \
    --exclude='coverage' \
    .

echo -e "${GREEN}✅ 部署包创建完成: $DEPLOY_PACKAGE${NC}"

# 上传到服务器
echo "📤 上传到服务器..."
scp "$DEPLOY_PACKAGE" "$SERVER_USER@$SERVER_HOST:/tmp/"

# 在服务器上执行部署
echo "🔧 在服务器上执行部署..."
ssh "$SERVER_USER@$SERVER_HOST" << EOF
    set -e
    
    echo "📂 准备部署目录..."
    sudo mkdir -p $SERVER_PATH
    sudo chown -R $SERVER_USER:$SERVER_USER $SERVER_PATH
    
    echo "📦 解压部署包..."
    cd /tmp
    tar -xzf "$DEPLOY_PACKAGE" -C "$SERVER_PATH" --strip-components=0
    
    echo "📦 安装生产依赖..."
    cd $SERVER_PATH
    npm install --production
    
    echo "🔐 检查环境变量..."
    if [ ! -f ".env" ]; then
        echo "⚠️  警告: .env 文件不存在，请手动配置"
        cp .env.example .env
    fi
    
    echo "🗄️  执行数据库迁移..."
    npm run migrate || echo "⚠️  迁移失败，请手动检查"
    
    echo "🔄 重启服务..."
    if pm2 list | grep -q "juju-backend"; then
        pm2 reload ecosystem.config.js --env production
    else
        pm2 start ecosystem.config.js --env production
    fi
    
    echo "🧹 清理临时文件..."
    rm -f "/tmp/$DEPLOY_PACKAGE"
    
    echo "✅ 部署完成"
EOF

# 清理本地部署包
rm -f "$DEPLOY_PACKAGE"

echo -e "${GREEN}🎉 部署成功!${NC}"
echo "