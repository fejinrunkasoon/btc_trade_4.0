<template>
  <div class="dashboard-container">
    <!-- Header -->
    <v-app-bar color="primary" dark elevation="0" class="dashboard-header">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title class="text-h6 font-weight-bold">
        BTC交易系统
      </v-toolbar-title>
      <v-spacer></v-spacer>

      <v-btn icon @click="handleLogout" class="ml-2">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- Navigation Drawer - Hydration Safe -->
    <v-navigation-drawer
      v-if="isMounted"
      v-model="drawer"
      temporary
    >
      <v-list>
        <v-list-item prepend-icon="mdi-view-dashboard" title="控制台" :active="true"></v-list-item>
        <v-list-item prepend-icon="mdi-api" title="多API管理" @click="navigateToApiManagement"></v-list-item>
        <v-list-item
          v-if="canAccessRoute('account-management')"
          prepend-icon="mdi-account-group"
          title="用户管理"
          @click="navigateToAccountManagement"
        >
          <template #append>
            <v-chip color="primary" size="x-small" variant="tonal">管理员</v-chip>
          </template>
        </v-list-item>
        <!-- <v-list-item prepend-icon="mdi-chart-timeline-variant" title="交易历史" @click="navigateToTradingHistory"></v-list-item> -->
      </v-list>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main class="main-content">
      <v-container fluid class="pa-4">


        <v-row class="mb-4">
          <v-col cols="12">
            <v-card class="strategy-management-card" elevation="2">
              <v-card-title class="pa-4">
                <!-- <v-icon class="mr-2" color="primary">mdi-strategy</v-icon> -->
                交易策略管理
                <v-spacer></v-spacer>
                <!-- 刷新按钮 -->


                <div class="strategy-stats mt-4">
                    <v-row>
                      <v-col cols="4">
                        <div class="text-center">
                          <div class="text-h6 font-weight-bold text-primary">{{ strategies.length }}</div>
                          <div class="text-caption text-medium-emphasis">策略总数</div>
                        </div>
                      </v-col>
                      <v-col cols="4">
                        <div class="text-center">
                          <div class="text-h6 font-weight-bold text-success">{{ activeStrategiesCount }}</div>
                          <div class="text-caption text-medium-emphasis">运行中</div>
                        </div>
                      </v-col>
                      <v-col cols="4">
                        <div class="text-center">
                          <div class="text-h6 font-weight-bold text-warning">{{ pausedStrategiesCount }}</div>
                          <div class="text-caption text-medium-emphasis">已暂停</div>
                        </div>
                      </v-col>
                    </v-row>
                  </div>
              </v-card-title>
              <v-divider></v-divider>
              <v-card-text class="pa-4">
                <v-card
                    class="strategy-add-card mb-4"
                    variant="outlined"
                    @click="navigateToNewStrategy"
                    elevation="1"
                >
                  <v-card-text class="pa-4 d-flex align-center">
                    <v-icon size="32" color="primary" class="mr-4">mdi-plus-circle</v-icon>
                    <div>
                      <h4 class="text-subtitle-2 font-weight-medium mb-1">新增策略</h4>
                      <p class="text-caption text-medium-emphasis mb-0">创建新的交易策略</p>
                    </div>
                  </v-card-text>
                </v-card>

                <!-- Strategy List Loading -->
                <div v-if="isLoadingStrategies" class="text-center py-8">
                  <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
                  <p class="text-subtitle-1 mt-4">加载策略列表...</p>
                </div>

                <!-- No Strategies -->
                <div v-else-if="strategies.length === 0" class="text-center py-8">
                  <div class="empty-state">
                    <v-icon size="80" color="grey-lighten-1" class="mb-4">mdi-strategy</v-icon>
                    <h3 class="text-h6 font-weight-medium mb-2">暂无交易策略</h3>
                    <p class="text-body-2 text-medium-emphasis mb-4">点击上方按钮创建您的第一个策略</p>
                    <v-btn
                      color="primary"
                      variant="outlined"
                      @click="navigateToNewStrategy"
                      class="mt-2"
                    >
                      立即创建
                    </v-btn>
                  </div>
                </div>
              </v-card-text>
            </v-card>

            <!-- Horizontal Scrollable Strategy List -->
            <div class="strategy-list-container">

              <!-- Vertical Scroll Container -->
              <div class="strategy-scroll-container">
                <div class="strategy-scroll-wrapper">
                  <!-- Add New Strategy Card -->
                  <v-card
                      v-for="strategy in strategies"
                      :key="strategy.id"
                      class="strategy-card mb-4"
                      variant="outlined"
                      elevation="1"
                  >
                    <v-card-text class="pa-4">
                      <!-- Strategy Header -->
                      <div class="d-flex align-center justify-space-between mb-3">
                        <div class="d-flex align-center">
                          <v-avatar size="40" class="mr-3">
                              <v-icon
                              v-if="strategy.positions && strategy.positions.positionSide"
                              :color="strategy.positions.positionSide === 'LONG' ? 'success' : 'error'"
                              size="24"
                            >
                              {{ strategy.positions.positionSide === 'LONG' ? 'mdi-trending-up' : 'mdi-trending-down' }}
                            </v-icon>
                            <v-icon v-else 
                            :color="strategy.direction === 'LONG' ? 'success' : 'error'"
                            size="24">
                              {{strategy.direction === 'LONG' ? 'mdi-trending-up' : 'mdi-trending-down'}}</v-icon>
                          </v-avatar>
                          <div class="flex-1">
                            <div class="d-flex align-center">
                              <h4 class="text-subtitle-1 font-weight-bold mb-0 mr-2">{{ strategy.name }}</h4>
                              <v-chip size="x-small" variant="outlined" color="primary">{{ strategy.symbol }}</v-chip>
                            </div>
                          </div>
                        </div>
                        <div class="d-flex align-center">
                          <v-col cols="8" class="pa-1">
                          <v-btn
                              size="24"
                              variant="elevated"
                              color="error"
                              @click="resetStrategy(strategy)"
                              block
                              class="px-4 py-2"
                              min-width="80"
                          >
                            <v-icon size="18" class="mr-2">mdi-refresh</v-icon>
                            重置
                          </v-btn>
                        </v-col>
                        </div>
                        <div class="text-center">
                          <v-chip color="primary" size="small" variant="tonal">
                            {{ strategy.leverage }}x
                          </v-chip>
                          <div class="text-caption text-medium-emphasis mt-1">杠杆倍数</div>
                        </div>

                      </div>

                      <!-- Strategy Details -->
                      <div class="strategy-details mb-4">

                        <v-row>
                          <v-col cols="4">
                            <div class="text-center">
                              <div class="text-body-2 font-weight-bold">{{ strategy.quantity }}</div>
                              <div class="text-caption text-medium-emphasis">开仓数量</div>
                            </div>
                          </v-col>

                          <v-col cols="4">
                            <div class="text-center">
                              <div class="text-body-2 font-weight-bold text-error">
                                {{ strategy.stop_loss_percentage ? `-${strategy.stop_loss_percentage}%` : '-' }}
                              </div>
                              <div class="text-caption text-medium-emphasis">止损</div>
                            </div>
                          </v-col>
                          <v-col cols="4">
                            <div class="text-center">
                              <div class="text-body-2 font-weight-bold text-success">
                                {{ strategy.take_profit_percentage ? `+${strategy.take_profit_percentage}%` : '-' }}
                              </div>
                              <div class="text-caption text-medium-emphasis">止盈</div>
                            </div>
                          </v-col>
                        </v-row>

                        <v-row>
                          <v-row v-if="strategy.dca_config && strategy.dca_config.length > 0">
                            <v-col cols="12">
                              <div class="text-center mb-2">
                                <v-chip size="small" color="orange" variant="tonal">
                                  <v-icon size="16" class="mr-1">mdi-chart-line-stacked</v-icon>
                                  {{ strategy.dca_config.length }} 个补仓设置
                                </v-chip>
                              </div>

                              <div class="d-flex flex-wrap justify-center ga-2">
                                <v-chip
                                  v-for="(dca, index) in strategy.dca_config"
                                  :key="index"
                                  size="small"
                                  color="orange"
                                  variant="outlined"
                                  class="mb-1"
                                >
                                  <v-icon size="14" class="mr-1">mdi-numeric-{{ index + 1 }}-circle</v-icon>
                                  {{ dca.triggerPercentage || 0 }}% → {{ dca.count || 0 }}次
                                </v-chip>
                              </div>

