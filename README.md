# Web Design Image Generator MCP Server

一个专为网页设计生成 AI 图片的 MCP Server，支持通过 ModelScope 的 FLUX 模型生成各种尺寸的占位图片。

## 功能特性

- 🎨 **AI 图片生成**: 使用 ModelScope 的 FLUX 模型生成高质量图片
- 📐 **预设尺寸**: 提供常用的网页设计尺寸预设
- 🔧 **自定义尺寸**: 支持自定义宽度和高度
- 📦 **批量生成**: 支持一次生成多张图片
- 💾 **本地保存**: 自动保存生成的图片到本地
- 🔒 **安全设计**: API 密钥由客户端传入，不在服务器中硬编码

## 安装

```bash
# 克隆项目
git clone <repository-url>
cd web-design-image-generator-mcp-server

# 安装依赖
npm install

# 构建项目
npm run build
```

## 使用方法

### 1. 在 MCP 客户端中配置

在你的 MCP 客户端配置文件中添加：

```json
{
  "mcpServers": {
    "web-design-image-generator": {
      "command": "node",
      "args": ["/path/to/web-design-image-generator-mcp-server/dist/index.js"]
    }
  }
}
```

### 3. 可用工具

#### `generate_web_image`

生成单张网页设计图片

**参数:**

- `prompt` (必需): 图片生成的英文描述
- `api_key` (必需): ModelScope API 密钥
- `size_preset` (可选): 预设尺寸类型
- `width` (可选): 自定义宽度
- `height` (可选): 自定义高度
- `filename` (可选): 保存的文件名

**示例:**

```json
{
  "prompt": "A modern minimalist website hero banner with blue gradient background",
  "api_key": "your-modelscope-api-key",
  "size_preset": "hero-banner"
}
```

#### `list_size_presets`

列出所有可用的尺寸预设

**可用预设:**

- `hero-banner`: 1920x600 - 网站首页横幅图片
- `card-image`: 400x300 - 卡片图片
- `thumbnail`: 200x150 - 缩略图
- `avatar`: 100x100 - 头像图片
- `blog-featured`: 800x450 - 博客特色图片
- `product-image`: 500x500 - 产品展示图片
- `gallery-item`: 300x200 - 画廊项目图片
- `background`: 1920x1080 - 背景图片

#### `generate_multiple_images`

批量生成多张图片

**参数:**

- `images` (必需): 图片配置数组
- `api_key` (必需): ModelScope API 密钥

**示例:**

```json
{
  "api_key": "your-modelscope-api-key",
  "images": [
    {
      "prompt": "Modern office workspace",
      "size_preset": "hero-banner",
      "filename": "office-hero.jpg"
    },
    {
      "prompt": "Team collaboration",
      "size_preset": "card-image",
      "filename": "team-card.jpg"
    }
  ]
}
```

## API 密钥获取

1. 访问 [ModelScope](https://modelscope.cn/)
2. 注册并登录账户
3. 在个人中心获取 API 密钥
4. 在调用工具时传入 API 密钥

## 使用场景

### 网页设计师

- 快速生成网站占位图片
- 为不同页面元素生成合适尺寸的图片
- 批量生成设计素材

### 前端开发者

- 在开发过程中生成临时图片
- 为原型设计生成真实感图片
- 测试不同尺寸图片的显示效果

### 内容创作者

- 为博客文章生成特色图片
- 生成社交媒体素材
- 创建产品展示图片

## 输出目录

生成的图片会保存在项目根目录的 `generated-images` 文件夹中。

## 技术栈

- **MCP SDK**: Model Context Protocol 服务器框架
- **ModelScope API**: AI 图片生成服务
- **Sharp**: 图片处理和尺寸调整
- **TypeScript**: 类型安全的开发体验
- **Axios**: HTTP 请求处理

## 开发

```bash
# 开发模式
npm run dev

# 构建
npm run build

# 启动
npm start
```

## 注意事项

1. **API 限制**: ModelScope API 可能有调用频率限制
2. **图片质量**: 生成的图片质量取决于 prompt 的描述质量
3. **存储空间**: 生成的图片会占用本地存储空间
4. **网络连接**: 需要稳定的网络连接来访问 ModelScope API

## 许可证

MIT License
