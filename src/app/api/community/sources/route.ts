import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, getAuthenticatedUserFromRequest } from '@/lib/supabase-server'

const OFFICIAL_USER_ID = process.env.OFFICIAL_USER_ID

interface NewsSource {
  id: string
  title: string
  description: string | null
  language: string | null
  category: string | null
  link: string | null
  rss: string | null
  tags: string[] | null
  user_id: string | null
  is_public: boolean
  subscribers_num: number
  status: string | null
  latest_crawled_num: number | null
  latest_crawled_at: string | null
  created_at: string
}

export async function GET(request: NextRequest) {
  try {
    // 对于公开新闻源，我们使用匿名客户端
    // 但如果用户已认证，我们获取用户信息以显示订阅状态
    let user = null
    let userToken = null

    try {
      const authResult = await getAuthenticatedUserFromRequest(request)
      user = authResult.user
      userToken = authResult.token
    } catch {
      // 如果没有认证，继续获取公开数据，但不包含订阅状态
    }

    // 创建客户端 - 如果有用户token就使用，否则使用匿名访问
    const supabase = createSupabaseServerClient(userToken || undefined)

    // 并行获取所有类型的新闻源（这些是公开数据）
    const [officialData, communityData, newlyData] = await Promise.all([
      // 获取官方源
      supabase
        .from('news_source')
        .select('*')
        .eq('is_public', true)
        .eq('status', 'Activated')
        .eq('user_id', OFFICIAL_USER_ID)
        .order('subscribers_num', { ascending: false }),

      // 获取社区源
      supabase
        .from('news_source')
        .select('*')
        .eq('is_public', true)
        .eq('status', 'Activated')
        .neq('user_id', OFFICIAL_USER_ID)
        .order('subscribers_num', { ascending: false }),

      // 获取最新添加的源
      supabase
        .from('news_source')
        .select('*')
        .eq('is_public', true)
        .eq('status', 'Activated')
        .order('created_at', { ascending: false })
        .limit(9)
    ])

    if (officialData.error) throw officialData.error
    if (communityData.error) throw communityData.error
    if (newlyData.error) throw newlyData.error

    // 如果用户已认证，获取订阅状态
    const subscriptionMap = new Map<string, boolean>()
    if (user && userToken) {
      const allSourceIds = [
        ...(officialData.data || []).map(s => s.id),
        ...(communityData.data || []).map(s => s.id),
        ...(newlyData.data || []).map(s => s.id)
      ]

      if (allSourceIds.length > 0) {
        // 使用认证的客户端获取用户订阅状态
        const authenticatedSupabase = createSupabaseServerClient(userToken)
        const { data: subscriptions } = await authenticatedSupabase
          .from('user_subscription')
          .select('news_source_id, status')
          .eq('user_id', user.id)
          .in('news_source_id', allSourceIds)

        subscriptions?.forEach((sub: { news_source_id: string; status: string }) => {
          subscriptionMap.set(sub.news_source_id, sub.status === 'Subscribed')
        })
      }
    }

    // 添加订阅状态到源数据
    const addSubscriptionStatus = (sources: NewsSource[]) =>
      sources.map(source => ({
        ...source,
        isSubscribed: subscriptionMap.get(source.id) || false
      }))

    const result = {
      official: addSubscriptionStatus(officialData.data || []),
      community: addSubscriptionStatus(communityData.data || []),
      newly: addSubscriptionStatus(newlyData.data || [])
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch news sources' },
      { status: 500 }
    )
  }
}
