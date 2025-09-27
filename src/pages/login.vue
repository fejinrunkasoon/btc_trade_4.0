<template>
  <v-container fluid class="fill-height login-container">
    <v-row justify="center" align="center" class="fill-height">
      <v-col cols="12" sm="8" md="6" lg="4" xl="3">
        <v-card
          class="login-card elevation-12"
          rounded="lg"
        >
          <!-- Logo/Brand Section -->
          <v-card-text class="text-center pt-8 pb-4">
            <div class="brand-section">
              <v-icon
                size="48"
                color="primary"
                class="mb-4"
              >
                mdi-bitcoin
              </v-icon>
              <h1 class="text-h4 font-weight-bold primary--text mb-2">
                BTC Trade
              </h1>
              <p class="text-subtitle-1 text--secondary">
                欢迎回来，请登录您的账户
              </p>
            </div>
          </v-card-text>

          <!-- Login Form -->
          <v-card-text class="px-6 pb-8">
            <!-- Error/Success Messages -->
            <v-alert
              v-if="errorMessage"
              type="error"
              variant="tonal"
              class="mb-4"
              closable
              @click:close="errorMessage = ''"
            >
              {{ errorMessage }}
            </v-alert>

            <v-alert
              v-if="successMessage"
              type="success"
              variant="tonal"
              class="mb-4"
              closable
              @click:close="successMessage = ''"
            >
              {{ successMessage }}
            </v-alert>

            <v-form
              ref="loginForm"
              v-model="valid"
              @submit.prevent="handleLogin"
            >
              <!-- Username Field -->
              <v-text-field
                v-model="username"
                label="用户名"
                prepend-inner-icon="mdi-account-outline"
                variant="outlined"
                :rules="usernameRules"
                class="mb-3"
                density="comfortable"
                color="primary"
                hint="将自动添加 @openprimion.com 后缀"
                persistent-hint
              />

              <!-- Password Field -->
              <v-text-field
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                label="密码"
                prepend-inner-icon="mdi-lock-outline"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                variant="outlined"
                :rules="passwordRules"
                class="mb-4"
                density="comfortable"
                color="primary"
                @click:append-inner="showPassword = !showPassword"
              />

              <!-- Remember Me & Forgot Password -->
<!--              <div class="d-flex justify-space-between align-center mb-6">-->
<!--                <v-checkbox-->
<!--                  v-model="rememberMe"-->
<!--                  label="记住我"-->
<!--                  density="compact"-->
<!--                  color="primary"-->
<!--                  hide-details-->
<!--                />-->
<!--                <v-btn-->
<!--                  variant="text"-->
<!--                  color="primary"-->
<!--                  size="small"-->
<!--                  @click="handleForgotPassword"-->
<!--                >-->
<!--                  忘记密码？-->
<!--                </v-btn>-->
<!--              </div>-->

              <!-- Login Button -->
              <v-btn
                type="submit"
                block
                size="large"
                color="primary"
                :loading="loading"
                :disabled="!valid"
                class="mb-4"
                rounded="lg"
              >
                登录
              </v-btn>



<!--              &lt;!&ndash; Register Link &ndash;&gt;-->
<!--              <div class="text-center">-->
<!--                <span class="text-body-2 text&#45;&#45;secondary">还没有账户？</span>-->
<!--                <v-btn-->
<!--                  variant="text"-->
<!--                  color="primary"-->
<!--                  size="small"-->
<!--                  @click="handleRegister"-->
<!--                >-->
<!--                  立即注册-->
<!--                </v-btn>-->
<!--              </div>-->
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Footer -->
    <div class="login-footer">
      <v-container>
        <div class="text-center text-caption text--secondary">
          <p class="mb-2"> 2024 BTC Trade. All rights reserved.</p>
          <div>
            <v-btn variant="text" size="x-small" color="grey">隐私政策</v-btn>
            <span class="mx-2">·</span>
            <v-btn variant="text" size="x-small" color="grey">服务条款</v-btn>
            <span class="mx-2">·</span>
            <v-btn variant="text" size="x-small" color="grey">帮助中心</v-btn>
          </div>
        </div>
      </v-container>
    </div>

    <!-- Loading Overlay -->
    <v-overlay
      v-model="loading"
      class="align-center justify-center"
    >
      <v-progress-circular
        color="primary"
        indeterminate
        size="64"
      />
    </v-overlay>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'

