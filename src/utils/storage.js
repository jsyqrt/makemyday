// 配置存储
export const loadConfig = () => {
  try {
    const config = localStorage.getItem('makemyday_config')
    return config ? JSON.parse(config) : null
  } catch (error) {
    console.error('加载配置失败:', error)
    return null
  }
}

export const saveConfig = (config) => {
  try {
    localStorage.setItem('makemyday_config', JSON.stringify(config))
  } catch (error) {
    console.error('保存配置失败:', error)
  }
}

// 事件存储
export const loadEvents = () => {
  try {
    const events = localStorage.getItem('makemyday_events')
    return events ? JSON.parse(events) : []
  } catch (error) {
    console.error('加载事件失败:', error)
    return []
  }
}

export const saveEvents = (events) => {
  try {
    localStorage.setItem('makemyday_events', JSON.stringify(events))
  } catch (error) {
    console.error('保存事件失败:', error)
  }
}

// 检查浏览器存储警告
export const checkStorageWarning = () => {
  const warned = sessionStorage.getItem('makemyday_storage_warned')
  return warned === 'true'
}

export const setStorageWarning = () => {
  sessionStorage.setItem('makemyday_storage_warned', 'true')
}

