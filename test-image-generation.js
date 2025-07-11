import { spawn } from "child_process";

// 测试单张图片生成
async function testImageGeneration() {
  console.log("开始测试图片生成...");

  const mcpServer = spawn("node", ["dist/index.js"], {
    stdio: ["pipe", "pipe", "pipe"],
  });

  // 监听错误输出（调试信息）
  mcpServer.stderr.on("data", (data) => {
    console.log("Debug:", data.toString());
  });

  // 发送工具调用请求
  const request = {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: {
      name: "generate_web_image",
      arguments: {
        prompt:
          "A fluffy orange tabby cat with bright green eyes sitting gracefully",
        api_key: "81269f5e-21a6-4244-aca1-ea95b884692d",
        size_preset: "card-image",
        filename: "test-cat.jpg",
      },
    },
  };

  mcpServer.stdin.write(JSON.stringify(request) + "\n");

  mcpServer.stdout.on("data", (data) => {
    console.log("Response:", data.toString());
    mcpServer.kill();
  });

  mcpServer.on("error", (error) => {
    console.error("Process error:", error);
  });

  mcpServer.on("close", (code) => {
    console.log(`Process exited with code ${code}`);
  });
}

testImageGeneration().catch(console.error);
