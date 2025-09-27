<template>
  <div class="strategy-container">
    <!-- Header -->
    <v-app-bar color="primary" dark elevation="0" class="strategy-header">
      <v-btn icon @click="goBack">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title class="text-h6 font-weight-bold">
        {{ editStrategyId ? '编辑交易策略' : '新增交易策略' }}
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="handleLogout">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- Main Content -->
    <v-main class="main-content">
      <v-container fluid class="pa-4">
        <v-form ref="strategyForm" v-model="valid" @submit.prevent="saveStrategy">
          <!-- Strategy Basic Info -->
          <!-- <v-card class="mb-4" elevation="2">
            <v-card-title class="pa-4">
              <v-icon class="mr-2" color="primary">mdi-chart-line</v-icon>
              策略基本信息
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text class="pa-4">
              <v-row>

              </v-row>
            </v-card-text>
          </v-card> -->

          <!-- Real-time Market Data Dashboard -->
<!--          <v-card class="mb-4" elevation="2">-->
<!--            <v-card-title class="pa-4 bg-gradient" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">-->
<!--              <v-icon class="mr-2">mdi-chart-line-variant</v-icon>-->
<!--              BTC/USDT 实时行情-->
<!--              <v-spacer></v-spacer>-->
<!--              <v-chip -->
<!--                :color="marketData.connected ? 'success' : 'error'" -->
<!--                size="small" -->
<!--                variant="elevated"-->
<!--              >-->
<!--                <v-icon size="12" class="mr-1">-->
<!--                  {{ marketData.connected ? 'mdi-wifi' : 'mdi-wifi-off' }}-->
<!--                </v-icon>-->
<!--                {{ marketData.connected ? '已连接' : '断开连接' }}-->
<!--              </v-chip>-->
<!--            </v-card-title>-->
<!--            <v-card-text class="pa-0">-->
<!--              <v-row no-gutters>-->
<!--                &lt;!&ndash; 价格信息 &ndash;&gt;-->
<!--                <v-col cols="12" md="4">-->
<!--                  <div class="pa-4 text-center border-r">-->
<!--                    <div class="text-h4 font-weight-bold" :class="marketData.priceChangePercent >= 0 ? 'text-success' : 'text-error'">-->
<!--                      ${{ marketData.lastPrice?.toFixed(2) || '0.00' }}-->
<!--                    </div>-->
<!--                    <div class="text-body-2 text-medium-emphasis">当前价格</div>-->
<!--                    <div class="mt-2" :class="marketData.priceChangePercent >= 0 ? 'text-success' : 'text-error'">-->
<!--                      <v-icon size="16" class="mr-1">-->
<!--                        {{ marketData.priceChangePercent >= 0 ? 'mdi-trending-up' : 'mdi-trending-down' }}-->
<!--                      </v-icon>-->
<!--                      {{ marketData.priceChangePercent >= 0 ? '+' : '' }}{{ marketData.priceChangePercent?.toFixed(2) || '0.00' }}%-->
<!--                    </div>-->
<!--                    <div class="text-caption" :class="marketData.priceChangePercent >= 0 ? 'text-success' : 'text-error'">-->
<!--                      {{ marketData.priceChangePercent >= 0 ? '+' : '' }}${{ marketData.priceChange?.toFixed(2) || '0.00' }}-->
<!--                    </div>-->
<!--                  </div>-->
<!--                </v-col>-->
<!--                -->
<!--                &lt;!&ndash; 24小时数据 &ndash;&gt;-->
<!--                <v-col cols="12" md="4">-->
<!--                  <div class="pa-4 border-r">-->
<!--                    <v-row dense>-->
<!--                      <v-col cols="6">-->
<!--                        <div class="text-body-2 text-medium-emphasis">最高价</div>-->
<!--                        <div class="font-weight-medium text-success">${{ marketData.highPrice?.toFixed(2) || '0.00' }}</div>-->
<!--                      </v-col>-->
<!--                      <v-col cols="6">-->
<!--                        <div class="text-body-2 text-medium-emphasis">最低价</div>-->
<!--                        <div class="font-weight-medium text-error">${{ marketData.lowPrice?.toFixed(2) || '0.00' }}</div>-->
<!--                      </v-col>-->
<!--                      <v-col cols="6" class="mt-2">-->
<!--                        <div class="text-body-2 text-medium-emphasis">成交量</div>-->
<!--                        <div class="font-weight-medium">{{ formatVolume(marketData.volume) }} BTC</div>-->
<!--                        <div class="text-caption text-medium-emphasis">成交额: ${{ formatVolume(marketData.quoteVolume) }}</div>-->
<!--                      </v-col>-->