<!--                              <div class="text-caption text-medium-emphasis mt-1">补仓配置详情</div>-->
                            </v-col>
                          </v-row>

                          <v-row v-else>
                            <v-col cols="12">
                              <div class="text-center">
                                <v-icon size="32" color="grey-lighten-2" class="mb-2">mdi-chart-line-stacked</v-icon>
                                <div class="text-body-2 text-medium-emphasis">暂无补仓配置</div>
                                <div class="text-caption text-medium-emphasis">未设置DCA策略</div>
                              </div>
                            </v-col>
                          </v-row>
                        </v-row>

                        <v-row>
                          <!-- 合约余额内容 -->
                          <v-col cols="12" v-if="strategy.usdtBalance">
                            <div class="d-flex align-center justify-space-between mb-2">
                              <h6 class="text-subtitle-2 font-weight-medium">合约余额</h6>
                              <v-chip size="x-small" color="info" variant="tonal">
                                {{ strategy.usdtBalance.asset }}
                              </v-chip>
                            </div>

                            <div class="balance-details text-caption">
                              <v-row dense>
                                <!-- 总余额和可用余额 -->
                                <v-col cols="6">
                                  <div class="balance-item mb-2">
                                    <div class="text-medium-emphasis mb-1">总余额</div>
                                    <div class="text-subtitle-2 font-weight-medium">
                                      {{ parseFloat(strategy.usdtBalance.balance).toFixed(2) }} {{ strategy.usdtBalance.asset }}
                                    </div>
                                  </div>
                                </v-col>
                                <v-col cols="6">
                                  <div class="balance-item mb-2">
                                    <div class="text-medium-emphasis mb-1">可用余额</div>
                                    <div class="text-subtitle-2 font-weight-medium text-success">
                                      {{ parseFloat(strategy.usdtBalance.availableBalance).toFixed(2) }} {{ strategy.usdtBalance.asset }}
                                    </div>
                                  </div>
                                </v-col>
                                <!-- 跨仓余额和未实现盈亏 -->
                                <v-col cols="6">
                                  <div class="balance-item mb-2">
                                    <div class="text-medium-emphasis mb-1">全仓余额</div>
                                    <div class="text-subtitle-2">
                                      {{ parseFloat(strategy.usdtBalance.crossWalletBalance).toFixed(2) }} {{ strategy.usdtBalance.asset }}
                                    </div>
                                  </div>
                                </v-col>
                                <v-col cols="6">
                                  <div class="balance-item mb-2">
                                    <div class="text-medium-emphasis mb-1">全仓未实现盈亏</div>
                                    <div class="text-subtitle-2"
                                         :class="parseFloat(strategy.usdtBalance.crossUnPnl) >= 0 ? 'text-success' : 'text-error'">
                                      {{ parseFloat(strategy.usdtBalance.crossUnPnl) >= 0 ? '+' : '' }}{{ parseFloat(strategy.usdtBalance.crossUnPnl).toFixed(2) }} {{ strategy.usdtBalance.asset }}
                                    </div>
                                  </div>
                                </v-col>
                              </v-row>

                              <!-- 其他信息 -->
                              <v-divider class="my-2"></v-divider>
                              <v-row dense>
                                <v-col cols="12">
                                  <div class="d-flex justify-space-between align-center text-caption">
                                    <span class="text-medium-emphasis">账户别名: {{ strategy.usdtBalance.accountAlias }}</span>
                                    <v-chip
                                      size="x-small"
                                      :color="strategy.usdtBalance.marginAvailable ? 'success' : 'warning'"
                                      variant="tonal">
                                      {{ strategy.usdtBalance.marginAvailable ? '保证金可用' : '保证金不可用' }}
                                    </v-chip>
                                  </div>
                                </v-col>
                              </v-row>
                            </div>
                          </v-col>

                          <!-- 无余额数据状态 -->
                          <v-col cols="12" v-else>
                            <div class="text-center py-2">
                              <v-icon size="24" color="grey-lighten-2" class="mb-1">mdi-wallet-outline</v-icon>
                              <div class="text-caption text-medium-emphasis">余额数据加载中...</div>
                            </div>
                          </v-col>
                        </v-row>

                        <v-row>
                          <!-- 持仓信息区域 -->
                          <v-col cols="12">
                            <v-divider class="mb-3"></v-divider>
                            <div class="position-info-section">
                              <div class="d-flex align-center justify-space-between mb-2">
                                <h6 class="text-subtitle-2 font-weight-medium">持仓信息</h6>
                              </div>
                              <div v-if="strategy.positions && parseFloat(strategy.positions.positionAmt) !== 0" class="position-data text-caption">
                                <v-chip
                                  size="small"
                                  :color="parseFloat(strategy.positions.unRealizedProfit || 0) >= 0 ? 'success' : 'error'"
                                  variant="tonal"
                                  class="mb-2"
                                >
                                  <v-icon size="14" class="mr-1">mdi-chart-line</v-icon>
                                  盈亏: {{ formatPnl(strategy.positions.unRealizedProfit) }}
                                </v-chip>
                                <p><strong>初始价格:</strong> {{ strategy.start_price }}</p>
                                <p><strong>开仓均价:</strong> {{ strategy.positions.entryPrice }}</p>
                                <p><strong>持仓数量:</strong> {{ strategy.positions.positionAmt }}</p>
                                <p><strong>标记价格:</strong> {{ strategy.positions.markPrice }}</p>
                                <p><strong>合约价值:</strong> {{ parseFloat(strategy.positions.notional).toFixed(2) }}</p>
                                <p><strong>盈亏平衡价:</strong> {{ strategy.positions.breakEvenPrice }}</p>
                                <p><strong>杠杆:</strong> {{ strategy.leverage }}</p>
                                <p><strong>持仓方向:</strong> {{ strategy.positions.positionSide === 'LONG' ? '多' : '空' }}</p>
                                <p><strong>强平价格:</strong> {{ strategy.positions.liquidationPrice }}</p>
                                <p><strong>持仓未实现盈亏:</strong> {{ strategy.positions.unRealizedProfit }}</p>
                              </div>

                              <!-- 无持仓状态 -->
                              <div v-else class="text-center py-2">
                                <v-icon size="24" color="grey-lighten-2" class="mb-1">mdi-chart-areaspline</v-icon>
                                <div class="text-caption text-medium-emphasis">暂无持仓</div>
                              </div>
                            </div>
                          </v-col>
                        </v-row>
                      </div>

                      <v-row>
