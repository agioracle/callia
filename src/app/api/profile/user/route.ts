import { NextRequest, NextResponse } from 'next/server'
import { createAuthenticatedClient } from '@/lib/supabase-server'

interface UserProfileUpdates {
  enable_email_delivery?: boolean
  brief_language?: string
}

export async function GET(request: NextRequest) {
  try {
    // 创建带有用户身份验证的客户端（安全方式）
    const { client: supabase, user } = await createAuthenticatedClient(request)

    // 获取用户配置文件 - RLS 策略自动确保用户只能访问自己的数据
    const { data: profile, error } = await supabase
      .from('user_profile')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      )
    }

    return NextResponse.json(profile)

  } catch (error) {
    console.error('User Profile API Error:', error)

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
    const updates = await request.json()

    // 只允许更新特定字段
    const allowedFields: (keyof UserProfileUpdates)[] = ['enable_email_delivery', 'brief_language']
    const filteredUpdates: UserProfileUpdates = Object.keys(updates)
      .filter(key => allowedFields.includes(key as keyof UserProfileUpdates))
      .reduce((obj, key) => {
        obj[key as keyof UserProfileUpdates] = updates[key]
        return obj
      }, {} as UserProfileUpdates)

    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    // 更新用户配置文件 - RLS 策略自动确保用户只能更新自己的数据
    const { data, error } = await supabase
      .from('user_profile')
      .update(filteredUpdates)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)

  } catch (error) {
    console.error('User Profile Update API Error:', error)

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
