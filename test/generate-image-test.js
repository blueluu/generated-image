#!/usr/bin/env node

// 图片生成测试脚本
// 这个脚本演示如何与MCP Server交互生成图片

import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import readline from "readline";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

console.log("🎨 Web Design Image Generator 测试工具\n");

// 创建命令行接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// 启动MCP Server
let serverProcess;

async function startServer() {
  console.log("🚀 启动MCP Server...");
  serverProcess = spawn("node", [join(projectRoot, "dist/index.js")], {
    stdio: ["pipe", "pipe", "pipe"],
  });

  return new Promise((resolve, reject) => {
    serverProcess.stderr.on("data", (data) => {
      const message = data.toString();
      if (message.includes("已启动")) {
        console.log("✅ MCP Server 启动成功!\n");
        resolve();
      }
    });

    serverProcess.on("error", reject);

    setTimeout(() => {
      reject(new Error("服务器启动超时"));
    }, 5000);
  });
}

function sendRequest(request) {
  return new Promise((resolve) => {
    const requestStr = JSON.stringify(request) + "\n";

    const responseHandler = (data) => {
      try {
        const response = JSON.parse(data.toString());
        serverProcess.stdout.removeListener("data", responseHandler);
        resolve(response);
      } catch (error) {
        // 忽略解析错误，继续等待
      }
    };

    serverProcess.stdout.on("data", responseHandler);
    serverProcess.stdin.write(requestStr);
  });
}

async function testImageGeneration() {
  try {
    await startServer();

    console.log("📋 可用的尺寸预设:");
    console.log("1. hero-banner (1920x600) - 网站横幅");
    console.log("2. card-image (400x300) - 卡片图片");
    console.log("3. thumbnail (200x150) - 缩略图");
    console.log("4. avatar (100x100) - 头像");
    console.log("5. blog-featured (800x450) - 博客特色图");
    console.log("6. product-image (500x500) - 产品图片");
    console.log("7. gallery-item (300x200) - 画廊图片");
    console.log("8. background (1920x1080) - 背景图片\n");

    // 获取API密钥
    const apiKey = await askQuestion("请输入您的ModelScope API密钥: ");
    if (!apiKey.trim()) {
      console.log("❌ API密钥不能为空");
      process.exit(1);
    }

    // 获取图片描述
    const prompt =
      (await askQuestion("请输入图片描述 (英文): ")) ||
      "A beautiful modern website hero banner with blue gradient background";

    // 获取尺寸预设
    const sizePreset =
      (await askQuestion("选择尺寸预设 (输入名称，如 hero-banner): ")) ||
      "card-image";

    console.log("\n🎨 开始生成图片...");
    console.log(`📝 描述: ${prompt}`);
    console.log(`📐 尺寸: ${sizePreset}`);
    console.log("⏳ 请稍等，这可能需要30-60秒...\n");

    // 发送图片生成请求
    const response = await sendRequest({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: {
        name: "generate_web_image",
        arguments: {
          prompt: prompt,
          api_key: apiKey,
          size_preset: sizePreset,
          filename: `test-${Date.now()}.jpg`,
        },
      },
    });

    if (response.result && response.result.content) {
      const textContent = response.result.content.find(
        (c) => c.type === "text"
      );
      if (textContent) {
        console.log("✅ 图片生成成功!");
        console.log(textContent.text);
      }

      const imageContent = response.result.content.find(
        (c) => c.type === "image"
      );
      if (imageContent) {
        console.log("\n📸 图片已生成并保存到 generated-images 目录");
        console.log("🖼️  图片数据已返回 (base64编码)");
      }
    } else if (response.result && response.result.isError) {
      console.log("❌ 生成失败:", response.result.content[0].text);
    } else {
      console.log("❓ 未知响应:", JSON.stringify(response, null, 2));
    }
  } catch (error) {
    console.error("❌ 测试失败:", error.message);
  } finally {
    if (serverProcess) {
      serverProcess.kill();
    }
    rl.close();
  }
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

// 处理进程退出
process.on("SIGINT", () => {
  console.log("\n🛑 测试中断");
  if (serverProcess) {
    serverProcess.kill();
  }
  rl.close();
  process.exit(0);
});

// 开始测试
testImageGeneration();
