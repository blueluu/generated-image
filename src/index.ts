#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
  CallToolRequest,
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 获取调用项目的根目录路径（用户的项目目录）
const getCallerProjectRoot = () => {
  // 优先使用环境变量中的项目路径
  const envProjectPath =
    process.env.USER_PROJECT_ROOT || process.env.PROJECT_ROOT;
  if (envProjectPath) {
    return envProjectPath;
  }

  const cwd = process.cwd();
  // 如果当前工作目录是根目录或MCP服务器目录，尝试从环境变量获取用户项目路径
  if (
    cwd === "/" ||
    cwd === "\\" ||
    cwd.includes("mcp") ||
    cwd.includes("node_modules")
  ) {
    // 尝试从HOME目录推断用户项目路径
    const homeDir = process.env.HOME || process.env.USERPROFILE;
    if (homeDir) {
      // 默认使用用户桌面作为项目根目录
      return path.join(homeDir, "Desktop");
    }
  }

  return cwd;
};

// 获取输出目录的绝对路径（在调用项目的根目录中）
const getOutputDir = () => {
  const projectRoot = getCallerProjectRoot();
  const outputPath = path.join(projectRoot, "generated-images");
  console.error(`Debug: Project root: ${projectRoot}`);
  console.error(`Debug: Output path: ${outputPath}`);
  console.error(`Debug: __dirname: ${__dirname}`);
  console.error(`Debug: process.cwd(): ${process.cwd()}`);
  return outputPath;
};

// 尺寸预设类型定义
interface SizePreset {
  width: number;
  height: number;
  description: string;
}

// 中文到英文的基础翻译映射
const CHINESE_TO_ENGLISH_MAP: Record<string, string> = {
  // 动物
  猫: "cat",
  小猫: "kitten",
  狗: "dog",
  小狗: "puppy",
  鸟: "bird",
  鱼: "fish",
  兔子: "rabbit",
  熊猫: "panda",
  老虎: "tiger",
  狮子: "lion",

  // 颜色
  红色: "red",
  蓝色: "blue",
  绿色: "green",
  黄色: "yellow",
  黑色: "black",
  白色: "white",
  粉色: "pink",
  紫色: "purple",
  橙色: "orange",
  灰色: "gray",

  // 物品
  房子: "house",
  汽车: "car",
  花: "flower",
  树: "tree",
  山: "mountain",
  海: "ocean",
  天空: "sky",
  太阳: "sun",
  月亮: "moon",
  星星: "star",

  // 风格
  可爱: "cute",
  美丽: "beautiful",
  现代: "modern",
  简约: "minimalist",
  专业: "professional",
  卡通: "cartoon",
  写实: "realistic",
  艺术: "artistic",

  // 场景
  办公室: "office",
  家: "home",
  公园: "park",
  街道: "street",
  森林: "forest",
  海滩: "beach",
  城市: "city",
  乡村: "countryside",

  // 品牌/物品
  耐克: "Nike",
  鞋子: "shoes",
  衣服: "clothes",
  帽子: "hat",
  包: "bag",
  手机: "phone",
  电脑: "computer",
  书: "book",

  // 形容词
  大: "big",
  小: "small",
  高: "tall",
  矮: "short",
  胖: "fat",
  瘦: "thin",
  新: "new",
  旧: "old",
  快: "fast",
  慢: "slow",

  // 动作
  跑: "running",
  走: "walking",
  坐: "sitting",
  站: "standing",
  睡: "sleeping",
  吃: "eating",
  喝: "drinking",
  笑: "smiling",

  // 常用短语
  穿着: "wearing",
  在: "in",
  和: "and",
  的: "",
  一个: "a",
  一只: "a",
  很: "very",
  非常: "very",
  高质量: "high quality",
  高分辨率: "high resolution",
};