<!--                       渲染合约余额内容-->

                      </v-row>

                      <!-- Action Buttons -->
                      <v-row dense class="mt-2">
                        <v-col cols="4" class="pa-1">
                          <v-btn
                              size="small"
                              variant="tonal"
                              color="primary"
                              @click.stop="editStrategy(strategy)"
                              block
                          >
                            <v-icon size="16" class="mr-1">mdi-pencil</v-icon>
                            编辑
                          </v-btn>
                        </v-col>
                        <v-col cols="4" class="pa-1">
                          <v-btn
                              size="small"
                              variant="tonal"
                              :color="strategy.status === 'ACTIVE' ? 'warning' : 'success'"
                              @click.stop="toggleStrategy(strategy)"
                              block
                          >
                            <v-icon size="16" class="mr-1">{{ strategy.status === 'ACTIVE' ? 'mdi-pause' : 'mdi-play' }}</v-icon>
                            {{ strategy.status === 'ACTIVE' ? '停止' : '启动' }}
                          </v-btn>
                        </v-col>
                        
                        <v-col cols="4" class="pa-1">
                          <v-btn
                              size="small"
                              variant="tonal"
                              color="error"
                              @click.stop="showDeleteDialog(strategy)"
                              block
                          >
                            <v-icon size="16" class="mr-1">mdi-delete</v-icon>
                            删除
                          </v-btn>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </div>
              </div>

              <!-- Strategy Statistics -->

            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </div>

  <!-- Delete Confirmation Dialog -->
  <v-dialog v-model="deleteDialog" max-width="500">
    <v-card>
      <v-card-title class="text-h5 pa-6 bg-error text-white">
        <v-icon class="mr-3" size="28">mdi-delete-alert</v-icon>
        确认删除策略
      </v-card-title>

      <v-card-text class="pa-6">
        <div class="text-center mb-4">
          <v-icon color="error" size="64">mdi-delete-circle-outline</v-icon>
        </div>

        <div class="text-h6 mb-4 text-center">
          您确定要删除以下策略吗？
        </div>

        <v-divider class="mb-4"></v-divider>

        <div v-if="strategyToDelete">
          <div class="mb-3">
            <div class="text-caption text-medium-emphasis">策略名称</div>
            <div class="text-h6 font-weight-bold">{{ strategyToDelete.name }}</div>
          </div>

          <div class="mb-3">
            <div class="text-caption text-medium-emphasis">交易对</div>
            <div class="font-weight-medium">{{ strategyToDelete.symbol }}</div>
          </div>
        </div>

        <v-divider class="my-4"></v-divider>

        <v-alert
          type="warning"
          variant="tonal"
          class="mb-0"
        >
          <template #text>
            <div class="text-body-2">
              ⚠️ <strong>此操作无法撤销</strong>，删除后策略的所有配置和历史记录都将永久丢失。
            </div>
          </template>
        </v-alert>
      </v-card-text>

      <v-card-actions class="pa-6 pt-0">
        <v-btn
          variant="outlined"
          @click="cancelDelete"
        >
          取消
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          color="error"
          variant="elevated"
          :loading="deletingStrategy"
          @click="confirmDelete"
        >
          <v-icon class="mr-2">mdi-delete</v-icon>
          确认删除
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Start Strategy Confirmation Dialog -->
  <v-dialog v-model="startDialog" max-width="500">
    <v-card>
      <v-card-title class="text-h5 pa-6 bg-warning text-white">
        <v-icon class="mr-3" size="28">mdi-rocket-launch</v-icon>
        启动交易策略
      </v-card-title>

      <v-card-text class="pa-6">
        <div class="text-center mb-4">
          <v-icon color="warning" size="64">mdi-alert-circle-outline</v-icon>
        </div>

        <div class="text-h6 mb-4 text-center">
          确定要启动以下策略吗？
        </div>

        <v-divider class="mb-4"></v-divider>

        <div v-if="strategyToStart">
          <div class="mb-3">
            <div class="text-caption text-medium-emphasis">策略名称</div>
            <div class="text-h6 font-weight-bold">{{ strategyToStart.name }}</div>
          </div>

          <div class="mb-3">
            <div class="text-caption text-medium-emphasis">交易对</div>
            <div class="font-weight-medium">{{ strategyToStart.symbol }}</div>
          </div>

          <v-row dense class="mb-3">
            <v-col cols="6">
              <div class="text-caption text-medium-emphasis">交易方向</div>
              <v-chip
                :color="strategyToStart.direction === 'LONG' ? 'success' : 'error'"
                size="small"
                variant="tonal"
              >
                {{ strategyToStart.direction === 'LONG' ? '📈 做多' : '📉 做空' }}
              </v-chip>
            </v-col>
            <v-col cols="6">
              <div class="text-caption text-medium-emphasis">杠杆倍数</div>
              <v-chip color="primary" size="small" variant="tonal">
                {{ strategyToStart.leverage }}x
              </v-chip>
            </v-col>

            <v-col cols="6">
              <div class="text-caption text-medium-emphasis">开仓数量</div>
              <v-chip color="green" size="small" variant="tonal">
                <v-icon size="14" class="mr-1">mdi-currency-usd</v-icon>
                {{ strategyToStart.quantity }}
              </v-chip>
            </v-col>
            <v-col cols="6">
              <div class="text-caption text-medium-emphasis">补仓次数</div>
              <v-chip color="orange" size="small" variant="tonal">
                <v-icon size="14" class="mr-1">mdi-layers-triple</v-icon>
                {{ strategyToStart.dca_count }}
              </v-chip>
            </v-col>
          </v-row>

        </div>

        <v-divider class="my-4"></v-divider>

        <v-alert
          type="warning"
          variant="tonal"
          class="mb-0"
        >
          <template #text>
            <div class="text-body-2">
              ⚠️ <strong>此操作将执行真实的币安交易</strong>，请确保：<br>
              🔑 API配置正确<br>
              💰 账户有足够余额<br>
              ⚡ 理解交易风险
            </div>
          </template>
        </v-alert>
      </v-card-text>

      <v-card-actions class="pa-6 pt-0">
        <v-btn
          variant="outlined"
          @click="cancelStart"
        >
          取消
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          color="warning"
          variant="elevated"
          :loading="startingStrategy"
          @click="confirmStart"
        >
          <v-icon class="mr-2">mdi-rocket-launch</v-icon>
          确认启动
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Reset Strategy Confirmation Dialog -->
  <v-dialog v-model="resetDialog" max-width="500">
    <v-card>
      

      <v-card-title class="text-h5 pa-6 bg-error text-white">
        <v-icon class="mr-3" size="28">mdi-refresh-alert</v-icon>
        确认重置策略
      </v-card-title>

      <v-card-text class="pa-6">
        <div class="text-center mb-4">
          <v-icon color="error" size="64">mdi-refresh-circle</v-icon>
        </div>

        <div class="text-h6 mb-4 text-center">
          您确定要重置该用户的所有状态吗？
        </div>

        <v-divider class="mb-4"></v-divider>

        <div v-if="strategyToReset">
          <div class="mb-3">
            <div class="text-caption text-medium-emphasis">策略名称</div>
            <div class="text-h6 font-weight-bold">{{ strategyToReset.name }}</div>
          </div>

          <div class="mb-3">
            <div class="text-caption text-medium-emphasis">交易对</div>
            <div class="font-weight-medium">{{ strategyToReset.symbol }}</div>
          </div>
        </div>

        <v-divider class="my-4"></v-divider>

        <v-alert
          type="warning"
          variant="tonal"
          class="mb-0"
        >
          <template #text>
            <div class="text-body-2">
              ⚠️ <strong>此操作将重置账号所有状态</strong>，为了确保账号安全，请谨慎操作。
            </div>
          </template>
        </v-alert>
      </v-card-text>

      <v-card-actions class="pa-6 pt-0">
        <v-btn
          variant="outlined"
          @click="cancelReset"
        >
          取消
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          color="error"
          variant="elevated"
          :loading="resettingStrategy"
          @click="confirmReset"
        >
          <v-icon class="mr-2">mdi-refresh</v-icon>
          确认重置
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRouter } from 'vue-router'


