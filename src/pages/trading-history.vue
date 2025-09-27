<template>
  <div class="trading-history-container">
    <!-- Header -->
    <v-app-bar color="primary" dark elevation="0" class="trading-history-header">
      <v-btn icon @click="navigateBack" class="mr-2">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title class="text-h6 font-weight-bold">
        <v-icon class="mr-2">mdi-chart-timeline-variant</v-icon>
        交易历史
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="refreshHistory" :loading="isLoading" class="ml-2">
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- Main Content -->
    <v-main class="main-content">
      <v-container fluid class="pa-4">
        
       

        <!-- Filters -->
        <v-card class="mb-4" elevation="1">
          <v-card-title class="pa-4">
            <v-icon class="mr-2">mdi-filter</v-icon>
            筛选条件
          </v-card-title>
          <v-card-text class="pa-4 pt-0">
            <v-row>
              <v-col cols="12" md="3">
                <v-text-field
                  v-model="selectedFromDate"
                  type="date"
                  label="开始日期"
                  clearable
                  prepend-inner-icon="mdi-calendar-start"
                  variant="outlined"
                  density="compact"
                  @input="applyFilters"
                >
                </v-text-field>
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field
                  v-model="selectedToDate"
                  type="date"
                  label="结束日期"
                  clearable
                  prepend-inner-icon="mdi-calendar-end"
                  variant="outlined"
                  density="compact"
                  @input="applyFilters"
                >
                </v-text-field>
              </v-col>
              <v-col cols="12" md="2">
                <v-select
                  v-model="selectedDirection"
                  :items="directionOptions"
                  label="交易方向"
                  clearable
                  prepend-inner-icon="mdi-swap-horizontal"
                  variant="outlined"
                  density="compact"
                  @update:model-value="applyFilters"
                >
                </v-select>
              </v-col>
              <v-col cols="12" md="2">
                <v-select
                  v-model="selectedStrategy"
                  :items="strategyOptions"
                  item-title="name"
                  item-value="id"
                  label="策略名称"
                  clearable
                  prepend-inner-icon="mdi-strategy"
                  variant="outlined"
                  density="compact"
                  @update:model-value="applyFilters"
                >
                </v-select>
              </v-col>
              <v-col cols="12" md="2">
                <v-select
                  v-model="selectedSymbol"
                  :items="symbolOptions"
                  label="交易对"
                  clearable
                  prepend-inner-icon="mdi-currency-btc"
                  variant="outlined"
                  density="compact"
                  @update:model-value="applyFilters"
                >
                </v-select>
              </v-col>
            </v-row>
            <!-- <v-row>
              <!-- <v-col cols="12" md="8">
                <v-text-field
                  v-model="searchKeyword"
                  label="搜索关键词"
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                  density="compact"
                  clearable
                  @input="applyFilters"
                  placeholder="搜索策略名称、交易对等..."
                >
                </v-text-field>
              </v-col> -->
              <!-- <v-col cols="12" md="4" class="d-flex align-center">
                <v-btn
                  color="primary"
                  variant="elevated"
                  @click="clearFilters"
                  class="mr-2"
                >
                  <v-icon class="mr-1">mdi-filter-off</v-icon>
                  清除筛选
                </v-btn>
                <v-btn
                  color="success"
                  variant="outlined"
                  @click="exportHistory"
                  :loading="isExporting"
                >
                  <v-icon class="mr-1">mdi-download</v-icon>
                  导出数据
                </v-btn>
              </v-col>
            </v-row> --> -->
          </v-card-text>
        </v-card>

        <!-- Trading History Table -->
        <v-card elevation="2">
          <v-card-title class="pa-4">
            <v-icon class="mr-2">mdi-table</v-icon>
            交易历史记录
            <v-spacer></v-spacer>
            <v-chip
              color="primary"
              size="small"
              variant="tonal"
            >
              {{ filteredTrades.length }} 条记录
            </v-chip>
          </v-card-title>
          
          <!-- Loading State -->
          <div v-if="isLoading" class="text-center py-8">
            <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
            <p class="text-subtitle-1 mt-4">加载交易历史...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="filteredTrades.length === 0" class="text-center py-8">
            <v-icon size="80" color="grey-lighten-1" class="mb-4">mdi-chart-timeline-variant</v-icon>
            <h3 class="text-h6 font-weight-medium mb-2">暂无交易记录</h3>
            <p class="text-body-2 text-medium-emphasis mb-4">当前筛选条件下没有找到交易记录</p>
          </div>

          <!-- Data Table -->
          <v-data-table
            v-else
            :headers="tableHeaders"
            :items="paginatedTrades"
            :items-per-page="itemsPerPage"
            :page="currentPage"
            hide-default-footer
            class="elevation-0"
          >
            <!-- Time Column -->
            <template v-slot:item.time="{ item }">
              <div class="text-caption">
                <div class="font-weight-medium">{{ formatDate(item.time) }}</div>
                <div class="text-medium-emphasis">{{ formatTime(item.time) }}</div>
              </div>
            </template>

            <!-- Symbol Column -->
            <template v-slot:item.symbol="{ item }">
              <div class="d-flex align-center">
                <v-avatar size="24" class="mr-2" color="primary">
                  <v-icon size="14" color="white">mdi-currency-btc</v-icon>
                </v-avatar>
                <div class="font-weight-medium">{{ item.symbol }}</div>
              </div>
            </template>

            <!-- Side Column -->
            <template v-slot:item.side="{ item }">
              <v-chip
                :color="getSideColor(item.side)"
                size="small"
                variant="tonal"
              >
                <v-icon size="14" class="mr-1">{{ getSideIcon(item.side) }}</v-icon>
                {{ getSideText(item.side) }}
              </v-chip>
            </template>

            <!-- Entry Price Column -->
            <template v-slot:item.entry_price="{ item }">
              <div class="text-body-2 font-weight-medium">
                ${{ formatPrice(item.entry_price) }}
              </div>
            </template>

            <!-- Quantity Column -->
            <template v-slot:item.quantity="{ item }">
              <div class="text-body-2">
                {{ formatQuantity(item.quantity) }}
              </div>
            </template>

            <!-- Fee Column -->
            <template v-slot:item.fee="{ item }">
              <div class="text-body-2">
                ${{ formatPrice(item.fee) }}
              </div>
            </template>

            <!-- Role Column -->
            <template v-slot:item.role="{ item }">
              <v-chip
                :color="getRoleColor(item.role)"
                size="small"
                variant="outlined"
              >
                {{ getRoleText(item.role) }}
              </v-chip>
            </template>

            <!-- Realized Profit Column -->
            <template v-slot:item.realized_profit="{ item }">
              <div class="text-body-2 font-weight-bold" :class="item.realized_profit >= 0 ? 'text-success' : 'text-error'">
                <v-icon size="14" class="mr-1" :color="item.realized_profit >= 0 ? 'success' : 'error'">
                  {{ item.realized_profit >= 0 ? 'mdi-trending-up' : 'mdi-trending-down' }}
                </v-icon>
                {{ formatProfit(item.realized_profit) }}
              </div>
            </template>

            <!-- Actions Column -->
            <template v-slot:item.actions="{ item }">
              <v-btn
                icon
                size="small"
                variant="text"
                @click="viewDetails(item)"
              >
                <v-icon size="18">mdi-eye</v-icon>
              </v-btn>
            </template>
          </v-data-table>

          <!-- Pagination -->
          <v-card-actions v-if="filteredTrades.length > 0" class="justify-center pa-4">
            <v-pagination
              v-model="currentPage"
              :length="totalPages"
              :total-visible="7"
              color="primary"
              class="mb-0"
            ></v-pagination>
            <v-spacer></v-spacer>
            <div class="text-caption text-medium-emphasis">
              显示 {{ (currentPage - 1) * itemsPerPage + 1 }} - {{ Math.min(currentPage * itemsPerPage, filteredTrades.length) }} 
              / 共 {{ filteredTrades.length }} 条记录
            </div>
          </v-card-actions>
        </v-card>
      </v-container>
    </v-main>

    <!-- Details Dialog -->
    <v-dialog v-model="detailsDialog" max-width="600">
      <v-card v-if="selectedTrade">
        <v-card-title class="pa-4 bg-primary text-white">
          <v-icon class="mr-2">mdi-information</v-icon>
          交易详情
        </v-card-title>
        <v-card-text class="pa-4">
          <v-row>
            <v-col cols="12">
              <v-list>
                <v-list-item>
                  <v-list-item-title>交易时间</v-list-item-title>
                  <v-list-item-subtitle>{{ formatDateTime(selectedTrade.time) }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>交易对</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedTrade.symbol }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>交易方向</v-list-item-title>
                  <v-list-item-subtitle>{{ getSideText(selectedTrade.side) }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>开仓价格</v-list-item-title>
                  <v-list-item-subtitle>${{ formatPrice(selectedTrade.entry_price) }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>购入数量</v-list-item-title>
                  <v-list-item-subtitle>{{ formatQuantity(selectedTrade.quantity) }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>手续费</v-list-item-title>
                  <v-list-item-subtitle>${{ formatPrice(selectedTrade.fee) }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>订单类型</v-list-item-title>
                  <v-list-item-subtitle>{{ getRoleText(selectedTrade.role) }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>实现盈亏</v-list-item-title>
                  <v-list-item-subtitle :class="selectedTrade.realized_profit >= 0 ? 'text-success' : 'text-error'">
                    {{ formatProfit(selectedTrade.realized_profit) }}
                  </v-list-item-subtitle>
                </v-list-item>
                <v-list-item v-if="selectedTrade.strategy_name">
                  <v-list-item-title>策略名称</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedTrade.strategy_name }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="detailsDialog = false">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'

// Router
const router = useRouter()

// Reactive data
const isLoading = ref(false)
const isExporting = ref(false)
const trades = ref([])
const strategies = ref([])
const detailsDialog = ref(false)
const selectedTrade = ref(null)

// Filters
const selectedFromDate = ref('')
const selectedToDate = ref('')
const selectedDirection = ref(null)
const selectedStrategy = ref(null)
const selectedSymbol = ref(null)
const searchKeyword = ref('')

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Table headers
const tableHeaders = [
  { title: '交易时间', key: 'time', sortable: true },
  { title: '交易对', key: 'symbol', sortable: true },
  { title: '方向', key: 'side', sortable: true },
  { title: '开仓价格', key: 'entry_price', sortable: true },
  { title: '购入数量', key: 'quantity', sortable: true },
  { title: '手续费', key: 'fee', sortable: true },
  { title: '订单类型', key: 'role', sortable: true },
  { title: '实现盈亏', key: 'realized_profit', sortable: true },
  { title: '操作', key: 'actions', sortable: false }
]

// Filter options
const directionOptions = [
  { title: '做多', value: 'BUY' },
  { title: '做空', value: 'SELL' }
]

// Date range helper functions
const isDateInRange = (dateTime, fromDate, toDate) => {
  if (!dateTime) return true
  const date = new Date(dateTime).toDateString()
  const checkDate = new Date(date)
  
  if (fromDate && toDate) {
    const from = new Date(fromDate)
    const to = new Date(toDate)
    to.setHours(23, 59, 59, 999) // Include the entire end date
    return checkDate >= from && checkDate <= to
  } else if (fromDate) {
    return checkDate >= new Date(fromDate)
  } else if (toDate) {
    const to = new Date(toDate)
    to.setHours(23, 59, 59, 999)
    return checkDate <= to
  }
  
  return true
}

// Computed properties
const strategyOptions = computed(() => {
  return strategies.value.map(strategy => ({
    id: strategy.id,
    name: strategy.name
  }))
})

const symbolOptions = computed(() => {
  const symbols = [...new Set(trades.value.map(trade => trade.symbol))]
  return symbols.map(symbol => ({ title: symbol, value: symbol }))
})

const filteredTrades = computed(() => {
  let filtered = [...trades.value]

  // Date range filter
  if (selectedFromDate.value || selectedToDate.value) {
    filtered = filtered.filter(item => isDateInRange(item.time, selectedFromDate.value, selectedToDate.value))
  }

  // Direction filter
  if (selectedDirection.value) {
    filtered = filtered.filter(item => item.side === selectedDirection.value)
  }

  // Strategy filter
  if (selectedStrategy.value) {
    filtered = filtered.filter(item => item.strategy_id === selectedStrategy.value)
  }

  // Symbol filter
  if (selectedSymbol.value) {
    filtered = filtered.filter(item => item.symbol === selectedSymbol.value)
  }

  // Search keyword
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(item => 
      (item.strategy_name || '').toLowerCase().includes(keyword) ||
      (item.symbol || '').toLowerCase().includes(keyword) ||
      (item.side || '').toLowerCase().includes(keyword)
    )
  }

  return filtered
})

const paginatedTrades = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredTrades.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredTrades.value.length / itemsPerPage.value)
})