<!--                      <v-col cols="6" class="mt-2">-->
<!--                        <div class="text-body-2 text-medium-emphasis">交易次数</div>-->
<!--                        <div class="font-weight-medium">{{ formatTradeCount(marketData.count) }}</div>-->
<!--                      </v-col>-->
<!--                    </v-row>-->
<!--                  </div>-->
<!--                </v-col>-->
<!--                -->
<!--            -->
<!--              </v-row>-->
<!--            </v-card-text>-->
<!--          </v-card>-->
          <!-- Entry Configuration -->
          <v-card class="mb-4" elevation="2">
            <v-card-title class="pa-4">
              <v-icon class="mr-2" color="primary">mdi-chart-line</v-icon>
              策略配置
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text class="pa-4">
              <v-row>
                <v-col cols="6">
                  <v-text-field
                    :key="`strategy-name-${marketData.refreshKey || 0}`"
                    v-model="strategy.name"
                    label="策略名称"
                    variant="outlined"
                    :rules="nameRules"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model="strategy.symbol"
                    label="交易对"
                    variant="outlined"
                    readonly
                    hint="当前版本仅支持BTC/USDT交易对"
                    persistent-hint
                  ></v-text-field>
                </v-col>
                <v-col cols="6" >
                  <v-text-field
                      v-model.number="strategy.up_percent"
                      label="上涨判断"
                      variant="outlined"
                      type="number"
                      step="0.01"
                      min="-100"
                      max="100"
                      suffix="%"
                      :rules="[
                        v => !!v || '请输入趋势判断百分比',
                        v => (v && v >= 0) || '百分比不能小于0',
                        v => (v && v <= 100) || '百分比不能超过100%',
                        v => (v && Number.isFinite(v)) || '请输入有效的小数'
                      ]"
                      hint="预判上涨"
                      persistent-hint
                      required
                  ></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-select
                    v-model="strategy.up_percent_direction"
                    :items="directions"
                    label="上涨后交易方向"
                    variant="outlined"
                    :rules="[v => !!v || '请选择交易方向']"
                    required
                  ></v-select>
                </v-col>
                <v-col cols="6">
                <v-text-field
                    v-model.number="strategy.down_percent"
                    label="下跌判断"
                    variant="outlined"
                    type="number"
                    step="0.01"
                    min="-100"
                    max="100"
                    suffix="%"
                    :rules="[
                        v => !!v || '请输入趋势判断百分比',
                        v => (v && v >= 0) || '百分比不能小于0',
                        v => (v && v <= 100) || '百分比不能超过100%',
                        v => (v && Number.isFinite(v)) || '请输入有效的小数'
                      ]"
                    hint="预判下跌"
                    persistent-hint
                    required
                ></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-select
                      v-model="strategy.down_percent_direction"
                      :items="directions"
                      label="下跌后交易方向"
                      variant="outlined"
                      :rules="[v => !!v || '请选择交易方向']"
                      required
                  ></v-select>
                </v-col>
                <v-col cols="6">
                  <v-text-field
                      v-model.number="strategy.leverage"
                      :items="leverageOptions"
                      label="杠杆倍数"
                      variant="outlined"
                      suffix="x"
                      :rules="[
                        v => !!v || '请输入杠杆倍数（1x-150x）',
                        v => (v && v >= 1) || '杠杆倍数不能小于0',
                        v => (v && v <= 150) || '杠杆倍数不能超过150',
                      ]"
                      required
                  ></v-text-field>
                </v-col>
                <v-col cols="6" >
                  <v-text-field
                      v-model.number="strategy.quantity"
                      label="开仓数量"
                      variant="outlined"
                      type="number"
                      :step="strategy.quantityType === 'fixed' ? '0.001' : '1'"
                      :rules="quantityRules"
                      :suffix="strategy.quantityType === 'percentage' ? '%' : ''"
                      required
                  ></v-text-field>
                </v-col>

                <!-- <v-col cols="6">
                  <v-select
                      v-model="strategy.order_type"
                      :items="orderTypes"
                      label="订单类型"
                      variant="outlined"
                      :rules="[v => !!v || '请选择订单类型']"
                      required
                  >
                    <template v-slot:prepend-inner>
                      <v-icon color="primary">mdi-order-bool-ascending</v-icon>
                    </template>
                  </v-select>
                </v-col> -->
                <v-col cols="6" >
                  <v-text-field
                    v-model.number="strategy.stopLossPercentage"
                    label="止损(%)"
                    variant="outlined"
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="50"
                    :rules="stopLossRules"
                    suffix="%"
                    :hint="getProfitLossHint(strategy.stopLossPercentage, 'stopLoss')"
                    persistent-hint
                    @input="validateStopLossInput"
                    @keydown="preventNonNumericInput"
                  ></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model.number="strategy.takeProfitPercentage"
                    label="止盈(%)"
                    variant="outlined"
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="100"
                    :rules="takeProfitPercentageRules"
                    suffix="%"
                    persistent-hint
                    required
                  ></v-text-field>
                </v-col>
              </v-row>
              <!-- 期货合约杠杆配置 -->
              <v-row>

                <!-- 保证金模式固定为全仓，无需用户选择 -->
