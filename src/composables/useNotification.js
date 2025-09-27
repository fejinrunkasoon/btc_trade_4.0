import { ref } from 'vue'

// Global notification state
const notifications = ref([])

export const useNotification = () => {
  const addNotification = (message, type = 'info', timeout = 4000) => {
    const notification = {
      id: Date.now() + Math.random(),
      message,
      type, // 'success', 'error', 'warning', 'info'
      timeout,
      show: true
    }
    
    notifications.value.push(notification)
    
    // Auto remove after timeout
    if (timeout > 0) {
      setTimeout(() => {
        removeNotification(notification.id)
      }, timeout)
    }
    
    return notification.id
  }
  
  const removeNotification = (id) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }
  
  // Convenience methods
  const showSuccess = (message, timeout = 4000) => {
    return addNotification(message, 'success', timeout)
  }
  
  const showError = (message, timeout = 6000) => {
    return addNotification(message, 'error', timeout)
  }
  
  const showWarning = (message, timeout = 5000) => {
    return addNotification(message, 'warning', timeout)
  }
  
  const showInfo = (message, timeout = 4000) => {
    return addNotification(message, 'info', timeout)
  }
  
  const clearAll = () => {
    notifications.value = []
  }
  
  return {
    notifications,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearAll
  }
}
