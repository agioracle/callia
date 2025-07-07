import { createClient } from '@supabase/supabase-js'

// 服务端配置 - 使用用户 JWT token，更安全的方式
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 创建使用用户 JWT 的 Supabase 客户端（推荐方式）
export function createSupabaseServerClient(userToken?: string) {
  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  }

  if (!supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
  }

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: userToken ? {
        Authorization: `Bearer ${userToken}`
      } : {}
    }
  })

  return client
}

// 备用方案：仅在必要时使用 service role key（仅用于用户验证）
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

export function getSupabaseServer() {
  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  }

  if (!supabaseServiceKey) {
    throw new Error('Missing SUPABASE_SERVICE_KEY environment variable')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// 辅助函数：验证用户身份（仅此处使用 service role key）
export async function getAuthenticatedUser(authHeader: string | null) {
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header')
  }

  const token = authHeader.replace('Bearer ', '')

  // 只在验证 JWT token 时使用 service role key
  const adminClient = getSupabaseServer()
  const { data: { user }, error } = await adminClient.auth.getUser(token)

  if (error || !user) {
    throw new Error('Invalid authentication token')
  }

  return { user, token }
}

// 辅助函数：从请求中获取认证用户和 token
export async function getAuthenticatedUserFromRequest(request: Request) {
  const authHeader = request.headers.get('authorization')
  return await getAuthenticatedUser(authHeader)
}

// 创建带有用户身份的客户端
export async function createAuthenticatedClient(request: Request) {
  const { user, token } = await getAuthenticatedUserFromRequest(request)
  const client = createSupabaseServerClient(token)
  return { client, user }
}
