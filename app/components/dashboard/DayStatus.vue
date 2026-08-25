<script setup lang="ts">
import type { DayStatusResult } from '#shared/types'

defineProps<{
  dayStatus: DayStatusResult
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
}>()
</script>

<template>
  <UCard class="bg-primary-50/20 dark:bg-primary-950/20 border-primary/30">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="p-3 rounded-xl bg-primary/10 text-primary">
          <UIcon
            v-if="dayStatus.status === 'Holiday'"
            name="i-lucide-party-popper"
            class="size-8"
          />
          <UIcon
            v-else-if="dayStatus.status === 'Weekend'"
            name="i-lucide-sun"
            class="size-8"
          />
          <UIcon
            v-else
            name="i-lucide-briefcase"
            class="size-8"
          />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h2 class="font-semibold text-lg text-highlighted">
              Status Hari Ini
            </h2>
            <UBadge
              :color="dayStatus.status === 'Holiday' ? 'error' : dayStatus.status === 'Weekend' ? 'warning' : 'success'"
              variant="subtle"
            >
              {{ dayStatus.status }}
            </UBadge>
          </div>
          <p class="text-sm text-muted mt-0.5">
            {{ dayStatus.description }} ({{ dayStatus.dateStr }})
          </p>
        </div>
      </div>

      <UButton
        label="Cek Ulang Status"
        icon="i-lucide-refresh-cw"
        color="neutral"
        variant="ghost"
        size="sm"
        :loading="loading"
        @click="emit('refresh')"
      />
    </div>
  </UCard>
</template>
