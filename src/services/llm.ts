import type { Analysis } from '@/types'

interface LLMResponse {
  tags: string[]
  summary: string
  category: string
  urgency: 'low' | 'medium' | 'high'
  schedule?: {
    eventName: string
    eventTime: string
    location?: string
  }
}

const SILICONFLOW_API = 'https://api.siliconflow.cn/v1/chat/completions'
const SILICONFLOW_MODEL = 'THUDM/GLM-4.1V-9B-Thinking'

const SYSTEM_PROMPT = `你是一个截图智能分析助手。请分析截图中包含的信息，提取标签、摘要、分类和日程（如果有）。

输出格式（仅输出JSON，不要其他内容）：
{
  "tags": ["标签1", "标签2"],
  "summary": "一句话描述截图内容",
  "category": "chat|quote|contract|order|transfer|notification|schedule|other",
  "urgency": "low|medium|high",
  "schedule": {
    "eventName": "事件名称",
    "eventTime": "2024-01-01 12:00",
    "location": "地点（可选）"
  }
}

注意：
1. tags 应该是2-5个标签
2. urgency 表示紧急程度，high表示需要立即处理
3. schedule 只在截图中明确提到具体时间时填写
4. category 必须是指定选项之一：chat(聊天记录), quote(报价单), contract(合同), order(订单), transfer(转账凭证), notification(通知), schedule(日程), other(其他)`

class LLMService {
  private apiKey: string = ''

  initialize(apiKey: string) {
    this.apiKey = apiKey
  }

  async analyze(imageBase64: string): Promise<Analysis | null> {
    if (!this.apiKey) {
      console.log('LLM not configured')
      return null
    }

    try {
      return await this.analyzeWithImage(imageBase64)
    } catch (error) {
      console.error('LLM analysis failed:', error)
      return null
    }
  }

  async analyzeWithImage(imageBase64: string): Promise<Analysis | null> {
    const response = await fetch(SILICONFLOW_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: SILICONFLOW_MODEL,
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/png;base64,${imageBase64}`
                }
              },
              {
                type: 'text',
                text: '请分析这张截图'
              }
            ]
          }
        ],
        temperature: 0.7
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      throw new Error('No response content')
    }

    return this.parseResponse(content)
  }

  private parseResponse(content: string): Analysis {
    let jsonStr = content
    if (content.includes('```json')) {
      jsonStr = content.split('```json')[1].split('```')[0]
    } else if (content.includes('```')) {
      jsonStr = content.split('```')[1].split('```')[0]
    }

    const jsonStr_clean = jsonStr.trim()

    let response: LLMResponse
    try {
      response = JSON.parse(jsonStr_clean)
    } catch (e) {
      const match = jsonStr_clean.match(/\{[\s\S]*\}/)
      if (match) {
        response = JSON.parse(match[0])
      } else {
        throw new Error('Failed to parse JSON response')
      }
    }

    const categoryMap: Record<string, string> = {
      'chat': 'chat',
      'quote': 'quote',
      'contract': 'contract',
      'order': 'order',
      'transfer': 'transfer',
      'notification': 'notification',
      'schedule': 'schedule',
      'other': 'other'
    }

    const analysis: Analysis = {
      screenshotId: crypto.randomUUID(),
      tags: response.tags || [],
      summary: response.summary || '无法生成摘要',
      category: categoryMap[response.category] || 'other',
      urgency: response.urgency || 'medium',
      provider: 'siliconflow-glm4v',
      analyzedAt: new Date()
    }

    if (response.schedule?.eventName && response.schedule?.eventTime) {
      analysis.schedule = {
        id: crypto.randomUUID(),
        screenshotId: analysis.screenshotId,
        eventName: response.schedule.eventName,
        eventTime: new Date(response.schedule.eventTime),
        location: response.schedule.location,
        reminderMinutes: 15,
        isExportedToCalendar: false,
        status: 'pending'
      }
    }

    return analysis
  }
}

export const llmService = new LLMService()
