<template>
  <div class="api-management-container">
    <!-- Header -->
    <v-app-bar color="primary" dark elevation="0" class="api-header">
      <v-btn icon @click="goBack">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title class="text-h6 font-weight-bold">
        多API管理
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="handleLogout">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- Main Content -->
    <v-main class="main-content">
      <v-container fluid class="pa-4">
        <!-- Header Actions -->
        <div class="d-flex align-center justify-space-between mb-4">
          <div>
            <h2 class="text-h5 font-weight-bold mb-1">币安API配置</h2>
            <p class="text-body-2 text--secondary">管理您的币安API密钥</p>
          </div>
          <v-btn
            color="primary"
            size="large"
            prepend-icon="mdi-plus"

            @click="addNewApi"
          >
            添加API
          </v-btn>
        </div>

        <!-- API Count Info -->
        <v-alert
          color="info"
          variant="tonal"
          class="mb-4"
        >
          <div class="d-flex align-center">
            <v-icon class="mr-2">mdi-information</v-icon>
            <span>
              当前已配置 {{ apis.length }} 个API密钥
            </span>
          </div>
        </v-alert>

        <!-- Empty State -->
        <div v-if="apis.length === 0" class="text-center py-12">
          <v-icon size="96" color="grey-lighten-1" class="mb-4">mdi-api-off</v-icon>
          <h3 class="text-h6 mb-2">暂无API配置</h3>
          <p class="text-body-2 text--secondary mb-4">添加您的币安API密钥开始交易</p>
          <v-btn
            color="primary"
            size="large"
            prepend-icon="mdi-plus"
            @click="addNewApi"
          >
            添加第一个API
          </v-btn>
        </div>

        <!-- API Cards -->
        <v-row v-else>
          <v-col
            v-for="(api, index) in apis"
            :key="`api-${index}`"
            cols="12"
            md="6"
            lg="4"
          >
            <v-card
              class="api-card"
              elevation="2"
              :class="{ 'api-card--active': api.isActive }"
            >
              <!-- Card Header -->
              <v-card-title class="pa-4 d-flex align-center justify-space-between">
                <div class="d-flex align-center">
                  <v-icon class="mr-2" color="orange">mdi-api</v-icon>
                  <span class="text-subtitle-1">{{ api.name }}</span>
                </div>
                <v-menu>
                  <template v-slot:activator="{ props }">
                    <v-btn icon size="small" v-bind="props">
                      <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                  </template>
                  <v-list>
                    <v-list-item @click="editApi(index)">
                      <v-list-item-title>编辑</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="toggleApiStatus(index)">
                      <v-list-item-title>
                        {{ api.isActive ? '禁用' : '启用' }}
                      </v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="deleteApi(index)" class="text-error">
                      <v-list-item-title>删除</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </v-card-title>

              <v-divider></v-divider>

              <!-- Card Content -->
              <v-card-text class="pa-4">
                <div class="api-info">
                  <!-- Status -->
                  <div class="d-flex align-center justify-space-between mb-3">
                    <span class="text-body-2 text--secondary">状态</span>
                    <v-chip
                      :color="api.isActive ? 'success' : 'grey'"
                      size="small"
                    >
                      {{ api.isActive ? '启用' : '禁用' }}
                    </v-chip>
                  </div>

                  <!-- API Key -->
                  <div class="mb-3">
                    <div class="text-body-2 text--secondary mb-1">API Key</div>
                    <div class="api-key-display">
                      {{ maskApiKey(api.apiKey) }}
                    </div>
                  </div>

                  <!-- Network -->
                  <div class="mb-3">
                    <div class="text-body-2 text--secondary mb-1">网络</div>
                    <v-chip
                      :color="api.testnet ? 'warning' : 'primary'"
                      size="small"
                      variant="outlined"
                    >
                      {{ api.testnet ? '测试网' : '主网' }}
                    </v-chip>
                  </div>

                  <!-- Last Used -->
                  <div class="mb-3">
                    <div class="text-body-2 text--secondary mb-1">最后使用</div>
                    <div class="text-body-2">
                      {{ api.lastUsed || '从未使用' }}
                    </div>
                  </div>

                  <!-- Created Date -->
                  <div>
                    <div class="text-body-2 text--secondary mb-1">创建时间</div>
                    <div class="text-body-2">
                      {{ formatDate(api.createdAt) }}
                    </div>
                  </div>
                </div>
              </v-card-text>

              <!-- Card Actions -->
              <v-card-actions class="pa-4 pt-0">
                <v-btn
                  variant="outlined"
                  size="small"
                  prepend-icon="mdi-pencil"
                  @click="editApi(index)"
                >
                  编辑
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn
                  :color="api.isActive ? 'warning' : 'success'"
                  variant="text"
                  size="small"
                  @click="toggleApiStatus(index)"
                >
                  {{ api.isActive ? '禁用' : '启用' }}
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <!-- API Dialog -->
    <v-dialog
      v-model="dialog"
      max-width="600px"
      persistent
    >
      <v-card>
        <v-card-title class="pa-4">
          <span class="text-h6">{{ editingIndex >= 0 ? '编辑' : '添加' }}API配置</span>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="pa-4">
          <v-form ref="apiForm" v-model="dialogValid">
            <v-text-field
              v-model="editingApi.name"
              label="API名称"
              variant="outlined"
              :rules="nameRules"
              class="mb-3"
              required
            ></v-text-field>

            <v-text-field
              v-model="editingApi.apiKey"
              label="API Key"
              variant="outlined"
              :rules="apiKeyRules"
              class="mb-3"
              required
            ></v-text-field>

            <v-text-field
              v-model="editingApi.secretKey"
              label="Secret Key"
              variant="outlined"
              type="password"
              :rules="secretKeyRules"
              class="mb-3"
              required
            ></v-text-field>

            <v-switch
              v-model="editingApi.testnet"
              label="使用测试网络"
              color="primary"
              class="mb-3"
            ></v-switch>

            <v-switch
              v-model="editingApi.isActive"
              label="启用此API"
              color="primary"
            ></v-switch>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="closeDialog"
          >
            取消
          </v-btn>
          <v-btn
            color="primary"
            :loading="saving || isVerifying"
            :disabled="!dialogValid || isVerifying"
            @click="saveApi"
          >
            <span v-if="isVerifying">验证中...</span>
            <span v-else-if="saving">保存中...</span>
            <span v-else>保存</span>
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
          确定要删除API "{{ deletingApi?.name }}" 吗？此操作不可撤销。
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
import { ref, reactive, onMounted } from 'vue'
import {getApiConfigs,updateApiConfig,createApiConfig,deleteApiConfig} from '@/lib/util.js';
import router from "@/router/index.js";
import {supabase} from "@/lib/supabase.js";


