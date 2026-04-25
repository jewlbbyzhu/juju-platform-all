#!/usr/bin/env pwsh

# 聚聚平台后端部署脚本 (PowerShell 版本)
# 使用方法: .\deploy.ps1

$ErrorActionPreference = "Stop"

Write-Host "🚀 开始部署 JuJu 后端..." -ForegroundColor Green

# 配置
$SERVER_USER = "ubuntu"
$SERVER_HOST = "122.51.255.13"
$SERVER_PATH = "/var/www/juju-platform/backend"
$LOCAL_PATH = Get-Location

# 颜色输出
function Write-Red($text) { Write-Host $text -ForegroundColor Red }
function Write-Green($text) { Write-Host $text -ForegroundColor Green }
function Write-Yellow($text) { Write-Host $text -ForegroundColor Yellow }

# 检查本地环境
Write-Host "📋 检查本地环境..."
if (-not (Test-Path "package.json")) {
    Write-Red "❌ 错误: 请在 backend 目录下运行此脚本"
    exit 1
}

# 检查依赖
Write-Host "📦 检查依赖..."
if (-not (Test-Path "node_modules")) {
    Write-Yellow "⚠️  node_modules 不存在，正在安装依赖..."
    npm install
}

# 运行测试
Write-Host "🧪 运行测试..."
try {
    npm test
    Write-Green "✅ 测试通过"
} catch {
    Write-Yellow "⚠️  测试未通过，是否继续部署? (y/n)"
    $response = Read-Host
    if ($response -ne "y") {
        Write-Red "❌ 部署已取消"
        exit 1
    }
}

# 检查代码规范
Write-Host "🔍 检查代码规范..."
try {
    npm run lint
    Write-Green "✅ 代码规范检查通过"
} catch {
    Write-Yellow "⚠️  代码规范检查未通过，是否继续部署? (y/n)"
    $response = Read-Host
    if ($response -ne "y") {
        Write-Red "❌ 部署已取消"
        exit 1
    }
}

# 创建部署包
Write-Host "📦 创建部署包..."
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$DEPLOY_PACKAGE = "deploy-$timestamp.zip"

# 使用 PowerShell 压缩（排除指定目录和文件）
$excludePaths = @('node_modules', '.git', 'logs', 'uploads', '.env', 'tests', '*.log', '.nyc_output', 'coverage')
$filesToInclude = Get-ChildItem -Path . -Exclude $excludePaths | Where-Object { $_.Name -notin $excludePaths }

Compress-Archive -Path $filesToInclude -DestinationPath $DEPLOY_PACKAGE -Force

Write-Green "✅ 部署包创建完成: $DEPLOY_PACKAGE"

# 检查 SSH 连接
Write-Host "🔌 检查 SSH 连接..."
try {
    $sshTest = ssh -o ConnectTimeout=5 -o BatchMode=yes $SERVER_USER@$SERVER_HOST "echo 'SSH连接成功'" 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "SSH 连接失败"
    }
    Write-Green "✅ SSH 连接正常"
} catch {
    Write-Red "❌ SSH 连接失败，请检查:"
    Write-Red "   1. 是否配置了 SSH 密钥"
    Write-Red "   2. 服务器地址是否正确"
    Write-Red "   3. 网络连接是否正常"
    exit 1
}

# 上传到服务器
Write-Host "📤 上传到服务器..."
scp $DEPLOY_PACKAGE "$SERVER_USER@${SERVER_HOST}:/tmp/"
if ($LASTEXITCODE -ne 0) {
    Write-Red "❌ 上传失败"
    exit 1
}
Write-Green "✅ 上传完成"

# 在服务器上执行部署
Write-Host "🔧 在服务器上执行部署..."
$remoteCommands = @"
set -e

echo "📂 准备部署目录..."
sudo mkdir -p $SERVER_PATH
sudo chown -R $SERVER_USER:$SERVER_PATH

echo "📦 解压部署包..."
cd /tmp
unzip -o "$DEPLOY_PACKAGE" -d "$SERVER_PATH"

echo "📦 安装生产依赖..."
cd $SERVER_PATH
npm install --production

echo "🔐 检查环境变量..."
if [ ! -f ".env" ]; then
    echo "⚠️  警告: .env 文件不存在，使用 .env.production"
    cp .env.production .env
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
"@

ssh $SERVER_USER@$SERVER_HOST $remoteCommands
if ($LASTEXITCODE -ne 0) {
    Write-Red "❌ 服务器部署失败"
    exit 1
}

# 清理本地部署包
Remove-Item -Force $DEPLOY_PACKAGE

Write-Green "🎉 部署成功!"
Write-Host ""
Write-Host "📊 服务状态检查:"
ssh $SERVER_USER@$SERVER_HOST "pm2 status"
Write-Host ""
Write-Host "📝 查看日志:"
Write-Host "   ssh $SERVER_USER@$SERVER_HOST 'pm2 logs juju-backend --lines 50'"