import { usePermissions } from '@/composables/usePermissions'
import { deleteTradingStrategy } from '@/lib/util'


// Vue Router instance
const router = useRouter()

// Permissions
const { isAdmin, hasPermission, canAccessRoute } = usePermissions()



import { supabase } from '@/lib/supabase'


// 简单的通知函数替代
const showSuccess = (message) => {
  console.log('✅ 成功:', message)
  // 可以后续集成 toast 组件
}

const showError = (message) => {
  console.error('❌ 错误:', message)
  // 可以后续集成 toast 组件
}

const showWarning = (message) => {
  console.warn('⚠️ 警告:', message)
  // 可以后续集成 toast 组件
}

const showInfo = (message) => {
  console.info('ℹ️ 信息:', message)
  // 可以后续集成 toast 组件
}

// UI State
const drawer = ref(false)

const isLoading = ref(true)
const isMounted = ref(false) // 用于避免导航抽屉SSR/CSR水合不一致

// Strategy management state
const strategies = ref([])
const isLoadingStrategies = ref(false)
const currentUser = ref(null)
const futuresBalance = ref(null)
const positionAmt = ref(0.0)


// Computed properties for strategy statistics
const activeStrategiesCount = computed(() => {
  return strategies.value.filter(strategy => strategy.status === 'ACTIVE').length
})

