import { useState, useEffect, useLayoutEffect, useRef } from 'react'

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

function EventEditModal({ event, onSave, onAutoSave, onClose, onDelete, isCreating = false }) {
  const [formData, setFormData] = useState({
    title: '',
    suggestion: '',
    detail: '',
    priority: '',
    completed: false,
    eventType: 'one-time', // 'one-time' 或 'recurring'
    completionHistory: [] // 周期性事件的完成记录
  })

  const detailTextareaRef = useRef(null)
  const isInitialized = useRef(false) // 标记是否已初始化
  const autoSaveTimerRef = useRef(null) // 自动保存定时器
  const cursorPositionRef = useRef({ start: 0, end: 0 }) // 保存光标位置
  const scrollPositionRef = useRef(0) // 保存滚动位置
  const isAutoSaving = useRef(false) // 标记是否正在自动保存

  useEffect(() => {
    if (event) {
      // 如果是自动保存触发的更新，不重新设置 formData，避免光标丢失
      if (isAutoSaving.current) {
        isAutoSaving.current = false
        return
      }

      setFormData({
        title: event.title || '',
        suggestion: event.suggestion || '',
        detail: event.detail || '',
        priority: event.priority || 'not-urgent-not-important',
        completed: event.completed || false,
        eventType: event.eventType || 'one-time',
        completionHistory: event.completionHistory || []
      })

      // 延迟标记初始化完成，确保初始数据不会触发自动保存
      setTimeout(() => {
        isInitialized.current = true
      }, 100)
    }
  }, [event])

  // 自动调整详细信息textarea的高度并恢复光标和滚动位置
  // 使用 useLayoutEffect 在浏览器重绘前同步执行，避免可见的跳动
  useLayoutEffect(() => {
    if (detailTextareaRef.current) {
      const textarea = detailTextareaRef.current
      const isFocused = document.activeElement === textarea
      const maxHeight = 400 // 最大高度 400px

      // 调整高度：如果内容高度小于最大高度，则自动调整
      textarea.style.height = 'auto'
      const scrollHeight = textarea.scrollHeight
      if (scrollHeight <= maxHeight) {
        textarea.style.height = scrollHeight + 'px'
      } else {
        textarea.style.height = maxHeight + 'px'
      }

      // 如果 textarea 处于焦点状态，同步恢复光标位置和滚动位置
      if (isFocused && cursorPositionRef.current) {
        const { start, end } = cursorPositionRef.current
        const savedScrollTop = scrollPositionRef.current

        // 先恢复滚动位置
        textarea.scrollTop = savedScrollTop

        // 再恢复光标位置
        textarea.setSelectionRange(start, end)

        // 确保滚动位置不被 setSelectionRange 改变
        textarea.scrollTop = savedScrollTop
      }
    }
  }, [formData.detail])

  // 自动保存功能（防抖）
  useEffect(() => {
    // 跳过创建模式和初始化阶段
    if (isCreating || !isInitialized.current || !onAutoSave) {
      return
    }

    // 清除之前的定时器
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }

    // 设置新的定时器（500ms 防抖）
    autoSaveTimerRef.current = setTimeout(() => {
      // 标题不为空时才保存
      if (formData.title.trim()) {
        // 标记正在自动保存，避免触发 formData 重新设置
        isAutoSaving.current = true
        onAutoSave(event.id, formData)
      }
    }, 500)

    // 清理函数
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [formData, event.id, onAutoSave, isCreating])

  // 处理关闭弹窗（创建模式下有标题自动创建）
  const handleClose = () => {
    if (isCreating && formData.title.trim()) {
      // 创建模式且有标题内容，自动创建
      onSave(null, formData)
    } else {
      // 否则直接关闭
      onClose()
    }
  }

  // ESC 键关闭弹窗
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => {
      window.removeEventListener('keydown', handleEsc)
    }
  }, [isCreating, formData.title, onSave, onClose])

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={handleClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          {/* 头部 */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {isCreating ? '➕ 创建事件' : '✏️ 编辑事件'}
              </h2>
              {isCreating ? (
                <p className="text-sm text-gray-500 mt-1">💡 填写标题后会自动创建</p>
              ) : (
                <p className="text-sm text-gray-500 mt-1">💾 修改会自动保存</p>
              )}
            </div>
            <button
              onClick={handleClose}
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
                ref={detailTextareaRef}
                value={formData.detail}
                onChange={(e) => {
                  const target = e.target
                  const newValue = target.value
                  const newCursorPos = target.selectionStart

                  // 立即保存输入后的光标位置和滚动位置
                  cursorPositionRef.current = {
                    start: newCursorPos,
                    end: newCursorPos
                  }
                  scrollPositionRef.current = target.scrollTop

                  setFormData({ ...formData, detail: newValue })
                }}
                onScroll={(e) => {
                  // 实时保存滚动位置
                  scrollPositionRef.current = e.target.scrollTop
                }}
                onSelect={(e) => {
                  // 实时保存光标位置（处理用户点击、选择等操作）
                  const target = e.target
                  cursorPositionRef.current = {
                    start: target.selectionStart,
                    end: target.selectionEnd
                  }
                }}
                placeholder="补充更多细节，如完成情况、收集的信息等..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none overflow-y-auto"
                style={{ minHeight: '100px', maxHeight: '400px' }}
              />
            </div>

            {/* 事件类型 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                事件类型
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setFormData({ ...formData, eventType: 'one-time' })}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    formData.eventType === 'one-time'
                      ? 'border-purple-500 bg-purple-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">✅</span>
                    <div>
                      <div className="font-medium text-gray-800">一次性事件</div>
                      <div className="text-xs text-gray-500 mt-1">完成后移到已完成</div>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => setFormData({ ...formData, eventType: 'recurring' })}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    formData.eventType === 'recurring'
                      ? 'border-purple-500 bg-purple-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🔄</span>
                    <div>
                      <div className="font-medium text-gray-800">周期性事件</div>
                      <div className="text-xs text-gray-500 mt-1">记录完成次数，保留在象限</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* 周期性事件的完成历史 */}
            {formData.eventType === 'recurring' && formData.completionHistory.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  完成记录 ({formData.completionHistory.length} 次)
                </label>
                <div className="max-h-40 overflow-y-auto bg-gray-50 rounded-lg p-3 space-y-2">
                  {formData.completionHistory.slice().reverse().map((record, index) => (
                    <div key={index} className="text-sm text-gray-700">
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
                        <div className="ml-6 text-xs text-gray-600 bg-white p-2 rounded border border-gray-200">
                          {record.note}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
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
            {isCreating ? (
              <>
                <button
                  onClick={handleClose}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  {formData.title.trim() ? '完成' : '取消'}
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium shadow-lg"
                >
                  ✨ 创建
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium shadow-lg"
              >
                关闭
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventEditModal

