@echo off
chcp 65001 >nul
echo =====================================
echo   截历 - 项目初始化
echo =====================================
echo.

:: 检查 Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js 未安装
    echo 请先安装 Node.js: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js 版本: 
node -v
echo ✅ npm 版本: 
npm -v
echo.

:: 安装依赖
echo 📦 安装依赖...
npm install

if %errorlevel% equ 0 (
    echo ✅ 依赖安装完成
) else (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)

echo.
echo =====================================
echo   初始化完成！
echo =====================================
echo.
echo 下一步操作：
echo 1. 开发模式: npm run dev
echo 2. 添加平台: npm run cap:add:ios 或 npm run cap:add:android
echo 3. 构建生产: npm run build
echo.
echo 详细文档请参考 README.md
echo.

pause
npm run dev
