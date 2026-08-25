<script setup lang="ts">
import type { DayStatusResult, ScheduleWithSubject } from '#shared/types'

defineProps<{
  dayStatus: DayStatusResult
  todaySchedules: Array<{
    schedule: ScheduleWithSubject
    statusType: 'current' | 'incoming'
  }>
  todayFormatted?: string
}>()
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between border-b border-subtle pb-4">
      <h2 class="text-2xl font-bold text-highlighted flex items-center gap-2.5">
        <UIcon
          name="i-lucide-calendar"
          class="text-primary size-6"
        />
        Jadwal Hari Ini
      </h2>
    </div>

    <!-- 1. National Holiday Display -->
    <div
      v-if="dayStatus.status === 'Holiday'"
      class="space-y-4"
    >
      <TodayActivityCard
        type="holiday"
        :holiday-description="dayStatus.description"
        :date-str="dayStatus.dateStr"
      />
    </div>

    <!-- 2. Weekend Display -->
    <div
      v-else-if="dayStatus.status === 'Weekend'"
      class="space-y-4"
    >
      <TodayActivityCard
        type="holiday"
        holiday-description="Akhir Pekan (Hari Libur)"
        :date-str="dayStatus.dateStr || todayFormatted"
      />
    </div>

    <!-- 3. Weekday Classes List -->
    <div
      v-else
      class="space-y-4"
    >
      <div
        v-if="todaySchedules.length > 0"
        class="space-y-4"
      >
        <TodayActivityCard
          v-for="item in todaySchedules"
          :key="item.schedule.id"
          :type="item.statusType"
          :schedule="item.schedule"
        />
      </div>
      <!-- Empty State: No schedules active today or all have finished -->
      <div
        v-else
        class="flex flex-col items-center justify-center py-12 px-6 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl text-center"
      >
        <div class="p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-full text-muted mb-4">
          <UIcon
            name="i-lucide-calendar-clock"
            class="size-10"
          />
        </div>
        <h3 class="text-lg font-bold text-highlighted">
          Tidak Ada Jadwal Tersisa
        </h3>
        <p class="text-sm text-muted max-w-sm mt-1">
          Tidak ada perkuliahan yang terjadwal untuk sisa hari ini. Nikmati waktu istirahat Anda!
        </p>
      </div>
    </div>
  </div>
</template>
