<script setup lang="ts">
import type { UserSessionPayload } from '#shared/types'

defineProps<{
  user?: UserSessionPayload | null
  yearOptions: Array<{ label: string, value: string }>
  savingActiveYear?: boolean
}>()

const activeYear = defineModel<string>('activeYear', { required: true })

const emit = defineEmits<{
  (e: 'addYear'): void
  (e: 'changeActiveYear', value: string): void
}>()
</script>

<template>
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-subtle pb-6">
    <div>
      <h1 class="text-2xl sm:text-3xl font-bold text-highlighted flex items-center gap-2">
        👋 Halo, {{ user?.name || user?.username }}!
      </h1>
      <p class="mt-1 text-muted text-sm sm:text-base">
        Selamat datang di Panel Kontrol Manajemen Jadwal & Perkuliahan PSIK25B.
      </p>
    </div>

    <!-- Tombol Tambah Tahun Ajaran & Selector Active Year -->
    <div class="flex flex-wrap items-center gap-3">
      <UButton
        label="Tambah Tahun Ajaran"
        icon="i-lucide-plus"
        color="primary"
        variant="subtle"
        @click="emit('addYear')"
      />

      <div class="flex items-center gap-2">
        <span class="text-xs sm:text-sm text-muted font-medium">TA Aktif:</span>
        <USelect
          v-model="activeYear"
          :items="yearOptions"
          value-attribute="value"
          option-attribute="label"
          class="w-56"
          :loading="savingActiveYear"
          @update:model-value="(val) => emit('changeActiveYear', String(val))"
        />
      </div>
    </div>
  </div>
</template>
