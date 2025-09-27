import { supabase } from '@/lib/supabase'

// Account management functions

export  async  function  getApiConfigs(userId:string) {
  try {
    // 获取当前用户的session token
    // const authToken = session?.access_token

    // console.log('前端获取API配置 - token存在:', !!authToken)

    // 直接使用Supabase查询api_configs表
    const { data, error } =  await supabase
      .from('api_configs')
      .select('*')
      .eq('user_id', userId)
      // .eq('is_active', true)
      .order('created_at', { ascending: false })

    

    if (error) {
      console.error('Supabase查询错误:', error)
      return { data: null, error }
    }

    console.log('成功获取API配置:', data?.length, '条记录')
    return { data, error: null }

  } catch (error) {
    console.error('获取API配置失败:', error)
    return { data: null, error }
  }
}


export async function deleteTradingStrategy(id:string, api_config_id:string) {
  const { data, error } = await supabase
    .from('trading_strategies')
    .delete()
    .eq('id', id)
    .eq('api_config_id', api_config_id)
  
  await fetch(`https://jp.sdk250.cn:8443/db_updated`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      uid: api_config_id
    })
  })
    return { data, error }
}

export async function createTradingStrategy(strategy:any) {
  const { data, error } = await supabase
    .from('trading_strategies')
    .insert([strategy])
    .select()

    await fetch(`https://jp.sdk250.cn:8443/db_updated`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uid: strategy.api_config_id
      })
    })
    return { data, error }
}

export async function updateTradingStrategy(id:string, updates:any) {
  const { data, error } = await supabase
    .from('trading_strategies')
    .update(updates)
    .eq('id', id)
    .eq('api_config_id', updates.api_config_id)
    .select()

  await fetch(`https://jp.sdk250.cn:8443/db_updated`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      uid: updates.api_config_id
    })
  })
    return { data, error }
}


export  async function  getTradingStrategies(strategyId:string){
  const { data, error } = await supabase
    .from('trading_strategies')
    .select('*')
    .eq('id', strategyId)
    .single()

  return { data, error }
}

// API Config management functions
export async function createApiConfig(apiConfig: any) {
  const { data, error } = await supabase
    .from('api_configs')
    .insert([apiConfig])
    .select()

  if (data && data[0]) {
    await fetch(`https://jp.sdk250.cn:8443/db_updated`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uid: data[0].id
      })
    })
  }
  
  return { data, error }
}

export async function updateApiConfig(id: string, updates: any) {
  const { data, error } = await supabase
    .from('api_configs')
    .update(updates)
    .eq('id', id)
    .select()

  await fetch(`https://jp.sdk250.cn:8443/db_updated`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      uid: id
    })
  })

  return { data, error }
}

export async function deleteApiConfig(id: string) {
  const { data, error } = await supabase
    .from('api_configs')
    .delete()
    .eq('id', id)
    .select()

  await fetch(`https://jp.sdk250.cn:8443/db_updated`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      uid: id
    })
  })

  return { data, error }
}