const totalTrades = computed(() => trades.value.length)
const totalLongTrades = computed(() => trades.value.filter(item => item.side === 'BUY').length)
const totalShortTrades = computed(() => trades.value.filter(item => item.side === 'SELL').length)
const totalRealizedProfit = computed(() => {
  return trades.value.reduce((sum, trade) => sum + (trade.realized_profit || 0), 0)
})

// Methods
const navigateBack = () => {
  router.push('/dashboard')
}

const loadTradingHistory = async () => {
  isLoading.value = true
  try {
    const userId = localStorage.getItem('userid')
    if (!userId) {
      console.error('用户未登录')
      return
    }

    // Load strategies for mapping
    const { data: strategyData, error: strategyError } = await supabase
      .from('trading_strategies')
      .select('id, name, symbol, direction')
      .eq('user_id', userId)

    if (strategyError) {
      console.error('加载策略数据失败:', strategyError)
      return
    }

    strategies.value = strategyData || []

    // Load trading history records
    // Assuming you have a 'trading_history' table in Supabase with the required fields
    const { data: tradingData, error: tradingError } = await supabase
      .from('trading_history')
      .select('*')
      .eq('user_id', userId)
      .order('time', { ascending: false })

    if (tradingError) {
      console.error('加载交易历史失败:', tradingError)
      // For demo purposes, create mock data if table doesn't exist
      trades.value = generateMockTradingData()
      return
    }

    // Map strategy names to trades
    const strategyMap = new Map(strategies.value.map(s => [s.id, s]))
    trades.value = (tradingData || []).map(trade => ({
      ...trade,
      strategy_name: strategyMap.get(trade.strategy_id)?.name || '未知策略'
    }))

    console.log(`✅ 加载了 ${trades.value.length} 条交易历史记录`)
  } catch (error) {
    console.error('加载交易历史出错:', error)
    // Fallback to mock data
    trades.value = generateMockTradingData()
  } finally {
    isLoading.value = false
  }
}

