import { NextRequest, NextResponse } from 'next/server'
import { createAuthenticatedClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    // 创建带有用户身份验证的客户端（安全方式）
    const { client: supabase, user } = await createAuthenticatedClient(request)

    // 获取用户订阅 - RLS 策略自动过滤用户数据
    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from('user_subscription')
      .select('user_id, news_source_id, status')
      .eq('user_id', user.id)
      .eq('status', 'Subscribed')

    if (subscriptionsError) {
      return NextResponse.json(
        { error: 'Failed to fetch subscriptions' },
        { status: 500 }
      )
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json([])
    }

    // 获取新闻源 IDs
    const newsSourceIds = subscriptions.map(sub => sub.news_source_id)

    // 获取新闻源信息
    const { data: newsSources, error: newsSourcesError } = await supabase
      .from('news_source')
      .select('*')
      .in('id', newsSourceIds)

    if (newsSourcesError) {
      return NextResponse.json(
        { error: 'Failed to fetch news sources' },
        { status: 500 }
      )
    }

    // 合并数据
    const combinedData = subscriptions.map(sub => {
      const newsSource = newsSources?.find(ns => ns.id === sub.news_source_id)
      return {
        ...sub,
        news_source: newsSource
      }
    }).filter(item => item.news_source) // 只包含有效新闻源的项目

    return NextResponse.json(combinedData)

  } catch (error) {
    console.error('Profile Subscriptions API Error:', error)

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

export async function POST(request: NextRequest) {
  try {
    // 创建带有用户身份验证的客户端（安全方式）
    const { client: supabase, user } = await createAuthenticatedClient(request)

    // 解析请求体
    const { newsSourceId, action } = await request.json()

    if (!newsSourceId || !action) {
      return NextResponse.json(
        { error: 'Missing newsSourceId or action' },
        { status: 400 }
      )
    }

    if (action === 'toggle') {
      // 切换订阅状态 - RLS 策略自动确保用户只能访问自己的订阅
      const { data: subscription } = await supabase
        .from('user_subscription')
        .select('status')
        .eq('user_id', user.id)
        .eq('news_source_id', newsSourceId)
        .single()

      const newStatus = subscription?.status === 'Subscribed' ? 'Unsubscribed' : 'Subscribed'

      const { error } = await supabase
        .from('user_subscription')
        .update({ status: newStatus })
        .eq('user_id', user.id)
        .eq('news_source_id', newsSourceId)

      if (error) throw error

      return NextResponse.json({ success: true, newStatus })

    } else if (action === 'remove') {
      // 删除订阅 - RLS 策略自动确保用户只能删除自己的订阅
      const { error } = await supabase
        .from('user_subscription')
        .delete()
        .eq('user_id', user.id)
        .eq('news_source_id', newsSourceId)

      if (error) throw error

      return NextResponse.json({ success: true })

    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Profile Subscriptions Action API Error:', error)

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
