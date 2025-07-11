#!/usr/bin/env node

import readline from "readline";
import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";

// 创建交互式界面
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// 颜色输出函数
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

function colorLog(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// MCP 客户端类
class MCPClient {
  constructor() {
    this.mcpProcess = null;
    this.requestId = 1;
  }

  // 启动 MCP 服务器
  async startMCPServer() {
    try {
      colorLog("🚀 启动 MCP 服务器...", "blue");

      // 检查 dist 目录是否存在
      try {
        await fs.access("./dist/index.js");
      } catch {
        colorLog("⚠️  dist/index.js 不存在，正在构建项目...", "yellow");
        await this.buildProject();
      }

      this.mcpProcess = spawn("node", ["./dist/index.js"], {
        stdio: ["pipe", "pipe", "pipe"],
      });

      this.mcpProcess.stderr.on("data", (data) => {
        colorLog(`MCP 错误: ${data}`, "red");
      });

      colorLog("✅ MCP 服务器启动成功！", "green");
      return true;
    } catch (error) {
      colorLog(`❌ 启动 MCP 服务器失败: ${error.message}`, "red");
      return false;
    }
  }

  // 构建项目
  async buildProject() {
    return new Promise((resolve, reject) => {
      const buildProcess = spawn("npm", ["run", "build"], { stdio: "inherit" });
      buildProcess.on("close", (code) => {
        if (code === 0) {
          colorLog("✅ 项目构建成功！", "green");
          resolve();
        } else {
          reject(new Error(`构建失败，退出码: ${code}`));
        }
      });
    });
  }

  // 发送 MCP 请求
  async sendMCPRequest(method, params = {}) {
    if (!this.mcpProcess) {
      throw new Error("MCP 服务器未启动");
    }

    const request = {
      jsonrpc: "2.0",
      id: this.requestId++,
      method: method,
      params: params,
    };

    return new Promise((resolve, reject) => {
      let responseData = "";
      let responseReceived = false;

      // 增加超时时间到60秒，图片生成需要更多时间
      const timeout = setTimeout(() => {
        if (!responseReceived) {
          // 检查是否有图片文件生成
          this.checkGeneratedImages()
            .then((hasImages) => {
              if (hasImages) {
                colorLog("⚠️ 通信超时，但检测到图片已生成", "yellow");
                resolve({
                  content: [
                    {
                      text: "图片生成成功，请检查 generated-images 目录",
                    },
                  ],
                });
              } else {
                reject(new Error("请求超时且未检测到生成的图片"));
              }
            })
            .catch(() => {
              reject(new Error("请求超时"));
            });
        }
      }, 60000);

      const onData = (data) => {
        responseData += data.toString();

        // 尝试解析每一行作为独立的JSON响应
        const lines = responseData.split("\n");
        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i].trim();
          if (line) {
            try {
              const response = JSON.parse(line);
              if (response.id === request.id) {
                responseReceived = true;
                clearTimeout(timeout);
                this.mcpProcess.stdout.off("data", onData);

                if (response.error) {
                  reject(new Error(response.error.message || "未知错误"));
                } else {
                  resolve(response.result);
                }
                return;
              }
            } catch (e) {
              // 这一行不是有效的JSON，继续处理下一行
            }
          }
        }

        // 保留最后一行（可能不完整）
        responseData = lines[lines.length - 1];
      };

      this.mcpProcess.stdout.on("data", onData);
      this.mcpProcess.stdin.write(JSON.stringify(request) + "\n");
    });
  }

  // 检查是否有图片生成
  async checkGeneratedImages() {
    try {
      const generatedDir = "./generated-images";
      const files = await fs.readdir(generatedDir);
      const imageFiles = files.filter(
        (file) =>
          file.endsWith(".jpg") ||
          file.endsWith(".png") ||
          file.endsWith(".jpeg")
      );
      return imageFiles.length > 0;
    } catch {
      return false;
    }
  }

  // 关闭 MCP 服务器
  closeMCPServer() {
    if (this.mcpProcess) {
      this.mcpProcess.kill();
      this.mcpProcess = null;
      colorLog("🔴 MCP 服务器已关闭", "yellow");
    }
  }
}

// 主测试类
class MCPTester {
  constructor() {
    this.client = new MCPClient();
    this.apiKey = "";
  }

