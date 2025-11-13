import { useState, useEffect } from 'react'
import InputArea from './InputArea'
import EventList from './EventList'
import QuadrantView from './QuadrantView'
import { loadEvents, saveEvents, checkStorageWarning, setStorageWarning } from '../utils/storage'
import { callLLM } from '../utils/llm'

function MainLayout({ config, onOpenConfig }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState('list') // 'list' or 'quadrant'
  const [showWarning, setShowWarning] = useState(false)

  // 初始化：只在组件挂载时加载数据
  useEffect(() => {
    const savedEvents = loadEvents()
    setEvents(savedEvents)

    // 检查是否需要显示刷新警告
    if (!checkStorageWarning()) {
      setShowWarning(true)
      setStorageWarning()
    }
  }, []) // 空数组：只执行一次

  // 监听页面刷新和关闭（依赖 events.length）
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (events.length > 0) {
        e.preventDefault()
        // 自定义提示信息
        const message = '⚠️ 数据已自动保存在浏览器中。\n\n如果您清除浏览器缓存或使用无痕模式，数据将会丢失！\n\n确定要离开吗？'
        e.returnValue = message
        return message
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [events.length])

  // 自动保存（依赖 events）
  useEffect(() => {
    saveEvents(events)
  }, [events])

  const handleAddInput = async (text) => {
    if (!text.trim()) return

    setLoading(true)
    try {
      const parsedEvents = await callLLM(config, text)

      if (Array.isArray(parsedEvents) && parsedEvents.length > 0) {
        const newEvents = parsedEvents.map((event, index) => ({
          id: Date.now() + index,
          title: event.title || '未命名事件',
          priority: event.priority || 'not-urgent-not-important',
          suggestion: event.suggestion || '',
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
    }
  }

  const handleUpdateEvent = (id, updates) => {
    setEvents(events.map(event =>
      event.id === id ? { ...event, ...updates } : event
    ))
  }

  const handleDeleteEvent = (id) => {
    if (confirm('确定要删除这个事件吗？')) {
      setEvents(events.filter(event => event.id !== id))
    }
  }

  const handleReorderEvents = (newEvents) => {
    setEvents(newEvents)
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
              <button
                onClick={onOpenConfig}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                ⚙️ 设置
              </button>
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 transition-colors ${
                    viewMode === 'list'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  📋 列表
                </button>
                <button
                  onClick={() => setViewMode('quadrant')}
                  className={`px-4 py-2 transition-colors ${
                    viewMode === 'quadrant'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  📊 四象限
                </button>
              </div>
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
            {viewMode === 'list' ? (
              <EventList
                events={events}
                onUpdate={handleUpdateEvent}
                onDelete={handleDeleteEvent}
                onReorder={handleReorderEvents}
              />
            ) : (
              <QuadrantView
                events={events}
                onUpdate={handleUpdateEvent}
                onDelete={handleDeleteEvent}
              />
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default MainLayout

