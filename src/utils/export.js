// 导出和导入工具函数

// 导出为 JSON - 包含所有字段的完整数据
export const exportToJSON = (events) => {
  // 确保导出的数据包含所有必要字段
  const exportData = {
    version: '1.0', // 添加版本号，便于未来兼容性处理
    exportDate: new Date().toISOString(),
    events: events.map(event => ({
      id: event.id,
      title: event.title,
      priority: event.priority,
      suggestion: event.suggestion || '',
      detail: event.detail || '',
      completed: event.completed || false,
      eventType: event.eventType || 'one-time',
      completionHistory: event.completionHistory || [],
      isExpanded: event.isExpanded !== false, // 默认展开
      createdAt: event.createdAt || new Date().toISOString()
    }))
  }

  const dataStr = JSON.stringify(exportData, null, 2)
  const blob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `makemyday-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// 从 JSON 导入 - 兼容新旧格式
export const importFromJSON = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)

        let events

        // 判断是新格式还是旧格式
        if (data.version && data.events) {
          // 新格式：包含版本号和元数据
          events = data.events
        } else if (Array.isArray(data)) {
          // 旧格式：直接是事件数组
          events = data
        } else {
          throw new Error('无效的 JSON 格式')
        }

        // 验证数据格式
        if (!Array.isArray(events)) {
          throw new Error('无效的 JSON 格式：事件数据必须是数组')
        }

        // 验证并规范化每个事件的所有字段
        const validEvents = events.map(event => {
          if (!event.id || !event.title) {
            throw new Error('无效的事件数据：缺少必需字段 id 或 title')
          }

          return {
            id: event.id,
            title: event.title,
            priority: event.priority || 'not-urgent-not-important',
            suggestion: event.suggestion || '',
            detail: event.detail || '',
            completed: event.completed || false,
            eventType: event.eventType || 'one-time',
            completionHistory: Array.isArray(event.completionHistory) ? event.completionHistory : [],
            isExpanded: event.isExpanded !== false, // 默认展开
            createdAt: event.createdAt || new Date().toISOString()
          }
        })

        resolve(validEvents)
      } catch (error) {
        reject(new Error(`解析 JSON 失败: ${error.message}`))
      }
    }

    reader.onerror = () => {
      reject(new Error('读取文件失败'))
    }

    reader.readAsText(file)
  })
}