import { usePermissions } from '@/composables/usePermissions'
import { useNotification } from '@/composables/useNotification'
const { showSuccess, showError } = useNotification()



// State
const apis = ref([])
const loading = ref(true)
const currentUser = ref(null)
const isVerifying = ref(false)
const verificationResult = ref(null)
const dialog = ref(false)
const deleteDialog = ref(false)
const dialogValid = ref(false)
const saving = ref(false)
const editingIndex = ref(-1)
const deletingIndex = ref(-1)
const deletingApi = ref(null)
const apiForm = ref(null)

const editingApi = reactive({
  name: '',
  apiKey: '',
  secretKey: '',
  testnet: false,
  isActive: true
})



// Validation rules
const nameRules = [
  v => !!v || '请输入API名称',
  v => (v && v.length >= 2) || 'API名称至少2个字符'
]

const apiKeyRules = [
  v => !!v || '请输入API Key',
  v => (v && v.length >= 10) || 'API Key格式不正确'
]

const secretKeyRules = [
  v => !!v || '请输入Secret Key',
  v => (v && v.length >= 10) || 'Secret Key格式不正确'
]

// Methods
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
    await  router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
  }
}

const maskApiKey = (apiKey) => {
  if (!apiKey || apiKey.length < 8) return apiKey
  return apiKey.substring(0, 4) + '****' + apiKey.substring(apiKey.length - 4)
}

const formatDate = (date) => {
  if (!date) return '从未使用'
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj)
}

const addNewApi = () => {
  if (apis.value.length >= 30 ) {
    alert('最多只能添加30个API配置')
    return
  }

  editingIndex.value = -1
  Object.assign(editingApi, {
    name: '',
    apiKey: '',
    secretKey: '',
    testnet: false,
    isActive: true
  })
  dialog.value = true
}

const editApi = (index) => {
  editingIndex.value = index
  const api = apis.value[index]
  Object.assign(editingApi, {
    name: api.name,
    apiKey: api.apiKey,
    secretKey: api.secretKey,
    testnet: api.testnet,
    isActive: api.isActive
  })
  dialog.value = true
}

const toggleApiStatus = async (index) => {
  const api = apis.value[index]
  const newStatus = !api.isActive
  console.log('Toggle API status:', api.id, newStatus)

  try {
    const { error } = await updateApiConfig(api.id, { is_active: newStatus })

    if (error) {
      console.error('Toggle API status error:', error)
      alert('更新API状态失败：' + error.message)
      return
    }

    // Update local state
    apis.value[index].isActive = newStatus
  } catch (error) {
    console.error('Toggle API status error:', error)
    alert('更新API状态失败，请重试')
  }
}

const deleteApi = (index) => {
  deletingIndex.value = index
  deletingApi.value = apis.value[index]
  deleteDialog.value = true
}

