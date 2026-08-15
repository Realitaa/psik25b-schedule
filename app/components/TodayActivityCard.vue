<script setup lang="ts">
import type { SubjectWithLecturers } from '#shared/types'

defineProps<{
  type: 'current' | 'incoming' | 'holiday'
  subject?: SubjectWithLecturers
  holidayDescription?: string
  dateStr?: string
}>()
</script>

<template>
  <UCard
    :class="[
      'transition-all duration-300 shadow-sm border rounded-xl overflow-hidden',
      type === 'current' ? 'border-fuchsia-500 dark:border-fuchsia-400 bg-fuchsia-50/20 dark:bg-fuchsia-950/10 ring-2 ring-fuchsia-500/20' : '',
      type === 'incoming' ? 'border-blue-500 dark:border-blue-400 bg-blue-50/20 dark:bg-blue-950/10 ring-2 ring-blue-500/10' : '',
      type === 'holiday' ? 'border-green-500 dark:border-green-400 bg-green-50/20 dark:bg-green-950/10 ring-2 ring-green-500/10' : ''
    ]"
  >
    <!-- Holiday / Weekend -->
    <div
      v-if="type === 'holiday'"
      class="flex items-center gap-4 py-2"
    >
      <div class="p-3 rounded-full bg-green-100 dark:bg-green-950/30 text-green-500 dark:text-green-400">
        <UIcon
          name="i-lucide-calendar-x"
          class="size-8 sm:size-10"
        />
      </div>
      <div>
        <div class="flex items-center gap-2 flex-wrap">
          <UBadge
            color="success"
            variant="subtle"
            size="sm"
          >
            Hari Libur
          </UBadge>
          <span class="text-xs text-muted font-medium">{{ dateStr }}</span>
        </div>
        <h3 class="text-lg font-bold text-highlighted mt-1">
          {{ holidayDescription || 'Libur / Tidak Ada Perkuliahan' }}
        </h3>
        <p class="text-sm text-muted">
          Tidak ada kegiatan perkuliahan terjadwal hari ini.
        </p>
      </div>
    </div>

    <!-- Active Class (Current / Incoming) -->
    <div
      v-else-if="subject"
      class="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2"
    >
      <div class="flex items-start gap-4">
        <div
          :class="[
            'p-3 rounded-full',
            type === 'current' ? 'bg-fuchsia-100 dark:bg-fuchsia-950/30 text-fuchsia-500 dark:text-fuchsia-400' : 'bg-blue-100 dark:bg-blue-950/30 text-blue-500 dark:text-blue-400'
          ]"
        >
          <UIcon
            :name="type === 'current' ? 'i-lucide-play' : 'i-lucide-clock'"
            class="size-6 sm:size-8"
          />
        </div>
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <UBadge
              :color="type === 'current' ? 'primary' : 'info'"
              variant="subtle"
              size="sm"
            >
              {{ type === 'current' ? 'Sedang Berlangsung' : 'Mendatang' }}
            </UBadge>
            <span class="text-xs font-semibold text-highlighted">
              {{ subject.day }}, {{ subject.timeStart || '??:??' }} - {{ subject.timeEnd || '??:??' }}
            </span>
          </div>
          <h3 class="text-lg sm:text-xl font-bold text-highlighted mt-1">
            {{ subject.name }}
          </h3>
          <!-- Location -->
          <div class="flex items-center gap-2 text-sm text-muted mt-1.5 flex-wrap">
            <span
              v-if="subject.room"
              class="flex items-center gap-1"
            >
              <UIcon
                name="i-lucide-map-pin"
                class="size-3.5 text-primary"
              />
              R. {{ subject.room }}
            </span>
            <span v-if="subject.building">
              (Gedung {{ subject.building }}<template v-if="subject.floor">, Lt. {{ subject.floor }}</template>)
            </span>
            <span v-else-if="!subject.room">-</span>
          </div>
        </div>
      </div>

      <!-- Lecturers -->
      <div class="md:text-right flex flex-col items-start md:items-end gap-1.5 mt-2 md:mt-0">
        <span class="text-xs text-muted uppercase tracking-wider font-semibold">Dosen Pengampu</span>
        <div class="flex flex-wrap gap-1">
          <UBadge
            v-for="l in subject.lecturers"
            :key="l.id"
            color="neutral"
            variant="outline"
            size="sm"
          >
            {{ l.name }} ({{ l.shortname }})
          </UBadge>
          <span
            v-if="!subject.lecturers || subject.lecturers.length === 0"
            class="text-sm text-muted italic"
          >
            Belum ditentukan
          </span>
        </div>
      </div>
    </div>
  </UCard>
</template>
