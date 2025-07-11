#!/bin/bash

# Web Design Image Generator MCP Server 启动脚本

echo "🚀 启动 Web Design Image Generator MCP Server..."

# 检查是否已构建
if [ ! -d "dist" ]; then
    echo "📦 首次运行，正在构建项目..."
    npm run build
fi

# 检查构建是否成功
if [ ! -f "dist/index.js" ]; then
    echo "❌ 构建失败，请检查错误信息"
    exit 1
fi

echo "✅ 启动服务器..."
node dist/index.js
