import { useState, useEffect } from 'react'
import ConfigModal from './components/ConfigModal'
import MainLayout from './components/MainLayout'
import { loadConfig, saveConfig, loadBackgroundSettings } from './utils/storage'

function App() {
  const [config, setConfig] = useState(null)
  const [showConfig, setShowConfig] = useState(false)
  const [bgSettings, setBgSettings] = useState(loadBackgroundSettings())
  const [currentBgIndex, setCurrentBgIndex] = useState(0)

  useEffect(() => {
    const savedConfig = loadConfig()
    if (!savedConfig || !savedConfig.apiKey) {
      setShowConfig(true)
    } else {
      setConfig(savedConfig)
    }
  }, [])

  // 加载背景设置
  useEffect(() => {
    const handleStorageChange = () => {
      setBgSettings(loadBackgroundSettings())
    }

    // 监听自定义事件（当配置模态框保存时触发）
    window.addEventListener('backgroundSettingsChanged', handleStorageChange)

    return () => {
      window.removeEventListener('backgroundSettingsChanged', handleStorageChange)
    }
  }, [])

  // 应用背景样式（带淡入淡出效果）
  useEffect(() => {
    const body = document.body

    // 添加过渡效果
    body.style.transition = 'background-image 1s ease-in-out, background 0.5s ease-in-out'

    switch (bgSettings.backgroundType) {
      case 'gradient':
        body.style.backgroundImage = 'none'
        body.style.background = `linear-gradient(135deg, ${bgSettings.gradientStart} 0%, ${bgSettings.gradientEnd} 100%)`
        body.style.backgroundAttachment = 'fixed'
        break

      case 'color':
        body.style.backgroundImage = 'none'
        body.style.background = bgSettings.backgroundColor
        body.style.backgroundAttachment = 'fixed'
        break

      case 'image':
        if (bgSettings.backgroundImage) {
          body.style.backgroundImage = `url(${bgSettings.backgroundImage})`
          body.style.backgroundSize = bgSettings.backgroundSize
          body.style.backgroundPosition = bgSettings.backgroundPosition
          body.style.backgroundRepeat = bgSettings.backgroundRepeat
          body.style.backgroundAttachment = 'fixed'
          body.style.backgroundColor = '#000'
        }
        break

      case 'folder':
        if (bgSettings.backgroundImages.length > 0) {
          const currentImage = bgSettings.backgroundImages[currentBgIndex % bgSettings.backgroundImages.length]
          body.style.backgroundImage = `url(${currentImage})`
          body.style.backgroundSize = bgSettings.backgroundSize
          body.style.backgroundPosition = bgSettings.backgroundPosition
          body.style.backgroundRepeat = bgSettings.backgroundRepeat
          body.style.backgroundAttachment = 'fixed'
          body.style.backgroundColor = '#000'
        }
        break

      default:
        body.style.backgroundImage = 'none'
        body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        body.style.backgroundAttachment = 'fixed'
    }
  }, [bgSettings, currentBgIndex])

  // 自动切换背景图片
  useEffect(() => {
    if (
      bgSettings.backgroundType === 'folder' &&
      bgSettings.autoSwitch &&
      bgSettings.backgroundImages.length > 1
    ) {
      const interval = setInterval(() => {
        setCurrentBgIndex(prev => (prev + 1) % bgSettings.backgroundImages.length)
      }, bgSettings.switchInterval * 1000)

      return () => clearInterval(interval)
    }
  }, [bgSettings.backgroundType, bgSettings.autoSwitch, bgSettings.backgroundImages.length, bgSettings.switchInterval])

  const handleSaveConfig = (newConfig) => {
    saveConfig(newConfig)
    setConfig(newConfig)
    setShowConfig(false)
  }

  return (
    <div className="min-h-screen">
      {showConfig || !config ? (
        <ConfigModal
          config={config}
          onSave={handleSaveConfig}
          onClose={() => config && setShowConfig(false)}
        />
      ) : (
        <MainLayout
          config={config}
          onOpenConfig={() => setShowConfig(true)}
        />
      )}
    </div>
  )
}

export default App

