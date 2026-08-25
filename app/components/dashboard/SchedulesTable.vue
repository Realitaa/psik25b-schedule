<script setup lang="ts">
import type { ScheduleWithSubject } from '#shared/types'
import { formatIndonesianDateTime } from '#shared/utils/date'

defineProps<{
  schedules: ScheduleWithSubject[]
}>()

const emit = defineEmits<{
  (e: 'add'): void
  (e: 'action' | 'edit', schedule: ScheduleWithSubject): void
  (e: 'delete', id: number, name: string): void
}>()

const scheduleColumns = [
  { accessorKey: 'subject', header: 'Mata Kuliah' },
  { accessorKey: 'dayTime', header: 'Jadwal & Status' },
  { accessorKey: 'location', header: 'Lokasi' },
  { id: 'actions', header: 'Aksi' }
]
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-semibold text-highlighted flex items-center gap-2">
            <UIcon
              name="i-lucide-calendar-days"
              class="text-primary size-5"
            />
            Tabel Jadwal Perkuliahan
          </h2>
          <p class="text-sm text-muted">
            Kelola waktu, ruangan, status lewati minggu ini, pindah sementara, atau tandai selesai
          </p>
        </div>
        <UButton
          label="Tambah Jadwal"
          icon="i-lucide-plus"
          color="primary"
          @click="emit('add')"
        />
      </div>
    </template>

    <UTable
      :data="schedules"
      :columns="scheduleColumns"
    >
      <template #subject-cell="{ row }">
        <div class="space-y-1">
          <div class="text-sm font-semibold text-highlighted">
            {{ row.original.subject?.name || '-' }}
          </div>
          <div class="flex items-center gap-1.5 flex-wrap">
            <UBadge
              v-if="row.original.type === 'regular'"
              color="primary"
              variant="subtle"
              size="xs"
            >
              Jadwal Tetap
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
        </div>
      </template>

      <template #dayTime-cell="{ row }">
        <div class="text-sm space-y-1">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span
              :class="[
                'font-medium',
                row.original.status === 'skipped' ? 'line-through text-rose-500' : 'text-highlighted',
                row.original.status === 'ended' ? 'text-muted line-through' : ''
              ]"
            >
              {{ row.original.day || '-' }}
            </span>

            <UBadge
              v-if="row.original.status === 'skipped'"
              color="error"
              variant="subtle"
              size="xs"
            >
              Dilewati Minggu Ini
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
              v-else
              color="success"
              variant="subtle"
              size="xs"
            >
              Aktif
            </UBadge>
          </div>

          <span
            v-if="row.original.timeStart"
            class="text-muted block text-xs"
          >
            {{ row.original.timeStart }} - {{ row.original.timeEnd || 'Selesai' }}
          </span>

          <span
            v-if="row.original.endDate"
            class="text-xs text-amber-600 dark:text-amber-400 font-medium block"
          >
            Exp: {{ formatIndonesianDateTime(row.original.endDate) }}
          </span>
        </div>
      </template>

      <template #location-cell="{ row }">
        <div class="text-sm">
          <UBadge
            v-if="row.original.isOnline"
            color="info"
            variant="subtle"
            size="sm"
          >
            <UIcon
              name="i-lucide-video"
              class="size-3.5 mr-1"
            />
            Daring
          </UBadge>
          <template v-else>
            <span
              v-if="row.original.room"
              class="font-medium text-highlighted"
            >R. {{ row.original.room }}</span>
            <span
              v-else
              class="text-muted"
            >-</span>
            <span
              v-if="row.original.building"
              class="text-muted block text-xs"
            >
              Gedung {{ row.original.building }} <template v-if="row.original.floor">, Lt. {{ row.original.floor }}</template>
            </span>
          </template>
        </div>
      </template>

      <template #actions-cell="{ row }">
        <div class="flex items-center gap-1">
          <!-- Double play button for fast schedule actions (skip, move, end, reset) -->
          <UTooltip text="Aksi Jadwal (Lewati / Pindah / Selesai)">
            <UButton
              icon="i-lucide-fast-forward"
              color="warning"
              variant="subtle"
              size="xs"
              aria-label="Aksi Jadwal"
              @click="emit('action', row.original)"
            />
          </UTooltip>

          <UButton
            icon="i-lucide-pencil"
            color="neutral"
            variant="ghost"
            size="xs"
            aria-label="Edit Jadwal"
            @click="emit('edit', row.original)"
          />
          <UButton
            icon="i-lucide-trash-2"
            color="error"
            variant="ghost"
            size="xs"
            aria-label="Hapus Jadwal"
            @click="emit('delete', row.original.id, `${row.original.subject?.name} (${row.original.day})`)"
          />
        </div>
      </template>
    </UTable>
    <!-- Empty State for schedules -->
    <div
      v-if="!schedules || schedules.length === 0"
      class="text-center py-8 text-muted text-sm"
    >
      Belum ada jadwal perkuliahan terdaftar.
    </div>
  </UCard>
</template>
