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

export const getUserSubscriptions = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_subscription')
    .select(`
      user_id,
      news_source_id,
      status,
      news_source!inner (
        title,
        description,
        language,
        category,
        link,
        rss,
        tags,
        user_id,
        is_public,
        subscribers_num,
        status,
        latest_crawled_num,
        latest_crawled_at
      )
    `)
    .eq('user_id', userId)
    .eq('status', 'Subscribed')

  return { data, error }
}

// Alternative approach if the join doesn't work properly
export const getUserSubscriptionsAlternative = async (userId: string) => {
  // First get the user subscriptions
  const { data: subscriptions, error: subscriptionsError } = await supabase
    .from('user_subscription')
    .select('user_id, news_source_id, status')
    .eq('user_id', userId)
    .eq('status', 'Subscribed')

  if (subscriptionsError) {
    return { data: null, error: subscriptionsError }
  }

  if (!subscriptions || subscriptions.length === 0) {
    return { data: [], error: null }
  }

  // Get the news source IDs
  const newsSourceIds = subscriptions.map(sub => sub.news_source_id)

  // Fetch the news sources
  const { data: newsSources, error: newsSourcesError } = await supabase
    .from('news_source')
    .select('*')
    .in('id', newsSourceIds)

  if (newsSourcesError) {
    return { data: null, error: newsSourcesError }
  }

  // Combine the data
  const combinedData = subscriptions.map(sub => {
    const newsSource = newsSources?.find(ns => ns.id === sub.news_source_id)
    return {
      ...sub,
      news_source: newsSource
    }
  }).filter(item => item.news_source) // Only include items with valid news sources

  return { data: combinedData, error: null }
}

export const toggleSubscriptionStatus = async (userId: string, newsSourceId: string, status: 'Subscribed' | 'Unsubscribed') => {
  try {
    // Check current subscription status
    const { data: currentSubscription } = await supabase
      .from('user_subscription')
      .select('status')
      .eq('user_id', userId)
      .eq('news_source_id', newsSourceId)
      .single()

    // Update subscription status
    const { data, error: subscriptionError } = await supabase
      .from('user_subscription')
      .upsert({
        user_id: userId,
        news_source_id: newsSourceId,
        status: status
      })

    if (subscriptionError) {
      return { data, error: subscriptionError }
    }

    // Update subscribers_num based on status change
    const previousStatus = currentSubscription?.status
    let subscriberChange = 0

    // Determine subscriber count change
    if (previousStatus !== status) {
      if (status === 'Subscribed' && previousStatus !== 'Subscribed') {
        subscriberChange = 1 // New subscription or reactivating
      } else if (status === 'Unsubscribed' && previousStatus === 'Subscribed') {
        subscriberChange = -1 // Unsubscribing
      }
    }

    // Update subscribers_num if there's a change
    if (subscriberChange !== 0) {
      const { data: newsSource, error: fetchError } = await supabase
        .from('news_source')
        .select('subscribers_num')
        .eq('id', newsSourceId)
        .single()

      if (fetchError) {
        return { data, error: fetchError }
      }

      const { error: updateError } = await supabase
        .from('news_source')
        .update({
          subscribers_num: Math.max(0, newsSource.subscribers_num + subscriberChange)
        })
        .eq('id', newsSourceId)

      if (updateError) {
        return { data, error: updateError }
      }
    }

    return { data, error: null }
  } catch (err) {
    return { data: null, error: err }
  }
}

export const addUserSubscription = async (userId: string, newsSourceId: string) => {
  const { data, error } = await supabase
    .from('user_subscription')
    .insert({
      user_id: userId,
      news_source_id: newsSourceId,
      status: 'Activated'
    })

  return { data, error }
}

export const removeUserSubscription = async (userId: string, newsSourceId: string) => {
  try {
    // Update user subscription status
    const { data, error: subscriptionError } = await supabase
      .from('user_subscription')
      .update({ status: 'Unsubscribed' })
      .eq('user_id', userId)
      .eq('news_source_id', newsSourceId)

    if (subscriptionError) {
      return { data: null, error: subscriptionError }
    }

    // Decrement subscribers_num in news_source table
    const { error: updateError } = await supabase
      .rpc('decrement_subscribers', { news_source_id: newsSourceId })

    if (updateError) {
      // If the RPC function doesn't exist, fall back to manual update
      const { data: newsSource, error: fetchError } = await supabase
        .from('news_source')
        .select('subscribers_num')
        .eq('id', newsSourceId)
        .single()

      if (fetchError) {
        return { data, error: fetchError }
      }

      const { error: manualUpdateError } = await supabase
        .from('news_source')
        .update({ subscribers_num: Math.max(0, newsSource.subscribers_num - 1) })
        .eq('id', newsSourceId)

      if (manualUpdateError) {
        return { data, error: manualUpdateError }
      }
    }

    return { data, error: null }
  } catch (err) {
    return { data: null, error: err }
  }
}

