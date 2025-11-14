# Make My Day - AI 日程规划助手 ✨

<div align="center">
  <h3>让 AI 帮你规划美好的一天</h3>
  <p>基于 AI 的智能日程规划 Web 应用</p>
  <p>
    <a href="#快速开始">快速开始</a> •
    <a href="#功能特性">功能特性</a> •
    <a href="#使用指南">使用指南</a> •
    <a href="#技术栈">技术栈</a>
  </p>
</div>

---

## 📖 项目简介

**Make My Day** 是一个纯前端的 AI 日程规划助手。用户可以通过**文字**输入计划，AI 会智能地将这些计划分解成具体可操作的事件，并根据**"紧急重要四象限"**理论给出优先级建议和行动方案。

### 核心特点

- 🤖 **AI 智能规划**：自动解析计划，生成具体事件和建议
- 🎯 **四象限管理**：科学的时间管理方法
- 📱 **纯前端应用**：无需后端，可部署到任何静态服务器
- 🔒 **隐私安全**：数据存储在本地浏览器，不上传服务器
- 🎨 **现代 UI**：美观流畅的用户体验

---

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

应用将在 http://localhost:5173 启动

### 3. 配置 LLM API

首次打开应用会弹出配置页面：

#### 必需配置
- **API Key**：你的 LLM API 密钥

#### 可选配置
- **Base URL**：API 地址（默认：`https://api.siliconflow.cn/v1`）
- **Model**：模型名称（默认：`deepseek-ai/DeepSeek-V3`）

#### 获取 API Key

**推荐：SiliconFlow**（默认配置）
1. 访问 https://siliconflow.cn
2. 注册并登录
3. 进入控制台获取 API Key
4. 每月有免费额度

**其他选择**
- OpenAI: https://platform.openai.com
- 任何兼容 OpenAI 格式的 API 服务

### 4. 开始使用

在输入框中描述你的计划：
```
我要写一份项目报告，下午3点开会讨论新功能，
晚上7点去健身房锻炼，周末陪家人去郊游
```

点击"让 AI 帮我规划"，AI 会：
- ✅ 分解成具体事件
- ✅ 评估优先级（四象限）
- ✅ 提供行动建议

---

## ✨ 功能特性

### 核心功能

#### 🤖 AI 智能解析
- 自然语言理解，支持复杂的计划描述
- 自动提取事件标题、优先级和建议
- 支持批量创建多个事件

#### 📊 四象限管理
基于"紧急重要四象限"理论：

| 象限 | 说明 | 建议 | 示例 |
|------|------|------|------|
| 🔥 紧急且重要 | 危机、截止日期 | **立即去做** | 今天到期的报告 |
| ⚡ 紧急但不重要 | 干扰、部分邮件 | **授权他人** | 电话接听 |
| ⭐ 不紧急但重要 | 规划、学习、锻炼 | **计划去做** | 学习新技能 |
| 📌 不紧急也不重要 | 琐事、娱乐 | **稍后再做** | 刷社交媒体 |

#### ✏️ 灵活管理

**事件操作**
- ✅ **标记完成**：点击 ✓ 标记完成，点击 ↩️ 取消完成
- ✏️ **编辑**：修改事件标题、建议、优先级
- 🗑️ **删除**：移除不需要的事件
- 🔀 **拖拽排序**：在列表视图中调整顺序
- 🎯 **跨象限拖拽**：在四象限视图中拖拽事件改变优先级

**视图切换**
- 📋 **列表视图**：线性展示所有事件，支持拖拽排序
- 📊 **四象限视图**（默认）：按优先级分组展示，支持跨象限拖拽

#### 📥📤 导入导出

**导出功能**
- 📄 **JSON**：完整数据备份，可用于迁移
- 📝 **Markdown**：美观的文档格式，按象限分组
- 🖼️ **图片**：高清 PNG 截图，适合分享打印

**导入功能**
- 📥 **从 JSON 导入**：恢复之前的备份数据
- ✅ 自动验证和修复数据格式
- ⚠️ 导入前确认（会覆盖现有数据）

使用方法：
```
导出：顶部菜单 → [📤 导出] → 选择格式
导入：顶部菜单 → [📥 导入] → 选择 JSON 文件
```

---

## 📱 使用指南

### 基本流程

```
1. 输入计划
   ↓
2. AI 智能解析（自动分类和建议）
   ↓
3. 管理事件（编辑/删除/排序/完成）
   ↓
4. 导出备份（JSON/Markdown/图片）
```

### 详细步骤

#### 1️⃣ 输入你的计划

```
我要完成一个重要的项目报告，明天截止。
下午3点有个产品评审会。
晚上想去健身房锻炼1小时。
周末计划学习 React 新特性。
```

#### 2️⃣ AI 自动规划

AI 会生成：
```json
{
  "title": "完成项目报告",
  "priority": "urgent-important",
  "suggestion": "立即开始，预留充足时间进行审核"
}
```

#### 3️⃣ 管理你的事件

**在列表视图**
- 🔀 拖拽事件卡片调整顺序
- ✏️ 点击编辑按钮修改
- 🗑️ 点击删除按钮移除
- ✓ 点击完成按钮标记

**在四象限视图**
- 🎯 拖拽事件到不同象限（改变优先级）
- 🔀 同象限内拖拽（调整顺序）
- 📊 按优先级分类查看
- ✓ 标记完成状态

#### 4️⃣ 导出和备份

**定期备份**
```
[📤 导出] → [📄 JSON]
→ makemyday-2024-11-14.json
```

