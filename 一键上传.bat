@echo off
chcp 65001 >nul
title 截历 - APK 自动化构建

echo ==================================================
echo   截历 - APK 自动化构建工具
echo ==================================================
echo.

echo [1/3] 打开项目文件夹...
explorer.exe "C:\Users\Administrator\.qclaw\workspace\screenshot-manager"

echo.
echo [2/3] 打开 GitHub 创建仓库页面...
start https://github.com/new

echo.
echo [3/3] 显示快速上传指南...
type "QUICK_UPLOAD.md"

echo.
echo ==================================================
echo   🚀 开始使用！
echo ==================================================
echo.
echo   步骤：
echo   1. 在 GitHub 上创建仓库
echo   2. 点击 "uploading an existing file"
echo   3. 从打开的文件夹中拖拽所有文件
echo   4. 提交后，GitHub 自动构建 APK！
echo.
echo   📥 APK 下载位置：
echo   仓库 -^> Actions -^> 最新构建 -^> Artifacts
echo.
echo ==================================================
pause