// Router
const router = useRouter()

// Form refs
const loginForm = ref(null)

// Reactive data
const valid = ref(false)
const loading = ref(false)
const showPassword = ref(false)
const rememberMe = ref(true)
const username = ref('')
const password = ref('')
const errorMessage = ref('')
const successMessage = ref('')

// Validation rules
const usernameRules = [
  v => !!v || '用户名不能为空',
  v => (v && v.length >= 3) || '用户名至少需要3个字符',
  v => (v && v.length <= 20) || '用户名不能超过20个字符',
  v => /^[a-zA-Z0-9_-]+$/.test(v) || '用户名只能包含字母、数字、下划线和连字符'
]

const passwordRules = [
  v => !!v || '密码不能为空',
  v => (v && v.length >= 5) || '密码至少需要5个字符'
]

// Clear messages
const clearMessages = () => {
  errorMessage.value = ''
  successMessage.value = ''
}

// Handle login
const handleLogin = async () => {
  clearMessages()

  if (!loginForm.value || !valid.value) {
    return
  }

  loading.value = true

  try {
    // Create full email with domain suffix
    const email = `${username.value}@openprimion.com`

    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password.value
    })


    // console.log('🔍 [DEBUG] user data:', data)
    if (error) {
      throw error
    }

    if (data?.user) {
      successMessage.value = '登录成功！正在跳转...'

      // Store remember me preference
      if (rememberMe.value) {
        localStorage.setItem('rememberMe', 'true')
        localStorage.setItem('userid', data.user.id)
        localStorage.setItem('lastUsername', username.value)
      } else {
        localStorage.removeItem('rememberMe')
        localStorage.removeItem('lastUsername')
      }

      // Navigate to dashboard after short delay
      router.push('/dashboard')
    }

  } catch (error) {
    console.error('Login error:', error)

    // Handle specific error types
    if (error.message?.includes('Invalid login credentials')) {
      errorMessage.value = '用户名或密码错误，请重试'
    } else if (error.message?.includes('Email not confirmed')) {
      errorMessage.value = '请先验证您的邮箱地址'
    } else if (error.message?.includes('Too many requests')) {
      errorMessage.value = '登录尝试次数过多，请稍后再试'
    } else {
      errorMessage.value = error.message || '登录失败，请稍后重试'
    }
  } finally {
    loading.value = false
  }
}

// Handle forgot password
const handleForgotPassword = async () => {
  if (!username.value) {
    errorMessage.value = '请先输入用户名'
    return
  }

  clearMessages()
  loading.value = true

  try {
    const email = `${username.value}@openprimion.com`

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    
    if (error) throw error

    successMessage.value = '重置密码邮件已发送，请检查您的邮箱'
  } catch (error) {
    console.error('Reset password error:', error)
    errorMessage.value = error.message || '发送重置密码邮件失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

// Handle register navigation
const handleRegister = () => {
  router.push('/register')
}

// Load remembered username
const loadRememberedData = () => {
  const remembered = localStorage.getItem('rememberMe')
  const lastUsername = localStorage.getItem('lastUsername')

  if (remembered === 'true' && lastUsername) {
    username.value = lastUsername
    rememberMe.value = true
  }
}

// Lifecycle hooks
onMounted(() => {
  loadRememberedData()
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
}

.login-card {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.brand-section {
  padding: 0 16px;
}

.social-buttons .v-btn {
  text-transform: none;
  font-weight: 500;
}

.login-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 0;
}

/* Mobile-first responsive adjustments */
@media (max-width: 600px) {
  .login-container {
    padding: 16px;
  }

  .login-card {
    margin-top: 0;
  }

  .brand-section {
    padding: 0 8px;
  }

  .login-footer {
    position: static;
    margin-top: 24px;
  }
}

/* Dark mode support */
.v-theme--dark .login-card {
  background: rgba(18, 18, 18, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.v-theme--dark .login-container {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}
</style>