// 中文检测和翻译函数
function translateChinesePrompt(prompt: string): {
  translatedPrompt: string;
  isTranslated: boolean;
} {
  // 检测是否包含中文字符
  const chineseRegex = /[\u4e00-\u9fff]/;
  const hasChinese = chineseRegex.test(prompt);

  if (!hasChinese) {
    return { translatedPrompt: prompt, isTranslated: false };
  }

  let translatedPrompt = prompt;

  // 简单的词汇替换翻译
  Object.entries(CHINESE_TO_ENGLISH_MAP).forEach(([chinese, english]) => {
    if (chinese) {
      const regex = new RegExp(chinese, "g");
      translatedPrompt = translatedPrompt.replace(regex, english);
    }
  });

  // 清理多余的空格
  translatedPrompt = translatedPrompt.replace(/\s+/g, " ").trim();

  // 如果翻译后还有中文，添加提示
  if (chineseRegex.test(translatedPrompt)) {
    // 保留原始中文，但添加英文提示
    translatedPrompt = `${translatedPrompt} (Chinese description, may need manual translation for better results)`;
  }

  return { translatedPrompt, isTranslated: true };
}

// 图片生成服务类
class ImageGenerationService {
  private apiKey: string;
  private baseUrl = "https://api-inference.modelscope.cn/v1/images/generations";
  private model = "MusePublic/489_ckpt_FLUX_1";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateImage(
    prompt: string,
    width?: number,
    height?: number
  ): Promise<Buffer> {
    try {
      // 完全按照Python示例的格式，不添加size参数
      const payload = {
        model: this.model,
        prompt: prompt,
      };

      const headers = {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      };

      const response = await axios.post(this.baseUrl, payload, { headers });

      if (!response.data.images || response.data.images.length === 0) {
        throw new Error("No images generated");
      }

      const imageUrl = response.data.images[0].url;
      const imageResponse = await axios.get(imageUrl, {
        responseType: "arraybuffer",
      });

      let imageBuffer = Buffer.from(imageResponse.data);

      // 如果指定了尺寸，使用sharp调整图片大小
      if (width && height) {
        imageBuffer = await sharp(imageBuffer)
          .resize(width, height, { fit: "cover" })
          .jpeg({ quality: 90 })
          .toBuffer();
      }

      return imageBuffer;
    } catch (error) {
      throw new Error(
        `Image generation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}

// 常用的网页设计尺寸预设
const COMMON_SIZES: Record<string, SizePreset> = {
  "hero-banner": { width: 1920, height: 600, description: "网站首页横幅图片" },
  "card-image": { width: 400, height: 300, description: "卡片图片" },
  thumbnail: { width: 200, height: 150, description: "缩略图" },
  avatar: { width: 100, height: 100, description: "头像图片" },
  "blog-featured": { width: 800, height: 450, description: "博客特色图片" },
  "product-image": { width: 500, height: 500, description: "产品展示图片" },
  "gallery-item": { width: 300, height: 200, description: "画廊项目图片" },
  background: { width: 1920, height: 1080, description: "背景图片" },
};

// API Key 管理
let storedApiKey: string | null = null;

// 获取API Key配置文件路径
const getApiKeyConfigPath = () => {
  const projectRoot = getCallerProjectRoot();
  return path.join(projectRoot, ".mcp-image-generator-config.json");
};

// 保存API Key到配置文件
async function saveApiKey(apiKey: string): Promise<void> {
  const configPath = getApiKeyConfigPath();
  const config = { apiKey, timestamp: Date.now() };
  await fs.writeFile(configPath, JSON.stringify(config, null, 2));
  storedApiKey = apiKey;
}

// 从配置文件加载API Key
async function loadApiKey(): Promise<string | null> {
  if (storedApiKey) {
    return storedApiKey;
  }

  try {
    const configPath = getApiKeyConfigPath();
    const configData = await fs.readFile(configPath, "utf-8");
    const config = JSON.parse(configData);
    storedApiKey = config.apiKey;
    return storedApiKey;
  } catch (error) {
    return null;
  }
}

// 获取API Key（优先使用存储的，否则提示用户设置）
async function getApiKey(providedApiKey?: string): Promise<string> {
  if (providedApiKey) {
    // 如果用户提供了API Key，保存它
    await saveApiKey(providedApiKey);
    return providedApiKey;
  }

  const savedApiKey = await loadApiKey();
  if (savedApiKey) {
    return savedApiKey;
  }

  throw new Error(
    "请先设置ModelScope API密钥。使用 set_api_key 工具设置API密钥，或在调用时提供 api_key 参数。"
  );
}

// 创建MCP服务器
const server = new Server(
  {
    name: "web-design-image-generator",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 工具列表
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "set_api_key",
        description: "设置ModelScope API密钥，设置后可在后续调用中自动使用",
        inputSchema: {
          type: "object",
          properties: {
            api_key: {
              type: "string",
              description: "ModelScope API密钥",
            },
          },
          required: ["api_key"],
        },
      },
      {
        name: "generate_web_image",
        description: "为网页设计生成AI图片，支持自定义尺寸和预设尺寸",
        inputSchema: {
          type: "object",
          properties: {
            prompt: {
              type: "string",
              description: "图片生成的描述prompt（支持中文，会自动翻译为英文）",
            },
            api_key: {
              type: "string",
              description: "ModelScope API密钥（可选，如果已设置则自动使用）",
            },
            size_preset: {
              type: "string",
              enum: Object.keys(COMMON_SIZES),
              description: "预设尺寸类型",
            },
            width: {
              type: "number",
              description: "自定义宽度（像素）",
            },
            height: {
              type: "number",
              description: "自定义高度（像素）",
            },
            filename: {
              type: "string",
              description: "保存的文件名（可选，默认自动生成）",
            },
          },
          required: ["prompt"],
        },
      },
      {
        name: "list_size_presets",
        description: "列出所有可用的网页设计图片尺寸预设",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "generate_multiple_images",
        description: "批量生成多张网页设计图片",
        inputSchema: {
          type: "object",
          properties: {
            images: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  prompt: { type: "string" },
                  size_preset: {
                    type: "string",
                    enum: Object.keys(COMMON_SIZES),
                  },
                  width: { type: "number" },
                  height: { type: "number" },
                  filename: { type: "string" },
                },
                required: ["prompt"],
              },
              description: "要生成的图片列表",
            },
            api_key: {
              type: "string",
              description: "ModelScope API密钥（可选，如果已设置则自动使用）",
            },
          },
          required: ["images"],
        },
      },
    ] as Tool[],
  };
});

// 工具调用处理
server.setRequestHandler(
  CallToolRequestSchema,
  async (request: CallToolRequest) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case "set_api_key":
          const { api_key: newApiKey } = args as { api_key: string };
          if (!newApiKey) {
            throw new Error("api_key是必需的参数");
          }

          await saveApiKey(newApiKey);
          return {
            content: [
              {
                type: "text",
                text: `✅ API密钥设置成功！\n现在可以在后续调用中自动使用此密钥。`,
              },
            ],
          };

        case "list_size_presets":
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(COMMON_SIZES, null, 2),
              },
            ],
          };

        case "generate_web_image":
          const { prompt, api_key, size_preset, width, height, filename } =
            args as {
              prompt: string;
              api_key?: string;
              size_preset?: string;
              width?: number;
              height?: number;
              filename?: string;
            };

          if (!prompt) {
            throw new Error("prompt是必需的参数");
          }

          // 获取API Key（优先使用提供的，否则使用存储的）
          const finalApiKey = await getApiKey(api_key);

          // 处理中文prompt翻译
          const { translatedPrompt, isTranslated } =
            translateChinesePrompt(prompt);

          // 确定图片尺寸
          let finalWidth: number | undefined;
          let finalHeight: number | undefined;

          if (size_preset && COMMON_SIZES[size_preset]) {
            finalWidth = COMMON_SIZES[size_preset].width;
            finalHeight = COMMON_SIZES[size_preset].height;
          } else if (width && height) {
            finalWidth = width;
            finalHeight = height;
          }

          const imageService = new ImageGenerationService(finalApiKey);
          const imageBuffer = await imageService.generateImage(
            translatedPrompt,
            finalWidth,
            finalHeight
          );

          // 生成文件名
          const finalFilename =
            filename || `web-image-${uuidv4().slice(0, 8)}.jpg`;

          // 确保输出目录存在（使用绝对路径）
          const outputDir = getOutputDir();
          await fs.mkdir(outputDir, { recursive: true });

          const filePath = path.join(outputDir, finalFilename);
          await fs.writeFile(filePath, imageBuffer);

          const sizeInfo = size_preset
            ? `${COMMON_SIZES[size_preset].description} (${finalWidth}x${finalHeight})`
            : finalWidth && finalHeight
            ? `${finalWidth}x${finalHeight}`
            : "原始尺寸";

          return {
            content: [
              {
                type: "text",
                text: `✅ 图片生成成功！
📝 原始描述: ${prompt}${isTranslated ? `\n🔄 翻译后: ${translatedPrompt}` : ""}
📐 尺寸: ${sizeInfo}
💾 文件路径: ${filePath}
📊 文件大小: ${(imageBuffer.length / 1024).toFixed(2)} KB`,
              },
              {
                type: "image",
                data: imageBuffer.toString("base64"),
                mimeType: "image/jpeg",
              },
            ],
          };

        case "generate_multiple_images":
          const { images, api_key: batchApiKey } = args as {
            images: Array<{
              prompt: string;
              size_preset?: string;
              width?: number;
              height?: number;
              filename?: string;
            }>;
            api_key?: string;
          };

          if (!images || !Array.isArray(images) || images.length === 0) {
            throw new Error("images数组不能为空");
          }

          // 获取API Key（优先使用提供的，否则使用存储的）
          const finalBatchApiKey = await getApiKey(batchApiKey);

          const batchImageService = new ImageGenerationService(
            finalBatchApiKey
          );
          const results = [];

          // 确保输出目录存在（使用绝对路径）
          const batchOutputDir = getOutputDir();
          await fs.mkdir(batchOutputDir, { recursive: true });

          for (let i = 0; i < images.length; i++) {
            const imageConfig = images[i];

            try {
              // 确定图片尺寸
              let imgWidth: number | undefined;
              let imgHeight: number | undefined;

              if (
                imageConfig.size_preset &&
                COMMON_SIZES[imageConfig.size_preset]
              ) {
                imgWidth = COMMON_SIZES[imageConfig.size_preset].width;
                imgHeight = COMMON_SIZES[imageConfig.size_preset].height;
              } else if (imageConfig.width && imageConfig.height) {
                imgWidth = imageConfig.width;
                imgHeight = imageConfig.height;
              }

              const imgBuffer = await batchImageService.generateImage(
                imageConfig.prompt,
                imgWidth,
                imgHeight
              );

              const imgFilename =
                imageConfig.filename ||
                `batch-image-${i + 1}-${uuidv4().slice(0, 8)}.jpg`;
              const imgFilePath = path.join(batchOutputDir, imgFilename);
              await fs.writeFile(imgFilePath, imgBuffer);

              const imgSizeInfo = imageConfig.size_preset
                ? `${
                    COMMON_SIZES[imageConfig.size_preset].description
                  } (${imgWidth}x${imgHeight})`
                : imgWidth && imgHeight
                ? `${imgWidth}x${imgHeight}`
                : "原始尺寸";

              results.push({
                index: i + 1,
                prompt: imageConfig.prompt,
                size: imgSizeInfo,
                filepath: imgFilePath,
                filesize: `${(imgBuffer.length / 1024).toFixed(2)} KB`,
                success: true,
              });
            } catch (error) {
              results.push({
                index: i + 1,
                prompt: imageConfig.prompt,
                error: error instanceof Error ? error.message : "Unknown error",
                success: false,
              });
            }
          }

          const successCount = results.filter((r) => r.success).length;
          const failCount = results.length - successCount;

          return {
            content: [
              {
                type: "text",
                text: `🎯 批量图片生成完成！
✅ 成功: ${successCount}张
❌ 失败: ${failCount}张

详细结果:
${results
  .map((r) =>
    r.success
      ? `${r.index}. ✅ ${r.prompt}\n   📐 ${r.size}\n   💾 ${r.filepath}\n   📊 ${r.filesize}`
      : `${r.index}. ❌ ${r.prompt}\n   🚫 错误: ${r.error}`
  )
  .join("\n\n")}`,
              },
            ],
          };

        default:
          throw new Error(`未知的工具: ${name}`);
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ 错误: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
          },
        ],
        isError: true,
      };
    }
  }
);

// 启动服务器
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Web Design Image Generator MCP Server 已启动");
}

main().catch((error) => {
  console.error("服务器启动失败:", error);
  process.exit(1);
});
