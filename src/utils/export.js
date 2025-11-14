// 导出和导入工具函数

// 导出为 JSON
export const exportToJSON = (events) => {
  const dataStr = JSON.stringify(events, null, 2)
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

// 导出为 Markdown
export const exportToMarkdown = (events) => {
  const priorityLabels = {
    'urgent-important': '🔥 紧急且重要',
    'urgent-not-important': '⚡ 紧急但不重要',
    'not-urgent-important': '⭐ 不紧急但重要',
    'not-urgent-not-important': '📌 不紧急也不重要'
  }

  let markdown = `# Make My Day - 日程规划\n\n`
  markdown += `导出时间：${new Date().toLocaleString('zh-CN')}\n\n`
  markdown += `总计事件：${events.length} 个\n\n`
  markdown += `---\n\n`

  // 按象限分组
  const quadrants = [
    'urgent-important',
    'urgent-not-important',
    'not-urgent-important',
    'not-urgent-not-important'
  ]

  quadrants.forEach(priority => {
    const quadrantEvents = events.filter(e => e.priority === priority)
    if (quadrantEvents.length > 0) {
      markdown += `## ${priorityLabels[priority]}\n\n`
      quadrantEvents.forEach((event, index) => {
        const status = event.completed ? '[x]' : '[ ]'
        markdown += `${index + 1}. ${status} **${event.title}**\n`
        if (event.suggestion) {
          markdown += `   - 💡 ${event.suggestion}\n`
        }
        if (event.createdAt) {
          markdown += `   - 📅 创建于：${new Date(event.createdAt).toLocaleString('zh-CN')}\n`
        }
        markdown += `\n`
      })
      markdown += `\n`
    }
  })

  markdown += `---\n\n`
  markdown += `*由 Make My Day 生成*\n`

  const blob = new Blob([markdown], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `makemyday-${new Date().toISOString().split('T')[0]}.md`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// 导出为图片（使用 html2canvas）
export const exportToImage = async (events) => {
  try {
    // 动态导入 html2canvas
    let html2canvas
    try {
      html2canvas = (await import('html2canvas')).default
    } catch (importError) {
      throw new Error('请先安装 html2canvas: npm install html2canvas')
    }

    // 创建一个临时的 DOM 元素来渲染
    const container = document.createElement('div')
    container.style.cssText = `
      position: fixed;
      left: -9999px;
      top: 0;
      width: 1200px;
      padding: 40px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    `

    const priorityLabels = {
      'urgent-important': { label: '🔥 紧急且重要', color: '#ef4444' },
      'urgent-not-important': { label: '⚡ 紧急但不重要', color: '#f97316' },
      'not-urgent-important': { label: '⭐ 不紧急但重要', color: '#3b82f6' },
      'not-urgent-not-important': { label: '📌 不紧急也不重要', color: '#6b7280' }
    }

    let html = `
      <div style="background: white; border-radius: 20px; padding: 30px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
        <h1 style="font-size: 32px; font-weight: bold; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 10px;">
          ✨ Make My Day
        </h1>
        <p style="color: #6b7280; margin-bottom: 30px;">导出时间：${new Date().toLocaleString('zh-CN')}</p>
    `

    const quadrants = [
      'urgent-important',
      'urgent-not-important',
      'not-urgent-important',
      'not-urgent-not-important'
    ]

    html += '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">'

    quadrants.forEach(priority => {
      const quadrantEvents = events.filter(e => e.priority === priority)
      const config = priorityLabels[priority]

      html += `
        <div style="background: #f9fafb; border-radius: 12px; padding: 20px; border: 2px solid ${config.color}20;">
          <h2 style="font-size: 18px; font-weight: bold; color: ${config.color}; margin-bottom: 15px;">
            ${config.label}
          </h2>
      `

      if (quadrantEvents.length === 0) {
        html += '<p style="color: #9ca3af; text-align: center; padding: 20px;">暂无事件</p>'
      } else {
        quadrantEvents.forEach(event => {
          const opacity = event.completed ? '0.5' : '1'
          const textDecoration = event.completed ? 'line-through' : 'none'
          const completedBadge = event.completed ? '<span style="color: #10b981; margin-left: 8px;">✓</span>' : ''

          html += `
            <div style="background: white; border-radius: 8px; padding: 12px; margin-bottom: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); opacity: ${opacity};">
              <div style="font-weight: 600; color: #1f2937; margin-bottom: 5px; text-decoration: ${textDecoration};">
                ${event.title}${completedBadge}
              </div>
              ${event.suggestion ? `<div style="font-size: 12px; color: #6b7280;">💡 ${event.suggestion}</div>` : ''}
            </div>
          `
        })
      }

      html += '</div>'
    })

    html += '</div></div>'
    container.innerHTML = html
    document.body.appendChild(container)

    // 生成图片
    const canvas = await html2canvas(container, {
      backgroundColor: null,
      scale: 2,
      logging: false
    })

    document.body.removeChild(container)

    // 下载图片
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `makemyday-${new Date().toISOString().split('T')[0]}.png`
      link.click()
      URL.revokeObjectURL(url)
    })
  } catch (error) {
    console.error('导出图片失败:', error)
    throw new Error('导出图片失败，请确保已安装 html2canvas')
  }
}

// 从 JSON 导入
export const importFromJSON = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const events = JSON.parse(e.target.result)

        // 验证数据格式
        if (!Array.isArray(events)) {
          throw new Error('无效的 JSON 格式：数据必须是数组')
        }

        // 验证每个事件的必需字段
        const validEvents = events.map(event => {
          if (!event.id || !event.title) {
            throw new Error('无效的事件数据：缺少必需字段')
          }

          return {
            ...event,
            // 确保所有必需字段都存在
            priority: event.priority || 'not-urgent-not-important',
            suggestion: event.suggestion || '',
            completed: event.completed || false,
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

