# 直接使用示例

## 快速生成单张图片

```bash
# 启动服务器
./start.sh

# 或者
npm start
```

然后发送 JSON-RPC 请求：

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "generate_web_image",
    "arguments": {
      "prompt": "A cute cat wearing Nike shoes, cartoon style",
      "api_key": "your-modelscope-api-key",
      "size_preset": "card-image",
      "filename": "cute-cat.jpg"
    }
  }
}
```

## 使用测试脚本

```bash
# 交互式生成图片
node test/generate-image-test.js
```

按提示输入：

1. ModelScope API 密钥
2. 图片描述（英文）
3. 尺寸预设名称

## 批量生成示例

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "generate_multiple_images",
    "arguments": {
      "api_key": "your-modelscope-api-key",
      "images": [
        {
          "prompt": "Modern office workspace, clean design",
          "size_preset": "hero-banner",
          "filename": "office-hero.jpg"
        },
        {
          "prompt": "Professional team meeting",
          "size_preset": "card-image",
          "filename": "team-card.jpg"
        },
        {
          "prompt": "Business person portrait",
          "size_preset": "avatar",
          "filename": "person-avatar.jpg"
        }
      ]
    }
  }
}
```