<!--                <v-col cols="12" md="6">-->
<!--                  <v-text-field-->
<!--                    value="全仓 (CROSSED)"-->
<!--                    label="保证金类型"-->
<!--                    variant="outlined"-->
<!--                    readonly-->
<!--                    disabled-->
<!--                  >-->
<!--                    <template v-slot:prepend-inner>-->
<!--                      <v-icon color="primary">mdi-shield-account</v-icon>-->
<!--                    </template>-->
<!--                  </v-text-field>-->
<!--                </v-col>-->
              </v-row>
              <v-row>
                <v-col cols="12">
                  <v-alert
                    type="warning"
                    variant="tonal"
                    class="mt-2"
                    density="compact"
                  >
                    <template v-slot:prepend>
                      <v-icon>mdi-alert-circle</v-icon>
                    </template>
                    <div class="text-body-2">
                      <strong>合约风险提示：</strong>
                      {{ strategy.leverage }}x杠杆将放大收益和损失。交易具有高风险，可能导致全部资金损失。
                      全仓模式可能影响整个账户余额。
                    </div>
                  </v-alert>
                </v-col>
              </v-row>



            </v-card-text>
          </v-card>
          <!-- DCA Configuration -->
           <v-card class="mb-4" elevation="2">
            <v-card-title class="pa-4 d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <v-icon class="mr-2" color="info">mdi-chart-multiple</v-icon>
                补仓配置 (DCA)
              </div>
              <v-btn
                  color="primary"
                  size="small"
                  prepend-icon="mdi-plus"
                  @click="addDcaConfig"
              >
                添加补仓位
              </v-btn>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text class="pa-4">

              <div v-if="strategy.dca_config.length === 0" class="text-center py-8">
                <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-plus-circle-outline</v-icon>
                <p class="text-subtitle-1 text--secondary">暂无补仓配置</p>
                <p class="text-body-2 text--secondary">点击上方按钮添加补仓位</p>
              </div>

              <div v-for="(dca, index) in strategy.dca_config" :key="`dca-${index}`" class="mb-4">
                <v-card variant="outlined" class="dca-level-card">
                  <v-card-title class="pa-3 d-flex align-center justify-space-between">
                    <span class="text-subtitle-1">补仓位 {{ index + 1 }}</span>
                    <v-btn
                      icon
                      size="small"
                      color="error"
                      variant="text"
                      @click="removeDCAConfig(index)"
                    >
                      <v-icon>mdi-close</v-icon>
                    </v-btn>
                  </v-card-title>
                  <v-divider></v-divider>
                  <v-card-text class="pa-3">
                    <v-row>
                      <v-col cols="6">
                        <v-text-field
                          v-model.number="dca.triggerPercentage"
                          label="损失百分比 (%)"
                          variant="outlined"
                          type="number"
                          step="0.1"
                          min="0.1"
                          max="50"
                          :rules="percentageRules"
                          density="compact"
                          suffix="%"
                          persistent-hint
                          required
                        ></v-text-field>
                      </v-col>

                      <v-col cols="6">
                        <v-text-field
                          v-model.number="dca.count"
                          label="补仓次数"
                          variant="outlined"
                          type="number"
                          step="1"
                          :rules="dcaCountRules"
                          :suffix="dca.quantityType === 'percentage' ? '%' : ''"
                          density="compact"
                          required
                        ></v-text-field>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </div>
            </v-card-text>
          </v-card>

          <!-- Binance API Configuration -->
          <v-card class="mb-4" elevation="2">
            <v-card-title class="pa-4">
              <v-icon class="mr-2" color="orange">mdi-api</v-icon>
              币安API配置
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text class="pa-4">
              <v-row>
                <v-col cols="12">
                  <!-- API Selection Dropdown -->
                  <v-select
                    v-model="selectedApiConfigId"
                    :items="apiConfigOptions"
                    label="选择API配置"
                    variant="outlined"
                    :rules="[v => !!v || '请选择API配置']"
                    :loading="isLoadingApiConfigs"
                    required
                    clearable
                    @update:model-value="onApiConfigSelect"
                  >
                    <template #item="{ props, item }">
                      <v-list-item v-bind="props">
                        <template #prepend>
                          <v-avatar size="32" class="mr-3">
                            <v-icon
                              color="success"
                              size="20"
                            >
                            {{ parseBooleanValue(item.raw.testnet) ? 'mdi-test-tube' : 'mdi-api' }}
                            </v-icon>
                          </v-avatar>
                        </template>

                        <v-list-item-title class="font-weight-medium">
                          {{ item.raw.name }}
                        </v-list-item-title>

                      
                      </v-list-item>
                    </template>

                    <template #no-data>
                      <div class="text-center py-4">
                        <v-icon size="48" color="grey-lighten-1" class="mb-2">mdi-api-off</v-icon>
                        <p class="text-subtitle-2 text-medium-emphasis mb-2">暂无可用的API配置</p>
                        <p class="text-caption text-medium-emphasis">请先在多 API 管理中添加 API 配置</p>
                      </div>
                    </template>
                  </v-select>
                </v-col>

                <!-- Selected API Details -->
                <v-col v-if="selectedApiConfig" cols="12">
                  <v-card variant="tonal" class="selected-api-card">
                    <v-card-text class="pa-4">
                      <div class="d-flex align-center mb-3">
                        <v-icon class="mr-2">mdi-information</v-icon>
                        <h4 class="text-subtitle-1 font-weight-medium">已选择API配置</h4>
                      </div>

                      <v-row>
                        <v-col cols="12" sm="6">
                          <div class="detail-item">
                            <span class="text-caption text-medium-emphasis">配置名称：</span>
                            <span class="text-body-2 font-weight-medium">{{ selectedApiConfig.name }}</span>
                          </div>
                        </v-col>
                        <v-col cols="12" sm="6">
                          <div class="detail-item">
                            <span class="text-caption text-medium-emphasis">API Key：</span>
                            <span class="text-body-2 font-weight-medium">{{ maskApiKey(selectedApiConfig.api_key) }}</span>
                          </div>
                        </v-col>
                        <v-col cols="12" sm="6">
                          <div class="detail-item">
                            <span class="text-caption text-medium-emphasis">网络类型：</span>
                            <v-chip
                              color="success"
                              size="x-small"
                              variant="tonal"
                            >
                              {{ selectedApiConfig.testnet ? '测试网络' : '正式网络' }}
                            </v-chip>
                          </div>
                        </v-col>
                        <v-col cols="12" sm="6">
                          <div class="detail-item">
                            <span class="text-caption text-medium-emphasis">状态：</span>
                            <v-chip
                              color='success'
                              size="x-small"
                              variant="tonal"
                            >
                              启用
                            </v-chip>
                          </div>
                        </v-col>
                      </v-row>

                      
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Action Buttons -->
          <v-row>
            <v-col cols="12">
              <div class="d-flex justify-end ga-4">
                <v-btn
                  variant="outlined"
                  size="large"
                  class="mr-3"
                  @click="goBack"
                >
                  取消
                </v-btn>
                <v-btn
                  type="submit"
                  color="primary"
                  size="large"
                  :loading="saving"
                  :disabled="!valid"
                >
                  保存策略
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </v-form>
      </v-container>
    </v-main>

    <!-- 交易模式切换提示 -->
    <v-snackbar
      v-model="showModeChangeAlert"
      :timeout="3000"
      color="info"
      location="bottom"
      multi-line
    >
      <div class="d-flex align-center">
        <v-icon class="mr-2">mdi-information</v-icon>
        {{ modeChangeMessage }}
      </div>
      <template v-slot:actions>
        <v-btn
          color="white"
          variant="text"
          size="small"
          @click="showModeChangeAlert = false"
        >
 
        </v-btn>
      </template>
    </v-snackbar>

    <!-- Success Dialog -->
    <v-dialog v-model="successDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5 pa-6 bg-success text-white">
          <v-icon class="mr-3" size="28">mdi-check-circle</v-icon>
          策略保存成功！
        </v-card-title>

        <v-card-text class="pa-6">
          <div class="text-center mb-4">
            <v-icon color="success" size="64">mdi-check-circle-outline</v-icon>
          </div>

          <div class="text-h6 mb-4 text-center">
            您的交易策略已成功保存！
          </div>

          <v-divider class="mb-4"></v-divider>

          <div v-if="savedStrategy">
            <h4 class="mb-3">📊 策略信息</h4>

            <v-row dense>
              <v-col cols="6">
                <div class="text-caption text-medium-emphasis">策略名称</div>
                <div class="font-weight-medium">{{ savedStrategy.name }}</div>
              </v-col>
              <v-col cols="6">
                <div class="text-caption text-medium-emphasis">交易对</div>
                <div class="font-weight-medium">{{ savedStrategy.symbol }}</div>
              </v-col>
              <v-col cols="6">
                <div class="text-caption text-medium-emphasis">交易数量</div>
                <div class="font-weight-medium">{{ savedStrategy.quantity }}</div>
              </v-col>
              <v-col cols="6">
                <div class="text-caption text-medium-emphasis">杠杆倍数</div>
                <v-chip color="primary" size="small" variant="tonal">
                  {{ savedStrategy.leverage }}x 杠杆
                </v-chip>
              </v-col>
            </v-row>
          </div>

          <v-divider class="my-4"></v-divider>

          <v-alert
            type="info"
            variant="tonal"
            class="mb-0"
          >
            <template #text>
              <div class="text-body-2">
                🎉 策略已成功保存，您可以在仪表板或策略详情页面中启动此策略。
              </div>
            </template>
          </v-alert>
        </v-card-text>

        <v-card-actions class="pa-6 pt-0">
          <v-btn
            variant="outlined"
            @click="successDialog = false"
          >
            继续创建
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="success"
            variant="elevated"
            @click="goToDashboard"
          >
            <v-icon class="mr-2">mdi-view-dashboard</v-icon>
            返回仪表板
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'

