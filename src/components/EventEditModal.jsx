import { useState, useEffect } from 'react'

const quadrants = [
  {
    id: 'urgent-important',
    title: '重要且紧急',
    icon: '🔥'
  },
  {
    id: 'not-urgent-important',
    title: '重要但不紧急',
    icon: '⭐'
  },
  {
    id: 'urgent-not-important',
    title: '紧急但不重要',
    icon: '⚡'
  },
  {
    id: 'not-urgent-not-important',
    title: '不紧急也不重要',
    icon: '📌'
  }
]

function EventEditModal({ event, onSave, onClose, onDelete, isCreating = false }) {
  const [formData, setFormData] = useState({
    title: '',
    suggestion: '',
    detail: '',
    priority: '',
    completed: false
  })

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        suggestion: event.suggestion || '',
        detail: event.detail || '',
        priority: event.priority || 'not-urgent-not-important',
        completed: event.completed || false
      })
    }
  }, [event])

  // ESC 键关闭弹窗
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => {
      window.removeEventListener('keydown', handleEsc)
    }
  }, [onClose])

  const handleSave = () => {
    if (!formData.title.trim()) {
      alert('请输入事件标题')
      return
    }
    if (isCreating) {
      // 创建新事件时，不需要传 event.id
      onSave(null, formData)
    } else {
      // 更新已有事件
      onSave(event.id, formData)
    }
  }

  const handleDelete = () => {
    if (confirm('确定要删除这个事件吗？')) {
      onDelete(event.id)
    }
  }

  if (!event) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          {/* 头部 */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {isCreating ? '➕ 创建事件' : '✏️ 编辑事件'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {/* 表单 */}
          <div className="space-y-5">
            {/* 标题 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                事件标题 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="输入事件标题"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                autoFocus
              />
            </div>

            {/* 行动建议 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                行动建议
              </label>
              <textarea
                value={formData.suggestion}
                onChange={(e) => setFormData({ ...formData, suggestion: e.target.value })}
                placeholder="输入具体的行动建议"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows="3"
              />
            </div>

            {/* 详细信息 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                详细信息
              </label>
              <textarea
                value={formData.detail}
                onChange={(e) => setFormData({ ...formData, detail: e.target.value })}
                placeholder="补充更多细节，如完成情况、收集的信息等..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows="4"
              />
            </div>

            {/* 优先级 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                优先级（象限）
              </label>
              <div className="grid grid-cols-2 gap-3">
                {quadrants.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => setFormData({ ...formData, priority: q.id })}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      formData.priority === q.id
                        ? 'border-purple-500 bg-purple-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{q.icon}</span>
                      <span className="font-medium text-gray-800">{q.title}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 完成状态 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                完成状态
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setFormData({ ...formData, completed: false })}
                  className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                    !formData.completed
                      ? 'border-purple-500 bg-purple-50 text-purple-700 font-medium'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  ⏳ 未完成
                </button>
                <button
                  onClick={() => setFormData({ ...formData, completed: true })}
                  className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                    formData.completed
                      ? 'border-green-500 bg-green-50 text-green-700 font-medium'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  ✅ 已完成
                </button>
              </div>
            </div>
          </div>

          {/* 底部按钮 */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
            {!isCreating && (
              <button
                onClick={handleDelete}
                className="px-6 py-3 border-2 border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
              >
                🗑️ 删除
              </button>
            )}
            <div className="flex-1"></div>
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium shadow-lg"
            >
              {isCreating ? '✨ 创建' : '💾 保存'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventEditModal

