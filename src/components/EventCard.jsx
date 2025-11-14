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
  const [editForm, setEditForm] = useState({
    title: event.title,
    suggestion: event.suggestion,
    priority: event.priority
  })

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
                <h3 className={`text-lg font-semibold mb-1 ${event.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                  {event.title}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-block px-3 py-1 text-xs font-medium text-white ${config.color} rounded-full`}>
                    {config.label}
                  </span>
                  {event.completed && (
                    <span className="inline-block px-3 py-1 text-xs font-medium text-white bg-green-500 rounded-full">
                      ✓ 已完成
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
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2">
            {!isConfirmingDelete ? (
              <>
                <button
                  onClick={() => onUpdate(event.id, { completed: !event.completed })}
                  className={`p-2 rounded-lg transition-colors ${
                    event.completed
                      ? 'text-gray-600 hover:bg-gray-100'
                      : 'text-green-600 hover:bg-green-50'
                  }`}
                  title={event.completed ? '标记为未完成' : '标记为完成'}
                >
                  {event.completed ? '↩️' : '✓'}
                </button>
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
      </div>
    </div>
  )
}

export default EventCard

