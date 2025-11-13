// LLM API 集成
export const callLLM = async (config, prompt) => {
  const baseUrl = config.baseUrl || 'https://api.siliconflow.cn/v1'
  const apiKey = config.apiKey

  if (!apiKey) {
    throw new Error('未配置 API Key')
  }

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: config.model || 'deepseek-ai/DeepSeek-V2.5',
        messages: [
          {
            role: 'system',
            content: `你是一个专业的日程规划助手。用户会告诉你一些事情，你需要将这些事情分解成具体可操作的事件。
对于每个事件，你需要：
1. 给出清晰的事件名称
2. 评估优先级（根据紧急重要四象限）：
   - "urgent-important": 紧急且重要
   - "urgent-not-important": 紧急但不重要
   - "not-urgent-important": 不紧急但重要
   - "not-urgent-not-important": 不紧急也不重要
3. 给出具体的行动建议

请以 JSON 数组格式返回，格式如下：
[
  {
    "title": "事件标题",
    "priority": "urgent-important",
    "suggestion": "具体的行动建议"
  }
]

只返回 JSON 数组，不要包含其他文字。`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || `API 请求失败: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error('API 返回内容为空')
    }

    // 尝试解析 JSON
    try {
      // 提取 JSON 数组（可能被 markdown 代码块包裹）
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      return JSON.parse(content)
    } catch (parseError) {
      console.error('解析返回内容失败:', content)
      throw new Error('无法解析 AI 返回的内容')
    }
  } catch (error) {
    console.error('LLM 调用失败:', error)
    throw error
  }
}

// 测试 API 配置
export const testLLMConfig = async (config) => {
  try {
    const baseUrl = config.baseUrl || 'https://api.siliconflow.cn/v1'
    const apiKey = config.apiKey

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: config.model || 'deepseek-ai/DeepSeek-V2.5',
        messages: [
          { role: 'user', content: '你好' }
        ],
        max_tokens: 10
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || `API 测试失败: ${response.status}`)
    }

    return { success: true, message: 'API 配置测试成功！' }
  } catch (error) {
    return { success: false, message: error.message }
  }
}

