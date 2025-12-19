# Make My Day - AI 日程规划助手 ✨

<div align="center">
  <h3>让 AI 帮你规划美好的一天</h3>
  <p>基于 AI 的智能日程规划 Web 应用，结合四象限时间管理与长期目标追踪</p>
</div>

---

## 📖 项目简介

**Make My Day** 是一个纯前端的 AI 日程规划助手。用户可以通过文字输入计划，AI 会智能地将这些计划分解成具体可操作的事件，并根据**"紧急重要四象限"**理论给出优先级建议和行动方案。同时支持**长期目标管理**，帮助你将大目标拆解为可执行的子任务。

### 核心特点

- 🤖 **AI 智能规划**：自动解析计划，生成具体事件和建议
- 🎯 **四象限管理**：科学的时间管理方法
- 📋 **长期目标追踪**：支持目标拆解、子任务管理、进度追踪
- ✨ **AI 生成子任务**：一键智能拆解目标为可执行子任务
- 📊 **目标投影**：子任务可投影到四象限，统一管理
- 📱 **纯前端应用**：无需后端，可部署到任何静态服务器
- 🔒 **隐私安全**：数据存储在本地浏览器，不上传服务器

---

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

应用将在 http://localhost:5173 启动

### 配置 LLM API

首次打开应用会弹出配置页面：

- **API Key**（必需）：你的 LLM API 密钥
- **Base URL**（可选）：API 地址（默认：`https://api.siliconflow.cn/v1`）
- **Model**（可选）：模型名称（默认：`deepseek-ai/DeepSeek-V3`）

**推荐：SiliconFlow**
1. 访问 https://cloud.siliconflow.cn/i/oxgmy3DI
2. 注册并登录, 免费领取2000万token额度
3. 获取 API Key

---

## 🔨 构建与部署

### 生产构建

```bash
npm run build
```

构建结果在 `dist/` 目录

### 本地预览

```bash
npm run preview
```

### 部署到 GitHub Pages

本项目已配置 GitHub Actions 自动部署，推送到 `main` 分支后会自动构建并部署。

**首次部署设置：**

1. 进入 [仓库 Settings](https://github.com/jsyqrt/makemyday/settings/pages)
2. Pages → Source 选择 **"GitHub Actions"**
3. 推送代码到 `main` 分支，自动触发部署

**在线访问：** https://jsyqrt.github.io/makemyday/

### 其他部署平台

- **Vercel**: `vercel --prod`
- **Netlify**: 拖拽 `dist/` 文件夹
- **CloudFlare Pages**: 连接 GitHub 仓库

---

## ✨ 功能特性

### 四象限管理

| 象限 | 说明 | 建议 |
|------|------|------|
| 🔥 紧急且重要 | 危机、截止日期 | **立即去做** |
| ⚡ 紧急但不重要 | 干扰、部分邮件 | **授权他人** |
| ⭐ 不紧急但重要 | 规划、学习、锻炼 | **计划去做** |
| 📌 不紧急也不重要 | 琐事、娱乐 | **稍后再做** |

### 🎯 长期目标管理

- 📋 **目标列表**：左侧可展开/收起的目标面板
- ➕ **添加目标**：快速创建长期目标
- 📝 **目标编辑**：支持标题、描述、截止日期
- 🔀 **拖拽排序**：自由调整目标顺序
- 📊 **进度追踪**：根据子任务完成情况自动计算进度
- 💾 **状态记忆**：展开/收起状态自动保存

### 📌 子任务系统

- ✏️ **弹窗编辑**：完整的子任务编辑界面
- ⏱️ **预估时间**：支持小时/天/周/月/年单位
- 🎯 **优先级设置**：四象限优先级快捷选择
- 📊 **投影到四象限**：子任务可显示在对应象限中
- ✨ **AI 生成**：一键智能拆解目标为子任务
- 🔄 **双向同步**：投影的子任务与原目标实时同步

### 事件管理

- ✅ 标记完成 / ↩️ 取消完成
- ✏️ 编辑事件（弹窗编辑，自动保存）
- 🗑️ 删除事件（带确认提示）
- 🔀 拖拽排序
- 🎯 跨象限拖拽
- 🔄 周期性事件支持

### 导入导出

- 📄 **JSON**：完整数据备份
- 📝 **Markdown**：文档格式
- 🖼️ **图片**：PNG 截图

### 🎨 个性化设置

- 🌈 **渐变色背景**：自定义起始/结束颜色
- 🎨 **纯色背景**：简洁单色风格
- 🖼️ **图片背景**：支持单张/多张图片轮播
- 🔲 **透明度调节**：卡片背景透明度可调

---

## 🎯 技术栈

- **React 18** + **Vite 5** + **Tailwind CSS 3**
- **@dnd-kit**：拖拽功能
- **html2canvas**：图片导出
- **localStorage**：本地数据存储

---

## 🏗️ 项目结构

```
makemyday/
├── src/
│   ├── components/
│   │   ├── MainLayout.jsx          # 主布局组件
│   │   ├── QuadrantViewDraggable.jsx # 四象限拖拽视图
│   │   ├── GoalPanel.jsx           # 长期目标面板
│   │   ├── EventEditModal.jsx      # 事件编辑弹窗
│   │   ├── ConfigModal.jsx         # 配置弹窗
│   │   └── InputArea.jsx           # AI 输入区域
│   ├── utils/
│   │   ├── llm.js                  # LLM API 调用
│   │   ├── storage.js              # 本地存储
│   │   └── exportUtils.js          # 导出功能
│   ├── main.jsx                    # 入口文件
│   └── index.css                   # 全局样式
├── public/
│   └── favicon.svg                 # 网站图标
├── package.json
├── vite.config.js
└── tailwind.config.js
```

---

## ⚠️ 注意事项

- 数据保存在浏览器 localStorage，清除缓存会丢失数据
- 无痕模式下关闭浏览器数据会消失
- 建议定期使用导出功能备份数据
- API Key 保存在本地，不会上传

---

## 📄 开源协议

MIT License

---

<div align="center">
  <p>Made with ❤️ by AI</p>
</div>
