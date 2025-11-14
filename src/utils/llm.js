// LLM API 集成 - 流式输出版本
export const callLLM = async (config, prompt, onStream = null) => {
  const baseUrl = config.baseUrl || 'https://api.siliconflow.cn/v1'
  const apiKey = config.apiKey

  if (!apiKey) {
    throw new Error('未配置 API Key')
  }

  const systemPrompt = `你是一个专业的日程规划助手。用户会告诉你一些事情，你需要将这些事情分解成具体可操作的事件。
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
            content: systemPrompt
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        stream: !!onStream  // 如果有回调函数，则启用流式输出
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || `API 请求失败: ${response.status}`)
    }

    // 如果启用了流式输出
    if (onStream) {
      const reader = response.body.getReader()
      const decoder = new TextDecoder('utf-8')
      let buffer = ''
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // 保留最后一行不完整的数据

        for (const line of lines) {
          const trimmedLine = line.trim()
          if (!trimmedLine || trimmedLine === 'data: [DONE]') continue
          if (trimmedLine.startsWith('data: ')) {
            try {
              const jsonStr = trimmedLine.slice(6)
              const data = JSON.parse(jsonStr)
              const content = data.choices?.[0]?.delta?.content
              if (content) {
                fullContent += content
                onStream(content, fullContent)  // 回调：传递当前token和完整内容
              }
            } catch (e) {
              console.error('解析流式数据失败:', e, trimmedLine)
            }
          }
        }
      }

      // 解析完整内容
      if (!fullContent) {
        throw new Error('API 返回内容为空')
      }

      // 尝试解析 JSON
      try {
        const jsonMatch = fullContent.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0])
        }
        return JSON.parse(fullContent)
      } catch (parseError) {
        console.error('解析返回内容失败:', fullContent)
        throw new Error('无法解析 AI 返回的内容')
      }
    } else {
      // 非流式输出（兼容原有逻辑）
      const data = await response.json()
      const content = data.choices[0]?.message?.content

      if (!content) {
        throw new Error('API 返回内容为空')
      }

      // 尝试解析 JSON
      try {
        const jsonMatch = content.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0])
        }
        return JSON.parse(content)
      } catch (parseError) {
        console.error('解析返回内容失败:', content)
        throw new Error('无法解析 AI 返回的内容')
      }
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