**分享计划**
```
[📤 导出] → [🖼️ 图片]
→ 生成四象限截图 PNG
```

**文档格式**
```
[📤 导出] → [📝 Markdown]
→ 生成 .md 文档
```

---

## 🎯 技术栈

### 前端技术
- **React 18**：现代化的 UI 框架
- **Vite 5**：快速的构建工具
- **Tailwind CSS 3**：实用优先的 CSS 框架

### 核心库
- **@dnd-kit**：强大的拖拽功能
- **html2canvas**：HTML 转图片导出

### API 集成
- **OpenAI 兼容 API**：LLM 智能解析

### 数据存储
- **localStorage**：配置和事件持久化
- **sessionStorage**：临时状态管理

---

## 🏗️ 项目结构

```
makemyday/
├── public/
│   └── test-storage.html      # 存储诊断工具
├── src/
│   ├── components/
│   │   ├── App.jsx             # 应用入口
│   │   ├── ConfigModal.jsx     # 配置弹窗
│   │   ├── InputArea.jsx       # 输入区域
│   │   ├── EventCard.jsx       # 事件卡片
│   │   ├── EventList.jsx       # 列表视图
│   │   ├── QuadrantView.jsx    # 四象限视图（静态）
│   │   ├── QuadrantViewDraggable.jsx # 四象限视图（可拖拽）
│   │   └── MainLayout.jsx      # 主布局
│   ├── utils/
│   │   ├── llm.js              # LLM API 调用
│   │   ├── storage.js          # 本地存储
│   │   └── export.js           # 导入导出
│   ├── main.jsx                # React 入口
│   └── index.css               # 全局样式
├── package.json
├── vite.config.js
├── tailwind.config.js
├── README.md                   # 本文档
└── DEVELOPMENT.md              # 开发者文档
```

---

## 🔨 构建和部署

### 开发环境

```bash
npm run dev
```

### 生产构建

```bash
npm run build
```

构建结果在 `dist/` 目录

### 预览生产版本

```bash
npm run preview
```

### 部署

**静态托管服务**
- Vercel
- Netlify
- GitHub Pages
- CloudFlare Pages

**部署示例（Vercel）**
```bash
npm install -g vercel
vercel --prod
```

---

## ⚠️ 注意事项

### 数据存储
- ✅ 数据保存在浏览器本地 localStorage
- ✅ 不上传到服务器，完全隐私
- ⚠️ **请勿清除浏览器缓存**，否则数据会丢失
- ⚠️ **无痕模式**下关闭浏览器数据会消失
- 💡 建议定期使用导出功能备份数据

### API 配置
- 🔑 需要自行配置 LLM API Key
- 💰 建议使用有免费额度的服务（如 SiliconFlow）
- 🔒 API Key 保存在本地，不会上传

---

## 🐛 故障排除

### API 调用失败

**症状**：提示 API 调用失败

**解决方案**：
1. 检查 API Key 是否正确
2. 点击配置页面的"测试 API"功能
3. 确认 API 服务正常且有余额
4. 检查网络连接

### 数据刷新后丢失

**症状**：刷新页面后事件消失

**原因和解决**：
- ❌ 无痕模式 → 使用正常模式
- ❌ 浏览器设置阻止 localStorage → 调整隐私设置
- ❌ 清理扩展冲突 → 暂时禁用清理扩展
- ✅ 使用诊断工具：访问 `/test-storage.html` 测试

### 拖拽功能异常

**症状**：无法拖拽事件

**解决方案**：
1. 确保使用拖拽手柄（⋮⋮）
2. 检查浏览器是否支持（需现代浏览器）
3. 刷新页面重试

---

## 🎉 更新日志

### v2.0.0 - 2024-11-14

**重大更新**
- ✅ 添加事件完成状态（✓ 标记完成）
- ✅ 实现导入导出功能（JSON/Markdown/图片）
- ✅ 四象限支持跨象限拖拽
- ✅ 四象限支持内部排序拖拽
- ✅ 默认视图改为四象限
- ✅ 四象限自适应高度（移除滚动条）
- ✅ 优化数据持久化逻辑
- ✅ 改进用户提示和警告

**技术改进**
- 使用 `@dnd-kit` 实现拖拽功能
- 使用 `html2canvas` 实现图片导出
- 优化 React hooks 避免无限渲染
- 改进 localStorage 读写时机

### v1.0.0 - 2024-11-13

**初始版本**
- 🤖 AI 智能解析计划
- 📊 四象限优先级管理
- ✏️ 事件编辑和删除
- 🔀 列表视图拖拽排序
- 💾 本地数据持久化
- 🎨 美观的 UI 设计

---

## 🤝 贡献指南

欢迎贡献代码、报告问题或提出建议！

### 如何贡献

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 开发指南

查看 [DEVELOPMENT.md](./DEVELOPMENT.md) 了解：
- 项目架构详解
- 代码规范
- 开发流程
- API 文档

---

## 📄 开源协议

MIT License - 详见 [LICENSE](./LICENSE) 文件

---

## 📧 联系方式

- 💬 提问和讨论：[GitHub Issues](https://github.com/jsyqrt/makemyday/issues)
- 🐛 Bug 报告：[GitHub Issues](https://github.com/jsyqrt/makemyday/issues)
- 💡 功能建议：[GitHub Discussions](https://github.com/jsyqrt/makemyday/discussions)

---

<div align="center">
  <p>Made with ❤️ by AI</p>
  <p>⭐ 如果这个项目对你有帮助，请给一个 Star！</p>
</div>
