#!/bin/bash

# 截历 - 项目初始化脚本
# 在安装 Node.js 后双击运行此脚本

echo "====================================="
echo "  截历 - 项目初始化"
echo "====================================="
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装"
    echo "请先安装 Node.js: https://nodejs.org/"
    read -p "按回车键退出..."
    exit 1
fi

echo "✅ Node.js 版本: $(node -v)"
echo "✅ npm 版本: $(npm -v)"
echo ""

# 安装依赖
echo "📦 安装依赖..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ 依赖安装完成"
else
    echo "❌ 依赖安装失败"
    read -p "按回车键退出..."
    exit 1
fi

echo ""
echo "====================================="
echo "  初始化完成！"
echo "====================================="
echo ""
echo "下一步操作："
echo "1. 开发模式: npm run dev"
echo "2. 添加平台: npm run cap:add:ios 或 npm run cap:add:android"
echo "3. 构建生产: npm run build"
echo ""
echo "详细文档请参考 README.md"
echo ""

read -p "按回车键启动开发服务器..."
npm run dev
