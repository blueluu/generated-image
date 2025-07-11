#!/usr/bin/env node

// 简单的MCP Server测试脚本
// 注意：这个脚本需要在安装依赖并构建项目后运行

import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

console.log("🧪 开始测试 Web Design Image Generator MCP Server...\n");

// 启动MCP Server进程
const serverProcess = spawn("node", [join(projectRoot, "dist/index.js")], {
  stdio: ["pipe", "pipe", "pipe"],
});

let serverReady = false;

serverProcess.stderr.on("data", (data) => {
  const message = data.toString();
  console.log("📡 Server:", message.trim());
  if (message.includes("已启动")) {
    serverReady = true;
    runTests();
  }
});

serverProcess.stdout.on("data", (data) => {
  console.log("📤 Server Output:", data.toString());
});

serverProcess.on("error", (error) => {
  console.error("❌ Server Error:", error);
});

function runTests() {
  console.log("\n🔍 开始功能测试...\n");

  // 测试1: 列出工具
  console.log("测试1: 列出可用工具");
  sendRequest({
    jsonrpc: "2.0",
    id: 1,
    method: "tools/list",
  });

  setTimeout(() => {
    // 测试2: 列出尺寸预设
    console.log("\n测试2: 列出尺寸预设");
    sendRequest({
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: {
        name: "list_size_presets",
        arguments: {},
      },
    });
  }, 1000);

  // 清理
  setTimeout(() => {
    console.log("\n✅ 测试完成，关闭服务器...");
    serverProcess.kill();
    process.exit(0);
  }, 3000);
}

function sendRequest(request) {
  const requestStr = JSON.stringify(request) + "\n";
  console.log("📨 发送请求:", JSON.stringify(request, null, 2));
  serverProcess.stdin.write(requestStr);
}

// 处理进程退出
process.on("SIGINT", () => {
  console.log("\n🛑 收到中断信号，关闭服务器...");
  serverProcess.kill();
  process.exit(0);
});

setTimeout(() => {
  if (!serverReady) {
    console.log("⏰ 服务器启动超时，请检查构建是否成功");
    console.log("💡 请先运行: npm run build");
    serverProcess.kill();
    process.exit(1);
  }
}, 5000);
