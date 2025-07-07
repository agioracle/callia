import { SupabaseClient } from '@supabase/supabase-js'

// 检查订阅限制的函数
export async function checkSubscriptionLimit(supabase: SupabaseClient, userId: string) {
  // 获取用户配置文件 - RLS 策略自动确保安全访问
  const { data: profile } = await supabase
    .from('user_profile')
    .select('pricing_plan')
    .eq('user_id', userId)
    .single()

  const pricingPlan = profile?.pricing_plan || 'Free'

  // 定义订阅限制
  const limits: { [key: string]: number } = {
    'Free': 5,
    'Pro': 30,
    'Max': 50
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