const confirmDelete = async () => {
  if (deletingIndex.value >= 0 && deletingApi.value) {
    deleteDialog.value = false;
  
  try {
    const { data:strategiesData, error:strategiesError } = await supabase
      .from('trading_strategies')
      // .select('*')
      .select('*, api_configs(*)')
      .eq('user_id', localStorage.getItem('userid'))


    if (strategiesError) {
      console.error('Delete API error:', strategiesError)
      alert('删除API失败：' + strategiesError.message)
      return
      }
    const isApiInUse = strategiesData.some(strategy => {
      // 確保 api_configs 存在並且 ID 相符
      return strategy.api_configs && strategy.api_configs.id === deletingApi.value.id;
    });

    if (isApiInUse) {
      showError('删除API失败：该API正在被策略使用，请先删除相关策略或在策略切换其他API使用。');
      console.log('刪除API失敗：該API正在被策略使用');
      return // 終止執行，不進行刪除
    }

    const { error:deleteError } = await deleteApiConfig(deletingApi.value.id)
    if (deleteError) {
      console.error('Delete API error:', deleteError)
      alert('删除API失败：' + deleteError.message)
      return
      }

      // Remove from local state
      apis.value.splice(deletingIndex.value, 1)
      showSuccess('删除API成功')
    } catch (error) {
      console.error('Delete API error:', error)
      alert('删除API失败，请重试')
    }finally{
      deleteDialog.value = false
      deletingIndex.value = -1
      deletingApi.value = null
    }
  }
}
 


const saveApi = async () => {
  if (!dialogValid.value) return

  let user_id = localStorage.getItem('userid')
  saving.value = true

  try {
    // 首先验证API密钥
    console.log('🔐 开始验证API密钥...')
    isVerifying.value = true

    const validationResult = await validateApi(
      editingApi.apiKey,
      editingApi.secretKey,
      editingApi.testnet
    )

    isVerifying.value = false

    if (!validationResult.success) {
      showError("APIKey不正确，验证失败，无法连接到Binance账户,请检查后重新输入",8000)
      // editingApi.apiKey = ''
      // editingApi.secretKey = ''
      return
    }else{
      console.log('✅ API验证成功，继续保存配置...')
    }

    const apiData = {
      user_id: user_id,
      name: editingApi.name,
      api_key: editingApi.apiKey,
      secret_key: editingApi.secretKey,
      testnet: editingApi.testnet,
      is_active: editingApi.isActive
    }

    if (editingIndex.value >= 0) {
      // Edit existing API
      const existingApi = apis.value[editingIndex.value]
      const { data, error } = await updateApiConfig(existingApi.id, apiData)

      if (error) {
        console.error('Update API error:', error)
        alert('更新API失败：' + error.message)
        return
      }

      // Update local state
      if (data && data[0]) {
        apis.value[editingIndex.value] = {
          id: data[0].id,
          name: data[0].name,
          apiKey: data[0].api_key,
          secretKey: data[0].secret_key,
          testnet: data[0].testnet,
          isActive: data[0].is_active,
          lastUsed: data[0].last_used,
          createdAt: data[0].created_at
        }
      }
    } else {
      // Add new API
      // No limit on API count

      const isApiExisting = apis.value.some(api =>
        api.apiKey === editingApi.apiKey &&
        api.secretKey === editingApi.secretKey &&
        api.testnet === editingApi.testnet
      );

      if (isApiExisting) {
        showError('此API密钥已存在，无法重复添加。');
        console.log('API密钥重复，添加失败。');
        return;
      }

      const { data, error } = await createApiConfig(apiData)

      if (error) {
        console.error('Create API error:', error)
        alert('创建API失败：' + error.message)
        showError('创建API失败：' + error.message)
        return
      }

      // Add to local state
      if (data && data[0]) {
        apis.value.push({
          id: data[0].id,
          name: data[0].name,
          apiKey: data[0].api_key,
          secretKey: data[0].secret_key,
          testnet: data[0].testnet,
          isActive: data[0].is_active,
          lastUsed: data[0].last_used,
          createdAt: data[0].created_at
        })
      }
    }

    closeDialog()

  } catch (error) {
    console.error('Save API error:', error)
    showError("APIKey不正确，验证失败，无法连接到Binance账户,请检查后重新输入")
  } finally {
    saving.value = false
    isVerifying.value = false
    loadUserAndApis()
  }
}

const closeDialog = () => {
  dialog.value = false
  editingIndex.value = -1
  // Reset form
  Object.assign(editingApi, {
    name: '',
    apiKey: '',
    secretKey: '',
    testnet: false,
    isActive: true
  })
}


// Load user data and APIs on mount
onMounted(async () => {
  // Only run on client to avoid SSR hydration issues
  await loadUserAndApis()
})

