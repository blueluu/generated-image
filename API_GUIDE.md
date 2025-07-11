# ModelScope API 使用指南

## 🔑 获取 API 密钥

### 1. 注册 ModelScope 账户

- 访问 [ModelScope 官网](https://modelscope.cn/)
- 注册并登录账户

### 2. 获取 API 密钥

- 登录后，进入个人中心
- 找到"API 密钥"或"开发者设置"
- 创建新的 API 密钥
- 复制密钥备用

### 3. 验证 API 密钥

API 密钥通常格式为：`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

## 🎨 图片生成模型

我们使用的模型：`MusePublic/489_ckpt_FLUX_1`

- 这是一个高质量的文生图模型
- 支持英文 prompt
- 生成速度较快

## 💡 Prompt 编写建议

### 好的英文 Prompt 示例：

```
"A cute orange cat wearing red Nike sneakers, sitting on a wooden floor, cartoon style, high quality"

"Modern minimalist website hero banner with blue gradient background, clean design, professional"

"Beautiful landscape with mountains and sunset, peaceful atmosphere, high resolution"

"Professional headshot of a business person, studio lighting, white background"
```

### Prompt 结构建议：

1. **主体描述** - 要生成什么
2. **风格说明** - 艺术风格、画风
3. **环境背景** - 背景描述
4. **质量要求** - high quality, detailed 等

## ⚠️ 常见问题

### 401 错误 (Unauthorized)

- API 密钥无效或过期
- 检查密钥格式是否正确
- 确认账户状态正常

### 403 错误 (Forbidden)

- 账户余额不足
- API 调用次数超限
- 模型访问权限问题

### 500 错误 (Server Error)

- ModelScope 服务器问题
- 稍后重试

## 🔧 测试步骤

1. **准备 API 密钥**

   ```bash
   # 确保密钥格式正确
   echo "你的密钥: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
   ```

2. **运行测试**

   ```bash
   node test/simple-test.js
   ```

3. **输入信息**

   - API 密钥：粘贴你的真实密钥
   - 图片描述：使用英文描述
   - 尺寸预设：选择如 card-image

4. **等待结果**
   - 生成时间：30-60 秒
   - 成功后图片保存在 `generated-images/` 目录

## 📊 费用说明

- ModelScope 通常提供免费额度
- 超出免费额度后按调用次数收费
- 具体费用请查看 ModelScope 官网

## 🎯 使用技巧

1. **英文 Prompt 效果更好**
2. **描述要具体详细**
3. **可以指定艺术风格**
4. **避免过于复杂的描述**
5. **可以多次尝试优化 prompt**
