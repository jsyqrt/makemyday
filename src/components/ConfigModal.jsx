import { useState } from 'react'
import { testLLMConfig } from '../utils/llm'

function ConfigModal({ config, onSave, onClose }) {
  const [apiKey, setApiKey] = useState(config?.apiKey || '')
  const [baseUrl, setBaseUrl] = useState(config?.baseUrl || 'https://api.siliconflow.cn/v1')
  const [model, setModel] = useState(config?.model || 'deepseek-ai/DeepSeek-V2.5')
  const [speechApiKey, setSpeechApiKey] = useState(config?.speechApiKey || '')
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)
    const result = await testLLMConfig({ apiKey, baseUrl, model })
    setTestResult(result)
    setTesting(false)
  }

  const handleSave = () => {
    if (!apiKey.trim()) {
      alert('请输入 API Key')
      return
    }
    onSave({
      apiKey: apiKey.trim(),
      baseUrl: baseUrl.trim(),
      model: model.trim(),
      speechApiKey: speechApiKey.trim()
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">⚙️ 配置设置</h2>
            {config && (
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            )}
          </div>

          <div className="space-y-6">
            {/* LLM API 配置 */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-700">🤖 LLM API 配置</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="mt-1 text-sm text-gray-500">
                  默认使用 SiliconFlow API，
                  <a
                    href="https://siliconflow.cn"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:underline ml-1"
                  >
                    获取 API Key
                  </a>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base URL
                </label>
                <input
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://api.siliconflow.cn/v1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model
                </label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="deepseek-ai/DeepSeek-V2.5"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={handleTest}
                disabled={testing || !apiKey}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {testing ? '测试中...' : '🧪 测试 API 配置'}
              </button>

              {testResult && (
                <div className={`p-4 rounded-lg ${testResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {testResult.message}
                </div>
              )}
            </div>

            {/* 语音识别配置 */}
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-xl font-semibold text-gray-700">🎤 语音识别配置（可选）</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Speech API Key
                </label>
                <input
                  type="password"
                  value={speechApiKey}
                  onChange={(e) => setSpeechApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-600">
                    <strong>选项 1（推荐）</strong>：配置 SiliconFlow 语音识别 API Key
                  </p>
                  <p className="text-sm text-gray-500 ml-4">
                    • 使用与 LLM 相同的 API Key 即可
                  </p>
                  <p className="text-sm text-gray-500 ml-4">
                    • 支持所有现代浏览器
                  </p>
                  <p className="text-sm text-gray-500 ml-4">
                    • 识别准确度高
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>选项 2</strong>：留空使用浏览器内置语音识别
                  </p>
                  <p className="text-sm text-gray-500 ml-4">
                    • 完全免费，无需 API
                  </p>
                  <p className="text-sm text-gray-500 ml-4">
                    • 仅支持 Chrome/Edge 浏览器
                  </p>
                  <p className="text-sm text-gray-500 ml-4">
                    • 需要网络连接
                  </p>
                </div>
              </div>
            </div>

            {/* 保存按钮 */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium shadow-lg"
              >
                💾 保存配置
              </button>
              {config && (
                <button
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  取消
                </button>
              )}
            </div>
          </div>

          {/* 提示信息 */}
          {!config && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                💡 首次使用需要配置 API Key。数据将保存在浏览器本地存储中，请勿清除缓存以避免数据丢失。
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ConfigModal