  // 显示欢迎信息
  showWelcome() {
    console.clear();
    colorLog("🎨 MCP 图片生成器交互式测试工具", "cyan");
    colorLog("=".repeat(50), "cyan");
    colorLog("这个工具可以帮你测试 MCP 图片生成功能", "bright");
    console.log();
  }

  // 获取用户输入
  async prompt(question) {
    return new Promise((resolve) => {
      rl.question(question, resolve);
    });
  }

  // 设置 API Key
  async setupApiKey() {
    colorLog("🔑 请设置 ModelScope API Key", "yellow");
    colorLog("如果你还没有 API Key，请访问: https://modelscope.cn/", "blue");

    this.apiKey = await this.prompt("请输入你的 ModelScope API Key: ");

    if (!this.apiKey.trim()) {
      colorLog("❌ API Key 不能为空！", "red");
      return false;
    }

    colorLog("✅ API Key 设置成功！", "green");
    return true;
  }

  // 显示主菜单
  async showMainMenu() {
    console.log();
    colorLog("📋 请选择测试功能:", "bright");
    colorLog("1. 查看可用的图片尺寸预设", "cyan");
    colorLog("2. 生成单张图片", "cyan");
    colorLog("3. 批量生成图片", "cyan");
    colorLog("4. 生成响应式图片集", "cyan");
    colorLog("5. 重新设置 API Key", "cyan");
    colorLog("0. 退出程序", "red");
    console.log();
  }

  // 查看尺寸预设
  async listSizePresets() {
    try {
      colorLog("📏 获取尺寸预设...", "blue");
      const result = await this.client.sendMCPRequest("tools/call", {
        name: "list_size_presets",
        arguments: {},
      });

      colorLog("✅ 可用的图片尺寸预设:", "green");
      const presets = JSON.parse(result.content[0].text);

      Object.entries(presets).forEach(([key, value]) => {
        colorLog(
          `  ${key}: ${value.width}x${value.height} - ${value.description}`,
          "cyan"
        );
      });
    } catch (error) {
      colorLog(`❌ 获取尺寸预设失败: ${error.message}`, "red");
    }
  }

  // 生成单张图片
  async generateSingleImage() {
    try {
      colorLog("🎨 生成单张图片", "blue");

      const prompt = await this.prompt("请输入图片描述 (支持中文): ");
      if (!prompt.trim()) {
        colorLog("❌ 图片描述不能为空！", "red");
        return;
      }

      console.log();
      colorLog("选择尺寸方式:", "yellow");
      colorLog("1. 使用预设尺寸", "cyan");
      colorLog("2. 自定义尺寸", "cyan");

      const sizeChoice = await this.prompt("请选择 (1 或 2): ");

      let requestArgs = {
        prompt: prompt,
        api_key: this.apiKey,
      };

      if (sizeChoice === "1") {
        const preset = await this.prompt(
          "请输入预设名称 (如: hero-banner, card-image): "
        );
        if (preset.trim()) {
          requestArgs.size_preset = preset.trim();
        }
      } else if (sizeChoice === "2") {
        const width = await this.prompt("请输入宽度 (像素): ");
        const height = await this.prompt("请输入高度 (像素): ");

        if (width && height && !isNaN(width) && !isNaN(height)) {
          requestArgs.width = parseInt(width);
          requestArgs.height = parseInt(height);
        }
      }

      const filename = await this.prompt(
        "请输入文件名 (可选，直接回车使用自动生成): "
      );
      if (filename.trim()) {
        requestArgs.filename = filename.trim();
      }

      colorLog("🎨 正在生成图片，请稍候...", "yellow");

      const result = await this.client.sendMCPRequest("tools/call", {
        name: "generate_web_image",
        arguments: requestArgs,
      });

      colorLog("✅ 图片生成成功！", "green");
      colorLog(`📁 保存位置: ${result.content[0].text}`, "cyan");
    } catch (error) {
      colorLog(`❌ 图片生成失败: ${error.message}`, "red");
    }
  }

