import { useState, useEffect, useRef } from 'react'
import InputArea from './InputArea'
import QuadrantViewDraggable from './QuadrantViewDraggable'
import GoalPanel from './GoalPanel'
import { loadEvents, saveEvents, checkStorageWarning, setStorageWarning, loadUISettings, saveUISettings, loadBackgroundSettings, loadGoals, saveGoals } from '../utils/storage'
import { callLLM } from '../utils/llm'
import { exportToJSON, importFromJSON } from '../utils/export'

function MainLayout({ config, onOpenConfig }) {
  const [events, setEvents] = useState([])
  const [goals, setGoals] = useState([]) // 长期目标
  const [loading, setLoading] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [showPlanModal, setShowPlanModal] = useState(false) // 显示规划弹窗
  const [showSettingsMenu, setShowSettingsMenu] = useState(false) // 显示设置菜单
  const [showCompleted, setShowCompleted] = useState(true) // 是否显示已完成栏目
  const [showGoals, setShowGoals] = useState(true) // 是否显示长期目标栏目
  const [aiStreamOutput, setAiStreamOutput] = useState('') // AI 流式输出内容
  const [bgSettings, setBgSettings] = useState(loadBackgroundSettings()) // 背景设置
  const fileInputRef = useRef(null)
  const isInitialized = useRef(false) // 标记是否已初始化

  // 初始化：只在组件挂载时加载数据
  useEffect(() => {
    const savedEvents = loadEvents()
    setEvents(savedEvents)

    // 加载长期目标
    const savedGoals = loadGoals()
    setGoals(savedGoals)

    // 加载 UI 设置
    const uiSettings = loadUISettings()
    setShowCompleted(uiSettings.showCompleted)
    setShowGoals(uiSettings.showGoals !== false) // 默认显示

    // 延迟标记初始化完成，确保 setEvents 已经执行
    setTimeout(() => {
      isInitialized.current = true
    }, 100)

    // 检查是否需要显示刷新警告
    if (!checkStorageWarning()) {
      setShowWarning(true)
      setStorageWarning()
    }

    // 监听背景设置变化
    const handleBgChange = () => {
      setBgSettings(loadBackgroundSettings())
    }
    window.addEventListener('backgroundSettingsChanged', handleBgChange)
    return () => window.removeEventListener('backgroundSettingsChanged', handleBgChange)
  }, []) // 空数组：只执行一次

  // 保存 UI 设置
  useEffect(() => {
    if (isInitialized.current) {
      saveUISettings({ showCompleted, showGoals })
    }
  }, [showCompleted, showGoals])

  // 保存长期目标
  useEffect(() => {
    if (isInitialized.current) {
      saveGoals(goals)
    }
  }, [goals])

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
          eventType: event.eventType || 'one-time', // 默认为一次性事件
          completionHistory: [], // 周期性事件的完成记录
          isExpanded: true, // 默认展开
          createdAt: new Date().toISOString()
        }))
        setEvents([...newEvents, ...events])
        // 成功后关闭弹窗
        setShowPlanModal(false)
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

  const handleAddEvent = (newEvent) => {
    setEvents([newEvent, ...events])
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
    setShowSettingsMenu(false)
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
    setShowSettingsMenu(false)
  }

  const handleConfigClick = () => {
    onOpenConfig()
    setShowSettingsMenu(false)
  }

  const toggleShowCompleted = () => {
    setShowCompleted(!showCompleted)
  }

  const toggleShowGoals = () => {
    setShowGoals(!showGoals)
  }

  // 目标相关处理函数
  const handleAddGoal = (newGoal) => {
    setGoals([newGoal, ...goals])
  }

  const handleUpdateGoal = (goalId, updates) => {
    setGoals(goals.map(goal =>
      goal.id === goalId ? { ...goal, ...updates } : goal
    ))
  }

  const handleDeleteGoal = (goalId) => {
    setGoals(goals.filter(goal => goal.id !== goalId))
  }

  const handleReorderGoals = (newGoals) => {
    setGoals(newGoals)
  }

  const handleAddSubtask = (goalId, subtask) => {
    setGoals(goals.map(goal => {
      if (goal.id === goalId) {
        return {
          ...goal,
          subtasks: [...(goal.subtasks || []), subtask]
        }
      }
      return goal
    }))
  }

  const handleUpdateSubtask = (goalId, subtaskId, updates) => {
    setGoals(goals.map(goal => {
      if (goal.id === goalId) {
        return {
          ...goal,
          subtasks: (goal.subtasks || []).map(subtask =>
            subtask.id === subtaskId ? { ...subtask, ...updates } : subtask
          )
        }
      }
      return goal
    }))
  }

  const handleDeleteSubtask = (goalId, subtaskId) => {
    setGoals(goals.map(goal => {
      if (goal.id === goalId) {
        return {
          ...goal,
          subtasks: (goal.subtasks || []).filter(subtask => subtask.id !== subtaskId)
        }
      }
      return goal
    }))
  }

  const handleToggleSubtaskProjection = (goalId, subtaskId) => {
    const goal = goals.find(g => g.id === goalId)
    const subtask = goal?.subtasks?.find(s => s.id === subtaskId)

    if (!subtask) return

    if (subtask.projected) {
      // 取消投影：从 events 中移除对应的事件
      setEvents(events.filter(e => !(e.goalId === goalId && e.subtaskId === subtaskId)))
    } else {
      // 投影：在 events 中创建对应的事件
      const newEvent = {
        id: Date.now(),
        title: subtask.title,
        priority: subtask.priority || 'not-urgent-not-important',
        suggestion: subtask.suggestion || '',
        detail: subtask.estimatedTime ? `预估时间：${subtask.estimatedTime}` : '',
        completed: subtask.completed || false,
        eventType: 'one-time',
        isExpanded: true,
        createdAt: new Date().toISOString(),
        // 关联目标信息
        goalId: goalId,
        subtaskId: subtaskId,
        goalTitle: goal.title,
        isFromGoal: true
      }
      setEvents([newEvent, ...events])
    }

    // 更新子任务的投影状态
    setGoals(goals.map(g => {
      if (g.id === goalId) {
        return {
          ...g,
          subtasks: (g.subtasks || []).map(s =>
            s.id === subtaskId ? { ...s, projected: !s.projected } : s
          )
        }
      }
      return g
    }))
  }

  // 处理事件更新时同步目标子任务
  const handleUpdateEventWithSync = (id, updates) => {
    const event = events.find(e => e.id === id)

    // 更新事件
    setEvents(events.map(e =>
      e.id === id ? { ...e, ...updates } : e
    ))

    // 如果是来自目标的事件，同步更新子任务
    if (event?.isFromGoal && event.goalId && event.subtaskId) {
      const subtaskUpdates = {}
      if (updates.title !== undefined) subtaskUpdates.title = updates.title
      if (updates.priority !== undefined) subtaskUpdates.priority = updates.priority
      if (updates.suggestion !== undefined) subtaskUpdates.suggestion = updates.suggestion
      if (updates.completed !== undefined) subtaskUpdates.completed = updates.completed

      if (Object.keys(subtaskUpdates).length > 0) {
        setGoals(goals.map(goal => {
          if (goal.id === event.goalId) {
            return {
              ...goal,
              subtasks: (goal.subtasks || []).map(subtask =>
                subtask.id === event.subtaskId ? { ...subtask, ...subtaskUpdates } : subtask
              )
            }
          }
          return goal
        }))
      }
    }
  }

  // 处理事件删除时同步取消投影
  const handleDeleteEventWithSync = (id) => {
    const event = events.find(e => e.id === id)

    // 删除事件
    setEvents(events.filter(e => e.id !== id))

    // 如果是来自目标的事件，取消子任务的投影状态
    if (event?.isFromGoal && event.goalId && event.subtaskId) {
      setGoals(goals.map(goal => {
        if (goal.id === event.goalId) {
          return {
            ...goal,
            subtasks: (goal.subtasks || []).map(subtask =>
              subtask.id === event.subtaskId ? { ...subtask, projected: false } : subtask
            )
          }
        }
        return goal
      }))
    }
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
      <header className="bg-gradient-to-br from-purple-500 to-blue-500">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">
                ✨ Make My Day
              </h1>
              <p className="text-white/80 text-sm">
                根据紧急程度和重要程度分类管理你的事件 · 可拖拽调整象限
              </p>
            </div>
            <div className="flex gap-3">
              {/* 帮我规划按钮 */}
              <button
                onClick={() => setShowPlanModal(true)}
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all flex items-center gap-2 disabled:opacity-50 font-medium shadow-md"
                title="让 AI 帮我规划"
              >
                ✨ 帮我规划
              </button>

              {/* 设置菜单 */}
              <div className="relative">
                <button
                  onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                  title="设置"
                >
                  ⚙️ 设置
                </button>

                {showSettingsMenu && (
                  <>
                    {/* 点击外部关闭菜单 */}
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setShowSettingsMenu(false)}
                    />

                    {/* 下拉菜单 */}
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-40 overflow-hidden">
                      {/* 导入 */}
                      <button
                        onClick={handleImportClick}
                        disabled={loading}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3 border-b border-gray-100 disabled:opacity-50"
                      >
                        <span className="text-xl">📥</span>
                        <span className="text-sm font-medium text-gray-700">导入</span>
                      </button>

                      {/* 导出 */}
                      <button
                        onClick={handleExportJSON}
                        disabled={loading || events.length === 0}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3 border-b border-gray-100 disabled:opacity-50"
                      >
                        <span className="text-xl">📤</span>
                        <span className="text-sm font-medium text-gray-700">导出</span>
                      </button>

                      {/* 配置 */}
                      <button
                        onClick={handleConfigClick}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3 border-b border-gray-100"
                      >
                        <span className="text-xl">⚙️</span>
                        <span className="text-sm font-medium text-gray-700">配置</span>
                      </button>

                      {/* 显示长期目标 */}
                      <button
                        onClick={toggleShowGoals}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center justify-between gap-3 border-b border-gray-100"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{showGoals ? '🎯' : '🙈'}</span>
                          <span className="text-sm font-medium text-gray-700">长期目标</span>
                        </div>
                        <span className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          showGoals
                            ? 'bg-purple-500 border-purple-500'
                            : 'border-gray-300'
                        }`}>
                          {showGoals && (
                            <span className="text-white text-xs">✓</span>
                          )}
                        </span>
                      </button>

                      {/* 显示已完成 */}
                      <button
                        onClick={toggleShowCompleted}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center justify-between gap-3 border-b border-gray-100"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{showCompleted ? '👁️' : '🙈'}</span>
                          <span className="text-sm font-medium text-gray-700">已完成</span>
                        </div>
                        <span className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          showCompleted
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-300'
                        }`}>
                          {showCompleted && (
                            <span className="text-white text-xs">✓</span>
                          )}
                        </span>
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* 隐藏的文件输入 */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </div>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className={`mx-auto px-4 py-8 sm:px-6 lg:px-8 ${
        showGoals && showCompleted ? 'max-w-[1800px]' :
        (showGoals || showCompleted) ? 'max-w-[1400px]' : 'max-w-7xl'
      }`}>
        {/* 事件展示区 */}
        {events.length === 0 && goals.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">
              还没有任何事件
            </h3>
            <p className="text-gray-500 mb-6">
              点击右上角"帮我规划"按钮，让 AI 帮你分解任务
            </p>
            <button
              onClick={() => setShowPlanModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all font-medium shadow-lg"
            >
              ✨ 开始规划
            </button>
          </div>
        ) : (
          <QuadrantViewDraggable
            events={events}
            onAdd={handleAddEvent}
            onUpdate={handleUpdateEventWithSync}
            onDelete={handleDeleteEventWithSync}
            onReorder={handleReorderEvents}
            showCompleted={showCompleted}
            showGoals={showGoals}
            isImageBackground={bgSettings.backgroundType === 'image' || bgSettings.backgroundType === 'folder'}
            containerOpacity={bgSettings.containerOpacity !== undefined ? bgSettings.containerOpacity : 50}
            goals={goals}
            goalsPanel={
              <GoalPanel
                goals={goals}
                onAddGoal={handleAddGoal}
                onUpdateGoal={handleUpdateGoal}
                onDeleteGoal={handleDeleteGoal}
                onAddSubtask={handleAddSubtask}
                onUpdateSubtask={handleUpdateSubtask}
                onDeleteSubtask={handleDeleteSubtask}
                onToggleSubtaskProjection={handleToggleSubtaskProjection}
                onReorderGoals={handleReorderGoals}
                isImageBackground={bgSettings.backgroundType === 'image' || bgSettings.backgroundType === 'folder'}
                containerOpacity={bgSettings.containerOpacity !== undefined ? bgSettings.containerOpacity : 50}
                config={config}
              />
            }
          />
        )}
      </main>

      {/* AI 规划弹窗 */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => !loading && setShowPlanModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              {/* 头部 */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    ✨ AI 帮我规划
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">告诉我你的计划，AI 会帮你分解成具体的事件</p>
                </div>
                <button
                  onClick={() => !loading && setShowPlanModal(false)}
                  disabled={loading}
                  className="text-gray-500 hover:text-gray-700 text-2xl leading-none disabled:opacity-50"
                  title="关闭"
                >
                  ×
                </button>
              </div>

              {/* 输入区域 */}
              <InputArea
                onSubmit={handleAddInput}
                loading={loading}
                config={config}
                aiStreamOutput={aiStreamOutput}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MainLayout

