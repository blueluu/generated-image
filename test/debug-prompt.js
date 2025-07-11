#!/usr/bin/env node

// Prompt调试工具 - 分析中文翻译效果
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import readline from "readline";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

console.log("🔍 Prompt调试工具\n");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// 模拟翻译功能（与服务器代码一致）
const CHINESE_TO_ENGLISH_MAP = {
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

function translateChinesePrompt(prompt) {
  const chineseRegex = /[\u4e00-\u9fff]/;
  const hasChinese = chineseRegex.test(prompt);

  if (!hasChinese) {
    return { translatedPrompt: prompt, isTranslated: false };
  }

  let translatedPrompt = prompt;
  const translatedWords = [];
  const untranslatedWords = [];

  // 记录翻译过程
  Object.entries(CHINESE_TO_ENGLISH_MAP).forEach(([chinese, english]) => {
    if (chinese && translatedPrompt.includes(chinese)) {
      translatedWords.push(`${chinese} → ${english}`);
      const regex = new RegExp(chinese, "g");
      translatedPrompt = translatedPrompt.replace(regex, english);
    }
  });

  // 找出未翻译的中文词
  const remainingChinese = translatedPrompt.match(/[\u4e00-\u9fff]+/g);
  if (remainingChinese) {
    untranslatedWords.push(...remainingChinese);
  }

  // 清理多余的空格
  translatedPrompt = translatedPrompt.replace(/\s+/g, " ").trim();

  return {
    translatedPrompt,
    isTranslated: true,
    translatedWords,
    untranslatedWords,
  };
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function debugPrompt() {
  try {
    console.log("🎯 这个工具帮助您分析prompt翻译效果\n");

    while (true) {
      const prompt = await askQuestion(
        "📝 请输入您的中文描述 (输入 'exit' 退出): "
      );

      if (prompt.toLowerCase() === "exit") {
        break;
      }

      if (!prompt.trim()) {
        console.log("❌ 请输入有效的描述\n");
        continue;
      }

      console.log("\n" + "=".repeat(60));
      console.log("🔍 翻译分析结果:");
      console.log("=".repeat(60));

      const result = translateChinesePrompt(prompt);

      console.log(`📝 原始中文: ${prompt}`);
      console.log(`🔄 翻译结果: ${result.translatedPrompt}`);

      if (result.translatedWords.length > 0) {
        console.log("\n✅ 成功翻译的词汇:");
        result.translatedWords.forEach((word) => console.log(`   • ${word}`));
      }

      if (result.untranslatedWords.length > 0) {
        console.log("\n⚠️  未翻译的词汇:");
        result.untranslatedWords.forEach((word) =>
          console.log(`   • ${word} (需要手动翻译)`)
        );
      }

      // 分析prompt质量
      console.log("\n📊 Prompt质量分析:");

      const hasStyle =
        /cartoon|realistic|professional|modern|cute|beautiful|artistic/i.test(
          result.translatedPrompt
        );
      const hasQuality = /high quality|detailed|high resolution/i.test(
        result.translatedPrompt
      );
      const hasColor =
        /red|blue|green|yellow|orange|purple|pink|black|white|gray/i.test(
          result.translatedPrompt
        );
      const hasAction =
        /sitting|standing|running|walking|wearing|eating|drinking|smiling/i.test(
          result.translatedPrompt
        );

      console.log(`   • 包含风格描述: ${hasStyle ? "✅" : "❌"}`);
      console.log(`   • 包含质量要求: ${hasQuality ? "✅" : "❌"}`);
      console.log(`   • 包含颜色信息: ${hasColor ? "✅" : "❌"}`);
      console.log(`   • 包含动作描述: ${hasAction ? "✅" : "❌"}`);

      // 提供改进建议
      console.log("\n💡 改进建议:");

      if (!hasStyle) {
        console.log("   • 添加风格描述，如：卡通风格、写实风格、现代风格");
      }

      if (!hasQuality) {
        console.log("   • 添加质量要求，如：高质量、高分辨率");
      }

      if (result.untranslatedWords.length > 0) {
        console.log("   • 以下词汇建议用英文替换:");
        result.untranslatedWords.forEach((word) => {
          console.log(`     - "${word}" 可能需要查找对应的英文词汇`);
        });
      }

      // 提供优化版本
      let optimizedPrompt = result.translatedPrompt;
      if (!hasQuality) {
        optimizedPrompt += ", high quality";
      }
      if (!hasStyle && !optimizedPrompt.includes("style")) {
        optimizedPrompt += ", detailed";
      }

      console.log(`\n🚀 优化建议版本: ${optimizedPrompt}`);

      console.log("\n" + "=".repeat(60) + "\n");
    }
  } catch (error) {
    console.error("❌ 调试失败:", error.message);
  } finally {
    rl.close();
  }
}

// 处理进程退出
process.on("SIGINT", () => {
  console.log("\n🛑 调试中断");
  rl.close();
  process.exit(0);
});

// 开始调试
debugPrompt();
