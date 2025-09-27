import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

// 简化的用户信息接口
export interface UserInfo {
  id: string
  email: string
  isSuperAdmin: boolean
}

export function usePermissions() {
  const userInfo = ref<UserInfo | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)
  
  // 管理员用户ID - 与account-management.vue中的ADMIN_UID保持一致
  const SUPER_ADMIN_ID = 'dd84eede-dbe2-4878-a037-7aeb299f14e6'

  // Computed properties for permission checking
  const isSuperAdmin = computed(() => {
    return userInfo.value?.isSuperAdmin === true
  })

  const isUser = computed(() => {
    return !isSuperAdmin.value
  })

  const currentRole = computed(() => {
    return isSuperAdmin.value ? 'super_admin' : 'user'
  })

  // Load user info and check permissions
  const loadUserInfo = async () => {
    loading.value = true
    error.value = null

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        throw new Error('用户未登录')
      }

      // 检查用户是否为超级管理员
      const isSuper = user.id === SUPER_ADMIN_ID

      userInfo.value = {
        id: user.id,
        email: user.email || 'Unknown User',
        isSuperAdmin: isSuper
      }
    } catch (err: any) {
      error.value = err.message || '加载用户信息失败'
      console.error('Load user info error:', err)
    } finally {
      loading.value = false
    }
  }

  // Check if user has specific permission
  const hasPermission = (permission: string): boolean => {
    switch (permission) {
      case 'account_management':
        return isSuperAdmin.value // 只有超级管理员可以管理多账户
      
      case 'user_management':
        return isSuperAdmin.value // 只有超级管理员可以管理用户
      
      case 'system_settings':
        return isSuperAdmin.value // 只有超级管理员可以管理系统设置
      
      case 'api_management':
        return true // 所有认证用户都可以管理自己的API
      
      case 'trading_strategies':
        return true // 所有认证用户都可以管理自己的策略
      
      default:
        return false
    }
  }

  // Check if user can access a specific route
  const canAccessRoute = (routeName: string): boolean => {
    switch (routeName) {
      case 'account-management':
        return hasPermission('account_management')
      
      case 'user-management':
        return hasPermission('user_management')
      
      case 'system-settings':
        return hasPermission('system_settings')
      
      default:
        return true // Default allow access for other routes
    }
  }

  // 获取超级管理员ID（仅供超级管理员使用）
  const getSuperAdminId = (): string | null => {
    if (!isSuperAdmin.value) {
      return null
    }
    return SUPER_ADMIN_ID
  }

  // 更新超级管理员ID（仅供超级管理员使用，需要重新部署数据库函数）
  const updateSuperAdminId = async (newSuperAdminId: string) => {
    if (!isSuperAdmin.value) {
      throw new Error('权限不足：只有超级管理员可以执行此操作')
    }

    // 注意：这需要更新数据库中的 get_super_admin_id() 函数
    // 这里只是一个接口，实际实现需要数据库管理员操作
    throw new Error('更新超级管理员ID需要数据库管理员操作')
  }

  // Get all users (super admin only)
  const getAllUsers = async () => {
    if (!isSuperAdmin.value) {
      throw new Error('权限不足：只有超级管理员可以查看用户列表')
    }

    try {
      const { data, error } = await supabase
        .from('super_admin_user_overview')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      return data
    } catch (err: any) {
      throw new Error(err.message || '获取用户列表失败')
    }
  }

  // Initialize on mount
  onMounted(() => {
    loadUserInfo()
  })

  return {
    // State
    userInfo,
    loading,
    error,
    
    // Computed
    isSuperAdmin,
    isUser,
    currentRole,
    
    // Methods
    loadUserInfo,
    hasPermission,
    canAccessRoute,
    getSuperAdminId,
    updateSuperAdminId,
    getAllUsers
  }
}