// News Source Management Functions

export const getUserManagedNewsSources = async (userId: string) => {
  const { data, error } = await supabase
    .from('news_source')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return { data, error }
}

export const createNewsSource = async (userId: string, newsSourceData: {
  title: string
  description?: string
  language: string
  category: string
  link: string
  rss?: string
  tags?: string
  is_public?: boolean
}) => {
  const { data, error } = await supabase
    .from('news_source')
    .insert({
      title: newsSourceData.title,
      description: newsSourceData.description || '',
      language: newsSourceData.language || 'English',
      category: newsSourceData.category || 'General',
      link: newsSourceData.link || '',
      rss: newsSourceData.rss || '',
      tags: newsSourceData.tags || [''],
      user_id: userId,
      is_public: newsSourceData.is_public || true,
      subscribers_num: 1,
      status: 'Activated'
    })
    .select()
    .single()

  return { data, error }
}

export const updateNewsSource = async (newsSourceId: string, userId: string, updates: {
  title?: string
  description?: string
  language?: string
  category?: string
  link?: string
  rss?: string
  tags?: string
  is_public?: boolean
  status?: string
}) => {
  const { data, error } = await supabase
    .from('news_source')
    .update(updates)
    .eq('id', newsSourceId)
    .eq('user_id', userId) // Ensure user can only update their own sources
    .select()
    .single()

  return { data, error }
}

export const deleteNewsSource = async (newsSourceId: string, userId: string) => {
  // First delete related subscriptions
  const { error: subscriptionError } = await supabase
    .from('user_subscription')
    .delete()
    .eq('news_source_id', newsSourceId)

  if (subscriptionError) {
    return { data: null, error: subscriptionError }
  }

  // Then delete the news source
  const { data, error } = await supabase
    .from('news_source')
    .delete()
    .eq('id', newsSourceId)
    .eq('user_id', userId) // Ensure user can only delete their own sources

  return { data, error }
}

// Helper function to detect if URL is RSS feed
export const detectRSSFeed = async (url: string) => {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    const contentType = response.headers.get('content-type') || ''

    return contentType.includes('xml') ||
           contentType.includes('rss') ||
           url.includes('/feed') ||
           url.includes('/rss') ||
           url.endsWith('.xml')
  } catch {
    return false
  }
}

// Helper function to extract site info from URL
export const extractSiteInfo = async (url: string) => {
  try {
    const response = await fetch(`/api/extract-site-info?url=${encodeURIComponent(url)}`)
    if (response.ok) {
      return await response.json()
    }
  } catch {
    // Fallback to basic URL parsing
  }

  // Fallback: extract basic info from URL
  const urlObj = new URL(url)
  const domain = urlObj.hostname.replace('www.', '')
  const title = domain.split('.')[0]

  return {
    title: title.charAt(0).toUpperCase() + title.slice(1),
    description: `News from ${domain}`,
    category: 'General'
  }
}

// User Profile Preference Functions

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profile')
    .select('user_id, email, enable_email_delivery, brief_language, join_date, pricing_plan')
    .eq('user_id', userId)
    .single()

  return { data, error }
}

export const updateUserProfile = async (userId: string, updates: {
  enable_email_delivery?: boolean
  brief_language?: string
}) => {
  const { data, error } = await supabase
    .from('user_profile')
    .update(updates)
    .eq('user_id', userId)
    .select('enable_email_delivery, brief_language')
    .single()

  return { data, error }
}

// Get user's current subscription count
export const getUserSubscriptionCount = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_subscription')
    .select('news_source_id')
    .eq('user_id', userId)
    .eq('status', 'Subscribed')

  if (error) {
    return { count: 0, error }
  }

  return { count: data?.length || 0, error: null }
}

// Check subscription limits based on pricing plan
export const checkSubscriptionLimit = async (userId: string) => {
  try {
    // Get user's pricing plan
    const { data: userProfile, error: profileError } = await getUserProfile(userId)
    if (profileError || !userProfile) {
      return { canSubscribe: false, error: profileError || new Error('User profile not found') }
    }

    // Get current subscription count
    const { count: currentCount, error: countError } = await getUserSubscriptionCount(userId)
    if (countError) {
      return { canSubscribe: false, error: countError }
    }

    // Define subscription limits based on pricing plan
    const limits = {
      'Free': 3,
      'Pro': 30,
      'Max': 30
    }

    const limit = limits[userProfile.pricing_plan as keyof typeof limits] || 0
    const canSubscribe = currentCount < limit

    return {
      canSubscribe,
      currentCount,
      limit,
      pricingPlan: userProfile.pricing_plan,
      error: null
    }
  } catch (err) {
    return { canSubscribe: false, error: err }
  }
}
