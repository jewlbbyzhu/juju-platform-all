@echo off
chcp 65001
echo ==========================================
echo 聚聚 APP 自动测试脚本
echo ==========================================
echo.

set APK_PATH=%1
if "%APK_PATH%"=="" (
    echo 使用方法: test-apk.bat [APK文件路径]
    echo 示例: test-apk.bat D:\Downloads\juju-app.apk
    pause
    exit /b 1
)

echo [1/5] 检查设备连接...
adb devices | findstr "device$" >nul
if errorlevel 1 (
    echo ❌ 没有检测到设备，请连接手机或启动模拟器
    pause
    exit /b 1
)
echo ✅ 设备已连接

echo.
echo [2/5] 卸载旧版本...
adb uninstall uni.app.UNIJujuParty >nul 2>&1
echo ✅ 卸载完成（如果存在）

echo.
echo [3/5] 安装新版本...
adb install -r "%APK_PATH%"
if errorlevel 1 (
    echo ❌ 安装失败
    pause
    exit /b 1
)
echo ✅ 安装成功

echo.
echo [4/5] 启动应用...
adb shell monkey -p uni.app.UNIJujuParty -c android.intent.category.LAUNCHER 1 >nul
echo ✅ 应用已启动

echo.
echo [5/5] 等待应用加载...
timeout /t 5 /nobreak >nul

echo.
echo ==========================================
echo 正在截图验证...
echo ==========================================
adb shell screencap -p /sdcard/juju_test.png
adb pull /sdcard/juju_test.png %~dp0juju_screenshot.png

if exist "%~dp0juju_screenshot.png" (
    echo ✅ 截图已保存: juju_screenshot.png
    echo 请查看截图确认应用是否正常显示
) else (
    echo ⚠️ 截图失败
)

echo.
echo ==========================================
echo 测试完成！
echo ==========================================
pause
