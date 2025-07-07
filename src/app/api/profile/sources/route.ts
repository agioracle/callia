import { NextRequest, NextResponse } from 'next/server'
import { createAuthenticatedClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    // 创建带有用户身份验证的客户端（安全方式）
    const { client: supabase, user } = await createAuthenticatedClient(request)

    // 获取用户管理的新闻源 - RLS 策略自动过滤用户数据
    const { data: managedSources, error } = await supabase
      .from('news_source')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch managed sources' },
        { status: 500 }
      )
    }

    return NextResponse.json(managedSources || [])

  } catch (error) {
    console.error('Profile Sources API Error:', error)

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
    const { action, sourceId, updates, newsSourceData } = await request.json()

    if (!action) {
      return NextResponse.json(
        { error: 'Missing action' },
        { status: 400 }
      )
    }

    if (action === 'create') {
      // 创建新闻源
      if (!newsSourceData) {
        return NextResponse.json(
          { error: 'Missing newsSourceData for create action' },
          { status: 400 }
        )
      }

      const { data, error } = await supabase
        .from('news_source')
        .insert({
          ...newsSourceData,
          user_id: user.id,
          subscribers_num: 1, // 创建者自动订阅
          status: 'Activated'
        })
        .select()
        .single()

      if (error) throw error

      // 自动为创建者添加订阅
      const { error: subscriptionError } = await supabase
        .from('user_subscription')
        .insert({
          user_id: user.id,
          news_source_id: data.id,
          status: 'Subscribed'
        })

      if (subscriptionError) {
        console.error('Failed to create subscription for creator:', subscriptionError)
        // 不抛出错误，因为新闻源已经创建成功
      }

      return NextResponse.json(data)

    } else if (action === 'update') {
      // 更新新闻源 - RLS 策略自动确保用户只能更新自己的源
      if (!sourceId) {
        return NextResponse.json(
          { error: 'Missing sourceId for update action' },
          { status: 400 }
        )
      }

      const { error } = await supabase
        .from('news_source')
        .update(updates)
        .eq('id', sourceId)
        .eq('user_id', user.id) // 确保用户只能更新自己的源

      if (error) throw error

      return NextResponse.json({ success: true })

    } else if (action === 'delete') {
      // 删除新闻源 - RLS 策略自动确保用户只能删除自己的源
      if (!sourceId) {
        return NextResponse.json(
          { error: 'Missing sourceId for delete action' },
          { status: 400 }
        )
      }

      const { error } = await supabase
        .from('news_source')
        .delete()
        .eq('id', sourceId)
        .eq('user_id', user.id) // 确保用户只能删除自己的源

      if (error) throw error

      return NextResponse.json({ success: true })

    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Profile Sources Action API Error:', error)

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
