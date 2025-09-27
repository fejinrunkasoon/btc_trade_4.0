<template>
  <div class="account-management-container">
    <!-- Header -->
    <v-app-bar color="primary" dark elevation="0" class="account-header">
      <v-btn icon @click="goBack">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title class="text-h6 font-weight-bold">
        多账户管理
        <v-chip v-if="isSuperAdmin" color="error" size="small" class="ml-2">
          超级管理员
        </v-chip>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="handleLogout">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>
    <GlobalNotifications />
    <!-- Access Denied Message -->
    <v-main v-if="accessDenied" class="main-content d-flex align-center justify-center">
      <v-container class="text-center">
        <v-icon size="120" color="error" class="mb-4">mdi-shield-alert</v-icon>
        <h2 class="text-h4 font-weight-bold mb-4">访问被拒绝</h2>
        <p class="text-h6 text-medium-emphasis mb-6">
          您没有权限访问账户管理功能
        </p>
        <v-alert color="warning" variant="tonal" class="mb-6">
          <div class="text-body-1">
            <strong>权限说明：</strong><br>
            • 此功能仅限管理员使用<br>
            • 如需访问权限，请联系管理员
          </div>
        </v-alert>
        <v-btn color="primary" size="large" @click="goBack">
          <v-icon class="mr-2">mdi-arrow-left</v-icon>
          返回控制台
        </v-btn>
      </v-container>
    </v-main>

    <!-- Main Content -->
    <v-main v-if="!accessDenied && isAdmin" class="main-content">
      <v-container fluid class="pa-4">
        <!-- Header Actions -->
        <div class="d-flex align-center justify-space-between mb-4">
          <div>
            <h2 class="text-h5 font-weight-bold mb-1">用户管理</h2>
            <p class="text-body-2 text--secondary">管理系统用户账户</p>
          </div>
          <v-btn
            color="primary"
            size="large"
            prepend-icon="mdi-plus"
            @click="addNewUser"
          >
            创建用户
          </v-btn>
        </div>

        <!-- User Stats -->
<!--        <v-row class="mb-4">-->
<!--          <v-col cols="12" md="4">-->
<!--            <v-card elevation="2">-->
<!--              <v-card-text class="text-center pa-4">-->
<!--                <div class="text-h4 font-weight-bold text-primary">{{ users.length }}</div>-->
<!--                <div class="text-caption text-medium-emphasis">总用户数</div>-->
<!--              </v-card-text>-->
<!--            </v-card>-->
<!--          </v-col>-->
<!--          <v-col cols="12" md="4">-->
<!--            <v-card elevation="2">-->
<!--              <v-card-text class="text-center pa-4">-->
<!--                <div class="text-h4 font-weight-bold text-success">{{ confirmedUsersCount }}</div>-->
<!--                <div class="text-caption text-medium-emphasis">已确认用户</div>-->
<!--              </v-card-text>-->
<!--            </v-card>-->
<!--          </v-col>-->
<!--        </v-row>-->

        <!-- Empty State -->
        <div v-if="users.length === 0 && !loading" class="text-center py-12">
          <v-icon size="96" color="grey-lighten-1" class="mb-4">mdi-account-multiple-outline</v-icon>
          <h3 class="text-h6 mb-2">暂无用户</h3>
          <p class="text-body-2 text--secondary mb-4">创建系统的第一个用户</p>
          <v-btn
            color="primary"
            size="large"
            prepend-icon="mdi-plus"
            @click="addNewUser"
          >
            创建用户
          </v-btn>
        </div>

        <!-- User Cards -->
        <v-row v-else>
          <v-col
            v-for="user in users"
            :key="user.id"
            cols="12"
            lg="6"
          >
            <v-card
              class="user-card"
              elevation="2"
              :class="{ 'user-card--confirmed': user.email_confirmed_at }"
            >
              <!-- Card Header -->
              <v-card-title class="pa-4 d-flex align-center justify-space-between">
                <div class="d-flex align-center">
                  <v-avatar :color="user.email_confirmed_at ? 'success' : 'grey'" class="mr-3">
                    <v-icon color="white">mdi-account</v-icon>
                  </v-avatar>
                  <div>
                    <div class="text-subtitle-1 font-weight-bold">{{ user.email.split('@')[0] }}</div>
                    <div class="text-body-2 text-medium-emphasis">
                      创建时间：{{ formatDate(user.created_at) }}
                    </div>
                    <div class="text-body-2 text-medium-emphasis" v-if="user.updated_at !== user.created_at">
                      更新时间：{{ formatDate(user.updated_at) }}
                    </div>
                  </div>
                </div>
                <v-menu>
                  <template v-slot:activator="{ props }">
                    <v-btn icon size="small" v-bind="props">
                      <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                  </template>
                  <v-list>
                    <v-list-item @click="editUser(user)">
                      <v-list-item-title>编辑用户</v-list-item-title>
                    </v-list-item>
                    <v-list-item v-if="user.id !== ADMIN_UID" @click="deleteUser(user)" class="text-error">
                      <v-list-item-title>删除用户</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </v-card-title>

              <v-divider></v-divider>

              <!-- Card Content -->
              <v-card-text class="pa-4">
