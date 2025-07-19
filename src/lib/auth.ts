import { supabase } from './supabase'

// Helper function to ensure user profile exists
const ensureUserProfile = async (userId: string, email: string) => {
  try {
    // Check if user profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('user_profile')
      .select('user_id')
      .eq('user_id', userId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is "not found" error - other errors should be reported
      console.error('Error checking user profile:', checkError)
      return { error: checkError }
    }

    // If profile doesn't exist, create it
    if (!existingProfile) {
      const { data, error } = await supabase
        .from('user_profile')
        .insert({
          user_id: userId,
          email: email,
          enable_email_delivery: false,
          brief_language: 'English',
          join_date: new Date().toISOString(),
          pricing_plan: 'Free',
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating user profile:', error)
        return { error }
      }

      return { data, error: null }
    }

    return { data: existingProfile, error: null }
  } catch (err) {
    console.error('Error in ensureUserProfile:', err)
    return { error: err }
  }
}

// 获取当前有效的access token（推荐使用这个而不是直接调用getSession）
export const getValidAccessToken = async (): Promise<string | null> => {
  try {
    // 优先使用缓存的session（如果在React组件中，应该使用useAuth().getValidSession()）
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      console.error('Error getting session:', error)
      return null
    }

    if (!session?.access_token) {
      return null
    }

    // 检查token是否即将过期（5分钟内）
    try {
      const tokenParts = session.access_token.split('.')
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]))
        const expirationTime = payload.exp * 1000
        const currentTime = Date.now()
        const timeUntilExpiry = expirationTime - currentTime

        // 如果token在5分钟内过期，尝试刷新
        if (timeUntilExpiry < 5 * 60 * 1000) {
          console.log('Token expiring soon, attempting refresh...')
          const { data: refreshedData, error: refreshError } = await supabase.auth.refreshSession()

          if (refreshError || !refreshedData.session?.access_token) {
            console.error('Failed to refresh session:', refreshError)
            return session.access_token // 返回原token，让上层处理
          }

          return refreshedData.session.access_token
        }
      }
    } catch (parseError) {
      console.error('Error parsing token:', parseError)
    }

    return session.access_token
  } catch (error) {
    console.error('Error in getValidAccessToken:', error)
    return null
  }
}

export const signUp = async (email: string, password: string, fullName: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  // If sign up was successful and user was created, ensure user profile exists
  if (data?.user && !error) {
    await ensureUserProfile(data.user.id, email)
  }

  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  // If sign in was successful, ensure user profile exists (in case of legacy users)
  if (data?.user && !error) {
    await ensureUserProfile(data.user.id, email)
  }

  return { data, error }
}

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/`
    }
  })

  // Note: For OAuth, we can't check user immediately here because the user
  // will be redirected. The profile creation should be handled in the
  // redirect callback or when the user session is established.
  // You might want to add a useEffect in your app to handle this.

  return { data, error }
}

// Public helper function to ensure user profile exists
// This can be called from components, especially after OAuth or when checking current user
export const ensureCurrentUserProfile = async () => {
  const { user, error: userError } = await getCurrentUser()

  if (userError || !user) {
    return { error: userError || new Error('No user found') }
  }

  return await ensureUserProfile(user.id, user?.email || '')
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

// Utility functions for RSS and site info extraction
export const detectRSSFeed = async (url: string) => {
  try {
    // const response = await fetch(url, { method: 'HEAD' })
    // const contentType = response.headers.get('content-type') || ''

    // Check if the content type indicates RSS/XML
    return url.includes('rss') || url.includes('feed') || url.includes('.xml')
  } catch (error) {
    console.error('Error detecting RSS feed:', error)
    return false
  }
}

export const extractSiteInfo = async (url: string) => {
  try {
    // This is a simplified implementation
    // In a real application, you might want to use a service or API
    // to extract metadata from the URL

    const urlObj = new URL(url)
    const domain = urlObj.hostname.replace('www.', '')

    // Basic title extraction from domain
    const title = domain.split('.')[0]
      .split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')

    return {
      title: title,
      description: `News from ${domain}`,
      category: 'General'
    }
  } catch (error) {
    console.error('Error extracting site info:', error)
    return {
      title: '',
      description: '',
      category: 'General'
    }
  }
}
