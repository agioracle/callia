import { supabase } from './supabase'

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

  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  return { data, error }
}

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/`
    }
  })

  return { data, error }
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
  const { data, error } = await supabase
    .from('user_subscription')
    .upsert({
      user_id: userId,
      news_source_id: newsSourceId,
      status: status
    })

  return { data, error }
}

export const addUserSubscription = async (userId: string, newsSourceId: string) => {
  const { data, error } = await supabase
    .from('user_subscription')
    .insert({
      user_id: userId,
      news_source_id: newsSourceId,
      status: 'active'
    })

  return { data, error }
}

export const removeUserSubscription = async (userId: string, newsSourceId: string) => {
  const { data, error } = await supabase
    .from('user_subscription')
    .update({ status: 'inactive' })
    .eq('user_id', userId)
    .eq('news_source_id', newsSourceId)

  return { data, error }
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
