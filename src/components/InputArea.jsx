import { useState, useRef } from 'react'

function InputArea({ onSubmit, loading, aiStreamOutput = '' }) {
  const [text, setText] = useState('')
  const textareaRef = useRef(null)

  const handleSubmit = () => {
    if (text.trim() && !loading) {
      onSubmit(text)
      setText('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="space-y-4">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={loading && aiStreamOutput ? aiStreamOutput : text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="告诉我你今天想做什么...&#10;例如：我要写一份项目报告，下午开会，晚上健身，周末陪家人"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all resize-none"
            rows="4"
            disabled={loading}
            readOnly={loading && aiStreamOutput}
          />
          {loading && aiStreamOutput && (
            <div className="absolute top-2 right-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm">
                <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                <span>AI 生成中...</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={!text.trim() || loading}
            className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all font-medium shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                AI 思考中...
              </>
            ) : (
              <>
                ✨ 让 AI 帮我规划
              </>
            )}
          </button>
        </div>

        <p className="text-sm text-gray-500 text-center">
          💡 按 Ctrl/Cmd + Enter 快速提交
        </p>
      </div>
    </div>
  )
}

export default InputArea

