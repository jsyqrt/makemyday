import { useState, useEffect } from 'react'
import ConfigModal from './components/ConfigModal'
import MainLayout from './components/MainLayout'
import { loadConfig, saveConfig } from './utils/storage'

function App() {
  const [config, setConfig] = useState(null)
  const [showConfig, setShowConfig] = useState(false)

  useEffect(() => {
    const savedConfig = loadConfig()
    if (!savedConfig || !savedConfig.apiKey) {
      setShowConfig(true)
    } else {
      setConfig(savedConfig)
    }
  }, [])

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

