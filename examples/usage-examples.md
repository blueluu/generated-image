# 使用示例

## 基础使用

### 1. 生成网站横幅图片

```json
{
  "tool": "generate_web_image",
  "arguments": {
    "prompt": "Modern tech startup website hero banner with gradient blue background, clean design, professional look",
    "api_key": "your-modelscope-api-key",
    "size_preset": "hero-banner"
  }
}
```

### 2. 生成产品卡片图片

```json
{
  "tool": "generate_web_image",
  "arguments": {
    "prompt": "Elegant smartphone product showcase on white background, minimalist style",
    "api_key": "your-modelscope-api-key",
    "size_preset": "product-image",
    "filename": "smartphone-product.jpg"
  }
}
```

### 3. 自定义尺寸图片

```json
{
  "tool": "generate_web_image",
  "arguments": {
    "prompt": "Cozy coffee shop interior with warm lighting",
    "api_key": "your-modelscope-api-key",
    "width": 600,
    "height": 400,
    "filename": "coffee-shop-custom.jpg"
  }
}
```

## 批量生成示例

### 电商网站图片套装

```json
{
  "tool": "generate_multiple_images",
  "arguments": {
    "api_key": "your-modelscope-api-key",
    "images": [
      {
        "prompt": "E-commerce website hero banner with shopping theme, modern design",
        "size_preset": "hero-banner",
        "filename": "ecommerce-hero.jpg"
      },
      {
        "prompt": "Fashion clothing product on model, studio lighting",
        "size_preset": "product-image",
        "filename": "fashion-product-1.jpg"
      },
      {
        "prompt": "Electronics gadget product shot, clean white background",
        "size_preset": "product-image",
        "filename": "electronics-product.jpg"
      },
      {
        "prompt": "Customer testimonial avatar, professional headshot",
        "size_preset": "avatar",
        "filename": "customer-avatar.jpg"
      }
    ]
  }
}
```

### 博客网站图片套装

```json
{
  "tool": "generate_multiple_images",
  "arguments": {
    "api_key": "your-modelscope-api-key",
    "images": [
      {
        "prompt": "Technology blog featured image, futuristic digital concept",
        "size_preset": "blog-featured",
        "filename": "tech-blog-featured.jpg"
      },
      {
        "prompt": "Author profile picture, professional writer portrait",
        "size_preset": "avatar",
        "filename": "author-avatar.jpg"
      },
      {
        "prompt": "Article thumbnail about artificial intelligence",
        "size_preset": "thumbnail",
        "filename": "ai-article-thumb.jpg"
      },
      {
        "prompt": "Programming code on screen, developer workspace",
        "size_preset": "card-image",
        "filename": "programming-card.jpg"
      }
    ]
  }
}
```

## 高级用法

### 1. 查看可用尺寸预设

```json
{
  "tool": "list_size_presets",
  "arguments": {}
}
```

### 2. 生成响应式图片集

为同一内容生成不同尺寸的图片：

```json
{
  "tool": "generate_multiple_images",
  "arguments": {
    "api_key": "your-modelscope-api-key",
    "images": [
      {
        "prompt": "Beautiful landscape mountain view at sunset",
        "size_preset": "hero-banner",
        "filename": "landscape-hero.jpg"
      },
      {
        "prompt": "Beautiful landscape mountain view at sunset",
        "size_preset": "card-image",
        "filename": "landscape-card.jpg"
      },
      {
        "prompt": "Beautiful landscape mountain view at sunset",
        "size_preset": "thumbnail",
        "filename": "landscape-thumb.jpg"
      }
    ]
  }
}
```

## Prompt 编写技巧

### 好的 Prompt 示例

1. **具体描述**: "Modern minimalist office workspace with MacBook, coffee cup, and plants on white desk"
2. **风格指定**: "Watercolor illustration of a peaceful garden scene"
3. **情感表达**: "Warm and inviting living room with soft lighting and comfortable furniture"
4. **技术规格**: "High-resolution product photography of luxury watch on black background"

### Prompt 模板

#### 网站横幅

```
"[主题] website hero banner with [颜色] background, [风格] design, [情感] atmosphere"
```

#### 产品图片

```
"[产品名称] product showcase on [背景], [风格] style, [光照] lighting"
```

#### 头像图片

```
"Professional [职业] portrait, [年龄] [性别], [表情], [背景] background"
```

#### 背景图片

```
"[场景描述] background, [风格] style, [颜色调] color palette, [情感] mood"
```

## 常见问题解决

### 1. 图片质量不满意

- 尝试更详细的 prompt 描述
- 添加风格关键词（如"professional", "modern", "elegant"）
- 指定光照条件（如"soft lighting", "studio lighting"）

### 2. 尺寸不合适

- 使用预设尺寸确保符合网页设计标准
- 对于特殊需求使用自定义 width 和 height
- 考虑响应式设计需求生成多个尺寸

### 3. 批量生成失败

- 检查 API 密钥是否正确
- 确保网络连接稳定
- 减少单次批量生成的图片数量

## 与 MCP 客户端集成

### Claude Desktop 配置

在 Claude Desktop 的配置文件中添加：

```json
{
  "mcpServers": {
    "web-design-image-generator": {
      "command": "node",
      "args": ["/path/to/your/project/dist/index.js"]
    }
  }
}
```

### 在对话中使用

```
用户: 我需要为我的科技博客生成一张特色图片，主题是人工智能，尺寸要适合博客文章。

AI: 我来帮你生成一张适合博客的AI主题特色图片。

[调用generate_web_image工具]
- prompt: "Artificial intelligence concept illustration with neural networks, futuristic design, blue and purple gradient"
- size_preset: "blog-featured"
- api_key: [用户提供的API密钥]
```