<!--                <v-card-subtitle class="pb-2">-->
<!--                  <div class="d-flex align-center gap-2">-->
<!--&lt;!&ndash;                    <v-chip&ndash;&gt;-->
<!--&lt;!&ndash;                      size="small"&ndash;&gt;-->
<!--&lt;!&ndash;                      :color="user.is_active ? 'success' : 'warning'"&ndash;&gt;-->
<!--&lt;!&ndash;                      variant="flat"&ndash;&gt;-->
<!--&lt;!&ndash;                    >&ndash;&gt;-->
<!--&lt;!&ndash;                      {{ user.is_active ? '激活' : '禁用' }}&ndash;&gt;-->
<!--&lt;!&ndash;                    </v-chip>&ndash;&gt;-->
<!--                    <v-chip-->
<!--                      size="small"-->
<!--                      :color="user.role === 'admin' ? 'primary' : 'default'"-->
<!--                      variant="flat"-->
<!--                    >-->
<!--                      {{ user.role === 'admin' ? '管理员' : '普通用户' }}-->
<!--                    </v-chip>-->
<!--                  </div>-->
<!--                </v-card-subtitle>-->
                <div class="user-info mb-4">
                  <!-- Status -->
<!--                  <div class="d-flex align-center justify-space-between mb-3">-->
<!--                    <span class="text-body-2 text&#45;&#45;secondary">确认状态</span>-->
<!--                    <v-chip-->
<!--                      :color="user.email_confirmed_at ? 'success' : 'warning'"-->
<!--                      size="small"-->
<!--                    >-->
<!--                      {{ user.email_confirmed_at ? '已确认' : '未确认' }}-->
<!--                    </v-chip>-->
<!--                  </div>-->

                  <!-- Last Sign In -->
                  <div class="d-flex align-center justify-space-between mb-3">
                    <span class="text-body-2 text--secondary">最后登录</span>
                    <span class="text-body-2">
                      {{ user.last_sign_in_at ? formatDate(user.last_sign_in_at) : '从未登录' }}
                    </span>
                  </div>

                  <!-- Role -->
                  <!-- <div class="d-flex align-center justify-space-between mb-3">
                    <span class="text-body-2 text--secondary">用户角色</span>
                    <v-chip
                      :color="user.id === ADMIN_UID ? 'error' : 'primary'"
                      size="small"
                      variant="tonal"
                    >
                      {{ user.id === ADMIN_UID ? '管理员' : '普通用户' }}
                    </v-chip>
                  </div> -->
                </div>
              </v-card-text>

              <!-- Card Actions -->
              <v-card-actions class="pa-4 pt-0">
                <v-spacer></v-spacer>
                <v-btn
                  variant="outlined"
                  size="small"
                  prepend-icon="mdi-pencil"
                  @click="editUser(user)"
                >
                  编辑
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <!-- Loading Screen -->
    <v-main v-if="checkingAdmin" class="main-content d-flex align-center justify-center">
      <v-container class="text-center">
        <v-progress-circular size="60" indeterminate color="primary" class="mb-4"></v-progress-circular>
        <p class="text-h6 text-medium-emphasis">正在验证身份...</p>
      </v-container>
    </v-main>

    <!-- Account Dialog -->
    <v-dialog v-model="dialog" max-width="600px" persistent>
      <v-card>
        <v-card-title class="pa-4">
          <span class="text-h6">{{ editingUser.id ? '编辑用户' : '创建用户' }}</span>
        </v-card-title>

        <!-- <v-divider></v-divider> -->

        <v-card-text class="pa-4">
          <v-form ref="userForm" v-model="dialogValid">
            <v-text-field
              v-model="editingUser.username"
              label="用户名"
              variant="outlined"
              :rules="usernameRules"
              class="mb-3"
              prepend-inner-icon="mdi-account"
              placeholder="user"
              required
              :disabled="!!editingUser.id"
            ></v-text-field>

            <v-text-field
              v-model="editingUser.password"
              label="用户密码"
              variant="outlined"
              :rules="passwordRules"
              class="mb-3"
              prepend-inner-icon="mdi-lock-outline"
              :type="showPassword ? 'text' : 'password'"
              :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append-inner="showPassword = !showPassword"
              placeholder="••••••••"
              autocomplete="current-password"
              required
            ></v-text-field>

