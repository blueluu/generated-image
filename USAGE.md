# Web Design Image Generator MCP Server 使用说明

## 问题解决：图片保存位置

如果你在另一个项目中使用这个 MCP 服务器，但发现生成的图片仍然保存在 MCP 服务器目录中而不是你的项目目录中，请按照以下步骤解决：

### 方法 1：使用 set_project_root 工具（推荐）

在生成图片之前，先设置你的项目根目录：

```javascript
// 调用 set_project_root 工具
{
  "name": "set_project_root",
  "arguments": {
    "project_root": "/path/to/your/project"
  }
}
```

例如：

```javascript
{
  "name": "set_project_root",
  "arguments": {
    "project_root": "/Users/username/Documents/my-project"
  }
}
```

设置成功后，所有生成的图片都会保存到 `/Users/username/Documents/my-project/generated-images/` 目录中。

### 方法 2：设置环境变量

在启动 MCP 服务器之前，设置环境变量：

```bash
export USER_PROJECT_ROOT="/path/to/your/project"
# 然后启动MCP服务器
```

### 工具使用流程

1. **设置项目根目录**（首次使用或切换项目时）

   ```javascript
   {
     "name": "set_project_root",
     "arguments": {
       "project_root": "/Users/username/Documents/my-web-project"
     }
   }
   ```

2. **设置 API 密钥**（首次使用时）

   ```javascript
   {
     "name": "set_api_key",
     "arguments": {
       "api_key": "your-modelscope-api-key"
     }
   }
   ```

3. **生成图片**
   ```javascript
   {
     "name": "generate_web_image",
     "arguments": {
       "prompt": "一只可爱的小猫",
       "size_preset": "card-image"
     }
   }
   ```

### 调试信息

MCP 服务器会在控制台输出调试信息，帮助你了解当前使用的路径：

```
Debug: Project root: /Users/username/Documents/my-project
Debug: Output path: /Users/username/Documents/my-project/generated-images
Debug: __dirname: /path/to/mcp/server/dist
Debug: process.cwd(): /current/working/directory
Debug: PWD: /environment/pwd/path
Debug: INIT_CWD: /initial/working/directory
```

### 常见问题

**Q: 为什么图片还是保存在 MCP 服务器目录中？**
A: 请确保在生成图片之前调用了 `set_project_root` 工具设置正确的项目根目录。

**Q: 如何确认项目根目录设置成功？**
A: 调用 `set_project_root` 后会返回确认信息，显示设置的路径和图片保存位置。

**Q: 可以使用相对路径吗？**
A: 建议使用绝对路径以避免路径解析问题。

### 可用的尺寸预设

- `hero-banner`: 1920x600 (网站首页横幅图片)
- `card-image`: 400x300 (卡片图片)
- `thumbnail`: 200x150 (缩略图)
- `avatar`: 100x100 (头像图片)
- `blog-featured`: 800x450 (博客特色图片)
- `product-image`: 500x500 (产品展示图片)
- `gallery-item`: 300x200 (画廊项目图片)
- `background`: 1920x1080 (背景图片)

使用 `list_size_presets` 工具可以查看所有可用的尺寸预设。