const pausedStrategiesCount = computed(() => {
  return strategies.value.filter(strategy => strategy.status === 'PAUSED' || strategy.status === 'STOPPED').length
})


// Strategy management functions
const loadStrategies = async () => {


  isLoadingStrategies.value = true
  try {
    // 直接使用 supabase 客户端查询
    const { data, error } = await supabase
      .from('trading_strategies')
      // .select('*')
      .select('*, api_configs(*)')
      .eq('user_id', localStorage.getItem('userid'))


    if (error) {
      console.error('加载策略失败:', error)
      return
    }

    const { data: apiConfigData, error: apiConfigError } = await supabase
      .from('api_configs')
      .select('*')
      .eq('user_id', localStorage.getItem('userid'))
    

    // console.log(`✅ [API配置] 获取成功:`, apiConfigData)

    for (let apiConfigIndex= 0 ;  apiConfigIndex < apiConfigData.length; apiConfigIndex++){
      // console.log(apiConfigData[apiConfigIndex])
      localStorage.setItem(apiConfigData[apiConfigIndex]['id'], JSON.stringify(apiConfigData[apiConfigIndex]));
    }

    if(data.length > 0) {

      // strategies.value = data || []
      // 步骤 1: 同步映射策略数据，并初始化空的 positions 属性
      const currentStrategies = data || []
      const previousCount = currentStrategies.length

      for (let index = 0; index < currentStrategies.length; index++) {
        currentStrategies[index].positions = await refreshFuturesPositions(currentStrategies[index]);
        currentStrategies[index].usdtBalance = await fetchActiveBalance(currentStrategies[index]);
      }

      strategies.value = currentStrategies
      // 如果策略状态有变化，显示提示
      if (previousCount > 0 && currentStrategies) {
        const activeCount = currentStrategies.filter(s => s.status === 'ACTIVE').length
        const previousActiveCount = activeStrategiesCount.value

        if (activeCount !== previousActiveCount) {
          console.log(`🔄 策略状态更新: ${activeCount} 个运行中 (之前: ${previousActiveCount})`)
        }
      }

      console.log(`✅ ${strategies.value[0].usdtBalance} 持仓信息已获取`)

    }

  } catch (error) {
    console.error('加载策略出错:', error)
  } finally {
    isLoadingStrategies.value = false
  }
}


