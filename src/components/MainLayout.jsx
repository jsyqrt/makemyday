import { useState, useEffect, useRef } from 'react'
import InputArea from './InputArea'
import QuadrantViewDraggable from './QuadrantViewDraggable'
import { loadEvents, saveEvents, checkStorageWarning, setStorageWarning } from '../utils/storage'
import { callLLM } from '../utils/llm'
import { exportToJSON, exportToMarkdown, exportToImage, importFromJSON } from '../utils/export'

function MainLayout({ config, onOpenConfig }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [aiStreamOutput, setAiStreamOutput] = useState('') // AI 流式输出内容
  const fileInputRef = useRef(null)
  const isInitialized = useRef(false) // 标记是否已初始化

  // 初始化：只在组件挂载时加载数据
  useEffect(() => {
    const savedEvents = loadEvents()
    setEvents(savedEvents)

    // 延迟标记初始化完成，确保 setEvents 已经执行
    setTimeout(() => {
      isInitialized.current = true
    }, 100)

    // 检查是否需要显示刷新警告
    if (!checkStorageWarning()) {
      setShowWarning(true)
      setStorageWarning()
    }
  }, []) // 空数组：只执行一次

  // 自动保存（依赖 events）- 跳过初始化时的保存
  useEffect(() => {
    if (isInitialized.current) {
      saveEvents(events)
    }
  }, [events])

  const handleAddInput = async (text) => {
    if (!text.trim()) return

    setLoading(true)
    setAiStreamOutput('') // 清空之前的输出
    try {
      // 流式输出回调函数
      const onStreamCallback = (token, fullContent) => {
        setAiStreamOutput(fullContent)
      }

      const parsedEvents = await callLLM(config, text, onStreamCallback)

      if (Array.isArray(parsedEvents) && parsedEvents.length > 0) {
        const newEvents = parsedEvents.map((event, index) => ({
          id: Date.now() + index,
          title: event.title || '未命名事件',
          priority: event.priority || 'not-urgent-not-important',
          suggestion: event.suggestion || '',
          detail: event.detail || '', // 详细信息
          completed: false,
          createdAt: new Date().toISOString()
        }))
        setEvents([...events, ...newEvents])
      } else {
        alert('AI 返回的数据格式不正确')
      }
    } catch (error) {
      alert(`处理失败: ${error.message}`)
    } finally {
      setLoading(false)
      // 延迟清空流式输出，让用户看到完整结果
      setTimeout(() => setAiStreamOutput(''), 1000)
    }
  }

  const handleUpdateEvent = (id, updates) => {
    setEvents(events.map(event =>
      event.id === id ? { ...event, ...updates } : event
    ))
  }

  const handleDeleteEvent = (id) => {
    setEvents(events.filter(event => event.id !== id))
  }

  const handleReorderEvents = (newEvents) => {
    setEvents(newEvents)
  }

  const handleExportJSON = () => {
    exportToJSON(events)
    setShowExportMenu(false)
  }

  const handleExportMarkdown = () => {
    exportToMarkdown(events)
    setShowExportMenu(false)
  }

  const handleExportImage = async () => {
    try {
      await exportToImage(events)
      setShowExportMenu(false)
    } catch (error) {
      alert(error.message)
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const importedEvents = await importFromJSON(file)

      if (confirm(`确定要导入 ${importedEvents.length} 个事件吗？\n\n这将覆盖当前的所有事件！`)) {
        setEvents(importedEvents)
        alert('导入成功！')
      }
    } catch (error) {
      alert(`导入失败: ${error.message}`)
    }

    // 清空 input
    e.target.value = ''
  }

  return (
    <div className="min-h-screen pb-8">
      {/* 警告提示 */}
      {showWarning && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-xl animate-bounce">
          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-500 text-yellow-900 p-5 rounded-xl shadow-2xl">
            <div className="flex items-start">
              <div className="flex-shrink-0 text-2xl animate-pulse">⚠️</div>
              <div className="ml-3 flex-1">
                <p className="text-base font-bold mb-2">
                  ⚡ 重要提示
                </p>
                <p className="text-sm font-medium mb-1">
                  • 数据存储在浏览器本地（localStorage）
                </p>
                <p className="text-sm font-medium mb-1">
                  • 请勿清除浏览器缓存，否则数据会丢失
                </p>
                <p className="text-sm font-medium">
                  • 无痕模式下的数据关闭浏览器后会消失
                </p>
              </div>
              <button
                onClick={() => setShowWarning(false)}
                className="ml-3 text-yellow-700 hover:text-yellow-900 text-2xl font-bold leading-none"
                title="我知道了"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 头部 */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              ✨ Make My Day
            </h1>
            <div className="flex gap-3">
              {/* 导入按钮 */}
              <button
                onClick={handleImportClick}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                title="导入 JSON 文件"
              >
                📥 导入
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />

              {/* 导出菜单 */}
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  disabled={loading || events.length === 0}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                  title="导出"
                >
                  📤 导出
                </button>
                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-10">
                    <button
                      onClick={handleExportJSON}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-2 border-b border-gray-100"
                    >
                      <span>📄</span>
                      <span>导出为 JSON</span>
                    </button>
                    <button
                      onClick={handleExportMarkdown}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-2 border-b border-gray-100"
                    >
                      <span>📝</span>
                      <span>导出为 Markdown</span>
                    </button>
                    <button
                      onClick={handleExportImage}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-2 rounded-b-lg"
                    >
                      <span>🖼️</span>
                      <span>导出为图片</span>
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={onOpenConfig}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                ⚙️ 设置
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* 输入区域 */}
        <InputArea
          onSubmit={handleAddInput}
          loading={loading}
          config={config}
          aiStreamOutput={aiStreamOutput}
        />

        {/* 事件展示区 */}
        {events.length === 0 ? (
          <div className="mt-8 text-center py-16 bg-white rounded-2xl shadow-lg">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">
              还没有任何事件
            </h3>
            <p className="text-gray-500">
              在上方输入框中告诉我你的计划，AI 会帮你分解成具体的事件
            </p>
          </div>
        ) : (
          <div className="mt-8">
            <QuadrantViewDraggable
              events={events}
              onUpdate={handleUpdateEvent}
              onDelete={handleDeleteEvent}
              onReorder={handleReorderEvents}
            />
          </div>
        )}
      </main>
    </div>
  )
}

export default MainLayout