import { useNotification } from '~/composables/useNotification'
import { useRoute } from 'vue-router'
const { showSuccess, showError, showWarning, showInfo } = useNotification()
import router from "@/router/index.js";
import { supabase } from '@/lib/supabase'


import {createTradingStrategy ,updateTradingStrategy,getTradingStrategies} from '@/lib/util.js';

const route = useRoute();

// Get current user

// API Configuration Management
const apiConfigs = ref([])
const isLoadingApiConfigs = ref(false)
const selectedApiConfigId = ref(null)
const selectedApiConfig = ref(null)
const isTestingApi = ref(false)

// Success Dialog
const successDialog = ref(false)
const savedStrategy = ref(null)

// Real-time Market Data
const marketData = ref({
  connected: false,
  loading: false,
  lastPrice: 0,
  priceChange: 0,
  priceChangePercent: 0,
  highPrice: 0,
  lowPrice: 0,
  volume: 0,
  quoteVolume: 0,
  count: 0,
  closeTime: null,
  refreshKey: 0 // ✅ 新增: 用于修复Vue slot警告的key属性
})
const websocket = ref(null)
// ✅ 新增: 组件挂载状态标识，防止卸载后仍然更新状态导致Vue运行时错误
const isMounted = ref(true)



// Computed property for API config options
const apiConfigOptions = computed(() => {

  const options = apiConfigs.value.map(config => {
    // console.log('处理api配置:', config.testnet);
    // console.log('处理is_active:', config.is_active);
    return {
      title: config.name,
      value: config.id,
      raw: config
    }
  })

  return options
})

// Load API configurations from Supabase
const loadApiConfigurations = async () => {
  isLoadingApiConfigs.value = true
  try {
    let allApiConfigsQuery = supabase
      .from('api_configs')
      .select('*')
      .eq('user_id',  localStorage.getItem('userid'))
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    
    const { data: allApiConfigsData, error: allConfigsError } = await allApiConfigsQuery;

    if (allConfigsError) {
      console.error('获取所有API配置失败:', allConfigsError)
      return
    }
 
    let usedApisQuery = supabase
      .from('trading_strategies')
      .select('api_config_id')
      .eq('user_id',  localStorage.getItem('userid'))
    
    // console.log('isEditMode.value:', isEditMode.value);
    // console.log('editStrategyId.value:', editStrategyId.value);
    if (isEditMode.value && editStrategyId.value) {
      usedApisQuery = usedApisQuery.not('id', 'eq', editStrategyId.value);
    }

    const { data: usedApis, error: usedApisError } = await usedApisQuery;
    // console.log('获取已使用API配置:', usedApis);
    if (usedApisError) {
      console.error('获取已使用API配置失败:', usedApisError)
      return
    }

    const usedApiIds = usedApis.map(v => v.api_config_id);
    

    const currentStrategyApiConfigId = isEditMode.value ? strategy.value.api_config_id : null;

    const filteredApiConfigs = allApiConfigsData.filter(config =>{
      return !usedApiIds.includes(config.id) || config.id === currentStrategyApiConfigId;
    })

    apiConfigs.value = filteredApiConfigs || []
    

  } catch (error) {
    console.error('加载API配置出错:', error)
  } finally {
    isLoadingApiConfigs.value = false
  }
}

