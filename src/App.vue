<template>
  <v-app>
    <router-view />
    <GlobalNotifications />
  </v-app>
</template>

<script lang="ts" setup>
import GlobalNotifications from '@/components/GlobalNotifications.vue'
</script>