// Strategy utility functions
// Navigation functions
const navigateToApiManagement = () => {
  router.push('/api-management')
}

const navigateToTradingHistory = () =>{
  router.push('/trading-history')
}

const navigateToNewStrategy = () => {
  router.push('/strategy/new')
}

const navigateToStrategy = (strategy) => {
  router.push(`/strategy/${strategy.id}`)
}

const navigateToAccountManagement = () => {
  // 双重检查权限
  if (!canAccessRoute('account-management')) {
    showError('权限不足：只有管理员才能访问多账户管理')
    return
  }
  router.push('/account-management')
}

// Strategy action functions


const editStrategy = (strategy) => {
  // Navigate to edit strategy page (new.vue with strategy data)
  router.push(`/strategy/new?id=${strategy.id}`)
}



const toggleStrategy = async (strategy) => {
  try {
    const newStatus = strategy.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'

    if (newStatus === 'ACTIVE') {
      // 启动策略：显示确认对话框
      strategyToStart.value = strategy
      startDialog.value = true
      return

    } else {
      // 停止策略：停止交易监控
      if (!confirm(`确定要停止策略"${strategy.name}"吗？\n\n⚠️ 这将停止价格监控，但不会自动平仓现有持仓`)) {
        return
      }

      try {

        console.log('🛑 策略监控已停止')
      } catch (error) {
        console.warn('停止交易监控时出现错误:', error)
      }
    }



    const currentTimestamp = new Date().toISOString() // timestamptz 兼容格式

    // 📅 直接使用 Supabase 更新 trading_strategies 表
    const { data, error } = await supabase
      .from('trading_strategies')
      .update({
        status: newStatus,
        start_time: currentTimestamp
      })
      .eq('id', strategy.id)

    await fetch(`https://jp.sdk250.cn:8443/db_updated`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uid: strategy.api_config_id
      })
    })

    if (error) {
      console.error('更新策略状态失败:', error)
      showError(`更新策略状态失败: ${error.message}`)
      return
    }

    // console.log('✅ Supabase 更新成功:', data)

    // 🔄 更新本地状态
    strategy.status = newStatus
    console.log(`✅ 策略 ${strategy.name} 状态已更新为: ${newStatus}`)

  } catch (error) {
    console.error('切换策略状态出错:', error)
    alert(`操作失败: ${error.message}`)
  }
}

// Reset Strategy Function
const resetStrategy = async (strategy) => {
  console.log('🔄 resetStrategy 被调用:', strategy)
  
  // 显示重置确认对话框
  strategyToReset.value = strategy
  resetDialog.value = true
}

