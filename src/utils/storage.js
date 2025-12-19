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

// UI 设置存储
export const loadUISettings = () => {
  try {
    const settings = localStorage.getItem('makemyday_ui_settings')
    return settings ? JSON.parse(settings) : {
      showCompleted: true
    }
  } catch (error) {
    console.error('加载UI设置失败:', error)
    return {
      showCompleted: true
    }
  }
}

export const saveUISettings = (settings) => {
  try {
    localStorage.setItem('makemyday_ui_settings', JSON.stringify(settings))
  } catch (error) {
    console.error('保存UI设置失败:', error)
  }
}

// 背景设置存储
export const loadBackgroundSettings = () => {
  try {
    const settings = localStorage.getItem('makemyday_background_settings')
    return settings ? JSON.parse(settings) : {
      backgroundType: 'gradient', // 'gradient' | 'color' | 'image' | 'folder'
      backgroundColor: '#667eea',
      gradientStart: '#667eea',
      gradientEnd: '#764ba2',
      backgroundImage: '',
      backgroundImages: [], // 存储多张图片的 base64 或 URL
      backgroundSize: 'cover', // 'cover' | 'contain' | 'auto' | 'stretch'
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      autoSwitch: false,
      switchInterval: 30, // 秒
      containerOpacity: 50 // 容器透明度（0-100）
    }
  } catch (error) {
    console.error('加载背景设置失败:', error)
    return {
      backgroundType: 'gradient',
      backgroundColor: '#667eea',
      gradientStart: '#667eea',
      gradientEnd: '#764ba2',
      backgroundImage: '',
      backgroundImages: [],
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      autoSwitch: false,
      switchInterval: 30,
      containerOpacity: 50
    }
  }
}

export const saveBackgroundSettings = (settings) => {
  try {
    localStorage.setItem('makemyday_background_settings', JSON.stringify(settings))
  } catch (error) {
    console.error('保存背景设置失败:', error)
  }
}

// 长期目标存储
export const loadGoals = () => {
  try {
    const goals = localStorage.getItem('makemyday_goals')
    return goals ? JSON.parse(goals) : []
  } catch (error) {
    console.error('加载长期目标失败:', error)
    return []
  }
}

export const saveGoals = (goals) => {
  try {
    localStorage.setItem('makemyday_goals', JSON.stringify(goals))
  } catch (error) {
    console.error('保存长期目标失败:', error)
  }
}