// Handle API config selection
const onApiConfigSelect = (configId) => {
  console.log('🔍 [DEBUG] onApiConfigSelect 调用:', { configId })

  if (!configId) {
    selectedApiConfig.value = null
    // Clear strategy binance config
    strategy.value.binanceConfig = {
      apiKey: '',
      secretKey: '',
      testnet: true
    }
    console.log('🔍 [DEBUG] 清空API配置')
    return
  }

  const config = apiConfigs.value.find(c => c.id === configId)
  // console.log('🔍 [DEBUG] 找到的config:', config)
  // console.log('🔍 [DEBUG] apiConfigs.value:', apiConfigs.value)

  if (config) {
    selectedApiConfig.value = config
    // Update strategy binance config with selected API
    strategy.value.binanceConfig = {
      apiKey: config.api_key,
      secretKey: config.secret_key,
      testnet: config.testnet
    }

    // console.log('🔍 [DEBUG] 已选择API配置:', config.name)
    // console.log('🔍 [DEBUG] 映射后的binanceConfig:', strategy.value.binanceConfig)
    // console.log('🔍 [DEBUG] apiKey长度:', strategy.value.binanceConfig.apiKey?.length || 0)
    // console.log('🔍 [DEBUG] secretKey长度:', strategy.value.binanceConfig.secretKey?.length || 0)
  } else {
    console.error('🔍 [DEBUG] 未找到对应的API配置!', { configId, availableConfigs: apiConfigs.value.map(c => ({ id: c.id, name: c.name })) })
  }
}

// Mask API Key for display
const maskApiKey = (apiKey) => {
  if (!apiKey || apiKey.length < 8) return apiKey
  return apiKey.substring(0, 6) + '***' + apiKey.substring(apiKey.length - 4)
}

// Form validation
const valid = ref(false)
const saving = ref(false)
const strategyForm = ref(null)

// Trading direction options
const directions = ref([
  { title: '做多 (LONG)', value: 'LONG' },
  { title: '做空 (SHORT)', value: 'SHORT' }
])

// Strategy data for Futures Trading
const strategy = ref({
  name: '',
  symbol: 'BTCUSDT', // 期货合约交易对
  entryPrice: null,
  quantityType: 'fixed', // 'fixed' or 'percentage'
  quantity: 0.01,
  prefix_direction:0.01,
  direction: 'LONG', // 'LONG' or 'SHORT' for futures
  leverage: 30, // 1-125x leverage for futures (default 30x)
  dca_count: 10, // 补仓次数，默认3次
  stopLoss: null, // 旧格式，保留用于向后兼容
  takeProfit: null, // 旧格式，保留用于向后兼容
  stopLossPercentage: null, // 新格式：基于平均成本的止损百分比
  takeProfitPercentage: 2, // 新格式：基于平均成本的止盈百分比
  dca_config: [{
    triggerPercentage: 1, // 改为百分比
    count: 10, // 'fixed' 或 'percentage'
  }],
  order_type:'MARKET',
  up_percent:0.01,
  up_percent_direction:'LONG',
  down_percent:0.01,
  down_percent_direction:'SHORT',
  
})



// UI反馈状态
const showModeChangeAlert = ref(false)
const modeChangeMessage = ref('')

// 添加布尔值解析函数
const parseBooleanValue = (value) => {
  if (typeof value === 'boolean') {
    return value
  }
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true'
  }
  return !!value
}




// 期货杠杆选项
const leverageOptions = [
  { title: '1x (无杠杆)', value: 1 },
  { title: '2x ', value: 2 },
  { title: '3x (低风险)', value: 3 },
  { title: '5x', value: 5 },
  { title: '10x ', value: 10 },
  { title: '20x', value: 20 },
  { title: '30x  (默认)', value: 30 },
  { title: '50x  (高风险)', value: 50 },
  { title: '100x (极高风险)', value: 100 }
]

// 保证金模式已固定为全仓模式，无需用户选择

// 订单类型选项
const orderTypes = [
  { title: '市价单', value: 'MARKET' },
  // { title: '限价单', value: 'LIMIT' }
]



// Strategy validation and helper functions
const validateStrategyName = async (name) => {
  if (!name || name.length < 2) return false

  // Check if strategy name already exists for current user
  try {
    // const { getTradingStrategies } = useSupabase()


    const { existingStrategies, error } = await supabase
      .from('trading_strategies')
      .select('*')
      .eq('name', name)
      // .eq('user_id', auth.user.id)
      // .single()
  
    return !existingStrategies?.some(s => s.name.toLowerCase() === name.toLowerCase())
  } catch (error) {
    console.error('Strategy name validation error:', error)
    return true // Allow if validation fails
  }
}


// Validation rules
const nameRules = [
  v => !!v || '请输入策略名称',
  v => (v && v.length >= 2) || '策略名称至少2个字符'
]



const dcaCountRules = computed(() => [
  v => !!v || '请输入数量',
  v => (v && v > 0) || '数量必须大于0',
])




const quantityRules = computed(() => [
  v => !!v || '请输入数量',
  v => (v && v > 0) || '数量必须大于0',
  v => (v && v >= 0.0001) || 'BTC最小交易数量为0.001',
  v => (v && v <= 1000) || '单笔交易数量不能超过1000 BTC'
])