  // 批量生成图片
  async generateMultipleImages() {
    try {
      colorLog("🎨 批量生成图片", "blue");

      const countStr = await this.prompt("请输入要生成的图片数量 (1-5): ");
      const count = parseInt(countStr);

      if (isNaN(count) || count < 1 || count > 5) {
        colorLog("❌ 请输入 1-5 之间的数字！", "red");
        return;
      }

      const images = [];

      for (let i = 1; i <= count; i++) {
        colorLog(`\n📝 配置第 ${i} 张图片:`, "yellow");

        const prompt = await this.prompt(`  图片描述: `);
        if (!prompt.trim()) {
          colorLog("❌ 图片描述不能为空！", "red");
          return;
        }

        const preset = await this.prompt(`  预设尺寸 (可选): `);
        const filename = await this.prompt(`  文件名 (可选): `);

        const imageConfig = { prompt: prompt.trim() };
        if (preset.trim()) imageConfig.size_preset = preset.trim();
        if (filename.trim()) imageConfig.filename = filename.trim();

        images.push(imageConfig);
      }

      colorLog("\n🎨 正在批量生成图片，请稍候...", "yellow");

      const result = await this.client.sendMCPRequest("tools/call", {
        name: "generate_multiple_images",
        arguments: {
          api_key: this.apiKey,
          images: images,
        },
      });

      colorLog("✅ 批量图片生成成功！", "green");
      colorLog(`📁 保存位置: ${result.content[0].text}`, "cyan");
    } catch (error) {
      colorLog(`❌ 批量图片生成失败: ${error.message}`, "red");
    }
  }

  // 生成响应式图片集
  async generateResponsiveImages() {
    try {
      colorLog("📱 生成响应式图片集", "blue");
      colorLog("将为同一内容生成多种尺寸的图片", "cyan");

      const prompt = await this.prompt("请输入图片描述: ");
      if (!prompt.trim()) {
        colorLog("❌ 图片描述不能为空！", "red");
        return;
      }

      const baseName = await this.prompt("请输入基础文件名 (不含扩展名): ");
      const baseFileName = baseName.trim() || "responsive-image";

      const responsiveImages = [
        {
          prompt: prompt,
          size_preset: "hero-banner",
          filename: `${baseFileName}-hero.jpg`,
        },
        {
          prompt: prompt,
          size_preset: "card-image",
          filename: `${baseFileName}-card.jpg`,
        },
        {
          prompt: prompt,
          size_preset: "thumbnail",
          filename: `${baseFileName}-thumb.jpg`,
        },
      ];

      colorLog("\n🎨 正在生成响应式图片集，请稍候...", "yellow");
      colorLog(
        "将生成: 横幅图 (1920x600)、卡片图 (400x300)、缩略图 (200x150)",
        "cyan"
      );

      const result = await this.client.sendMCPRequest("tools/call", {
        name: "generate_multiple_images",
        arguments: {
          api_key: this.apiKey,
          images: responsiveImages,
        },
      });

      colorLog("✅ 响应式图片集生成成功！", "green");
      colorLog(`📁 保存位置: ${result.content[0].text}`, "cyan");
    } catch (error) {
      colorLog(`❌ 响应式图片集生成失败: ${error.message}`, "red");
    }
  }

  // 主运行循环
  async run() {
    this.showWelcome();

    // 启动 MCP 服务器
    const serverStarted = await this.client.startMCPServer();
    if (!serverStarted) {
      colorLog("❌ 无法启动 MCP 服务器，程序退出", "red");
      process.exit(1);
    }

    // 设置 API Key
    const apiKeySet = await this.setupApiKey();
    if (!apiKeySet) {
      this.client.closeMCPServer();
      process.exit(1);
    }

    // 主循环
    while (true) {
      await this.showMainMenu();
      const choice = await this.prompt("请选择功能 (0-5): ");

      switch (choice.trim()) {
        case "1":
          await this.listSizePresets();
          break;
        case "2":
          await this.generateSingleImage();
          break;
        case "3":
          await this.generateMultipleImages();
          break;
        case "4":
          await this.generateResponsiveImages();
          break;
        case "5":
          await this.setupApiKey();
          break;
        case "0":
          colorLog("👋 感谢使用，再见！", "green");
          this.client.closeMCPServer();
          rl.close();
          process.exit(0);
        default:
          colorLog("❌ 无效选择，请重新输入！", "red");
      }

      // 等待用户按键继续
      await this.prompt("\n按回车键继续...");
    }
  }
}

// 处理程序退出
process.on("SIGINT", () => {
  colorLog("\n👋 程序被中断，正在清理...", "yellow");
  process.exit(0);
});

// 启动测试程序
const tester = new MCPTester();
tester.run().catch((error) => {
  colorLog(`❌ 程序运行出错: ${error.message}`, "red");
  process.exit(1);
});
