@echo off
chcp 65001
echo ==========================================
echo 聚聚 APP 云打包快速启动脚本
echo ==========================================
echo.
echo 步骤 1: 打开 HBuilderX
echo 步骤 2: 文件 -^> 打开目录
echo 步骤 3: 选择: D:\workspace\uni-app-mobile
echo 步骤 4: 点击: 发行 -^> 原生App-云打包
echo 步骤 5: 等待云端打包完成
echo.
echo ==========================================
echo.

:: 尝试打开 HBuilderX
if exist "C:\Program Files\HBuilderX\HBuilderX.exe" (
    start "" "C:\Program Files\HBuilderX\HBuilderX.exe" "D:\workspace\uni-app-mobile"
) else if exist "C:\Users\%USERNAME%\AppData\Local\Programs\HBuilderX\HBuilderX.exe" (
    start "" "C:\Users\%USERNAME%\AppData\Local\Programs\HBuilderX\HBuilderX.exe" "D:\workspace\uni-app-mobile"
) else (
    echo 未找到 HBuilderX，请手动打开
    echo 项目路径: D:\workspace\uni-app-mobile
    pause
)