const percentageRules = computed(() => [
  v => !!v || '请输入百分比',
  v => (v && v > 0) || '百分比必须大于0',
  v => (v && v >= 0.0001) || '最小百分比为0.1%',
  v => (v && v <= 50) || '最大百分比为50%'
])



const takeProfitPercentageRules = computed(() => [
  v => !!v || '请输入止盈百分比',
  v => (v && v > 0) || '止盈百分比必须大于0',
  v => (v && v >= 0.0001) || '最小止盈百分比为0.0001%',
  v => (v && v <= 100) || '最大止盈百分比为100%'
])

const stopLossRules = computed(() => [
  v => !v || (v && v > 0) || '止损百分比必须大于0',
  v => !v || (v && v >= 0.1) || '最小止损百分比为0.1%',
  v => !v || (v && v <= 50) || '最大止损百分比为50%',
  v => !v || (v && Number.isFinite(v)) || '请输入有效的数字'
])

// Methods
const validateStopLossInput = (event) => {
  const value = event.target.value
  // 只允许数字、小数点和负号
  const numericRegex = /^[0-9]*\.?[0-9]*$/
  
  if (!numericRegex.test(value)) {
    // 如果输入不是数字格式，移除非法字符
    const cleanValue = value.replace(/[^0-9.]/g, '')
    event.target.value = cleanValue
    strategy.value.stopLossPercentage = cleanValue ? parseFloat(cleanValue) : null
  }
}

