import { useState, useRef, useEffect } from 'react'
import { generateSubtasks } from '../utils/llm'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const priorityOptions = [
  { id: 'urgent-important', label: '重要且紧急', icon: '🔥', color: 'bg-red-500' },
  { id: 'not-urgent-important', label: '重要不紧急', icon: '⭐', color: 'bg-blue-500' },
  { id: 'urgent-not-important', label: '紧急不重要', icon: '⚡', color: 'bg-orange-500' },
  { id: 'not-urgent-not-important', label: '不紧急不重要', icon: '📌', color: 'bg-gray-500' },
]

const timeUnits = [
  { id: 'hour', label: '小时', short: '小时' },
  { id: 'day', label: '天', short: '天' },
  { id: 'week', label: '周', short: '周' },
  { id: 'month', label: '月', short: '月' },
  { id: 'year', label: '年', short: '年' },
]

// 解析预估时间字符串，返回数字和单位
function parseEstimatedTime(timeStr) {
  if (!timeStr) return { value: '', unit: 'hour' }
  const match = timeStr.match(/^(\d+(?:\.\d+)?)\s*(小时|天|周|月|年|hour|day|week|month|year)s?$/i)
  if (match) {
    const value = match[1]
    const unitStr = match[2].toLowerCase()
    const unitMap = {
      '小时': 'hour', 'hour': 'hour', 'hours': 'hour',
      '天': 'day', 'day': 'day', 'days': 'day',
      '周': 'week', 'week': 'week', 'weeks': 'week',
      '月': 'month', 'month': 'month', 'months': 'month',
      '年': 'year', 'year': 'year', 'years': 'year'
    }
    return { value, unit: unitMap[unitStr] || 'hour' }
  }
  return { value: '', unit: 'hour' }
}

// 格式化预估时间为字符串
function formatEstimatedTime(value, unit) {
  if (!value) return ''
  const unitObj = timeUnits.find(u => u.id === unit)
  return `${value}${unitObj?.short || '小时'}`
}

