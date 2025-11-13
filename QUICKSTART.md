# Make My Day - 快速启动指南 🚀

## 1️⃣ 安装依赖

```bash
npm install
```

这将安装以下依赖：
- React 18.2.0
- React DOM 18.2.0
- Vite 5.0.8
- Tailwind CSS 3.3.6
- @dnd-kit (拖拽功能)

## 2️⃣ 启动开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:5173` 启动

## 3️⃣ 配置 LLM API

首次打开应用时，会自动弹出配置页面：

### 必需配置
- **API Key**: 你的 LLM API 密钥

### 可选配置
- **Base URL**: API 地址（默认: `https://api.siliconflow.cn/v1`）
- **Model**: 模型名称（默认: `deepseek-ai/DeepSeek-V2.5`）
- **Speech API Key**: 语音识别密钥
  - 推荐：填入与 LLM 相同的 API Key，使用 SiliconFlow 语音识别
  - 或留空使用浏览器内置（仅支持 Chrome/Edge）

### 获取 API Key

#### 推荐：SiliconFlow（默认）
1. 访问 https://siliconflow.cn
2. 注册并登录
3. 进入控制台获取 API Key
4. 每月有免费额度

#### 其他选择
- OpenAI: https://platform.openai.com
- 其他兼容 OpenAI 格式的 API 服务

## 4️⃣ 使用应用

### 输入你的计划
在文本框中输入你想做的事情，例如：
```
我要写一份项目报告，下午3点开会讨论新功能，
晚上7点去健身房锻炼，周末陪家人去郊游
```

### AI 自动规划
点击"让 AI 帮我规划"，AI 会：
- 将计划分解成具体事件
- 评估每个事件的优先级（四象限）
- 提供行动建议

### 管理事件
- ✏️ **编辑**: 点击编辑按钮修改事件
- 🗑️ **删除**: 点击删除按钮移除事件
- 🔀 **排序**: 在列表视图中拖拽事件调整顺序
- 📊 **视图切换**: 在列表视图和四象限视图间切换

## 5️⃣ 构建生产版本

```bash
npm run build
```

构建结果在 `dist/` 目录，可以部署到任何静态服务器。

## 6️⃣ 预览生产版本

```bash
npm run preview
```

## 🎯 四象限说明

AI 会根据紧急程度和重要程度将事件分类：

| 象限 | 说明 | 建议 | 示例 |
|------|------|------|------|
| 🔥 紧急且重要 | 危机、截止日期 | 立即去做 | 今天到期的报告 |
| ⚡ 紧急但不重要 | 干扰、部分邮件 | 授权他人 | 电话接听 |
| ⭐ 不紧急但重要 | 规划、学习、锻炼 | 计划去做 | 学习新技能 |
| 📌 不紧急也不重要 | 琐事、娱乐 | 稍后再做 | 刷社交媒体 |

## 🎤 语音输入

应用支持两种语音识别方式：

### 方式 1：SiliconFlow API（推荐）
配置 Speech API Key 后：
- ✅ 支持所有现代浏览器（Chrome、Firefox、Safari、Edge）
- ✅ 识别准确度高
- ✅ 使用 FunAudioLLM/SenseVoiceSmall 模型
- 使用方法：点击"语音"按钮开始录音，再次点击停止并识别

### 方式 2：浏览器内置（免费）
留空 Speech API Key 时：
- ✅ 完全免费
- ✅ 实时语音转文字
- ⚠️ 仅支持 Chrome、Edge 浏览器
- ❌ 不支持：Firefox、Safari

## 💾 数据存储

- 所有数据保存在浏览器本地（localStorage）
- 不上传到服务器，完全隐私
- ⚠️ 请勿清除浏览器缓存，否则数据会丢失

## ⚡ 快捷键

- `Ctrl/Cmd + Enter`: 快速提交输入

## 🐛 常见问题

### Q: API 调用失败怎么办？
A:
1. 检查 API Key 是否正确
2. 使用配置页面的"测试 API"功能
3. 确认 API 服务正常且有余额

### Q: 语音识别不工作？
A:
1. **推荐方案**：配置 SiliconFlow 语音识别 API Key（与 LLM API Key 相同）
2. 确保授予浏览器麦克风权限
3. 如果使用浏览器内置识别，确保使用 Chrome 或 Edge 浏览器
4. 如果是生产环境，确保使用 HTTPS

### Q: 数据丢失了？
A:
- 数据存储在 localStorage，清除缓存会导致丢失
- 建议定期备份重要事件（未来会添加导出功能）

## 📝 下一步

- 探索四象限视图，更好地管理时间
- 尝试不同的输入方式
- 根据 AI 建议调整事件优先级

## 🤝 需要帮助？

- 查看 [README.md](./README.md) 了解详细功能
- 查看 [DEVELOPMENT.md](./DEVELOPMENT.md) 了解技术细节
- 在 GitHub 上提 Issue

---

祝你有美好的一天！✨