// 执行重置操作
const performReset = async (strategy, uidSuffix) => {
  try {
    const uid = localStorage.getItem('userid')
    const apiConfigId = strategy.api_config_id
    console.log('🔄 执行重置操作:', uid, apiConfigId)

    // 发送POST请求到/reset路由
    const response = await fetch(`https://jp.sdk250.cn:8443/reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uid: apiConfigId
      })
    })

    if (!response.ok) {
      // 非200响应，报错提示用户
      const errorText = await response.text()
      console.error('重置请求失败:', response.status, errorText)
      showError(`重置失败: 服务器返回错误 (${response.status})`)
      return
    }

    // 200响应，成功提示
    showSuccess(`重置成功，30秒后重新启动用户${uidSuffix}`)
    console.log('🔄 重置成功:', strategy.name)

  } catch (error) {
    console.error('重置策略出错:', error)
    showError(`重置失败: ${error.message}`)
  }
}

// Delete Confirmation Dialog
const deleteDialog = ref(false)
const strategyToDelete = ref(null)
const deletingStrategy = ref(false)

// Start Strategy Confirmation Dialog
const startDialog = ref(false)
const strategyToStart = ref(null)
const startingStrategy = ref(false)

// Reset Strategy Confirmation Dialog
const resetDialog = ref(false)
const strategyToReset = ref(null)
const resettingStrategy = ref(false)

// Computed property for UID suffix
const uidSuffix = computed(() => {
  const uid = localStorage.getItem('userid')
  return uid ? uid.slice(-3) : '000'
})

// Start Strategy Dialog Methods


const cancelStart = () => {
  try {
    startDialog.value = false
    strategyToStart.value = null
  } catch (error) {
    console.warn('⚠️ 取消启动对话框时出现错误:', error)
  }
}

const confirmStart = async () => {
  if (!strategyToStart.value) return

  startingStrategy.value = true

  try {

    const strategy = strategyToStart.value

    // 🕰️ 获取当前时间，与created_at一致的timestamptz格式
    const currentTimestamp = new Date().toISOString() // timestamptz 兼容格式

    console.log(`🚀 正在启动策略: ${strategy.name}, 时间: ${currentTimestamp}`)

    // 📅 直接使用 Supabase 更新 trading_strategies 表
    const { data, error } = await supabase
      .from('trading_strategies')
      .update({
        status: 'ACTIVE',
        start_time: currentTimestamp
      })
      .eq('id', strategy.id)
      .select()
    await fetch(`https://jp.sdk250.cn:8443/db_updated`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uid: strategy.api_configs.id
      })
    })

    if (error) {
      console.error('更新策略状态失败:', error)
      showError(`更新策略状态失败: ${error.message}`)
      return
    }

    // console.log('✅ Supabase 更新成功:', data)

    // 🔄 更新本地状态
    strategy.status = 'ACTIVE'
    strategy.start_time = currentTimestamp



    // 🎉 显示成功消息
    showSuccess(`策略启动成功！\n\n策略名称: ${strategy.name}\n启动时间: ${new Date(currentTimestamp).toLocaleString('zh-CN')}`)
    // console.log(`✅ 策略 ${strategy.name} 已启动，开始时间: ${currentTimestamp}`)
    // 🔒 关闭对话框
    cancelStart()

  } catch (error) {
    console.error('启动策略出错:', error)
    alert(`启动策略失败: ${error.message}`)
  } finally {
    startingStrategy.value = false
  }
}

const showDeleteDialog = (strategy) => {
  try {
    strategyToDelete.value = strategy
    deleteDialog.value = true
  } catch (error) {
    console.warn('⚠️ 显示删除对话框时出现错误:', error)
  }
}

const cancelDelete = () => {
  try {
    deleteDialog.value = false
    strategyToDelete.value = null
  } catch (error) {
    console.warn('⚠️ 取消删除对话框时出现错误:', error)
  }
}

const confirmDelete = async () => {
  if (!strategyToDelete.value) return

  deletingStrategy.value = true

  try {

    const { error } = await deleteTradingStrategy(strategyToDelete.value.id, strategyToDelete.value.api_config_id)

    if (error) {
      console.error('删除策略失败:', error)
      showError('删除策略失败')
      return
    }

    // Remove from local state
    const index = strategies.value.findIndex(s => s.id === strategyToDelete.value.id)
    if (index > -1) {
      strategies.value.splice(index, 1)
    }

    showSuccess('策略删除成功:', strategyToDelete.value.name)

    // Close dialog
    cancelDelete()
  } catch (error) {
    console.error('删除策略出错:', error)
    alert('删除策略失败')
  } finally {
    deletingStrategy.value = false
  }
}

// Reset Strategy Dialog Methods
const cancelReset = () => {
  try {
    resetDialog.value = false
    strategyToReset.value = null
  } catch (error) {
    console.warn('⚠️ 取消重置对话框时出现错误:', error)
  }
}

const confirmReset = async () => {
  if (!strategyToReset.value) return

  resettingStrategy.value = true

  try {
    const strategy = strategyToReset.value
    const uid = localStorage.getItem('userid')
    const uidSuffix = uid ? uid.slice(-3) : '000'
    
    await performReset(strategy, uidSuffix)
    
    // 关闭对话框
    cancelReset()

  } catch (error) {
    console.error('重置策略出错:', error)
    showError(`重置失败: ${error.message}`)
  } finally {
    resettingStrategy.value = false
  }
}

onMounted(async () => {
  console.log('Dashboard mounted, initializing...')

  isLoading.value = true

  try {

    // Load user strategies
    await loadStrategies()
    // await fetchData()

  } catch (error) {
    console.error('Dashboard initialization error:', error)
  } finally {
    isLoading.value = false
    isMounted.value = true
  }
})

// 页面销毁时清理定时器、事件监听和WebSocket
onBeforeUnmount(() => {
  try {
    // 关闭所有对话框
    deleteDialog.value = false
    startDialog.value = false
    resetDialog.value = false
    
    // 清理定时器
    if (window.dashboardRefreshInterval) {
      clearInterval(window.dashboardRefreshInterval)
      delete window.dashboardRefreshInterval
    }

    // 清理其他可能的定时器
    if (window.strategyRefreshInterval) {
      clearInterval(window.strategyRefreshInterval)
      delete window.strategyRefreshInterval
    }

    console.log('🧹 Dashboard页面销毁，清理完成')
  } catch (error) {
    console.warn('⚠️ 清理过程中出现错误:', error)
  }
})