// Generate mock trading data for demonstration
const generateMockTradingData = () => {
  const mockTrades = []
  const symbols = ['BTCUSDT', 'ETHUSDT', 'ADAUSDT', 'BNBUSDT', 'SOLUSDT']
  const sides = ['BUY', 'SELL']
  const roles = ['MAKER', 'TAKER']
  
  for (let i = 0; i < 50; i++) {
    const baseTime = new Date()
    baseTime.setDate(baseTime.getDate() - Math.floor(Math.random() * 30))
    baseTime.setHours(Math.floor(Math.random() * 24))
    baseTime.setMinutes(Math.floor(Math.random() * 60))
    baseTime.setSeconds(Math.floor(Math.random() * 60))
    
    const symbol = symbols[Math.floor(Math.random() * symbols.length)]
    const side = sides[Math.floor(Math.random() * sides.length)]
    const price = Math.random() * 50000 + 1000
    const quantity = Math.random() * 2 + 0.001
    const fee = price * quantity * 0.001
    const realizedProfit = (Math.random() - 0.5) * 1000
    
    mockTrades.push({
      id: `trade_${i}`,
      time: baseTime.toISOString(),
      symbol: symbol,
      side: side,
      entry_price: price,
      quantity: quantity,
      fee: fee,
      role: roles[Math.floor(Math.random() * roles.length)],
      realized_profit: realizedProfit,
      strategy_id: strategies.value[Math.floor(Math.random() * Math.max(1, strategies.value.length))]?.id || null,
      strategy_name: strategies.value[Math.floor(Math.random() * Math.max(1, strategies.value.length))]?.name || '演示策略'
    })
  }
  
  return mockTrades.sort((a, b) => new Date(b.time) - new Date(a.time))
}