const preventNonNumericInput = (event) => {
  // 允许的键：数字、小数点、退格、删除、方向键、Tab等
  const allowedKeys = [
    'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
    'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
    'Home', 'End'
  ]
  
  // 允许数字键 (0-9)
  const isNumber = event.key >= '0' && event.key <= '9'
  
  // 允许小数点，但只能有一个
  const isDecimalPoint = event.key === '.' && !event.target.value.includes('.')
  
  // 允许控制键
  const isControlKey = event.ctrlKey || event.metaKey || event.altKey
  
  // 允许特殊键
  const isAllowedKey = allowedKeys.includes(event.key)
  
  if (!isNumber && !isDecimalPoint && !isControlKey && !isAllowedKey) {
    event.preventDefault()
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




// DCA补仓配置逻辑
const dcaLogic = {
  // 添加DCA级别
  addConfig() {
    const newLevel = {
      triggerPercentage: null,
      count: 10,
      // quantityType: 'fixed',
      // id: Date.now() // 用于唯一标识
    }

    // 如果有前一个DCA级别，基于它计算建议百分比
    if (strategy.value.dca_config.length > 0) {
      const lastLevel = strategy.value.dca_config[strategy.value.dca_config.length - 1]
      if (lastLevel.triggerPercentage) {
        newLevel.triggerPercentage = dcaLogic.calculateNextDcaPercentage(lastLevel.triggerPercentage)
      }
    } else {
      // 第一个DCA级别，使用默认百分比
      newLevel.triggerPercentage = dcaLogic.calculateNextDcaPercentage(null)
    }

    strategy.value.dca_config.push(newLevel)
  },

  // 计算下一个DCA触发百分比
  calculateNextDcaPercentage(previousPercentage) {
    const incrementPercentage = 2 // 每级递增2%

    // 如果没有前一个百分比，默认从3%开始
    if (!previousPercentage) {
      return 1
    }

    return previousPercentage + incrementPercentage
  },

  // 验证DCA级别的合理性（基于百分比）
  validatedca_config() {
   

    return null // 验证通过
  },

  // 计算DCA总成本
  calculateTotalDcaCost() {
    let totalCost = 0

    // 初始投入成本
    if (strategy.value.entryPrice && strategy.value.quantity) {
      totalCost += strategy.value.entryPrice * strategy.value.quantity
    }

    // DCA级别成本
    strategy.value.dca_config.forEach(level => {
      if (level.triggerPercentage && level.quantity) {
        const dcaQuantity = parseFloat(level.quantity)
        let dcaTriggerPrice = 0

        if (strategy.value.direction === 'LONG') {
          dcaTriggerPrice = strategy.value.entryPrice * (1 - level.triggerPercentage / 100)
        } else {
          dcaTriggerPrice = strategy.value.entryPrice * (1 + level.triggerPercentage / 100)
        }

        if (level.quantityType === 'fixed') {
          totalCost += dcaTriggerPrice * dcaQuantity
        }
        // 百分比类型的成本计算需要账户余额信息
      }
    })

    return totalCost
  }
}

const addDcaConfig = () => {
  dcaLogic.addConfig()
}





// 🔍 [期货合约] 保存前的完整验证
const validateBeforeSave = async () => {
  // 1. 基础表单验证
  if (!valid.value) {
    showWarning('请完善所有必填字段')
    return false
  }



  // 3. DCA配置验证
  const dcaValidationError = dcaLogic.validatedca_config()
  if (dcaValidationError) {
    showWarning(dcaValidationError)
    return false
  }

  // 4. 风险控制验证
  // const riskReward = riskControlLogic.calculateRiskRewardRatio()
  // if (riskReward && riskReward < 0.5) {
  //   const confirm = window.confirm('当前风险收益比较低(<0.5)，是否继续保存？')
  //   if (!confirm) return false
  // }

  // 5. 期货杠杆验证
  if (!strategy.value.leverage || strategy.value.leverage < 1 || strategy.value.leverage > 125) {
    showWarning('杠杆倍数必须在1-125倍之间')
    return false
  }

  // 6. 期货API配置验证
  if (!strategy.value.binanceConfig.apiKey || !strategy.value.binanceConfig.secretKey) {
    showWarning('请配置币安API Key和Secret Key')
    return false
  }

  // 7. 期货保证金类型验证 - 系统固定使用全仓模式
  // const marginType = 'CROSSED'  // 系统只支持全仓模式
  // 无需验证，因为已经固定为全仓模式

  // 8. 订单类型验证
  const order_type = strategy.value.order_type || 'MARKET'
  if (!['MARKET', 'LIMIT'].includes(order_type)) {
    alert('无效的订单类型，仅支持市价单(MARKET)和限价单(LIMIT)')
    return false
  }

  console.log('✅ 策略验证通过')
  return true
}


const saveStrategy = async () => {

  // 完整验证
  const validationPassed = await validateBeforeSave()
  if (!validationPassed) return

  saving.value = true

  try {
    // 🚀 [期货合约] 验证期货API连接
    console.log('🔧 验证币安API连接...')

    const strategyToSave = {
      user_id: localStorage.getItem('userid'),
      name: strategy.value.name,
      symbol: strategy.value.symbol,
      
      quantity: strategy.value.quantity,
      leverage: strategy.value.leverage, // 期货杠杆倍数
      
      stop_loss_percentage: strategy.value.stopLossPercentage,
      take_profit_percentage: strategy.value.takeProfitPercentage,
      // dca_levels: futuresStrategy.dcaPositions,
      dca_config: strategy.value.dca_config,
      // dca_count: strategy.value.dca_count,
      api_config_id: selectedApiConfigId.value,
      up_percent:strategy.value.up_percent,
      up_percent_direction:strategy.value.up_percent_direction,
      down_percent:strategy.value.down_percent,
      down_percent_direction:strategy.value.down_percent_direction,
      
      order_type: strategy.value.order_type,
    }
    let data, error;
    // console.log('💾 保存策略配置:', strategyToSave)
    if (isEditMode.value) {

      // id, updates
      // console.log('💾 更新策略配置:', strategyToSave)
      data = await updateTradingStrategy(editStrategyId.value,strategyToSave)
      console.log('💾 更新策略data:', data)
    }else {
      // 2. 策略名称唯一性验证
      const nameIsUnique = await validateStrategyName(strategy.value.name)
      if (!nameIsUnique) {
        showWarning('策略名称已存在，请使用其他名称')
        return false
      }
       data = await createTradingStrategy(strategyToSave);
    }
    // 保存到数据库


    if (error) {
      console.error('❌ 保存策略失败:', error)
      alert(`保存失败: ${error.message}`)
      return
    }

    // console.log('✅ 策略保存成功:', data)

    // 📋 显示保存成功对话框
    savedStrategy.value = {
      name: strategy.value.name,
      symbol: strategy.value.symbol,
      // direction: strategy.value.direction,
      quantity: strategy.value.quantity,
      leverage: strategy.value.leverage,
      id: data[0]?.id || data?.id
    }
    successDialog.value = true

  } catch (error) {
    console.error('❌ 策略保存失败:', error)
    alert(`策略保存失败: ${error.message}`)
  } finally {
    saving.value = false
  }
}


// 计算平均持仓成本（包括DCA补仓）
const calculateAverageHoldingCost = () => {
  if (!strategy.value.quantity) {
    return 0
  }

  const entryPrice = parseFloat(strategy.value.entryPrice)
  const entryQuantity = parseFloat(strategy.value.quantity)

  // 初始投入成本
  let totalCost = entryPrice * entryQuantity
  let totalQuantity = entryQuantity

  // 添加所有DCA补仓的成本
  strategy.value.dca_config.forEach(dca => {
    if (dca.triggerPercentage && dca.quantity) {
      const dcaQuantity = parseFloat(dca.quantity)
      let dcaTriggerPrice = 0

      if (strategy.value.direction === 'LONG') {
        dcaTriggerPrice = entryPrice * (1 - dca.triggerPercentage / 100)
      } else {
        dcaTriggerPrice = entryPrice * (1 + dca.triggerPercentage / 100)
      }

      if (dca.quantityType === 'fixed') {
        totalCost += dcaTriggerPrice * dcaQuantity
        totalQuantity += dcaQuantity
      }
      // 百分比类型的DCA暂时不计算，因为需要账户余额信息
    }
  })

  return totalQuantity > 0 ? totalCost / totalQuantity : 0
}

// 止盈止损价格提示函数（基于平均持仓成本）
const getProfitLossHint = (percentage, type) => {
  if (!percentage) {
    return '请输入数字百分比，不可输入其他字符'
  }

  const averageCost = calculateAverageHoldingCost()
  if (averageCost === 0) {
    return '请先设置开仓价格和数量'
  }

  let targetPrice = 0
  const isProfit = type === 'takeProfit'

  if (strategy.value.direction === 'LONG') {
    if (isProfit) {
      targetPrice = averageCost * (1 + percentage / 100) // 做多止盈：平均成本 + 涨幅
    } else {
      targetPrice = averageCost * (1 - percentage / 100) // 做多止损：平均成本 - 跌幅
    }
  } else {
    if (isProfit) {
      targetPrice = averageCost * (1 - percentage / 100) // 做空止盈：平均成本 - 跌幅
    } else {
      targetPrice = averageCost * (1 + percentage / 100) // 做空止损：平均成本 + 涨幅
    }
  }

  return

  // return `${type === 'takeProfit' ? '止盈' : '止损'}价格: $${targetPrice.toFixed(2)} (平均成本: $${averageCost.toFixed(2)})`
}


const removeDCAConfig= (index) => {
  if (index >= 0 && index < strategy.value.dca_config.length) {
    strategy.value.dca_config.splice(index, 1)
    console.log('删除补仓位:', index, '剩余:', strategy.value.dca_config.length)
  }
}

// 页面焦点事件处理 - 用于API状态同步
const handlePageFocus = async () => {
  console.log('🔄 页面重新获得焦点，刷新API配置')
  if (!isLoadingApiConfigs.value) {
    await loadApiConfigurations()
  }
}

// 🎨 编辑模式状态
const isEditMode = ref(false)


// 加载策略数据进行编辑
const loadStrategyForEdit = async (strategyId) => {
  try {
    console.log('📝 加载策略进行编辑:', strategyId)
    // const { getTradingStrategy } = useSupabase()
    // // 传递用户ID确保权限验证
    // const { data, error } = await getTradingStrategy(strategyId, currentUser.value?.id)
    const { data: data, error:  error } = await getTradingStrategies(strategyId)

    console.log('加载策略数据:', data)
    if (error || !data) {
      console.error('获取策略失败:', error)
      alert('获取策略失败，请稍后再试。')
      return false
    }

    // 填充表单数据
    const strategyData =  data
    strategy.value = {
      name: strategyData.name || '',
      symbol: strategyData.symbol || 'BTCUSDT',
      leverage: strategyData.leverage || 3, // 修复：期货默认3倍杠杆
      direction: strategyData.direction || 'LONG',
      quantity: strategyData.quantity || null,

      // ✅ 新增：正确加载百分比字段
      stopLossPercentage: strategyData.stop_loss_percentage,
          // || convertLegacyPriceToPercentage(strategyData.stop_loss, strategyData.entry_price || strategyData.open_price, strategyData.direction, 'stopLoss'),
      takeProfitPercentage: strategyData.take_profit_percentage,
          // || convertLegacyPriceToPercentage(strategyData.take_profit, strategyData.entry_price || strategyData.open_price, strategyData.direction, 'takeProfit'),

      order_type: strategyData.order_type,
      // dca_count: strategyData.dca_count,
      prefix_direction: strategyData.prefix_direction,
      dca_config: strategyData.dca_config,
      up_percent: strategyData.up_percent,
      up_percent_direction: strategyData.up_percent_direction,
      down_percent: strategyData.down_percent,
      down_percent_direction: strategyData.down_percent_direction,
    }


    // console.log('📝 加载的策略数据:', strategyData.orderType)
    // ✅ 如果有API配置ID，设置选中的API配置
    if (strategyData.api_config_id) {
      selectedApiConfigId.value = strategyData.api_config_id
      // 触发API配置选择逻辑
      await nextTick() // 等待组件更新
      onApiConfigSelect(strategyData.api_config_id)
    }

    console.log('✅ 策略数据加载成功:', strategy.value)
    return true
  } catch (error) {
    console.error('加载策略失败:', error)
    alert('加载策略失败，请稍后再试。')
    return false
  }
}


const goToDashboard = () => {
  successDialog.value = false
  router.push('/dashboard')
}

const editStrategyId = ref(null);
// 组件挂载时初始化
onMounted(async () => {
  // Only run on client to avoid SSR hydration issues

  try {
    if (route.query.hasOwnProperty('id') && route.query.id) {
      editStrategyId.value = route.query.id
      isEditMode.value = true
      // console.log('🎨 进入编辑模式:', editStrategyId)
    }

    // Load API configurations
    await loadApiConfigurations()

    if (isEditMode.value && editStrategyId.value) {
      const loadSuccess = await loadStrategyForEdit(editStrategyId.value)
      if (!loadSuccess) {
        // 加载失败，返回控制台
        await router.push('/dashboard')
      }
    }

  } catch (error) {
    console.error('页面初始化失败:', error)
  }

  // ✅ 修复: 正确获取当前用户
  // try {
  //
  //
  // } catch (error) {
  //   console.error('用户初始化失败:', error)
  // }

  // 添加页面焦点监听
  // window.addEventListener('focus', handlePageFocus)
})

// 页面销毁时清理WebSocket连接和事件监听
onBeforeUnmount(() => {
  try {
    // ✅ 首先设置组件为未挂载状态，防止WebSocket监听器继续更新状态
    isMounted.value = false
    console.log('🔄 组件开始卸载，设置isMounted=false')

    // 安全清理WebSocket连接
    if (websocket.value) {
      if (typeof websocket.value.close === 'function') {
        websocket.value.close()
      } else if (typeof websocket.value.reconnect === 'function' && websocket.value.disconnect) {
        // 如果是自定义WebSocket服务，调用其disconnect方法
        websocket.value.disconnect()
      }
      websocket.value = null
    }

    // 安全移除事件监听
    if (typeof window !== 'undefined' && window.removeEventListener) {
      window.removeEventListener('focus', handlePageFocus)
    }


    // addDcaConfig();
    console.log('✅ WebSocket连接和事件监听已清理，组件卸载完成')
  } catch (error) {
    console.error('❌ 清理WebSocket连接时出错:', error)
  }
})
</script>

<style scoped>
.strategy-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.strategy-header {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%) !important;
}

.main-content {
  padding-top: 64px;
}

.border-r {
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.bg-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.dca-level-card {
  border: 1px solid #e0e7ff;
  border-radius: 12px;
}

.dca-level-card:hover {
  border-color: #6366f1;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
}

/* Mobile optimizations */
@media (max-width: 600px) {
  .main-content {
    padding-top: 56px;
  }
}

/* Dark theme support */
.v-theme--dark .strategy-container {
  background-color: #0f172a;
}

.v-theme--dark .dca-level-card {
  border-color: #334155;
}

.v-theme--dark .dca-level-card:hover {
  border-color: #6366f1;
}
</style>