// 子任务编辑弹窗组件
function SubtaskEditModal({ subtask, goalId, onUpdate, onDelete, onClose, isCreating = false }) {
  const parsedTime = parseEstimatedTime(subtask?.estimatedTime)
  const [formData, setFormData] = useState({
    title: subtask?.title || '',
    suggestion: subtask?.suggestion || '',
    estimatedTime: subtask?.estimatedTime || '',
    priority: subtask?.priority || 'not-urgent-not-important',
    projected: subtask?.projected || false
  })
  const [timeValue, setTimeValue] = useState(parsedTime.value)
  const [timeUnit, setTimeUnit] = useState(parsedTime.unit)
  const isInitialized = useRef(false)
  const autoSaveTimerRef = useRef(null)

  useEffect(() => {
    if (subtask && !isCreating) {
      const parsed = parseEstimatedTime(subtask.estimatedTime)
      setFormData({
        title: subtask.title || '',
        suggestion: subtask.suggestion || '',
        estimatedTime: subtask.estimatedTime || '',
        priority: subtask.priority || 'not-urgent-not-important',
        projected: subtask.projected || false
      })
      setTimeValue(parsed.value)
      setTimeUnit(parsed.unit)
      setTimeout(() => {
        isInitialized.current = true
      }, 100)
    } else if (isCreating) {
      isInitialized.current = true
    }
  }, [subtask, isCreating])

  // 更新预估时间
  const handleTimeChange = (newValue, newUnit) => {
    setTimeValue(newValue)
    setTimeUnit(newUnit)
    const formatted = formatEstimatedTime(newValue, newUnit)
    setFormData({ ...formData, estimatedTime: formatted })
  }

  // 自动保存（防抖）
  useEffect(() => {
    if (isCreating || !isInitialized.current) return

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }

    autoSaveTimerRef.current = setTimeout(() => {
      if (formData.title.trim()) {
        onUpdate(goalId, subtask.id, formData)
      }
    }, 500)

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [formData, goalId, subtask?.id, onUpdate, isCreating])

  const handleClose = () => {
    if (isCreating && formData.title.trim()) {
      // 创建模式且有标题，返回数据
      onClose(formData)
    } else {
      onClose(null)
    }
  }

  const handleDelete = () => {
    if (confirm('确定要删除这个子任务吗？')) {
      onDelete(goalId, subtask.id)
      onClose(null)
    }
  }

  // ESC 键关闭
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [formData.title])

  const currentPriority = priorityOptions.find(p => p.id === formData.priority) || priorityOptions[3]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={handleClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          {/* 头部 */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {isCreating ? '➕ 添加子任务' : '✏️ 编辑子任务'}
              </h2>
              {isCreating ? (
                <p className="text-sm text-gray-500 mt-1">💡 填写标题后关闭自动创建</p>
              ) : (
                <p className="text-sm text-gray-500 mt-1">💾 修改会自动保存</p>
              )}
            </div>
            <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">
              ×
            </button>
          </div>

          {/* 表单 */}
          <div className="space-y-4">
            {/* 标题 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                任务名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="输入子任务名称"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                autoFocus
              />
            </div>

            {/* 描述/建议 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                任务描述
              </label>
              <textarea
                value={formData.suggestion}
                onChange={(e) => setFormData({ ...formData, suggestion: e.target.value })}
                placeholder="详细描述任务内容、注意事项等..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows="4"
              />
            </div>

            {/* 预估时间 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                预估时间
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={timeValue}
                  onChange={(e) => handleTimeChange(e.target.value, timeUnit)}
                  placeholder="数量"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <select
                  value={timeUnit}
                  onChange={(e) => handleTimeChange(timeValue, e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white min-w-[100px]"
                >
                  {timeUnits.map((unit) => (
                    <option key={unit.id} value={unit.id}>{unit.label}</option>
                  ))}
                </select>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {[1, 2, 3, 5, 8].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleTimeChange(num.toString(), timeUnit)}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                      timeValue === num.toString()
                        ? 'bg-purple-100 border-purple-500 text-purple-700'
                        : 'border-gray-300 hover:border-purple-300 text-gray-600'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* 优先级 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                优先级
              </label>
              <div className="grid grid-cols-2 gap-2">
                {priorityOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setFormData({ ...formData, priority: option.id, projected: true })}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      formData.priority === option.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{option.icon}</span>
                      <span className="text-sm font-medium text-gray-700">{option.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 投影到四象限 */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-700">📊 投影到四象限</div>
                <div className="text-xs text-gray-500">开启后任务会显示在对应的象限中</div>
              </div>
              <button
                onClick={() => setFormData({ ...formData, projected: !formData.projected })}
                className={`w-12 h-6 rounded-full transition-colors ${
                  formData.projected ? 'bg-purple-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  formData.projected ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>

          {/* 底部按钮 */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
            {!isCreating && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 border-2 border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
              >
                🗑️ 删除
              </button>
            )}
            <div className="flex-1"></div>
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium"
            >
              {isCreating ? (formData.title.trim() ? '创建' : '取消') : '关闭'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// 子任务组件
function SubtaskItem({ subtask, goalId, onUpdate, onDelete, onToggleProjection }) {
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPriorityMenu, setShowPriorityMenu] = useState(false)
  const currentPriority = priorityOptions.find(p => p.id === subtask.priority) || priorityOptions[3]

  const handleEditClose = () => {
    setShowEditModal(false)
  }

  return (
    <>
      <div
        className={`group rounded-lg transition-all ${subtask.completed ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'} border border-gray-100`}
      >
        {/* 主要内容区 */}
        <div className="flex items-start gap-2 p-2.5">
          {/* 完成勾选 */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onUpdate(goalId, subtask.id, { completed: !subtask.completed })
            }}
            className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors mt-0.5 ${
              subtask.completed ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-green-400'
            }`}
          >
            {subtask.completed && <span className="text-white text-xs">✓</span>}
          </button>

          {/* 任务内容 - 点击打开编辑弹窗 */}
          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setShowEditModal(true)}>
            <div className={`text-sm font-medium ${subtask.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
              {subtask.title}
            </div>
            {subtask.suggestion && (
              <div className="text-sm text-gray-500 mt-1">💡 {subtask.suggestion}</div>
            )}
            {subtask.estimatedTime && (
              <div className="text-xs text-gray-400 mt-1">⏱ {subtask.estimatedTime}</div>
            )}
          </div>

          {/* 右侧操作按钮 */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* 投影到四象限按钮 */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleProjection(goalId, subtask.id)
              }}
              className={`p-1 rounded text-sm transition-colors ${
                subtask.projected
                  ? 'bg-purple-100 text-purple-600'
                  : 'hover:bg-gray-100 text-gray-400 opacity-0 group-hover:opacity-100'
              }`}
              title={subtask.projected ? '取消投影' : '投影到四象限'}
            >
              📊
            </button>

            {/* 优先级选择 */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowPriorityMenu(!showPriorityMenu)
                }}
                className="p-1 rounded hover:bg-gray-100 transition-colors"
                title="设置优先级"
              >
                <span className="text-sm">{currentPriority.icon}</span>
              </button>

              {showPriorityMenu && (
                <>
                  <div className="fixed inset-0 z-30" onClick={(e) => {
                    e.stopPropagation()
                    setShowPriorityMenu(false)
                  }} />
                  <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-xl border border-gray-200 z-40 py-1">
                    {priorityOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          onUpdate(goalId, subtask.id, { priority: option.id, projected: true })
                          setShowPriorityMenu(false)
                        }}
                        className={`w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm ${
                          subtask.priority === option.id ? 'bg-purple-50' : ''
                        }`}
                      >
                        <span>{option.icon}</span>
                        <span>{option.label}</span>
                        {subtask.priority === option.id && <span className="ml-auto text-purple-600">✓</span>}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 编辑弹窗 */}
      {showEditModal && (
        <SubtaskEditModal
          subtask={subtask}
          goalId={goalId}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onClose={handleEditClose}
        />
      )}
    </>
  )
}

// 单个目标卡片
function GoalCard({
  goal,
  onUpdate,
  onDelete,
  onAddSubtask,
  onUpdateSubtask,
  onDeleteSubtask,
  onToggleSubtaskProjection,
  onGenerateSubtasks,
  isGenerating,
  config,
  dragHandleProps
}) {
  // 使用存储的展开状态，默认为展开
  const isExpanded = goal.expanded !== false
  const setIsExpanded = (expanded) => onUpdate(goal.id, { expanded })
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(goal.title)
  const [editDescription, setEditDescription] = useState(goal.description || '')
  const [editDeadline, setEditDeadline] = useState(goal.deadline || '')
  const [showAddSubtaskModal, setShowAddSubtaskModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // 计算进度
  const completedCount = goal.subtasks?.filter(s => s.completed).length || 0
  const totalCount = goal.subtasks?.length || 0
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  // 计算有多少投影的子任务
  const projectedCount = goal.subtasks?.filter(s => s.projected).length || 0

  const handleSaveEdit = () => {
    onUpdate(goal.id, {
      title: editTitle,
      description: editDescription,
      deadline: editDeadline
    })
    setIsEditing(false)
  }

  const handleAddSubtaskClose = (formData) => {
    if (formData && formData.title.trim()) {
      onAddSubtask(goal.id, {
        id: Date.now(),
        title: formData.title.trim(),
        suggestion: formData.suggestion?.trim() || '',
        estimatedTime: formData.estimatedTime?.trim() || '',
        priority: formData.priority || 'not-urgent-not-important',
        projected: formData.projected || false,
        completed: false,
        createdAt: new Date().toISOString()
      })
    }
    setShowAddSubtaskModal(false)
  }

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = () => {
    onDelete(goal.id)
    setShowDeleteConfirm(false)
  }

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false)
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        {/* 目标头部 */}
        <div className="p-2.5 bg-gradient-to-r from-indigo-500 to-purple-500">
          <div className="flex items-start justify-between gap-1">
            {/* 拖动手柄 */}
            <div
              {...dragHandleProps}
              className="flex-shrink-0 cursor-grab active:cursor-grabbing p-1 -ml-1 rounded hover:bg-white/20 text-white/70 hover:text-white transition-colors"
              title="拖动排序"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-2 py-1 rounded text-gray-800 text-sm"
                  placeholder="目标名称"
                />
              ) : (
                <h4 className="font-semibold text-white text-sm truncate">{goal.title}</h4>
              )}
              {goal.deadline && !isEditing && (
                <div className="text-xs text-white/70 mt-0.5">📅 {goal.deadline}</div>
              )}
            </div>
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 rounded hover:bg-white/20 text-white transition-colors"
              >
                <span className="text-xs">{isExpanded ? '▼' : '▶'}</span>
              </button>
              <button
                onClick={() => {
                  if (isEditing) {
                    handleSaveEdit()
                  } else {
                    setIsEditing(true)
                  }
                }}
                className="p-1 rounded hover:bg-white/20 text-white transition-colors"
              >
                <span className="text-xs">{isEditing ? '✓' : '✏️'}</span>
              </button>
              <button
                onClick={handleDeleteClick}
                className="p-1 rounded hover:bg-white/20 text-white transition-colors"
              >
                <span className="text-xs">✕</span>
              </button>
            </div>
          </div>

        {/* 进度条 */}
        <div className="mt-2">
          <div className="flex justify-between text-xs text-white/80 mb-0.5">
            <span>进度</span>
            <span>{completedCount}/{totalCount} ({progress}%)</span>
          </div>
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-400 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* 编辑区域 */}
      {isEditing && isExpanded && (
        <div className="p-2.5 bg-gray-50 border-b border-gray-200 space-y-2">
          <div>
            <label className="text-xs text-gray-500 block mb-1">描述（SMART原则）</label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full px-2 py-1.5 rounded border border-gray-300 text-sm resize-none"
              rows={2}
              placeholder="具体、可衡量、可实现、相关、有时限..."
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">截止日期</label>
            <input
              type="date"
              value={editDeadline}
              onChange={(e) => setEditDeadline(e.target.value)}
              className="w-full px-2 py-1.5 rounded border border-gray-300 text-sm"
            />
          </div>
        </div>
      )}

      {/* 子任务列表 */}
      {isExpanded && (
        <div className="p-2.5 space-y-2">
          {/* 描述显示 */}
          {!isEditing && goal.description && (
            <div className="text-sm text-gray-500 p-2 bg-gray-50 rounded mb-2">
              {goal.description}
            </div>
          )}

          {/* 子任务 */}
          {goal.subtasks && goal.subtasks.length > 0 ? (
            <div className="space-y-2">
              {goal.subtasks.map((subtask) => (
                <SubtaskItem
                  key={subtask.id}
                  subtask={subtask}
                  goalId={goal.id}
                  onUpdate={onUpdateSubtask}
                  onDelete={onDeleteSubtask}
                  onToggleProjection={onToggleSubtaskProjection}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-400 text-sm">
              暂无子任务
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100">
            <button
              onClick={() => setShowAddSubtaskModal(true)}
              className="flex-1 px-2 py-1.5 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
            >
              ➕ 添加子任务
            </button>
            <button
              onClick={() => onGenerateSubtasks(goal)}
              disabled={isGenerating}
              className="flex-1 px-2 py-1.5 text-sm bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded hover:from-purple-600 hover:to-blue-600 transition-colors disabled:opacity-50"
            >
              {isGenerating ? '⏳ 生成中...' : '✨ AI 生成'}
            </button>
          </div>
        </div>
      )}
      </div>

      {/* 添加子任务弹窗 */}
      {showAddSubtaskModal && (
        <SubtaskEditModal
          subtask={null}
          goalId={goal.id}
          onUpdate={onUpdateSubtask}
          onDelete={onDeleteSubtask}
          onClose={handleAddSubtaskClose}
          isCreating={true}
        />
      )}

      {/* 删除目标确认对话框 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleCancelDelete}>
          <div className="bg-white rounded-xl shadow-2xl p-5 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              🗑️ 确认删除目标
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              确定要删除目标 "<span className="font-medium text-gray-800">{goal.title}</span>" 吗？
              {totalCount > 0 && (
                <span className="block mt-2 text-orange-600">
                  ⚠️ 此目标包含 {totalCount} 个子任务
                  {projectedCount > 0 && `，其中 ${projectedCount} 个已投影到四象限`}
                  ，删除后将全部移除。
                </span>
              )}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelDelete}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// 可排序的目标卡片包装组件
function SortableGoalCard(props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.goal.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <GoalCard {...props} dragHandleProps={listeners} />
    </div>
  )
}

// 目标面板主组件
function GoalPanel({
  goals,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
  onAddSubtask,
  onUpdateSubtask,
  onDeleteSubtask,
  onToggleSubtaskProjection,
  onReorderGoals,
  height,
  isImageBackground,
  containerOpacity,
  config
}) {
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [newGoalTitle, setNewGoalTitle] = useState('')
  const [generatingGoalId, setGeneratingGoalId] = useState(null)
  const [aiStreamOutput, setAiStreamOutput] = useState('')

  // 拖动排序传感器
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // 处理拖动结束
  const handleDragEnd = (event) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = goals.findIndex((g) => g.id === active.id)
      const newIndex = goals.findIndex((g) => g.id === over.id)
      const newGoals = arrayMove(goals, oldIndex, newIndex)
      onReorderGoals(newGoals)
    }
  }

  const handleAddGoal = () => {
    if (newGoalTitle.trim()) {
      onAddGoal({
        id: Date.now(),
        title: newGoalTitle.trim(),
        description: '',
        deadline: '',
        subtasks: [],
        expanded: true,
        createdAt: new Date().toISOString()
      })
      setNewGoalTitle('')
      setShowAddGoal(false)
    }
  }

  const handleGenerateSubtasks = async (goal) => {
    if (!config || !config.apiKey) {
      alert('请先配置 API Key')
      return
    }

    setGeneratingGoalId(goal.id)
    setAiStreamOutput('')

    try {
      const subtasks = await generateSubtasks(config, goal, (token, fullContent) => {
        setAiStreamOutput(fullContent)
      })

      if (Array.isArray(subtasks) && subtasks.length > 0) {
        const newSubtasks = subtasks.map((task, index) => ({
          id: Date.now() + index,
          title: task.title || '未命名任务',
          priority: task.priority || 'not-urgent-not-important',
          suggestion: task.suggestion || '',
          estimatedTime: task.estimatedTime || '',
          completed: false,
          projected: false,
          createdAt: new Date().toISOString()
        }))

        // 合并现有子任务
        const existingSubtasks = goal.subtasks || []
        onUpdateGoal(goal.id, {
          subtasks: [...existingSubtasks, ...newSubtasks]
        })
      }
    } catch (error) {
      alert(`生成子任务失败: ${error.message}`)
    } finally {
      setGeneratingGoalId(null)
      setAiStreamOutput('')
    }
  }

  // 计算透明度样式
  const bgStyle = isImageBackground
    ? { backgroundColor: `rgba(255, 255, 255, ${containerOpacity / 100})` }
    : {}
  const blurClass = isImageBackground && containerOpacity > 10 ? 'backdrop-blur-sm' : ''

  return (
    <div
      className={`w-72 lg:w-80 xl:w-96 2xl:w-[400px] h-full ${isImageBackground && containerOpacity > 10 ? blurClass : isImageBackground ? '' : 'bg-indigo-50'} rounded-xl shadow-xl border-2 border-indigo-300 overflow-hidden flex flex-col`}
      style={bgStyle}
    >
      {/* 头部 */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <div>
              <h3 className="text-base font-bold">长期目标</h3>
              <p className="text-xs opacity-90">{goals.length} 个目标</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddGoal(true)}
            className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 transition-all flex items-center justify-center text-white text-lg font-bold"
            title="添加目标"
          >
            +
          </button>
        </div>
      </div>

      {/* 目标列表 */}
      <div className="p-2.5 space-y-3 flex-1 overflow-y-auto min-h-0">
        {/* 添加目标输入框 */}
        {showAddGoal && (
          <div className="p-2.5 bg-white rounded-lg shadow-md border border-gray-200">
            <input
              type="text"
              value={newGoalTitle}
              onChange={(e) => setNewGoalTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddGoal()}
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm mb-2"
              placeholder="输入目标名称..."
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddGoal}
                className="flex-1 px-2 py-1.5 bg-purple-500 text-white text-sm rounded hover:bg-purple-600"
              >
                创建目标
              </button>
              <button
                onClick={() => {
                  setShowAddGoal(false)
                  setNewGoalTitle('')
                }}
                className="px-2 py-1.5 text-gray-500 text-sm hover:bg-gray-100 rounded"
              >
                取消
              </button>
            </div>
          </div>
        )}

        {/* 目标卡片列表 */}
        {goals.length === 0 && !showAddGoal ? (
          <div className="text-center py-6 text-gray-400">
            <p className="text-sm">暂无长期目标</p>
            <p className="text-xs mt-1">点击 + 添加目标</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={goals.map(g => g.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {goals.map((goal) => (
                  <SortableGoalCard
                    key={goal.id}
                    goal={goal}
                    onUpdate={onUpdateGoal}
                    onDelete={onDeleteGoal}
                    onAddSubtask={onAddSubtask}
                    onUpdateSubtask={onUpdateSubtask}
                    onDeleteSubtask={onDeleteSubtask}
                    onToggleSubtaskProjection={onToggleSubtaskProjection}
                    onGenerateSubtasks={handleGenerateSubtasks}
                    isGenerating={generatingGoalId === goal.id}
                    config={config}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* AI 生成流式输出显示 */}
        {generatingGoalId && aiStreamOutput && (
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-xs text-purple-600 mb-1">AI 正在生成子任务...</div>
            <div className="text-xs text-gray-600 max-h-32 overflow-y-auto whitespace-pre-wrap">
              {aiStreamOutput}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default GoalPanel


