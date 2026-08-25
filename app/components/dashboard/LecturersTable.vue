<script setup lang="ts">
import type { LecturerSelect } from '#shared/types'

defineProps<{
  lecturers: LecturerSelect[]
}>()

const emit = defineEmits<{
  (e: 'add'): void
  (e: 'edit', lecturer: LecturerSelect): void
  (e: 'delete', id: number, name: string): void
}>()

const lecturerColumns = [
  { accessorKey: 'shortname', header: 'Singkatan' },
  { accessorKey: 'name', header: 'Nama Dosen' },
  { accessorKey: 'nip', header: 'NIP' },
  { accessorKey: 'phone', header: 'No HP' },
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
              name="i-lucide-users"
              class="text-primary size-5"
            />
            Tabel Manajemen Dosen
          </h2>
          <p class="text-sm text-muted">
            Daftar dosen beserta singkatan pengenal (shortname)
          </p>
        </div>
        <UButton
          label="Tambah Dosen"
          icon="i-lucide-plus"
          color="primary"
          @click="emit('add')"
        />
      </div>
    </template>

    <UTable
      :data="lecturers"
      :columns="lecturerColumns"
    >
      <template #shortname-cell="{ row }">
        <UBadge
          color="primary"
          variant="subtle"
        >
          {{ row.original.shortname }}
        </UBadge>
      </template>

      <template #nip-cell="{ row }">
        <span>{{ row.original.nip || '-' }}</span>
      </template>

      <template #phone-cell="{ row }">
        <span>{{ row.original.phone || '-' }}</span>
      </template>

      <template #actions-cell="{ row }">
        <div class="flex items-center gap-1">
          <UButton
            icon="i-lucide-pencil"
            color="neutral"
            variant="ghost"
            size="xs"
            aria-label="Edit Dosen"
            @click="emit('edit', row.original)"
          />
          <UButton
            icon="i-lucide-trash-2"
            color="error"
            variant="ghost"
            size="xs"
            aria-label="Hapus Dosen"
            @click="emit('delete', row.original.id, row.original.name)"
          />
        </div>
      </template>
    </UTable>
    <!-- Empty State for lecturers -->
    <div
      v-if="!lecturers || lecturers.length === 0"
      class="text-center py-8 text-muted text-sm"
    >
      Belum ada data dosen terdaftar.
    </div>
  </UCard>
</template>
