<template>
  <div class="global-notifications">
    <v-snackbar
      v-for="notification in notifications"
      :key="notification.id"
      v-model="notification.show"
      :color="getColor(notification.type)"
      :timeout="notification.timeout"
      location="top right"
      multi-line
      vertical
      @update:model-value="(val) => !val && removeNotification(notification.id)"
    >
      <div class="d-flex align-center">
        <v-icon class="mr-3" size="24">
          {{ getIcon(notification.type) }}
        </v-icon>
        <div class="flex-grow-1">
          {{ notification.message }}
        </div>
        <v-btn 
          icon="mdi-close" 
          variant="text" 
          density="compact"
          @click="removeNotification(notification.id)"
        />
      </div>
    </v-snackbar>
  </div>
</template>

<script setup>
import { useNotification } from '@/composables/useNotification'

const { notifications, removeNotification } = useNotification()

const getColor = (type) => {
  const colors = {
    success: 'success',
    error: 'error',
    warning: 'warning',
    info: 'info'
  }
  return colors[type] || 'info'
}

const getIcon = (type) => {
  const icons = {
    success: 'mdi-check-circle',
    error: 'mdi-alert-circle',
    warning: 'mdi-alert',
    info: 'mdi-information'
  }
  return icons[type] || 'mdi-information'
}
</script>

<style scoped>
.global-notifications {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 9999;
}
</style>
