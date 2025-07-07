import { NextRequest, NextResponse } from 'next/server'
import { createAuthenticatedClient } from '@/lib/supabase-server'
import { SupabaseClient } from '@supabase/supabase-js'

// 检查订阅限制的函数
async function checkSubscriptionLimit(supabase: SupabaseClient, userId: string) {
  // 获取用户配置文件 - RLS 策略自动确保安全访问
  const { data: profile } = await supabase
    .from('user_profile')
    .select('pricing_plan')
    .eq('user_id', userId)
    .single()

  const pricingPlan = profile?.pricing_plan || 'Free'

  // 定义订阅限制
  const limits: { [key: string]: number } = {
    'Free': 10,
    'Pro': 100,
    'Max': 1000
  }

  const limit = limits[pricingPlan] || limits['Free']

  // 获取当前订阅数量 - RLS 策略自动过滤用户数据
  const { data: subscriptions } = await supabase
    .from('user_subscription')
    .select('news_source_id')
    .eq('user_id', userId)
    .eq('status', 'Subscribed')

  const currentCount = subscriptions?.length || 0

  return {
    canSubscribe: currentCount < limit,
    currentCount,
    limit,
    pricingPlan
  }
}

export async function POST(request: NextRequest) {
  try {
    // 创建带有用户身份验证的客户端（安全方式）
    const { client: supabase, user } = await createAuthenticatedClient(request)

    // 解析请求体
    const { sourceId, action } = await request.json()

    if (!sourceId || !action) {
      return NextResponse.json(
        { error: 'Missing sourceId or action' },
        { status: 400 }
      )
    }

    if (!['subscribe', 'unsubscribe'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be subscribe or unsubscribe' },
        { status: 400 }
      )
    }

    // 获取当前新闻源信息（公开数据，不需要特殊权限）
    const { data: newsSource, error: sourceError } = await supabase
      .from('news_source')
      .select('id, subscribers_num')
      .eq('id', sourceId)
      .single()

    if (sourceError || !newsSource) {
      return NextResponse.json(
        { error: 'News source not found' },
        { status: 404 }
      )
    }

    const newSubscriptionStatus = action === 'subscribe'
    const status = newSubscriptionStatus ? 'Subscribed' : 'Unsubscribed'

    // 如果是订阅操作，检查订阅限制
    if (newSubscriptionStatus) {
      const limitCheck = await checkSubscriptionLimit(supabase, user.id)

      if (!limitCheck.canSubscribe) {
        return NextResponse.json({
          error: 'Subscription limit reached',
          limit: limitCheck.limit,
          currentCount: limitCheck.currentCount,
          pricingPlan: limitCheck.pricingPlan
        }, { status: 403 })
      }
    }

    // 检查是否已存在订阅记录 - RLS 策略自动确保用户只能访问自己的订阅
    const { data: existingSubscription } = await supabase
      .from('user_subscription')
      .select('*')
      .eq('user_id', user.id)
      .eq('news_source_id', sourceId)
      .single()

    if (existingSubscription) {
      // 更新现有订阅 - RLS 策略自动确保用户只能更新自己的订阅
      const { error: updateError } = await supabase
        .from('user_subscription')
        .update({ status })
        .eq('user_id', user.id)
        .eq('news_source_id', sourceId)

      if (updateError) throw updateError
    } else {
      // 创建新订阅记录
      const { error: insertError } = await supabase
        .from('user_subscription')
        .insert({
          user_id: user.id,
          news_source_id: sourceId,
          status
        })

      if (insertError) throw insertError
    }

    // 更新新闻源的订阅者数量
    // 注意：这需要特殊处理，因为它涉及更新其他用户的数据
    // 在生产环境中，这应该通过数据库触发器或单独的管理员 API 处理
    const subscriberChange = newSubscriptionStatus ? 1 : -1
    const { error: updateSourceError } = await supabase
      .from('news_source')
      .update({
        subscribers_num: Math.max(0, newsSource.subscribers_num + subscriberChange)
      })
      .eq('id', sourceId)

    if (updateSourceError) {
      console.warn('Failed to update subscriber count:', updateSourceError)
      // 不抛出错误，因为订阅操作本身已成功
    }

    return NextResponse.json({
      success: true,
      isSubscribed: newSubscriptionStatus,
      newSubscriberCount: Math.max(0, newsSource.subscribers_num + subscriberChange)
    })

  } catch (error) {
    console.error('Subscribe API Error:', error)

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
