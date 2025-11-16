import { useState, useRef, useEffect } from 'react'

function InputArea({ onSubmit, loading, config, aiStreamOutput = '' }) {
  const [text, setText] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [recognition, setRecognition] = useState(null)
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const [audioChunks, setAudioChunks] = useState([])
  const textareaRef = useRef(null)
  const useSiliconFlow = config?.speechApiKey && config.speechApiKey.trim() !== ''

  useEffect(() => {
    // 如果没有配置 speechApiKey，初始化浏览器语音识别
    if (!useSiliconFlow && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognitionInstance = new SpeechRecognition()
      recognitionInstance.continuous = true
      recognitionInstance.interimResults = true
      recognitionInstance.lang = 'zh-CN'

      recognitionInstance.onresult = (event) => {
        let interimTranscript = ''
        let finalTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }

        if (finalTranscript) {
          setText(prev => prev + finalTranscript)
        }
      }

      recognitionInstance.onerror = (event) => {
        console.error('语音识别错误:', event.error)
        setIsRecording(false)
      }

      recognitionInstance.onend = () => {
        setIsRecording(false)
      }

      setRecognition(recognitionInstance)
    }
  }, [useSiliconFlow])

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

  // SiliconFlow 语音识别
  const startSiliconFlowRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data)
        }
      }

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' })
        await transcribeAudio(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      setMediaRecorder(recorder)
      setAudioChunks(chunks)
      recorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('录音启动失败:', error)
      alert('无法访问麦克风，请检查权限设置')
    }
  }

  const stopSiliconFlowRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop()
      setIsRecording(false)
    }
  }

  const transcribeAudio = async (audioBlob) => {
    setIsProcessing(true)
    try {
      const formData = new FormData()
      formData.append('model', 'FunAudioLLM/SenseVoiceSmall')
      formData.append('file', audioBlob, 'recording.webm')

      const response = await fetch('https://api.siliconflow.cn/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.speechApiKey}`
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error(`语音识别失败: ${response.status}`)
      }

      const data = await response.json()
      if (data.text) {
        setText(prev => prev + data.text)
      }
    } catch (error) {
      console.error('语音识别错误:', error)
      alert(`语音识别失败: ${error.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const toggleRecording = () => {
    if (useSiliconFlow) {
      // 使用 SiliconFlow API
      if (isRecording) {
        stopSiliconFlowRecording()
      } else {
        startSiliconFlowRecording()
      }
    } else {
      // 使用浏览器语音识别
      if (!recognition) {
        alert('您的浏览器不支持语音识别，请使用 Chrome 或 Edge 浏览器，或配置 SiliconFlow 语音识别 API')
        return
      }

      if (isRecording) {
        recognition.stop()
        setIsRecording(false)
      } else {
        recognition.start()
        setIsRecording(true)
      }
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
          {isRecording && (
            <div className="absolute top-2 right-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm">
                <div className="relative flex items-center justify-center">
                  <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                  <div className="absolute w-2 h-2 bg-red-600 rounded-full animate-ping"></div>
                </div>
                <span className="animate-pulse">录音中...</span>
              </div>
            </div>
          )}
          {isProcessing && (
            <div className="absolute top-2 right-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span>识别中...</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={!text.trim() || loading || isProcessing}
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

          {(useSiliconFlow || recognition) && (
            <button
              onClick={toggleRecording}
              disabled={loading || isProcessing}
              className={`relative px-6 py-3 rounded-xl font-medium transition-all shadow-lg ${
                isRecording
                  ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                  : isProcessing
                  ? 'bg-blue-500 text-white cursor-wait'
                  : 'bg-white border-2 border-gray-300 hover:border-purple-500 text-gray-700'
              }`}
              title={
                isProcessing
                  ? '正在识别...'
                  : (useSiliconFlow ? 'SiliconFlow 语音识别' : '浏览器语音识别')
              }
            >
              {isRecording && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              )}
              {isProcessing && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-spin absolute inline-flex h-full w-full rounded-full border-2 border-white border-t-transparent"></span>
                </span>
              )}
              🎤 {isRecording ? '停止' : isProcessing ? '处理' : '语音'}
            </button>
          )}
        </div>

        <p className="text-sm text-gray-500 text-center">
          💡 按 Ctrl/Cmd + Enter 快速提交
          {useSiliconFlow && ' • 使用 SiliconFlow 语音识别'}
          {!useSiliconFlow && recognition && ' • 使用浏览器语音识别'}
        </p>
      </div>
    </div>
  )
}

export default InputArea

