import { useState, useEffect } from 'react'
import { testLLMConfig } from '../utils/llm'
import { loadBackgroundSettings, saveBackgroundSettings } from '../utils/storage'

function ConfigModal({ config, onSave, onClose }) {
  const [apiKey, setApiKey] = useState(config?.apiKey || '')
  const [baseUrl, setBaseUrl] = useState(config?.baseUrl || 'https://api.siliconflow.cn/v1')
  const [model, setModel] = useState(config?.model || 'deepseek-ai/DeepSeek-V2.5')
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)

  // 背景设置
  const [bgSettings, setBgSettings] = useState(loadBackgroundSettings())

  useEffect(() => {
    setBgSettings(loadBackgroundSettings())
  }, [])

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

    // 保存 LLM 配置
    onSave({
      apiKey: apiKey.trim(),
      baseUrl: baseUrl.trim(),
      model: model.trim()
    })

    // 保存背景配置，捕获可能的存储错误
    try {
      saveBackgroundSettings(bgSettings)
      // 触发自定义事件通知背景设置已更改
      window.dispatchEvent(new Event('backgroundSettingsChanged'))
    } catch (error) {
      console.error('保存背景设置失败:', error)
      if (error.name === 'QuotaExceededError') {
        alert('背景图片过大，保存失败！\n请减少图片数量或使用更小的图片。\n\n提示：已保存 LLM 配置，但背景设置未保存。')
      } else {
        alert('保存背景设置时出错，请重试。')
      }
    }
  }

  const compressImage = (file, maxWidth = 1920, maxHeight = 1080, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height

          // 计算缩放比例
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height)
            width = width * ratio
            height = height * ratio
          }

          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)

          // 转换为 base64，使用 JPEG 格式和指定质量
          const compressedBase64 = canvas.toDataURL('image/jpeg', quality)

          // 检查压缩后的大小（粗略估算 base64 的字节数）
          const sizeInBytes = compressedBase64.length * 0.75
          const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2)

          console.log(`图片压缩后大小: ${sizeInMB}MB`)

          resolve(compressedBase64)
        }
        img.onerror = reject
        img.src = e.target.result
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleImageUpload = async (e, isMultiple = false) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    try {
      // 压缩所有图片
      const compressedImages = await Promise.all(
        files.map(file => compressImage(file))
      )

      // 检查总大小
      const totalSize = compressedImages.reduce((sum, img) => sum + img.length, 0)
      const totalSizeMB = (totalSize * 0.75 / (1024 * 1024)).toFixed(2)

      // 如果是多张图片模式，加上现有图片的大小
      if (isMultiple) {
        const existingSize = bgSettings.backgroundImages.reduce((sum, img) => sum + img.length, 0)
        const combinedSizeMB = ((totalSize + existingSize) * 0.75 / (1024 * 1024)).toFixed(2)

        if (combinedSizeMB > 8) {
          alert(`图片总大小 ${combinedSizeMB}MB 超出限制！\n建议：\n1. 减少图片数量\n2. 使用更小分辨率的图片\n3. 删除一些已有图片后再上传`)
          return
        }
      }

      if (totalSizeMB > 8) {
        alert(`图片大小 ${totalSizeMB}MB 超出限制！请使用更小的图片。`)
        return
      }

      if (isMultiple) {
        setBgSettings(prev => ({
          ...prev,
          backgroundImages: [...prev.backgroundImages, ...compressedImages]
        }))
        alert(`成功上传 ${files.length} 张图片（总大小约 ${totalSizeMB}MB）`)
      } else {
        setBgSettings(prev => ({
          ...prev,
          backgroundImage: compressedImages[0]
        }))
        alert(`图片上传成功（大小约 ${totalSizeMB}MB）`)
      }
    } catch (error) {
      console.error('图片压缩失败:', error)
      alert('图片处理失败，请尝试使用其他图片')
    }
  }

  const removeImage = (index) => {
    setBgSettings(prev => ({
      ...prev,
      backgroundImages: prev.backgroundImages.filter((_, i) => i !== index)
    }))
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

            {/* 背景设置 */}
            <div className="space-y-4 border-t border-gray-200 pt-6">
              <h3 className="text-xl font-semibold text-gray-700">🎨 背景设置</h3>

              {/* 背景类型选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  背景类型
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setBgSettings(prev => ({ ...prev, backgroundType: 'gradient' }))}
                    className={`py-2 px-4 rounded-lg border-2 transition-all ${
                      bgSettings.backgroundType === 'gradient'
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    🌈 渐变色
                  </button>
                  <button
                    onClick={() => setBgSettings(prev => ({ ...prev, backgroundType: 'color' }))}
                    className={`py-2 px-4 rounded-lg border-2 transition-all ${
                      bgSettings.backgroundType === 'color'
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    🎨 纯色
                  </button>
                  <button
                    onClick={() => setBgSettings(prev => ({ ...prev, backgroundType: 'image' }))}
                    className={`py-2 px-4 rounded-lg border-2 transition-all ${
                      bgSettings.backgroundType === 'image'
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    🖼️ 单张图片
                  </button>
                  <button
                    onClick={() => setBgSettings(prev => ({ ...prev, backgroundType: 'folder' }))}
                    className={`py-2 px-4 rounded-lg border-2 transition-all ${
                      bgSettings.backgroundType === 'folder'
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    📁 多张图片
                  </button>
                </div>
              </div>

              {/* 渐变色设置 */}
              {bgSettings.backgroundType === 'gradient' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      起始颜色
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={bgSettings.gradientStart}
                        onChange={(e) => setBgSettings(prev => ({ ...prev, gradientStart: e.target.value }))}
                        className="h-10 w-16 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={bgSettings.gradientStart}
                        onChange={(e) => setBgSettings(prev => ({ ...prev, gradientStart: e.target.value }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      结束颜色
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={bgSettings.gradientEnd}
                        onChange={(e) => setBgSettings(prev => ({ ...prev, gradientEnd: e.target.value }))}
                        className="h-10 w-16 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={bgSettings.gradientEnd}
                        onChange={(e) => setBgSettings(prev => ({ ...prev, gradientEnd: e.target.value }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 纯色设置 */}
              {bgSettings.backgroundType === 'color' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    背景颜色
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={bgSettings.backgroundColor}
                      onChange={(e) => setBgSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                      className="h-10 w-16 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={bgSettings.backgroundColor}
                      onChange={(e) => setBgSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              )}

              {/* 单张图片上传 */}
              {bgSettings.backgroundType === 'image' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    上传背景图片
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    💡 提示：图片会自动压缩至合适大小
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, false)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  {bgSettings.backgroundImage && (
                    <div className="mt-2 relative">
                      <img
                        src={bgSettings.backgroundImage}
                        alt="背景预览"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => setBgSettings(prev => ({ ...prev, backgroundImage: '' }))}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* 多张图片上传 */}
              {bgSettings.backgroundType === 'folder' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    上传多张背景图片
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    💡 提示：图片会自动压缩，建议上传 3-5 张，总大小不超过 8MB
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageUpload(e, true)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  {bgSettings.backgroundImages.length > 0 && (
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {bgSettings.backgroundImages.map((img, index) => (
                        <div key={index} className="relative">
                          <img
                            src={img}
                            alt={`背景 ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 自动切换设置 */}
                  {bgSettings.backgroundImages.length > 1 && (
                    <div className="mt-4 space-y-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={bgSettings.autoSwitch}
                          onChange={(e) => setBgSettings(prev => ({ ...prev, autoSwitch: e.target.checked }))}
                          className="w-4 h-4 text-purple-600 rounded"
                        />
                        <span className="text-sm font-medium text-gray-700">自动切换背景</span>
                      </label>

                      {bgSettings.autoSwitch && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            切换间隔（秒）
                          </label>
                          <input
                            type="number"
                            min="5"
                            max="300"
                            value={bgSettings.switchInterval}
                            onChange={(e) => setBgSettings(prev => ({ ...prev, switchInterval: parseInt(e.target.value) || 30 }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 容器透明度（仅在有图片时显示） */}
              {(bgSettings.backgroundType === 'image' || bgSettings.backgroundType === 'folder') && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      容器透明度
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={bgSettings.containerOpacity !== undefined ? bgSettings.containerOpacity : 50}
                        onChange={(e) => setBgSettings(prev => ({ ...prev, containerOpacity: parseInt(e.target.value) }))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                      />
                      <span className="text-sm font-medium text-gray-700 w-12 text-right">
                        {bgSettings.containerOpacity !== undefined ? bgSettings.containerOpacity : 50}%
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>透明</span>
                      <span>不透明</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 图片适配设置（仅在有图片时显示） */}
              {(bgSettings.backgroundType === 'image' || bgSettings.backgroundType === 'folder') && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      图片适配方式
                    </label>
                    <select
                      value={bgSettings.backgroundSize}
                      onChange={(e) => setBgSettings(prev => ({ ...prev, backgroundSize: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="cover">填充（Cover）</option>
                      <option value="contain">适应（Contain）</option>
                      <option value="auto">原始大小（Auto）</option>
                      <option value="100% 100%">拉伸（Stretch）</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      图片位置
                    </label>
                    <select
                      value={bgSettings.backgroundPosition}
                      onChange={(e) => setBgSettings(prev => ({ ...prev, backgroundPosition: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="center">居中</option>
                      <option value="top">顶部</option>
                      <option value="bottom">底部</option>
                      <option value="left">左侧</option>
                      <option value="right">右侧</option>
                      <option value="top left">左上</option>
                      <option value="top right">右上</option>
                      <option value="bottom left">左下</option>
                      <option value="bottom right">右下</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      图片重复
                    </label>
                    <select
                      value={bgSettings.backgroundRepeat}
                      onChange={(e) => setBgSettings(prev => ({ ...prev, backgroundRepeat: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="no-repeat">不重复</option>
                      <option value="repeat">重复</option>
                      <option value="repeat-x">水平重复</option>
                      <option value="repeat-y">垂直重复</option>
                    </select>
                  </div>
                </div>
              )}
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