<!--            <v-checkbox-->
<!--              v-if="!editingUser.id"-->
<!--              v-model="editingUser.auto_confirm"-->
<!--              class="mb-3"-->
<!--            >-->
<!--              <template v-slot:label>-->
<!--                <div>-->
<!--                  <div class="text-body-2">自动确认用户？</div>-->
<!--                  <div class="text-caption text-medium-emphasis">-->
<!--                    创建用户时不会发送确认邮件-->
<!--                  </div>-->
<!--                </div>-->
<!--              </template>-->
<!--            </v-checkbox>-->
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="closeDialog">
            取消
          </v-btn>
          <v-btn
            color="primary"
            :loading="saving"
            @click="saveAccount"
          >
            保存
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirm Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="pa-4">
          <span class="text-h6">确认删除</span>
        </v-card-title>
        <v-card-text class="pa-4">
          确定要删除用户 "{{ deletingUser?.username }}" 吗？此操作不可撤销。
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="deleteDialog = false">取消</v-btn>
          <v-btn color="error" @click="confirmDelete">删除</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { supabase,supabase_admin } from '@/lib/supabase'
import { usePermissions } from '@/composables/usePermissions'
import { useNotification } from '@/composables/useNotification'
import GlobalNotifications from "@/components/GlobalNotifications.vue";
// 管理员UID常量 - 请替换为您的实际管理员UID
const ADMIN_UID = 'dd84eede-dbe2-4878-a037-7aeb299f14e6'

const router = useRouter()
const { isSuperAdmin, hasPermission, canAccessRoute, loading: permissionLoading } = usePermissions()
const { showInfo, showSuccess, showError, showWarning } = useNotification()

// State
const users = ref([])
const loading = ref(true)
const currentUser = ref(null)
const accessDenied = ref(false)
const isAdmin = ref(false)
const checkingAdmin = ref(true)

const dialog = ref(false)
const deleteDialog = ref(false)
const dialogValid = ref(false)
const saving = ref(false)
const deletingUser = ref(null)
const userForm = ref(null)
const showPassword = ref(false)

const editingUser = reactive({
  id: null,
  username: '',
  password: '',
  auto_confirm: false
})

// Computed properties
const confirmedUsersCount = computed(() => {
  return users.value.filter(user => user.email_confirmed_at).length
})


// Validation rules
const usernameRules = [
  v => !!v || '请输入用户名',
  v => (v && v.length >= 3) || '用户名至少3个字符',
  v => /^[a-zA-Z0-9._-]+$/.test(v) || '用户名只能包含字母、数字、点、下划线和连字符'
]

const passwordRules = [
  v => !!v || '请输入密码',
  v => (v && v.length >= 5) || '密码至少5个字符'
]

// Methods
// 检查是否为管理员
const checkAdminStatus = async () => {
  checkingAdmin.value = true
  try {



    // 检查用户UID是否为管理员UID
    isAdmin.value = localStorage.getItem('userid') === ADMIN_UID

    if (!isAdmin.value) {
      accessDenied.value = true
      // console.log('Access denied: User is not admin')
    }
  } catch (error) {
    // console.error('Admin check error:', error)
    accessDenied.value = true
  } finally {
    checkingAdmin.value = false
  }
}

const goBack = () => {
  router.push('/dashboard')
}