const loadUserAndApis = async () => {
  loading.value = true

  try {
    // Get current user
    let user_id  = localStorage.getItem('userid');

    // Load user's API configurations
    const { data: apiData, error: apiError } = await getApiConfigs(user_id)
    if (apiError) {
      console.error('Load APIs error:', apiError)
      // Show error message but don't redirect
      alert('加载API配置失败：' + apiError.message)

    } else {
      // console.log('🔍 [DEBUG] apiData:', apiData);
      // 后端已经统一处理了状态字段，直接使用返回的数据
      apis.value = (apiData || []).map(api => ({
        id: api.id,
        name: api.name,
        apiKey: api.api_key,
        secretKey: api.secret_key,
        testnet: api.testnet,
        isActive: api.is_active, // 使用后端统一返回的isActive字段
        lastUsed: api.last_used,
        createdAt: api.created_at
      }))

    }
  } catch (error) {
    console.error('Load user and APIs error:', error)
    alert('加载数据失败，请刷新重试')
  } finally {
    loading.value = false
  }
}



const validateApi = async() => {
  try {
    const requestBody = {
      api_key: editingApi.apiKey,
      secret_key: editingApi.secretKey,
      testnet: editingApi.testnet
    }
    
    // console.log('Sending API validation request:', {
    //   url: 'https://jp.sdk250.cn:8443/validate',
    //   body: requestBody
    // })

    const response = await fetch(`https://jp.sdk250.cn:8443/validate`,{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    console.log('Response status:', response.status)
    console.log('Response headers:', response.headers)
    console.log('Response URL:', response.url)

    // Check if response is ok
    if (!response.ok) {
      console.error('API validation failed with status:', response.status)
      showError('API验证失败，请检查API密钥')
      return { success: false, message: 'API验证失败，请检查API密钥' }
    }

    // Check if response is JSON
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      console.log('Response is not JSON:', contentType)
      
      // Try to read the text response to get more details
      try {
        const textResponse = await response.text()
        console.log('Non-JSON response content:', textResponse)
        
        // Check if it's an HTML error page
        if (textResponse.includes('<html>') || textResponse.includes('<!DOCTYPE')) {
          showError('API验证失败，服务器返回错误页面')
          return { success: false, message: 'API验证失败，服务器返回错误页面' }
        }
        
        // Check if the text response indicates success
        const successKeywords = ['success', 'valid', 'ok', 'true']
        const isSuccess = successKeywords.some(keyword => 
          textResponse.toLowerCase().includes(keyword.toLowerCase())
        )
        
        if (isSuccess) {
          showSuccess('API有效，验证成功')
          return { success: true, message: 'API有效，验证成功' }
        }
        
        // Show the actual error message if it's plain text
        showError(`API验证失败: ${textResponse}`)
        return { success: false, message: `API验证失败: ${textResponse}` }
      } catch (textError) {
        console.error('Error reading text response:', textError)
        showError('API验证失败，无法读取服务器响应')
        return { success: false, message: 'API验证失败，无法读取服务器响应' }
      }
    }

    const data = await response.json()
    console.log('API validation response:', data)

    // Check for success based on status and response data
    if(response.status === 200 || response.status === 201){
      showSuccess('API有效，验证成功')
      return { success: true, message: 'API有效，验证成功' }
    } else {
      // Check if the response contains success information
      if (data && (data.success === true || data.valid === true)) {
        showSuccess('API有效，验证成功')
        return { success: true, message: 'API有效，验证成功' }
      }
      
      // Show error with response details if available
      const errorMessage = data && data.message ? data.message : 'API验证失败，请检查API密钥'
      showError(errorMessage)
      return { success: false, message: errorMessage }
    }
  } catch (error) {
    console.error('API验证错误:', error)
    showError('API验证失败，请检查API密钥')
    return { success: false, message: 'API验证失败，请检查API密钥' }
  }
}
</script>

<style scoped>
.api-management-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.api-header {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%) !important;
}

.main-content {
  padding-top: 64px;
}

.api-card {
  border-radius: 16px !important;
  transition: all 0.2s ease;
}

.api-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
}

.api-card--active {
  border: 2px solid #4caf50;
}

.api-key-display {
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  padding: 8px 12px;
  background-color: #f5f7fa;
  border-radius: 6px;
  color: #6b7280;
}

.api-info > div {
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 8px;
}

.api-info > div:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

/* Mobile optimizations */
@media (max-width: 600px) {
  .main-content {
    padding-top: 56px;
  }
}

/* Dark theme support */
.v-theme--dark .api-management-container {
  background-color: #0f172a;
}

.v-theme--dark .api-key-display {
  background-color: #334155;
  color: #cbd5e1;
}

.v-theme--dark .api-info > div {
  border-bottom-color: #334155;
}
</style>
