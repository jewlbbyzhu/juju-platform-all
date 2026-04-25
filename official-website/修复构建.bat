@echo off
chcp 65001 >nul
echo ============================================
echo 官网修复构建脚本
echo ============================================
echo.

cd /d D:\workspace\official-website

echo [1/4] 清理旧构建...
if exist .next rmdir /s /q .next
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

echo.
echo [2/4] 安装依赖...
call npm install
if errorlevel 1 (
    echo 依赖安装失败
    pause
    exit /b 1
)

echo.
echo [3/4] 构建项目...
call npm run build
if errorlevel 1 (
    echo 构建失败
    pause
    exit /b 1
)

echo.
echo [4/4] 检查构建结果...
if exist dist (
    echo ✅ 构建成功！
    echo 构建输出: D:\workspace\official-website\dist
) else (
    echo ❌ 构建失败，未找到dist目录
    pause
    exit /b 1
)

echo.
echo ============================================
echo 构建完成！
echo ============================================
echo.
echo 下一步：
echo 1. 将 dist 目录部署到服务器
pause