const refreshHistory = () => {
  loadTradingHistory()
}

const applyFilters = () => {
  currentPage.value = 1 // Reset to first page when filtering
}

const clearFilters = () => {
  selectedFromDate.value = ''
  selectedToDate.value = ''
  selectedDirection.value = null
  selectedStrategy.value = null
  selectedSymbol.value = null
  searchKeyword.value = ''
  currentPage.value = 1
}

const viewDetails = (trade) => {
  selectedTrade.value = trade
  detailsDialog.value = true
}

const exportHistory = async () => {
  isExporting.value = true
  try {
    // Simple CSV export
    const headers = ['交易时间', '交易对', '交易方向', '开仓价格', '购入数量', '手续费', '订单类型', '实现盈亏', '策略名称']
    const csvContent = [
      headers.join(','),
      ...filteredTrades.value.map(item => [
        formatDateTime(item.time),
        item.symbol || 'N/A',
        getSideText(item.side),
        formatPrice(item.entry_price),
        formatQuantity(item.quantity),
        formatPrice(item.fee),
        getRoleText(item.role),
        formatProfit(item.realized_profit),
        item.strategy_name || '未知策略'
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `trading_history_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  } catch (error) {
    console.error('导出数据失败:', error)
  } finally {
    isExporting.value = false
  }
}

// Utility functions
const getSideColor = (side) => {
  return side === 'BUY' ? 'success' : 'error'
}

const getSideIcon = (side) => {
  return side === 'BUY' ? 'mdi-trending-up' : 'mdi-trending-down'
}

const getSideText = (side) => {
  return side === 'BUY' ? '做多' : '做空'
}

const getRoleColor = (role) => {
  return role === 'MAKER' ? 'primary' : 'orange'
}

const getRoleText = (role) => {
  return role === 'MAKER' ? '限价' : '市价'
}

const formatPrice = (price) => {
  if (!price && price !== 0) return '0.00'
  return parseFloat(price).toFixed(2)
}

const formatQuantity = (quantity) => {
  if (!quantity && quantity !== 0) return '0.000'
  return parseFloat(quantity).toFixed(6)
}

const formatProfit = (profit) => {
  if (!profit && profit !== 0) return '$0.00'
  const formatted = parseFloat(profit).toFixed(2)
  return profit >= 0 ? `+$${formatted}` : `-$${Math.abs(formatted)}`
}

const formatDateTime = (dateTime) => {
  if (!dateTime) return ''
  const date = new Date(dateTime)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const formatDate = (dateTime) => {
  if (!dateTime) return ''
  const date = new Date(dateTime)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const formatTime = (dateTime) => {
  if (!dateTime) return ''
  const date = new Date(dateTime)
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// Watch for page changes
watch(currentPage, () => {
  // Could add smooth scrolling to top here if needed
})

// Lifecycle
onMounted(() => {
  loadTradingHistory()
})
</script>

<style scoped>
.trading-history-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.trading-history-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%) !important;
}

.main-content {
  padding-top: 64px; /* Account for app bar height */
}

.stat-card {
  transition: transform 0.2s ease-in-out;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.v-data-table {
  background-color: transparent;
}

.v-data-table >>> .v-data-table__wrapper {
  border-radius: 0;
}
</style>
