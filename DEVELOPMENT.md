# Make My Day - 开发文档

## 项目结构

```
makemyday/
├── index.html              # HTML 入口文件
├── package.json           # 项目依赖配置
├── vite.config.js         # Vite 构建配置
├── tailwind.config.js     # Tailwind CSS 配置
├── postcss.config.js      # PostCSS 配置
├── design.md             # 原始设计文档
├── README.md             # 用户使用说明
├── DEVELOPMENT.md        # 本文件 - 开发说明
└── src/
    ├── main.jsx          # React 应用入口
    ├── App.jsx           # 根组件
    ├── index.css         # 全局样式
    ├── components/       # React 组件
    │   ├── ConfigModal.jsx      # 配置模态框
    │   ├── MainLayout.jsx       # 主布局
    │   ├── InputArea.jsx        # 输入区域
    │   ├── EventList.jsx        # 事件列表视图
    │   ├── EventCard.jsx        # 事件卡片组件
    │   └── QuadrantView.jsx     # 四象限视图
    └── utils/            # 工具函数
        ├── storage.js    # 浏览器存储管理
        └── llm.js        # LLM API 集成
```

## 技术栈详解

### 核心框架
- **React 18**: 现代化的 UI 框架
- **Vite**: 快速的构建工具，提供极速的开发体验
- **Tailwind CSS**: 实用优先的 CSS 框架，快速构建美观界面

### 关键库
- **@dnd-kit**: 现代化的拖拽库，用于事件排序功能
  - `@dnd-kit/core`: 核心拖拽功能
  - `@dnd-kit/sortable`: 列表排序功能
  - `@dnd-kit/utilities`: 工具函数

### 浏览器 API
- **localStorage**: 持久化存储配置和事件数据
- **sessionStorage**: 临时存储警告状态

## 功能模块说明

### 1. 配置管理 (ConfigModal.jsx + storage.js)

**功能**:
- LLM API 配置（API Key、Base URL、Model）
- API 测试功能
- 配置持久化存储

**存储键**:
- `makemyday_config`: 配置数据

### 2. LLM 集成 (llm.js)

**功能**:
- 调用 OpenAI 兼容格式的 API
- 将用户输入解析为结构化事件
- 使用 Prompt Engineering 引导 AI 按特定格式返回

**Prompt 设计**:
- 明确要求返回 JSON 数组格式
- 定义四种优先级类型
- 要求提供事件标题、优先级和行动建议

**默认配置**:
- Base URL: `https://api.siliconflow.cn/v1`
- Model: `deepseek-ai/DeepSeek-V2.5`

### 3. 事件管理

#### 3.1 列表视图 (EventList.jsx + EventCard.jsx)

**功能**:
- 展示所有事件
- 拖拽排序（使用 @dnd-kit）
- 单个事件的编辑和删除

**交互**:
- 拖拽手柄：调整事件顺序
- 编辑按钮：内联编辑表单
- 删除按钮：确认后删除

#### 3.2 四象限视图 (QuadrantView.jsx)

**功能**:
- 按优先级分组展示事件
- 基于"紧急-重要"矩阵分类
- 每个象限独立的事件列表

**四象限定义**:
1. **紧急且重要** (urgent-important): 立即去做 - 红色 🔥
2. **紧急但不重要** (urgent-not-important): 授权他人 - 橙色 ⚡
3. **不紧急但重要** (not-urgent-important): 计划去做 - 蓝色 ⭐
4. **不紧急也不重要** (not-urgent-not-important): 稍后再做 - 灰色 📌

### 4. 输入区域 (InputArea.jsx)

**功能**:
- 文本输入
- 快捷键支持（Ctrl/Cmd + Enter）

### 5. 数据存储 (storage.js)

**功能**:
- 配置持久化
- 事件数据持久化
- 警告状态管理

**存储键**:
- `makemyday_config`: 配置数据 (localStorage)
- `makemyday_events`: 事件数据 (localStorage)
- `makemyday_storage_warned`: 警告显示状态 (sessionStorage)

## 开发指南

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

生成的文件在 `dist` 目录下。

### 预览生产版本

```bash
npm run preview
```

## 部署指南

### 静态文件部署

1. 构建项目：
```bash
npm run build
```

2. 将 `dist` 目录部署到任何静态文件托管服务：
   - GitHub Pages
   - Netlify
   - Vercel
   - AWS S3
   - 阿里云 OSS
   - 腾讯云 COS

### 注意事项

- 确保服务器支持单页应用路由（SPA）
- 如果使用子路径部署，需要修改 `vite.config.js` 中的 `base` 选项

## API 集成说明

### LLM API 要求

必须兼容 OpenAI Chat Completions API 格式：

```
POST {baseUrl}/chat/completions
Content-Type: application/json
Authorization: Bearer {apiKey}

{
  "model": "model-name",
  "messages": [...],
  "temperature": 0.7,
  "max_tokens": 2000
}
```

### 推荐 API 服务

1. **SiliconFlow** (默认)
   - 网站: https://siliconflow.cn
   - 优点: 国内访问快，价格便宜
   - 支持模型: DeepSeek、Qwen 等

2. **OpenAI**
   - Base URL: https://api.openai.com/v1
   - 需要国际访问

3. **其他兼容服务**
   - Azure OpenAI
   - 各种国内 LLM 服务（需要兼容 OpenAI 格式）

## 数据结构

### Config 对象

```javascript
{
  apiKey: string,           // LLM API Key (必需)
  baseUrl: string,          // API Base URL
  model: string             // 模型名称
}
```

### Event 对象

```javascript
{
  id: number,               // 事件唯一标识
  title: string,            // 事件标题
  priority: string,         // 优先级 (四个象限之一)
  suggestion: string,       // 行动建议
  createdAt: string         // 创建时间 (ISO 8601)
}
```

## 常见问题

### 1. API 调用失败

**可能原因**:
- API Key 无效或过期
- Base URL 配置错误
- 网络问题或 CORS 限制
- API 余额不足

**解决**:
- 使用配置页面的"测试 API"功能
- 检查 API 服务商的控制台
- 查看浏览器开发者工具的网络面板

### 2. 数据丢失

**原因**:
- 清除了浏览器缓存
- 使用了隐私/无痕模式
- localStorage 被禁用

**解决**:
- 不要清除浏览器缓存
- 使用正常模式浏览
- 定期导出数据（未来功能）

## 未来改进方向

- [ ] 数据导出/导入功能
- [ ] 日历集成 (iCal)
- [ ] 云端同步
- [ ] 主题切换（暗黑模式）
- [ ] 统计和分析
- [ ] 重复任务/提醒
- [ ] 多语言支持
- [ ] PWA 支持
- [ ] 移动端优化

## 贡献指南

欢迎提交 Pull Request！请确保：

1. 代码风格一致
2. 功能完整测试
3. 更新相关文档
4. 提交信息清晰

## 许可证

MIT License

---

最后更新: 2025-11-13

