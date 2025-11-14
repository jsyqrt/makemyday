import { useState } from 'react'

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

function QuadrantView({ events, onUpdate, onDelete }) {
  const [editingEvent, setEditingEvent] = useState(null)
  const [editForm, setEditForm] = useState({ title: '', suggestion: '', priority: '' })

  const getEventsByPriority = (priority) => {
    return events.filter(event => event.priority === priority)
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

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          📊 时间管理四象限
        </h2>
        <p className="text-white/80">
          根据紧急程度和重要程度分类管理你的事件
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quadrants.map((quadrant) => {
          const quadrantEvents = getEventsByPriority(quadrant.id)

          return (
            <div
              key={quadrant.id}
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
                <div className="mt-2 text-sm font-medium">
                  {quadrantEvents.length} 个事件
                </div>
              </div>

              {/* 事件列表 */}
              <div className="p-4 space-y-3 min-h-[200px]">
                {quadrantEvents.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <p>暂无事件</p>
                  </div>
                ) : (
                  quadrantEvents.map((event) => (
                    <div
                      key={event.id}
                      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all p-4 border border-gray-200"
                    >
                      {editingEvent === event.id ? (
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
                      ) : (
                        <>
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <h4 className={`font-semibold flex-1 ${event.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                              {event.title}
                              {event.completed && (
                                <span className="ml-2 text-xs text-green-600">✓</span>
                              )}
                            </h4>
                            <div className="flex gap-1">
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
                                onClick={() => onDelete(event.id)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="删除"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                          {event.suggestion && (
                            <p className={`text-sm mt-2 ${event.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                              💡 {event.suggestion}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default QuadrantView

