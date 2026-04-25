#!/bin/bash
# Uni-app 开发服务器启动脚本
# 支持本地IP访问

set -e

echo "🚀 启动 Uni-app 开发服务器..."

# 获取本机IP
LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "127.0.0.1")
echo "📍 本机IP: $LOCAL_IP"

# 设置环境变量
export VITE_API_HOST=$LOCAL_IP
export VITE_DEV_SERVER_HOST=$LOCAL_IP

# 杀掉可能占用3000端口的进程
echo "🔍 检查端口占用..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# 启动开发服务器
echo "🌐 启动服务器..."
echo "   本地访问: http://localhost:3000"
echo "   局域网访问: http://$LOCAL_IP:3000"
echo ""

# 使用npx启动，确保配置生效
npx vite --host --port 3000 --strictPort false
