import { useState } from 'react'
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

const quadrants = [
  {
    id: 'urgent-important',
    title: '紧急且重要',
    subtitle: '立即去做',
    color: 'bg-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-300',
    icon: '🔥'
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
    id: 'not-urgent-important',
    title: '不紧急但重要',
    subtitle: '计划去做',
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    icon: '⭐'
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
function DraggableEventCard({ event, quadrant, onUpdate, onDeleteClick, confirmDelete, deleteConfirm, cancelDelete, startEdit, showDragHandle = true }) {
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

  const isConfirmingDelete = deleteConfirm === event.id

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all p-4 border border-gray-200 cursor-move"
    >
      <div className="flex justify-between items-start gap-2 mb-2">
        <div className="flex-1 flex items-start gap-2" {...listeners}>
          {/* 拖拽手柄 */}
          {showDragHandle && (
            <div className="mt-1 text-gray-400 cursor-grab active:cursor-grabbing">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"/>
              </svg>
            </div>
          )}
          <h4 className={`font-semibold flex-1 ${event.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
            {event.title}
            {event.completed && (
              <span className="ml-2 text-xs text-green-600">✓</span>
            )}
          </h4>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          {!isConfirmingDelete ? (
            <>
              <button
                onClick={() => onUpdate(event.id, { completed: !event.completed })}
                className={`p-1 rounded transition-colors ${
                  event.completed
                    ? 'text-gray-600 hover:bg-gray-100'
                    : 'text-green-600 hover:bg-green-50'
                }`}
                title={event.completed ? '标记为未完成' : '标记为完成'}
              >
                {event.completed ? '↩️' : '✓'}
              </button>
              <button
                onClick={() => startEdit(event)}
                className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="编辑"
              >
                ✏️
              </button>
              <button
                onClick={() => onDeleteClick(event.id)}
                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                title="删除"
              >
                🗑️
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => confirmDelete(event.id)}
                className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                确认删除
              </button>
              <button
                onClick={cancelDelete}
                className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                取消
              </button>
            </>
          )}
        </div>
      </div>
      {event.suggestion && (
        <p className={`text-sm mt-2 ${event.completed ? 'text-gray-400' : 'text-gray-600'}`} {...listeners}>
          💡 {event.suggestion}
        </p>
      )}
    </div>
  )
}

// 可放置的象限容器
function DroppableQuadrant({ quadrant, children }) {
  const { setNodeRef } = useSortable({
    id: quadrant.id,
    data: {
      type: 'quadrant',
      quadrant: quadrant.id
    }
  })

  return (
    <div
      ref={setNodeRef}
      className={`${quadrant.bgColor} rounded-2xl shadow-xl border-2 ${quadrant.borderColor} overflow-hidden`}
    >
      {/* 象限头部 */}
      <div className={`${quadrant.color} text-white p-4`}>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{quadrant.icon}</span>
          <div>
            <h3 className="text-xl font-bold">{quadrant.title}</h3>
            <p className="text-sm opacity-90">{quadrant.subtitle}</p>
          </div>
        </div>
      </div>

      {/* 事件列表 */}
      <div className="p-4 space-y-3 min-h-[200px]">
        {children}
      </div>
    </div>
  )
}

function QuadrantViewDraggable({ events, onUpdate, onDelete, onReorder }) {
  const [activeId, setActiveId] = useState(null)
  const [editingEvent, setEditingEvent] = useState(null)
  const [editForm, setEditForm] = useState({ title: '', suggestion: '', priority: '' })
  const [deleteConfirm, setDeleteConfirm] = useState(null) // 删除确认状态

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // 获取未完成的事件（四象限中显示）
  const getEventsByPriority = (priority) => {
    return events.filter(event => event.priority === priority && !event.completed)
  }

  // 获取已完成的事件
  const getCompletedEvents = () => {
    return events.filter(event => event.completed)
  }

  // 友好的删除确认
  const handleDeleteClick = (eventId) => {
    setDeleteConfirm(eventId)
    // 3秒后自动取消确认状态
    setTimeout(() => {
      setDeleteConfirm(null)
    }, 3000)
  }

  const confirmDelete = (eventId) => {
    onDelete(eventId)
    setDeleteConfirm(null)
  }

  const cancelDelete = () => {
    setDeleteConfirm(null)
  }

  const startEdit = (event) => {
    setEditingEvent(event.id)
    setEditForm({
      title: event.title,
      suggestion: event.suggestion,
      priority: event.priority
    })
  }

  const saveEdit = () => {
    if (editingEvent) {
      onUpdate(editingEvent, editForm)
      setEditingEvent(null)
    }
  }

  const cancelEdit = () => {
    setEditingEvent(null)
    setEditForm({ title: '', suggestion: '', priority: '' })
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
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          📊 时间管理四象限
        </h2>
        <p className="text-white/80">
          根据紧急程度和重要程度分类管理你的事件 • 可拖拽调整象限
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6">
          {/* 左侧：四象限 */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <DroppableQuadrant quadrant={quadrant}>
                    {quadrantEvents.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <p>暂无事件</p>
                        <p className="text-xs mt-2">拖拽事件到这里</p>
                      </div>
                    ) : (
                      <SortableContext items={eventIds} strategy={verticalListSortingStrategy}>
                        {quadrantEvents.map((event) => (
                          editingEvent === event.id ? (
                            <div key={event.id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                              <div className="space-y-3">
                                <input
                                  type="text"
                                  value={editForm.title}
                                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                                  placeholder="事件标题"
                                />
                                <textarea
                                  value={editForm.suggestion}
                                  onChange={(e) => setEditForm({ ...editForm, suggestion: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none text-sm"
                                  rows="2"
                                  placeholder="行动建议"
                                />
                                <select
                                  value={editForm.priority}
                                  onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                                >
                                  {quadrants.map(q => (
                                    <option key={q.id} value={q.id}>
                                      {q.icon} {q.title}
                                    </option>
                                  ))}
                                </select>
                                <div className="flex gap-2">
                                  <button
                                    onClick={saveEdit}
                                    className="flex-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                                  >
                                    ✅ 保存
                                  </button>
                                  <button
                                    onClick={cancelEdit}
                                    className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                                  >
                                    取消
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <DraggableEventCard
                              key={event.id}
                              event={event}
                              quadrant={quadrant}
                              onUpdate={onUpdate}
                              onDeleteClick={handleDeleteClick}
                              confirmDelete={confirmDelete}
                              deleteConfirm={deleteConfirm}
                              cancelDelete={cancelDelete}
                              startEdit={startEdit}
                            />
                          )
                        ))}
                      </SortableContext>
                    )}
                  </DroppableQuadrant>
                </SortableContext>
              )
            })}
          </div>

          {/* 右侧：已完成区域 */}
          <div className="w-80 bg-green-50 rounded-2xl shadow-xl border-2 border-green-300 overflow-hidden">
            {/* 头部 */}
            <div className="bg-green-500 text-white p-4">
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
            <div className="p-4 space-y-3 min-h-[200px] max-h-[800px] overflow-y-auto">
              {completedEvents.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p>暂无已完成事件</p>
                  <p className="text-xs mt-2">完成事件后会显示在这里</p>
                </div>
              ) : (
                completedEvents.map((event) => (
                  editingEvent === event.id ? (
                    <div key={event.id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editForm.title}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                          placeholder="事件标题"
                        />
                        <textarea
                          value={editForm.suggestion}
                          onChange={(e) => setEditForm({ ...editForm, suggestion: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none text-sm"
                          rows="2"
                          placeholder="行动建议"
                        />
                        <select
                          value={editForm.priority}
                          onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                        >
                          {quadrants.map(q => (
                            <option key={q.id} value={q.id}>
                              {q.icon} {q.title}
                            </option>
                          ))}
                        </select>
                        <div className="flex gap-2">
                          <button
                            onClick={saveEdit}
                            className="flex-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                          >
                            ✅ 保存
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                          >
                            取消
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <DraggableEventCard
                      key={event.id}
                      event={event}
                      onUpdate={onUpdate}
                      onDeleteClick={handleDeleteClick}
                      confirmDelete={confirmDelete}
                      deleteConfirm={deleteConfirm}
                      cancelDelete={cancelDelete}
                      startEdit={startEdit}
                      showDragHandle={false}
                    />
                  )
                ))
              )}
            </div>
          </div>
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
    </div>
  )
}

export default QuadrantViewDraggable

