import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const priorityConfig = {
  'urgent-important': {
    label: '紧急且重要',
    color: 'bg-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: '🔥'
  },
  'urgent-not-important': {
    label: '紧急但不重要',
    color: 'bg-orange-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    icon: '⚡'
  },
  'not-urgent-important': {
    label: '不紧急但重要',
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: '⭐'
  },
  'not-urgent-not-important': {
    label: '不紧急也不重要',
    color: 'bg-gray-500',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    icon: '📌'
  }
}

function EventCard({ event, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [showPriorityMenu, setShowPriorityMenu] = useState(false)
  const [showCompletionHistory, setShowCompletionHistory] = useState(false)
  const [editForm, setEditForm] = useState({
    title: event.title,
    suggestion: event.suggestion,
    priority: event.priority
  })

  const [showCompletionDialog, setShowCompletionDialog] = useState(false)
  const [completionNote, setCompletionNote] = useState('')
  const completionNoteRef = useRef(null)

  // 处理完成按钮点击
  const handleCompleteToggle = () => {
    if (event.eventType === 'recurring') {
      // 周期性事件：打开弹窗让用户填写说明
      setShowCompletionDialog(true)
      setCompletionNote('')
    } else {
      // 一次性事件：切换完成状态
      onUpdate(event.id, { completed: !event.completed })
    }
  }

  // 确认完成周期性事件
  const handleConfirmCompletion = (e) => {
    e.stopPropagation() // 阻止事件冒泡
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
    e.stopPropagation() // 阻止事件冒泡
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

  const config = priorityConfig[event.priority] || priorityConfig['not-urgent-not-important']

  const startEdit = () => {
    setEditForm({
      title: event.title,
      suggestion: event.suggestion,
      priority: event.priority
    })
    setIsEditing(true)
  }

  const handleSave = () => {
    onUpdate(event.id, editForm)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const handleDeleteClick = () => {
    setIsConfirmingDelete(true)
    // 3秒后自动取消确认状态
    setTimeout(() => {
      setIsConfirmingDelete(false)
    }, 3000)
  }

  const confirmDelete = () => {
    onDelete(event.id)
    setIsConfirmingDelete(false)
  }

  const cancelDelete = () => {
    setIsConfirmingDelete(false)
  }

  const handlePriorityChange = (newPriority) => {
    onUpdate(event.id, { priority: newPriority })
    setShowPriorityMenu(false)
  }

  const toggleExpand = () => {
    onUpdate(event.id, { isExpanded: !event.isExpanded })
  }

  // 检查是否有详情或完成记录
  const hasExpandableContent = event.detail || (event.eventType === 'recurring' && event.completionHistory && event.completionHistory.length > 0)

  if (isEditing) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 border-2 ${config.borderColor}`}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              事件标题
            </label>
            <input
              type="text"
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              优先级
            </label>
            <select
              value={editForm.priority}
              onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              {Object.entries(priorityConfig).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.icon} {config.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              行动建议
            </label>
            <textarea
              value={editForm.suggestion}
              onChange={(e) => setEditForm({ ...editForm, suggestion: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
              rows="3"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              ✅ 保存
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all border-l-4 ${config.borderColor.replace('border-', 'border-l-')}`}
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          {/* 拖拽手柄 */}
          <button
            {...attributes}
            {...listeners}
            className="mt-1 cursor-move text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"/>
            </svg>
          </button>

          {/* 内容 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3 mb-3">
              <span className="text-2xl">{config.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`text-lg font-semibold ${event.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                    {/* 周期性事件标识 */}
                    {event.eventType === 'recurring' && (
                      <span className="mr-2">🔄</span>
                    )}
                    {event.title}
                  </h3>

                  {/* 展开/收起按钮 - 紧跟标题 */}
                  {hasExpandableContent && (
                    <button
                      onClick={toggleExpand}
                      className="p-1 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm"
                      title={event.isExpanded ? '收起' : '展开'}
                    >
                      {event.isExpanded !== false ? '▼' : '▶'}
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-block px-3 py-1 text-xs font-medium text-white ${config.color} rounded-full`}>
                    {config.label}
                  </span>
                  {/* 事件类型标识 */}
                  {event.eventType === 'recurring' ? (
                    <span className="inline-block px-3 py-1 text-xs font-medium text-white bg-blue-500 rounded-full">
                      🔄 周期性
                    </span>
                  ) : (
                    <span className="inline-block px-3 py-1 text-xs font-medium text-white bg-purple-500 rounded-full">
                      ✅ 一次性
                    </span>
                  )}
                  {event.completed && event.eventType !== 'recurring' && (
                    <span className="inline-block px-3 py-1 text-xs font-medium text-white bg-green-500 rounded-full">
                      ✓ 已完成
                    </span>
                  )}
                  {event.eventType === 'recurring' && event.completionHistory && event.completionHistory.length > 0 && (
                    <span className="inline-block px-3 py-1 text-xs font-medium text-white bg-green-500 rounded-full">
                      ✓ 已完成 {event.completionHistory.length} 次
                    </span>
                  )}
                </div>
              </div>
            </div>

            {event.suggestion && (
              <div className={`mt-3 p-3 ${config.bgColor} rounded-lg`}>
                <p className="text-sm text-gray-700">
                  💡 {event.suggestion}
                </p>
              </div>
            )}

            {/* 详细信息 - 只在展开时显示 */}
            {event.isExpanded !== false && event.detail && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs font-medium text-blue-700 mb-1">详细信息</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {event.detail}
                </p>
              </div>
            )}

            {/* 完成记录列表 - 只在展开时显示 */}
            {event.isExpanded !== false && event.eventType === 'recurring' && event.completionHistory && event.completionHistory.length > 0 && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs font-medium text-green-700 mb-2">
                  完成记录 ({event.completionHistory.length} 次)
                </p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {event.completionHistory.slice().reverse().slice(0, 5).map((record, index) => (
                    <div key={index} className="text-sm">
                      <div className="flex items-center gap-2 text-gray-700">
                        <span className="text-green-600">✓</span>
                        <span className="font-medium">
                          {new Date(record.timestamp).toLocaleString('zh-CN', {
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      {record.note && (
                        <div className="ml-6 text-xs text-gray-600 mt-1 bg-white p-2 rounded">
                          {record.note}
                        </div>
                      )}
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

          {/* 操作按钮 */}
          <div className="flex gap-2">
            {!isConfirmingDelete ? (
              <>
                <button
                  onClick={handleCompleteToggle}
                  className={`p-2 rounded-lg transition-colors ${
                    event.completed || (event.eventType === 'recurring')
                      ? 'text-green-600 hover:bg-green-50'
                      : 'text-green-600 hover:bg-green-50'
                  }`}
                  title={
                    event.eventType === 'recurring'
                      ? '记录完成一次'
                      : event.completed
                      ? '标记为未完成'
                      : '标记为完成'
                  }
                >
                  {event.eventType === 'recurring' ? '✓' : event.completed ? '↩️' : '✓'}
                </button>

                {/* 周期性事件的完成历史按钮 */}
                {event.eventType === 'recurring' && event.completionHistory && event.completionHistory.length > 0 && (
                  <div className="relative">
                    <button
                      onClick={() => setShowCompletionHistory(!showCompletionHistory)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                      title="查看完成历史"
                    >
                      {event.completionHistory.length}次
                    </button>

                    {showCompletionHistory && (
                      <>
                        {/* 点击外部关闭菜单 */}
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setShowCompletionHistory(false)}
                        />

                        {/* 完成历史下拉菜单 */}
                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-20 max-h-80 overflow-y-auto">
                          <div className="p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                            <div className="font-medium text-gray-800">完成记录 ({event.completionHistory.length} 次)</div>
                          </div>
                          <div className="p-2">
                            {event.completionHistory.slice().reverse().map((record, index) => (
                              <div key={index} className="px-3 py-2 hover:bg-gray-50 rounded text-sm text-gray-700">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-green-500">✓</span>
                                  <span className="font-medium">{new Date(record.timestamp).toLocaleString('zh-CN', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}</span>
                                </div>
                                {record.note && (
                                  <div className="ml-6 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                    {record.note}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* 象限切换按钮 */}
                <div className="relative">
                  <button
                    onClick={() => setShowPriorityMenu(!showPriorityMenu)}
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    title="切换象限"
                  >
                    {config.icon}
                  </button>

                  {showPriorityMenu && (
                    <>
                      {/* 点击外部关闭菜单 */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowPriorityMenu(false)}
                      />

                      {/* 下拉菜单 */}
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-20">
                        {Object.entries(priorityConfig).map(([key, conf]) => (
                          <button
                            key={key}
                            onClick={() => handlePriorityChange(key)}
                            className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-2 ${
                              event.priority === key ? 'bg-purple-50' : ''
                            } ${
                              key === Object.keys(priorityConfig)[Object.keys(priorityConfig).length - 1]
                                ? 'rounded-b-lg'
                                : 'border-b border-gray-100'
                            } ${
                              key === Object.keys(priorityConfig)[0]
                                ? 'rounded-t-lg'
                                : ''
                            }`}
                          >
                            <span className="text-xl">{conf.icon}</span>
                            <span className="text-sm font-medium text-gray-700">{conf.label}</span>
                            {event.priority === key && (
                              <span className="ml-auto text-purple-600">✓</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <button
                  onClick={startEdit}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="编辑"
                >
                  ✏️
                </button>
                <button
                  onClick={handleDeleteClick}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="删除"
                >
                  🗑️
                </button>
              </>
            ) : (
              <div className="flex gap-2 items-center">
                <span className="text-xs text-gray-600">确定删除？</span>
                <button
                  onClick={confirmDelete}
                  className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  确认
                </button>
                <button
                  onClick={cancelDelete}
                  className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                >
                  取消
                </button>
              </div>
            )}
          </div>
        </div>

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
      </div>
    </div>
  )
}

export default EventCard

