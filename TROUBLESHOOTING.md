# 故障排除指南

## ⚠️ Maximum update depth exceeded 错误

如果遇到 "Maximum update depth exceeded" 错误，按以下步骤排查：

### 快速修复步骤

#### 1. 清空浏览器存储
```javascript
// 在浏览器控制台执行：
localStorage.clear()
sessionStorage.clear()
// 然后刷新页面
location.reload()
```

#### 2. 硬刷新浏览器
- **Windows/Linux**: `Ctrl + Shift + R` 或 `Ctrl + F5`
- **Mac**: `Cmd + Shift + R`

#### 3. 清除 Vite 缓存
```bash
# 停止开发服务器，然后运行：
rm -rf node_modules/.vite
npm run dev
```

### 根本原因

这个错误通常由以下原因导致：

1. **旧的缓存数据格式不兼容**
   - 如果你之前运行过旧版本的代码，localStorage 中可能存储了不兼容的数据

2. **事件数据损坏**
   - 存储的事件对象可能缺少必需的字段

3. **Vite HMR 问题**
   - 热更新可能导致组件状态不一致

### 完整清理步骤

```bash
# 1. 停止开发服务器 (Ctrl+C)

# 2. 清理所有缓存
rm -rf node_modules/.vite
rm -rf dist

# 3. 在浏览器中清空存储
# 打开浏览器开发者工具 > Application > Storage > Clear site data

# 4. 重启开发服务器
npm run dev
```

### 如果问题仍然存在

检查浏览器控制台的完整错误堆栈，并提供以下信息：

1. 错误发生的具体操作（添加事件？编辑事件？切换视图？）
2. 浏览器和版本
3. 是否有任何自定义修改

---

## 其他常见问题

### CSP 警告

**问题**：看到 Content Security Policy 警告

**解决**：这是开发环境的正常警告，可以安全忽略。生产构建不会有此问题。

### 语音识别不工作

**问题**：点击语音按钮没有反应

**解决**：
1. 检查是否配置了 Speech API Key
2. 如果没配置，确保使用 Chrome 或 Edge 浏览器
3. 授予浏览器麦克风权限
4. 确保使用 HTTPS 或 localhost

### API 调用失败

**问题**：AI 无法解析输入

**解决**：
1. 检查 API Key 是否正确
2. 使用配置页面的"测试 API"功能
3. 确认 API 服务正常且有余额
4. 查看浏览器控制台的网络请求详情

