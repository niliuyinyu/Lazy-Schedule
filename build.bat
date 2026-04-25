@echo off
echo ========================================
echo 截历 App 构建脚本
echo ========================================
echo.

REM 检查 JDK
echo [1/5] 检查 JDK...
if "%JAVA_HOME%"=="" (
    echo 错误: JAVA_HOME 环境变量未设置
    echo 请先安装 JDK 17+ 并设置 JAVA_HOME
    pause
    exit /b 1
)

echo JAVA_HOME: %JAVA_HOME%
"%JAVA_HOME%\bin\java.exe" -version
if errorlevel 1 (
    echo 错误: Java 不可用
    pause
    exit /b 1
)

echo.
echo [2/5] 构建 Web 应用...
call npm run build
if errorlevel 1 (
    echo 错误: Web 应用构建失败
    pause
    exit /b 1
)

echo.
echo [3/5] 同步到 Android...
call npx cap sync android
if errorlevel 1 (
    echo 错误: Android 同步失败
    pause
    exit /b 1
)

echo.
echo [4/5] 构建 APK...
cd android
call gradlew.bat assembleDebug
if errorlevel 1 (
    echo 错误: APK 构建失败
    pause
    exit /b 1
)

cd ..

echo.
echo [5/5] 构建完成！
echo ========================================
echo APK 文件位置:
echo android\app\build\outputs\apk\debug\app-debug.apk
echo ========================================
pause