const handleLogout = async () => {
  try {
    const { error } = await supabase.auth.signOut()
   
    if (error) {
      console.error('Logout error:', error)
    }
    localStorage.removeItem('rememberMe')
    await router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
  }
}

const formatDate = (date) => {
  if (!date) return '未知'
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj)
}

// Load users from user_management table
const loadUsers = async () => {
  if (!isAdmin.value) {
    accessDenied.value = true
    loading.value = false
    return
  }

  loading.value = true
  try {
    const { data: usersData, error } = await supabase_admin.auth.admin.listUsers();

    
    // console.log('usersData:', usersData)
    if (usersData) {
      users.value = usersData.users
    }
    if (error) {
      console.error('Load users error:', error)
      // return
    }
  } catch (error) {
    console.error('Load users error:', error)
  } finally {
    loading.value = false
  }
}

const addNewUser = () => {
  Object.assign(editingUser, {
    id: null,
    username: '',
    password: '',
    auto_confirm: false
  })
  dialog.value = true
}

const editUser = (user) => {
  Object.assign(editingUser, {
    id: user.id,
    username: user.email.split('@')[0],
    password: '',
    auto_confirm: false
  })
  dialog.value = true
}


const deleteUser = (user) => {
  deletingUser.value = user
  deleteDialog.value = true
}

const confirmDelete = async () => {
  if (!deletingUser.value) return

  try {
    // 删除用户管理记录
    const { error } = await supabase_admin.auth.admin.deleteUser(deletingUser.value.id)
      // .from('user_management')
      // .delete()
      // .eq('id', deletingUser.value.id)


    if (error) {
      showError('Delete user error:', error)
      return
    }

    // Remove from local state
    const index = users.value.findIndex(u => u.id === deletingUser.value.id)
    if (index >= 0) {
      users.value.splice(index, 1)
    }

    showSuccess('删除用户成功')
  } catch (error) {
    console.error('Delete user error:', error)
  }

  deleteDialog.value = false
  deletingUser.value = null
}

const saveUser = async () => {
  if (!dialogValid.value) return

  saving.value = true

  // console.log("asss"+editingUser.id)
  try {
    if (editingUser.id) {
      // Update existing user
      const { data, error } = await supabase.auth.updateUser({
        // email: editingUser.username + '@openprimion.com',
        password: editingUser.password,
      });
      

      if (error) {
        showError(error)

        // show('Update user error:', error)
        return
      }

      // Update local state
      const index = users.value.findIndex(u => u.id === editingUser.id)
      if (index >= 0 && data[0]) {
        users.value[index] = data[0]
      }

     showSuccess('用户保存成功')
    } else {
      // Create new user in auth.users first
      const { data: authData, error: authError } = await supabase_admin.auth.admin.createUser({
        email: editingUser.username + '@openprimion.com',
        password: editingUser.password,
        email_confirm: true
      })
  
      if (authError) {
        console.error('Create auth user error:', authError)
        return
      }
     showSuccess('用户创建成功')
  
      await loadUsers()

    }

    closeDialog()
  } catch (error) {
    console.error('Save user error:', error)
  } finally {
    saving.value = false
  }
}

const saveAccount = saveUser

const closeDialog = () => {
  dialog.value = false
  showPassword.value = false
  Object.assign(editingUser, {
    id: null,
    username: '',
    password: '',
    auto_confirm: false
  })
}

// Remove API management function as it's no longer needed

// Check permissions and load data on mount
onMounted(async () => {
  // 首先检查管理员身份
  await checkAdminStatus()

  // 如果不是管理员，直接返回
  if (!isAdmin.value) {
    loading.value = false
    return
  }

  // 管理员身份验证通过后加载数据
  await loadUsers()
})
</script>

<style scoped>
.account-management-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.account-header {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%) !important;
}

.main-content {
  padding-top: 64px;
}

.account-card {
  border-radius: 16px !important;
  transition: all 0.2s ease;
}

.account-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
}

.account-card--active {
  border: 2px solid #4caf50;
}

.api-chips {
  max-height: 120px;
  overflow-y: auto;
}

/* Mobile optimizations */
@media (max-width: 600px) {
  .main-content {
    padding-top: 56px;
  }
}

/* Dark theme support */
.v-theme--dark .account-management-container {
  background-color: #0f172a;
}
</style>
