<script setup lang="ts">
import type { ScheduleWithSubject, EventSelect } from '#shared/types'
import { formatIndonesianDate } from '#shared/utils/date'

defineProps<{
  schedules: ScheduleWithSubject[]
}>()

const emit = defineEmits<{
  (e: 'openEvent', event: EventSelect, schedule: ScheduleWithSubject): void
}>()

const scheduleColumns = [
  { accessorKey: 'subject', header: 'Mata Kuliah' },
  { accessorKey: 'dayTime', header: 'Jadwal & Status' },
  { accessorKey: 'location', header: 'Lokasi' },
  { accessorKey: 'lecturers', header: 'Dosen Pengampu' }
]
</script>

<template>
  <div class="space-y-6">
    <div class="border-b border-subtle pb-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-highlighted flex items-center gap-2.5">
            <UIcon
              name="i-lucide-book-open"
              class="text-primary size-6"
            />
            Jadwal Mata Kuliah
          </h2>
          <p class="text-sm text-muted mt-1">
            Daftar lengkap seluruh jadwal perkuliahan pada semester aktif saat ini.
          </p>
        </div>
      </div>

      <!-- Status Legend Bar -->
      <div class="flex items-center gap-2 sm:gap-3 flex-wrap mt-4 pt-3 border-t border-subtle/50 text-xs">
        <span class="text-muted font-medium">Legenda:</span>
        <div class="flex items-center gap-1.5">
          <span class="size-2.5 rounded-full bg-white" />
          <span class="text-muted">Jadwal Tetap Aktif</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="size-2.5 rounded-full bg-amber-500" />
          <span class="text-muted">Pindah Sementara</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="size-2.5 rounded-full bg-rose-500" />
          <span class="text-muted">Ditiadakan Minggu Ini</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="size-2.5 rounded-full bg-sky-500" />
          <span class="text-muted">Kuliah Pengganti (1x)</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="size-2.5 rounded-full bg-neutral-400 dark:bg-neutral-600" />
          <span class="text-muted">Selesai</span>
        </div>
      </div>
    </div>

    <UCard class="overflow-hidden">
      <UTable
        :data="schedules"
        :columns="scheduleColumns"
      >
        <template #subject-cell="{ row }">
          <div
            :class="[
              'min-w-35 max-w-60 whitespace-normal wrap-break-word text-sm space-y-1.5',
              row.original.status === 'skipped' ? 'opacity-60' : '',
              row.original.status === 'ended' ? 'opacity-40 line-through' : ''
            ]"
          >
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="font-semibold text-highlighted">{{ row.original.subject?.name || '-' }}</span>
            </div>

            <!-- Active events attached to this schedule -->
            <div
              v-if="row.original.events && row.original.events.length > 0"
              class="flex flex-col gap-1 pt-0.5"
            >
              <div
                v-for="ev in row.original.events"
                :key="ev.id"
                class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium cursor-pointer transition-colors max-w-fit border"
                :style="{
                  backgroundColor: ev.color ? `${ev.color}15` : undefined,
                  borderColor: ev.color ? `${ev.color}40` : undefined,
                  color: ev.color || undefined
                }"
                @click="emit('openEvent', ev, row.original)"
              >
                <UIcon
                  :name="ev.icon || 'i-lucide-bell'"
                  class="size-3 shrink-0"
                />
                <span class="truncate max-w-40 font-semibold">{{ ev.title }}</span>
                <UIcon
                  name="i-lucide-arrow-right"
                  class="size-3 shrink-0 opacity-70"
                />
              </div>
            </div>
          </div>
        </template>

        <template #dayTime-cell="{ row }">
          <div class="min-w-35 whitespace-normal text-sm space-y-1">
            <!-- Specific execution date for moved / one_off schedules -->
            <span
              v-if="(row.original.type === 'temporary_move' || row.original.type === 'one_off') && row.original.endDate"
              class="text-xs text-amber-600 dark:text-amber-400 font-medium block"
            >
              {{ formatIndonesianDate(row.original.endDate) }}
            </span>

            <div class="flex items-center gap-1.5 flex-wrap">
              <span
                :class="[
                  'font-semibold',
                  row.original.status === 'skipped' ? 'line-through text-rose-500' : 'text-highlighted',
                  row.original.status === 'ended' ? 'text-muted line-through' : ''
                ]"
              >
                {{ row.original.day || '-' }}
              </span>

              <!-- Status & Type Badges -->
              <UBadge
                v-if="row.original.status === 'skipped'"
                color="error"
                variant="subtle"
                size="xs"
              >
                Ditiadakan Minggu Ini
              </UBadge>
              <UBadge
                v-else-if="row.original.status === 'ended'"
                color="neutral"
                variant="subtle"
                size="xs"
              >
                Selesai (Ended)
              </UBadge>
              <UBadge
                v-else-if="row.original.type === 'temporary_move'"
                color="warning"
                variant="subtle"
                size="xs"
              >
                Pindah Sementara
              </UBadge>
              <UBadge
                v-else-if="row.original.type === 'one_off'"
                color="info"
                variant="subtle"
                size="xs"
              >
                Kuliah Pengganti (1x)
              </UBadge>
            </div>

            <span
              v-if="row.original.timeStart"
              class="text-muted block text-xs"
            >
              {{ row.original.timeStart }} - {{ row.original.timeEnd || 'Selesai' }}
            </span>
          </div>
        </template>

        <template #location-cell="{ row }">
          <div
            :class="[
              'min-w-25 whitespace-normal flex gap-1 items-center flex-wrap',
              row.original.status === 'ended' ? 'opacity-40' : ''
            ]"
          >
            <UBadge
              v-if="row.original.isOnline"
              color="info"
              variant="subtle"
              size="lg"
              class="font-medium"
            >
              <UIcon
                name="i-lucide-video"
                class="size-3.5 mr-1"
              />
              Daring
            </UBadge>
            <template v-else>
              <UBadge
                v-if="row.original.building"
                class="whitespace-normal wrap-break-word tabular-nums text-md"
              >
                {{ row.original.building }}
              </UBadge>
              <UBadge
                v-if="row.original.floor"
                class="whitespace-normal wrap-break-word tabular-nums text-md"
              >
                {{ row.original.floor }}
              </UBadge>
              <UBadge
                v-if="row.original.room"
                class="whitespace-normal wrap-break-word tabular-nums text-md"
              >
                {{ row.original.room }}
              </UBadge>
              <span
                v-if="!row.original.building && !row.original.floor && !row.original.room"
                class="text-muted"
              >-</span>
            </template>
          </div>
        </template>

        <template #lecturers-cell="{ row }">
          <div
            :class="[
              'min-w-40 max-w-70 whitespace-normal flex flex-wrap gap-1',
              row.original.status === 'ended' ? 'opacity-40' : ''
            ]"
          >
            <UBadge
              v-for="l in row.original.subject?.lecturers || []"
              :key="l.id"
              color="neutral"
              variant="subtle"
              size="sm"
              class="whitespace-normal wrap-break-word text-md"
            >
              {{ l.shortname }}
            </UBadge>
            <span
              v-if="!row.original.subject?.lecturers?.length"
              class="text-sm text-muted italic"
            >
              -
            </span>
          </div>
        </template>
      </UTable>
      <!-- Empty State for schedules -->
      <div
        v-if="schedules.length === 0"
        class="text-center py-8 text-muted text-sm"
      >
        Tidak ada jadwal perkuliahan aktif di tahun ajaran saat ini.
      </div>
    </UCard>
  </div>
</template>
