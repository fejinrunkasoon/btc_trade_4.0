/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router'
// import { setupLayouts } from 'virtual:generated-layouts' // 暂时注释掉
// import { routes } from 'vue-router/auto-routes' // 暂时注释掉
import { supabase } from '../lib/supabase'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/login',
      component: () => import('../pages/login.vue')
    },
    {
      path: '/dashboard',
      component: () => import('../pages/dashboard.vue')
    },
    {
      path: '/api-management',
      component: () => import('../pages/api-management.vue')
    },
    {
      path: '/account-management',
      component: () => import('../pages/account-management.vue')
    },
    {
      path: '/trading-history',
      component: () => import('../pages/trading-history.vue')
    },
    {
      path: '/strategy/new',
      component: () => import('../pages/strategy/new.vue')
    }
  ],
})

// Authentication guard
router.beforeEach(async (to, from) => {
  console.log(`路由导航: ${from.path} -> ${to.path}`)

  try {
    // 获取当前用户登录状态
    const { data: { user }, error } = await supabase.auth.getUser()



    if (error) {
      console.log('认证状态检查错误:', error)
    }

    const isAuthenticated = !!user
    // console.log(`用户登录状态: ${isAuthenticated ? '已登录' : '未登录'}`)

    // 如果用户已登录
    if (isAuthenticated) {
      // 如果访问登录页，重定向到 supabase-test
      if (to.path === '/login') {
        // console.log('已登录用户访问登录页，重定向到 supabase-test')
        return '/dashboard'
        // return '/supabase-test'
      }
      // 如果访问根路径，重定向到 supabase-test
      if (to.path === '/') {
        // console.log('已登录用户访问根路径，重定向到 supabase-test')
        return '/dashboard'
        // return '/supabase-test'
      }
      // 其他路径正常访问
      return true
    }

    // 如果用户未登录
    else {
      // 如果访问登录页，允许访问
      if (to.path === '/login') {
        console.log('未登录用户访问登录页，允许访问')
        return true
      }
      // 其他所有路径都重定向到登录页
      console.log('未登录用户访问受保护页面，重定向到登录页')
      return '/login'
    }

  } catch (error) {
    console.error('路由守卫执行错误:', error)
    // 出错时默认重定向到登录页
    return '/login'
  }
})

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (localStorage.getItem('vuetify:dynamic-reload')) {
      console.error('Dynamic import error, reloading page did not fix it', err)
    } else {
      console.log('Reloading page to fix dynamic import error')
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    }
  } else {
    console.error(err)
  }
})

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})

export default router
