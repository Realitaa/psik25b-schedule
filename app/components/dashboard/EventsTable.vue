<script setup lang="ts">
import type { EventSelect } from '#shared/types'
import { formatEventEndDate } from '#shared/utils/date'

defineProps<{
  events: EventSelect[]
}>()

const emit = defineEmits<{
  (e: 'add'): void
  (e: 'preview' | 'edit', event: EventSelect): void
  (e: 'delete', id: number, title: string): void
}>()

const eventColumns = [
  { accessorKey: 'subject', header: 'Mata Kuliah' },
  { accessorKey: 'title', header: 'Judul Event & Tipe' },
  { accessorKey: 'endDate', header: 'Batas Waktu (Auto-Expiry)' },
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
              name="i-lucide-ticket"
              class="text-amber-500 size-5"
            />
            Tabel Manajemen Event / Pengumuman Matkul
          </h2>
          <p class="text-sm text-muted">
            Kelola tugas, kuis, atau pengumuman khusus yang melekat pada jadwal kuliah (otomatis kedaluwarsa)
          </p>
        </div>
        <UButton
          label="Tambah Event"
          icon="i-lucide-plus"
          color="primary"
          @click="emit('add')"
        />
      </div>
    </template>

    <UTable
      :data="events"
      :columns="eventColumns"
    >
      <template #subject-cell="{ row }">
        <div class="text-sm font-semibold text-highlighted">
          {{ row.original.schedule?.subject?.name || '-' }}
          <span
            v-if="row.original.schedule"
            class="text-xs text-muted block font-normal"
          >
            {{ row.original.schedule.day }} ({{ row.original.schedule.timeStart }}-{{ row.original.schedule.timeEnd }})
          </span>
        </div>
      </template>

      <template #title-cell="{ row }">
        <div class="flex items-center gap-2 flex-wrap">
          <div
            v-if="row.original.type || row.original.icon || row.original.color"
            class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border shrink-0"
            :style="{
              backgroundColor: row.original.color ? `${row.original.color}15` : undefined,
              borderColor: row.original.color ? `${row.original.color}40` : undefined,
              color: row.original.color || undefined
            }"
          >
            <UIcon
              :name="row.original.icon || 'i-lucide-bell'"
              class="size-3 shrink-0"
            />
            <span>{{ row.original.type || 'Event' }}</span>
          </div>
          <span class="font-medium text-highlighted">{{ row.original.title }}</span>
          <UButton
            icon="i-lucide-eye"
            color="neutral"
            variant="ghost"
            size="xs"
            label="Lihat"
            @click="emit('preview', row.original)"
          />
        </div>
      </template>

      <template #endDate-cell="{ row }">
        <div class="text-xs">
          <UBadge
            v-if="row.original.endDate"
            color="warning"
            variant="subtle"
            size="sm"
          >
            <UIcon
              name="i-lucide-clock"
              class="size-3 mr-1"
            />
            {{ formatEventEndDate(row.original.endDate, 'Tanpa batas waktu') }}
          </UBadge>
          <span
            v-else
            class="text-muted italic"
          >
            Tanpa batas waktu
          </span>
        </div>
      </template>

      <template #actions-cell="{ row }">
        <div class="flex items-center gap-1">
          <UButton
            icon="i-lucide-pencil"
            color="neutral"
            variant="ghost"
            size="xs"
            aria-label="Edit Event"
            @click="emit('edit', row.original)"
          />
          <UButton
            icon="i-lucide-trash-2"
            color="error"
            variant="ghost"
            size="xs"
            aria-label="Hapus Event"
            @click="emit('delete', row.original.id, row.original.title)"
          />
        </div>
      </template>
    </UTable>
    <!-- Empty State for events -->
    <div
      v-if="!events || events.length === 0"
      class="text-center py-8 text-muted text-sm"
    >
      Belum ada event / pengumuman terdaftar.
    </div>
  </UCard>
</template>
