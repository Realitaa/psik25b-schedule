<script setup lang="ts">
const isOnline = ref(true)

function updateOnlineStatus() {
  if (import.meta.client) {
    isOnline.value = navigator.onLine
  }
}

onMounted(() => {
  updateOnlineStatus()
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
})

onUnmounted(() => {
  if (import.meta.client) {
    window.removeEventListener('online', updateOnlineStatus)
    window.removeEventListener('offline', updateOnlineStatus)
  }
})
</script>

<template>
  <UBanner
    v-if="!isOnline"
    color="warning"
    icon="i-lucide-wifi-off"
    title="Mode Offline: Anda sedang tidak terhubung ke internet. Menampilkan data jadwal tersimpan di perangkat."
  />
</template>
