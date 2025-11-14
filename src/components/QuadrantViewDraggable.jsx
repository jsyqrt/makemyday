import { useState, useRef, useEffect } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import ReactMarkdown from 'react-markdown'
import EventEditModal from './EventEditModal'

const quadrants = [
  {
    id: 'urgent-important',
    title: '重要且紧急',
    subtitle: '立即去做',
    color: 'bg-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-300',
    icon: '🔥'
  },
  {
    id: 'not-urgent-important',
    title: '重要但不紧急',
    subtitle: '计划去做',
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    icon: '⭐'
  },
  {
    id: 'urgent-not-important',
    title: '紧急但不重要',
    subtitle: '授权他人',
    color: 'bg-orange-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-300',
    icon: '⚡'
  },
  {
    id: 'not-urgent-not-important',
    title: '不紧急也不重要',
    subtitle: '稍后再做',
    color: 'bg-gray-500',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-300',
    icon: '📌'
  }
]

// 可拖拽的事件卡片组件
function DraggableEventCard({ event, onUpdate, onCardClick, showDragHandle = true }) {
  const [showPriorityMenu, setShowPriorityMenu] = useState(false)
  const [showCompletionDialog, setShowCompletionDialog] = useState(false)
  const [completionNote, setCompletionNote] = useState('')
  const completionNoteRef = useRef(null)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: event.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleCardClick = (e) => {
    // 如果点击的是标题、拖拽手柄、完成按钮、象限切换按钮或展开收起按钮，不打开编辑弹窗
    if (e.target.closest('.event-title') || e.target.closest('.drag-handle') || e.target.closest('.complete-button') || e.target.closest('.priority-button') || e.target.closest('.expand-button')) {
      return
    }
    // 否则打开编辑弹窗
    onCardClick(event)
  }

  const toggleExpand = (e) => {
    e.stopPropagation()
    onUpdate(event.id, { isExpanded: !event.isExpanded })
  }

  // 检查是否有详情或完成记录
  const hasExpandableContent = event.detail || (event.eventType === 'recurring' && event.completionHistory && event.completionHistory.length > 0)

  const handlePriorityChange = (newPriority) => {
    onUpdate(event.id, { priority: newPriority })
    setShowPriorityMenu(false)
  }

  // 处理完成按钮点击
  const handleCompleteClick = (e) => {
    e.stopPropagation()

    if (event.eventType === 'recurring') {
      // 周期性事件：打开弹窗让用户填写说明
      setShowCompletionDialog(true)
      setCompletionNote('')
    } else {
      // 一次性事件：直接切换完成状态
      const updates = { completed: !event.completed }
      // 如果是标记为完成，记录完成时间
      if (!event.completed) {
        updates.completedAt = new Date().toISOString()
      } else {
        // 如果是取消完成，删除完成时间
        updates.completedAt = null
      }
      onUpdate(event.id, updates)
    }
  }

  // 确认完成周期性事件
  const handleConfirmCompletion = (e) => {
    e.stopPropagation() // 阻止事件冒泡，避免触发卡片点击
    const completionHistory = event.completionHistory || []
    const newHistory = [
      ...completionHistory,
      {
        timestamp: new Date().toISOString(),
        note: completionNote.trim()
      }
    ]
    onUpdate(event.id, { completionHistory: newHistory })
    setShowCompletionDialog(false)
    setCompletionNote('')
  }

  // 取消完成记录
  const handleCancelCompletion = (e) => {
    e.stopPropagation() // 阻止事件冒泡，避免触发卡片点击
    setShowCompletionDialog(false)
    setCompletionNote('')
  }

  // 自动调整 textarea 高度
  useEffect(() => {
    if (completionNoteRef.current) {
      completionNoteRef.current.style.height = 'auto'
      completionNoteRef.current.style.height = completionNoteRef.current.scrollHeight + 'px'
    }
  }, [completionNote])

  // 获取当前象限的配置
  const currentQuadrant = quadrants.find(q => q.id === event.priority) || quadrants[3]

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all p-4 border border-gray-200 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex justify-between items-center gap-2 mb-2">
        <div className="flex-1 flex items-center gap-2">
          {/* 拖拽手柄 */}
          {showDragHandle && (
            <div className="drag-handle text-gray-400 cursor-grab active:cursor-grabbing" {...listeners}>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"/>
              </svg>
            </div>
          )}
          <h4
            className={`event-title font-semibold cursor-grab active:cursor-grabbing ${event.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}
            {...listeners}
          >
            {/* 周期性事件标识 */}
            {event.eventType === 'recurring' && (
              <span className="mr-2 text-base">🔄</span>
            )}
            {event.title}
            {event.completed && (
              <span className="ml-2 text-xs text-green-600">✓</span>
            )}
          </h4>

          {/* 展开/收起按钮 - 紧跟标题 */}
          {hasExpandableContent && (
            <button
              className="expand-button p-1 rounded transition-colors ml-1"
              onClick={toggleExpand}
              title={event.isExpanded ? '收起' : '展开'}
            >
              <span className="text-gray-600 hover:bg-gray-100 p-1 rounded text-sm">
                {event.isExpanded ? '▼' : '▶'}
              </span>
            </button>
          )}
        </div>
        <div className="flex gap-1 flex-shrink-0">

          {/* 完成按钮 */}
          <button
            className="complete-button p-1 rounded transition-colors"
            onClick={handleCompleteClick}
            title={
              event.eventType === 'recurring'
                ? '记录完成一次'
                : event.completed
                ? '标记为未完成'
                : '标记为完成'
            }
          >
            {event.eventType === 'recurring' ? (
              <span className="text-green-600 hover:bg-green-50 p-1 rounded">✓</span>
            ) : event.completed ? (
              <span className="text-gray-600 hover:bg-gray-100 p-1 rounded">↩️</span>
            ) : (
              <span className="text-green-600 hover:bg-green-50 p-1 rounded">✓</span>
            )}
          </button>

          {/* 周期性事件完成记录弹窗 */}
          {showCompletionDialog && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              onClick={handleCancelCompletion}
            >
              <div
                className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  ✅ 记录完成
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  记录 <span className="font-medium text-gray-800">"{event.title}"</span> 的完成情况
                </p>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    完成说明（可选）
                  </label>
                  <textarea
                    ref={completionNoteRef}
                    value={completionNote}
                    onChange={(e) => setCompletionNote(e.target.value)}
                    placeholder="简单描述一下本次完成的情况..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none overflow-hidden"
                    style={{ minHeight: '80px' }}
                    autoFocus
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleCancelCompletion}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleConfirmCompletion}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    确认完成
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 象限切换按钮 */}
          <div className="priority-button relative">
            <button
              className="p-1 rounded transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                setShowPriorityMenu(!showPriorityMenu)
              }}
              title="切换象限"
            >
              <span className="text-purple-600 hover:bg-purple-50 p-1 rounded block">{currentQuadrant.icon}</span>
            </button>

            {showPriorityMenu && (
              <>
                {/* 点击外部关闭菜单 */}
                <div
                  className="fixed inset-0 z-30"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowPriorityMenu(false)
                  }}
                />

                {/* 下拉菜单 */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-40">
                  {quadrants.map((q, index) => (
                    <button
                      key={q.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        handlePriorityChange(q.id)
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-2 ${
                        event.priority === q.id ? 'bg-purple-50' : ''
                      } ${
                        index === quadrants.length - 1 ? 'rounded-b-lg' : 'border-b border-gray-100'
                      } ${
                        index === 0 ? 'rounded-t-lg' : ''
                      }`}
                    >
                      <span className="text-xl">{q.icon}</span>
                      <span className="text-sm font-medium text-gray-700">{q.title}</span>
                      {event.priority === q.id && (
                        <span className="ml-auto text-purple-600">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {event.suggestion && (
        <p className={`text-sm mt-2 ${event.completed ? 'text-gray-400' : 'text-gray-600'}`}>
          💡 {event.suggestion}
        </p>
      )}
      {/* 只在展开时显示详情和完成记录 */}
      {event.isExpanded !== false && event.detail && (
        <div className={`text-sm mt-2 p-3 rounded-lg ${event.completed ? 'bg-gray-50 text-gray-400' : 'bg-blue-50 text-blue-800'}`}>
          <div className="font-medium text-xs mb-1 opacity-75">详细信息：</div>
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>{event.detail}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* 完成记录列表 - 只在展开时显示 */}
      {event.isExpanded !== false && event.eventType === 'recurring' && event.completionHistory && event.completionHistory.length > 0 && (
        <div className="text-sm mt-2 p-3 rounded-lg bg-green-50 border border-green-200">
          <div className="font-medium text-xs mb-2 text-green-700">完成记录 ({event.completionHistory.length} 次)：</div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {event.completionHistory.slice().reverse().slice(0, 5).map((record, index) => (
              <div key={index} className="text-xs flex items-start gap-2 py-1">
                <span className="text-green-600 flex-shrink-0">✓</span>
                <div className="flex-1 min-w-0">
                  <div className="text-gray-600">
                    {new Date(record.timestamp).toLocaleString('zh-CN', {
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  {record.note && (
                    <div className="text-gray-500 mt-0.5 break-words prose prose-sm max-w-none">
                      <ReactMarkdown>{record.note}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {event.completionHistory.length > 5 && (
              <div className="text-xs text-gray-400 text-center pt-1">
                还有 {event.completionHistory.length - 5} 条记录...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// 可放置的象限容器
function DroppableQuadrant({ quadrant, children, onAddClick, isImageBackground, containerOpacity = 50 }) {
  const { setNodeRef } = useSortable({
    id: quadrant.id,
    data: {
      type: 'quadrant',
      quadrant: quadrant.id
    }
  })

  // 计算透明度样式和毛玻璃效果
  const bgStyle = isImageBackground
    ? { backgroundColor: `rgba(255, 255, 255, ${containerOpacity / 100})` }
    : {}

  // 只有透明度大于10%时才应用毛玻璃效果
  const blurClass = isImageBackground && containerOpacity > 10 ? 'backdrop-blur-sm' : ''

  return (
    <div
      ref={setNodeRef}
      className={`${isImageBackground ? blurClass : quadrant.bgColor} rounded-2xl shadow-xl border-2 ${quadrant.borderColor} overflow-hidden`}
      style={bgStyle}
    >
      {/* 象限头部 */}
      <div className={`${quadrant.color} text-white p-4`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{quadrant.icon}</span>
            <div>
              <h3 className="text-xl font-bold">{quadrant.title}</h3>
              <p className="text-sm opacity-90">{quadrant.subtitle}</p>
            </div>
          </div>
          {/* 添加按钮 */}
          <button
            onClick={() => onAddClick(quadrant.id)}
            className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-all flex items-center justify-center text-white text-xl font-bold"
            title={`创建${quadrant.title}事件`}
          >
            +
          </button>
        </div>
      </div>

      {/* 事件列表 */}
      <div className="p-4 space-y-3">
        {children}
      </div>
    </div>
  )
}

function QuadrantViewDraggable({ events, onUpdate, onDelete, onReorder, onAdd, showCompleted = true, isImageBackground = false, containerOpacity = 50 }) {
  const [activeId, setActiveId] = useState(null)
  const [editingEvent, setEditingEvent] = useState(null) // 当前正在编辑的事件
  const [isCreating, setIsCreating] = useState(false) // 是否在创建新事件
  const [completedBoxHeight, setCompletedBoxHeight] = useState('auto') // 已完成框的高度
  const quadrantsRef = useRef(null) // 左侧四象限容器的引用

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // 计算并设置已完成框的高度
  useEffect(() => {
    const updateHeight = () => {
      if (quadrantsRef.current) {
        const height = quadrantsRef.current.offsetHeight
        setCompletedBoxHeight(`${height}px`)
      }
    }

    // 初始计算
    updateHeight()

    // 监听窗口大小变化
    window.addEventListener('resize', updateHeight)

    // 使用 ResizeObserver 监听内容变化
    const resizeObserver = new ResizeObserver(updateHeight)
    if (quadrantsRef.current) {
      resizeObserver.observe(quadrantsRef.current)
    }

    return () => {
      window.removeEventListener('resize', updateHeight)
      resizeObserver.disconnect()
    }
  }, [events]) // 当 events 变化时重新计算

  // 获取未完成的事件（四象限中显示）
  // 周期性事件永远留在象限中，只有一次性事件完成后才会移除
  const getEventsByPriority = (priority) => {
    return events.filter(event => {
      if (event.priority !== priority) return false
      // 周期性事件：永远显示在象限中
      if (event.eventType === 'recurring') return true
      // 一次性事件：只显示未完成的
      return !event.completed
    })
  }

  // 获取已完成的事件（只包含一次性事件）
  const getCompletedEvents = () => {
    return events
      .filter(event => event.completed && event.eventType !== 'recurring')
      .sort((a, b) => {
        // 按完成时间降序排列（最新完成的在最前面）
        // 如果有 completedAt，优先使用；否则使用 id（因为 id 是时间戳）作为后备
        const timeA = a.completedAt ? new Date(a.completedAt).getTime() : a.id
        const timeB = b.completedAt ? new Date(b.completedAt).getTime() : b.id
        return timeB - timeA
      })
  }

  // 打开编辑弹窗
  const handleCardClick = (event) => {
    setEditingEvent(event)
    setIsCreating(false)
  }

  // 点击象限标题栏的+按钮，创建新事件
  const handleAddClick = (priority) => {
    setEditingEvent({
      title: '',
      suggestion: '',
      detail: '',
      priority: priority,
      completed: false
    })
    setIsCreating(true)
  }

  // 保存编辑
  const handleSaveEdit = (eventId, updates) => {
    if (isCreating) {
      // 创建新事件
      const newEvent = {
        id: Date.now(),
        ...updates,
        createdAt: new Date().toISOString()
      }
      onAdd(newEvent)
    } else {
      // 更新已有事件
      onUpdate(eventId, updates)
    }
    setEditingEvent(null)
    setIsCreating(false)
  }

  // 自动保存（不关闭弹窗）
  const handleAutoSave = (eventId, updates) => {
    // 只更新数据，不关闭弹窗
    onUpdate(eventId, updates)
    // 同时更新 editingEvent 状态，保持弹窗内容同步
    setEditingEvent(prev => prev ? { ...prev, ...updates } : null)
  }

  // 关闭编辑弹窗
  const handleCloseEdit = () => {
    setEditingEvent(null)
    setIsCreating(false)
  }

  // 删除事件
  const handleDeleteEvent = (eventId) => {
    onDelete(eventId)
    setEditingEvent(null)
    setIsCreating(false)
  }

  const handleDragStart = (event) => {
    setActiveId(event.active.id)
  }

  const handleDragOver = (event) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id

    // 查找被拖拽的事件
    const activeEvent = events.find(e => e.id === activeId)
    if (!activeEvent) return

    // 如果拖到象限上（跨象限移动）
    if (quadrants.some(q => q.id === overId)) {
      const newPriority = overId
      if (activeEvent.priority !== newPriority) {
        onUpdate(activeId, { priority: newPriority })
      }
    }
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeId = active.id
    const overId = over.id

    // 如果拖到同一个位置，不做任何操作
    if (activeId === overId) return

    const activeEvent = events.find(e => e.id === activeId)
    const overEvent = events.find(e => e.id === overId)

    if (!activeEvent || !overEvent) return

    // 跨象限移动：改变优先级
    if (activeEvent.priority !== overEvent.priority && !activeEvent.completed && !overEvent.completed) {
      onUpdate(activeId, { priority: overEvent.priority })
    }
    // 同象限内排序：重新排列顺序
    else if (activeEvent.priority === overEvent.priority) {
      const oldIndex = events.findIndex(e => e.id === activeId)
      const newIndex = events.findIndex(e => e.id === overId)

      if (oldIndex !== newIndex && onReorder) {
        const newEvents = [...events]
        const [removed] = newEvents.splice(oldIndex, 1)
        newEvents.splice(newIndex, 0, removed)
        onReorder(newEvents)
      }
    }
  }

  const activeEvent = activeId ? events.find(e => e.id === activeId) : null

  const completedEvents = getCompletedEvents()

  return (
    <div className="space-y-6">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className={`flex gap-6 items-start ${showCompleted ? '' : 'justify-center'}`}>
          {/* 左侧：四象限 */}
          <div ref={quadrantsRef} className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${showCompleted ? 'flex-1' : 'max-w-7xl w-full'}`}>
            {quadrants.map((quadrant) => {
              const quadrantEvents = getEventsByPriority(quadrant.id)
              const eventIds = quadrantEvents.map(e => e.id)

              return (
                <SortableContext
                  key={quadrant.id}
                  id={quadrant.id}
                  items={[quadrant.id, ...eventIds]}
                  strategy={verticalListSortingStrategy}
                >
                  <DroppableQuadrant quadrant={quadrant} onAddClick={handleAddClick} isImageBackground={isImageBackground} containerOpacity={containerOpacity}>
                    {quadrantEvents.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <p>暂无事件</p>
                        <p className="text-xs mt-2">拖拽事件到这里</p>
                      </div>
                    ) : (
                      <SortableContext items={eventIds} strategy={verticalListSortingStrategy}>
                        {quadrantEvents.map((event) => (
                          <DraggableEventCard
                            key={event.id}
                            event={event}
                            onUpdate={onUpdate}
                            onCardClick={handleCardClick}
                          />
                        ))}
                      </SortableContext>
                    )}
                  </DroppableQuadrant>
                </SortableContext>
              )
            })}
          </div>

          {/* 右侧：已完成区域 - 根据 showCompleted 决定是否显示 */}
          {showCompleted && (
            <div
              className={`w-80 ${isImageBackground && containerOpacity > 10 ? 'backdrop-blur-sm' : isImageBackground ? '' : 'bg-green-50'} rounded-2xl shadow-xl border-2 border-green-300 overflow-hidden flex flex-col`}
              style={{
                height: completedBoxHeight,
                ...(isImageBackground ? { backgroundColor: `rgba(255, 255, 255, ${containerOpacity / 100})` } : {})
              }}
            >
            {/* 头部 */}
            <div className="bg-green-500 text-white p-4 flex-shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-3xl">✅</span>
                <div>
                  <h3 className="text-xl font-bold">已完成</h3>
                  <p className="text-sm opacity-90">
                    {completedEvents.length} 个事件
                  </p>
                </div>
              </div>
            </div>

            {/* 已完成事件列表 */}
            <div className="p-4 space-y-3 flex-1 overflow-y-auto min-h-0">
              {completedEvents.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p>暂无已完成事件</p>
                  <p className="text-xs mt-2">完成事件后会显示在这里</p>
                </div>
              ) : (
                completedEvents.map((event) => (
                  <DraggableEventCard
                    key={event.id}
                    event={event}
                    onUpdate={onUpdate}
                    onCardClick={handleCardClick}
                    showDragHandle={false}
                  />
                ))
              )}
            </div>
            </div>
          )}
        </div>

        <DragOverlay>
          {activeEvent ? (
            <div className="bg-white rounded-lg shadow-2xl p-4 border-2 border-purple-500 opacity-90">
              <h4 className="font-semibold text-gray-800">
                {activeEvent.title}
              </h4>
              {activeEvent.suggestion && (
                <p className="text-sm text-gray-600 mt-2">
                  💡 {activeEvent.suggestion}
                </p>
              )}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* 编辑弹窗 */}
      {editingEvent && (
        <EventEditModal
          event={editingEvent}
          onSave={handleSaveEdit}
          onAutoSave={handleAutoSave}
          onClose={handleCloseEdit}
          onDelete={handleDeleteEvent}
          isCreating={isCreating}
        />
      )}
    </div>
  )
}

export default QuadrantViewDraggable