// Logout function
const handleLogout = async () => {
  try {
    await supabase.auth.signOut()
    router.push('/login')

  } catch (error) {
    console.error('Logout error:', error)
  }
}



const positions = ref([])
const futuresPositions = ref([])
const isLoadingPositions = ref(false)

const formatPnl = (pnl) =>{
  const pnlValue = parseFloat(pnl || 0);
  if (isNaN(pnlValue)) {
    return '-';
  }
  const prefix = pnlValue >= 0 ? '+' : '';
  return `${prefix}${pnlValue.toFixed(4)}`;
}

// 🚀 获取策略特定的持仓信息（优化版：直接使用策略表信息）
const refreshFuturesPositions = async (strategy) => {

  if (!strategy) return

  // console.log(strategy)

  // const allPositions = await fetch('https://jp.sdk250.cn:8443/positionRisk')
  const u_id = localStorage.getItem('userid')
  const api_configs_id = strategy.api_configs.id
  // console.log(api_configs_id)
  const allPositions = await fetch(`https://jp.sdk250.cn:8443/positionRisk/${u_id}/${api_configs_id}`)
  // const allPositions = await fetch(`http://localhost:8001/positionRisk/${u_id}/${api_configs_id}`)
  const positionRiskData = await allPositions.json()
  if (positionRiskData.length === 0) {
    positionAmt.value = 0
  } else {
    const value = positionRiskData.filter((v) => {return v.symbol === 'BTCUSDT'})
    if (value.length > 0) {
      // console.log(value)
      positionAmt.value = value[0].positionAmt
    }
  }

  if (!Array.isArray(positionRiskData)) {
    futuresPositions.value = []
    isLoadingPositions.value = false
    return []; 
  }

  const activePosition = positionRiskData.find(position => {
    return parseFloat(position.positionAmt) !== 0
  })
 
  return activePosition;

}

const fetchActiveBalance = async (strategy) => {

  if (!strategy) {
    return [];
  }
  try {

    // const response = await fetch('https://jp.sdk250.cn:8443/balance')
    const u_id = localStorage.getItem('userid')
    const api_configs_id = strategy.api_configs.id
    // const response = await fetch(`http://localhost:8001/balance/${u_id}/${api_configs_id}`)
    const response = await fetch(`https://jp.sdk250.cn:8443/balance/${u_id}/${api_configs_id}`)
    const data = await response.json()
  
    const usdtBalance = data.find(asset => asset.asset === 'USDT');

    // console.log('usdtBalance', usdtBalance)
    if (usdtBalance) {
      return usdtBalance;

    } else {
     return null;
    }
  } catch (error) {
    console.error('❌ 获取期货账户余额失败:', error.response ? error.response.data : error.message);
  }
}
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.dashboard-header {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%) !important;
}

.language-selector {
  max-width: 100px;
}

.main-content {
  padding-top: 64px; /* App bar height */
}

.strategy-management-card {
  background: white;
}

.strategy-add-btn {
  min-width: 200px;
}

.strategy-card {
  cursor: pointer;
  transition: all 0.2s ease;
  height: 100%;
}

.strategy-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}

.strategy-details .detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Horizontal scrollable strategy list styles */
.strategy-content {
  min-height: 400px;
}

.strategy-list-container {
  padding: 0;
}

.strategy-scroll-container {
  overflow-x: hidden;
  overflow-y: auto;
  max-height: 600px;
  padding: 8px 0;
}

.strategy-scroll-container::-webkit-scrollbar {
  width: 6px;
}

.strategy-scroll-container::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.strategy-scroll-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.strategy-scroll-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.strategy-scroll-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0;
  width: 100%;
}

.strategy-card {
  width: 100%;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 12px !important;
}

.strategy-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}

.strategy-add-card {
  width: 100%;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 12px !important;
  border: 2px dashed #e2e8f0 !important;
  background: #f8fafc;
}

.strategy-add-card:hover {
  transform: translateY(-1px);
  border-color: #3b82f6 !important;
  background: #f0f9ff;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1) !important;
}

.strategy-details {
  width: 100%;
}

.strategy-stats {
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e2e8f0;
}

.empty-state {
  padding: 24px;
  border-radius: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.btc-robot-card {
  background: linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%);
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 16px !important;
  color: white;
}

.btc-robot-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(255, 107, 107, 0.3) !important;
}

.robot-icon-container {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.signal-card {
  background: white;
  border-radius: 16px !important;
}

.signal-details {
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
}

/* Mobile optimizations */
@media (max-width: 600px) {
  .main-content {
    padding-top: 56px; /* Smaller app bar on mobile */
  }

  .robot-icon-container {
    margin-right: 12px !important;
  }
}

/* Dark theme support */
.v-theme--dark .dashboard-container {
  background-color: #0f172a;
}

.v-theme--dark .strategy-management-card {
  background: #1e293b;
}

.v-theme--dark .signal-card {
  background: #1e293b;
}

.v-theme--dark .signal-details {
  background: #334155;
}
</style>
