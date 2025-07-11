# 配置说明

## Claude Desktop 配置

### 1. 找到配置文件

Claude Desktop 配置文件位置：

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

### 2. 添加 MCP Server 配置

将 `claude-desktop-config.json` 中的内容添加到你的配置文件中，记得：

1. 将 `/path/to/web-design-image-generator-mcp-server` 替换为实际的项目路径
2. 如果配置文件已有其他 MCP 服务器，将新配置合并到现有的 `mcpServers` 对象中

### 3. 完整配置示例

```json
{
  "mcpServers": {
    "web-design-image-generator": {
      "command": "node",
      "args": [
        "/Users/yourname/projects/web-design-image-generator-mcp-server/dist/index.js"
      ],
      "description": "AI图片生成服务，专为网页设计优化"
    },
    "other-server": {
      "command": "python",
      "args": ["/path/to/other/server.py"]
    }
  }
}
```

### 4. 重启 Claude Desktop

配置完成后，重启 Claude Desktop 应用程序。

### 5. 验证配置

在 Claude Desktop 中，你应该能看到新的工具可用。可以尝试说：

"帮我生成一张网站横幅图片，主题是现代科技公司"

## 其他 MCP 客户端配置

### Continue (VS Code)

在 Continue 的配置中添加：

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

### 自定义 MCP 客户端

如果你在开发自己的 MCP 客户端，可以使用以下命令启动服务器：

```bash
node /path/to/web-design-image-generator-mcp-server/dist/index.js
```

## 故障排除

### 常见问题

1. **服务器无法启动**

   - 检查 Node.js 版本（需要 17+）
   - 确保已运行 `npm install` 和 `npm run build`
   - 检查路径是否正确

2. **工具不可用**

   - 检查 Claude Desktop 配置文件语法
   - 确保路径使用绝对路径
   - 重启 Claude Desktop

3. **图片生成失败**
   - 检查 ModelScope API 密钥是否有效
   - 确保网络连接正常
   - 检查 API 调用限制

### 调试模式

可以直接运行服务器进行调试：

```bash
cd /path/to/web-design-image-generator-mcp-server
./start.sh
```

然后手动发送 JSON-RPC 请求进行测试。
