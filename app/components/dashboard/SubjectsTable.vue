<script setup lang="ts">
import type { SubjectWithLecturers } from '#shared/types'

defineProps<{
  subjects: SubjectWithLecturers[]
}>()

const emit = defineEmits<{
  (e: 'add'): void
  (e: 'edit', subject: SubjectWithLecturers): void
  (e: 'delete', id: number, name: string): void
}>()

const subjectColumns = [
  { accessorKey: 'name', header: 'Mata Kuliah' },
  { accessorKey: 'dayTime', header: 'Jadwal' },
  { accessorKey: 'location', header: 'Lokasi' },
  { accessorKey: 'lecturers', header: 'Dosen Pengampu' },
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
              name="i-lucide-book-open"
              class="text-primary size-5"
            />
            Tabel Mata Kuliah
          </h2>
          <p class="text-sm text-muted">
            Daftar mata kuliah yang diajarkan pada semester ini
          </p>
        </div>
        <UButton
          label="Tambah Mata Kuliah"
          icon="i-lucide-plus"
          color="primary"
          @click="emit('add')"
        />
      </div>
    </template>

    <UTable
      :data="subjects"
      :columns="subjectColumns"
    >
      <template #name-cell="{ row }">
        <div class="space-y-1">
          <div class="text-sm font-semibold text-highlighted">
            {{ row.original.name }}
          </div>
          <UBadge
            v-if="row.original.isReplacement"
            color="warning"
            variant="subtle"
            size="xs"
          >
            Matkul Ganti
          </UBadge>
        </div>
      </template>

      <template #dayTime-cell="{ row }">
        <div class="text-sm">
          <span class="font-medium text-highlighted">{{ row.original.day || '-' }}</span>
          <span
            v-if="row.original.timeStart"
            class="text-muted block text-xs"
          >
            {{ row.original.timeStart }} - {{ row.original.timeEnd || 'Selesai' }}
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

      <template #lecturers-cell="{ row }">
        <div class="flex flex-wrap gap-1">
          <UBadge
            v-for="l in row.original.lecturers"
            :key="l.id"
            color="neutral"
            variant="subtle"
            size="sm"
          >
            {{ l.shortname }}
          </UBadge>
          <span
            v-if="!row.original.lecturers || row.original.lecturers.length === 0"
            class="text-xs text-muted"
          >
            Belum ada dosen
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
            aria-label="Edit Mata Kuliah"
            @click="emit('edit', row.original)"
          />
          <UButton
            icon="i-lucide-trash-2"
            color="error"
            variant="ghost"
            size="xs"
            aria-label="Hapus Mata Kuliah"
            @click="emit('delete', row.original.id, row.original.name)"
          />
        </div>
      </template>
    </UTable>
    <!-- Empty State for subjects -->
    <div
      v-if="!subjects || subjects.length === 0"
      class="text-center py-8 text-muted text-sm"
    >
      Belum ada mata kuliah terdaftar.
    </div>
  </UCard>
</template>
