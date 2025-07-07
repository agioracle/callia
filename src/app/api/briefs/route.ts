import { NextRequest, NextResponse } from 'next/server'
import { createAuthenticatedClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    // 创建带有用户身份验证的客户端（安全方式）
    const { client: supabase, user } = await createAuthenticatedClient(request)

    // 从 Supabase 获取用户简报数据 - 使用 RLS 自动过滤用户数据
    const { data, error } = await supabase
      .from('user_brief')
      .select('user_id, brief_date, brief_content, news_source_ids, brief_audio_url, brief_audio_script')
      .eq('user_id', user.id) // 这里的过滤会被 RLS 策略自动强制执行
      .order('brief_date', { ascending: false })
      .limit(15)

    if (error) {
      console.error('Error fetching user briefs:', error)
      return NextResponse.json(
        { error: 'Failed to fetch briefs' },
        { status: 500 }
      )
    }

    // 转换数据格式以匹配前端期望的结构
    interface UserBrief {
      user_id: string
      brief_date: string
      brief_content: string | object
      news_source_ids: string | string[] | null
      brief_audio_url: string | null
      brief_audio_script: string | null
    }

    const transformedData = data.map((brief: UserBrief) => {
      let parsedContent
      try {
        // 尝试解析 brief_content 如果它包含结构化数据
        parsedContent = typeof brief.brief_content === 'string'
          ? JSON.parse(brief.brief_content)
          : brief.brief_content
      } catch {
        // 如果不是 JSON，则作为纯文本处理
        parsedContent = { textContent: brief.brief_content }
      }

      // 计算新闻源数量
      let sourcesCount = 0
      if (brief.news_source_ids) {
        if (Array.isArray(brief.news_source_ids)) {
          sourcesCount = brief.news_source_ids.length
        } else if (typeof brief.news_source_ids === 'string') {
          try {
            const parsedIds = JSON.parse(brief.news_source_ids)
            sourcesCount = Array.isArray(parsedIds) ? parsedIds.length : 0
          } catch {
            // 如果是逗号分隔的字符串，分割并计数
            sourcesCount = brief.news_source_ids ? (brief.news_source_ids as string).split(',').filter((id: string) => id.trim()).length : 0
          }
        }
      }

      return {
        id: brief.user_id + '-' + brief.brief_date, // 创建唯一 ID
        date: brief.brief_date,
        audio: brief.brief_audio_url || "",
        audioScript: brief.brief_audio_script || "",
        textContent: parsedContent.textContent || brief.brief_content,
        sources: sourcesCount,
      }
    })

    return NextResponse.json(transformedData)

  } catch (error) {
    console.error('API Error:', error)

    if (error instanceof Error) {
      if (error.message.includes('authorization') || error.message.includes('authentication')) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
