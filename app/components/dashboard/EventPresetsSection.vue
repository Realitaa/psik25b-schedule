<script setup lang="ts">
import type { EventPresetSelect } from '#shared/types'

defineProps<{
  presets: EventPresetSelect[]
}>()

const emit = defineEmits<{
  (e: 'add'): void
  (e: 'edit', preset: EventPresetSelect): void
  (e: 'delete', id: number, name: string): void
}>()

const presetColumns = [
  { accessorKey: 'name', header: 'Nama Preset' },
  { accessorKey: 'color', header: 'Warna' },
  { accessorKey: 'icon', header: 'Icon' },
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
              name="i-lucide-palette"
              class="text-primary size-5"
            />
            Tabel Preset Event / Pengumuman
          </h2>
          <p class="text-sm text-muted">
            Kelola template preset (nama, warna, icon) yang dapat digunakan berulang saat membuat event
          </p>
        </div>
        <UButton
          label="Tambah Preset"
          icon="i-lucide-plus"
          color="primary"
          @click="emit('add')"
        />
      </div>
    </template>

    <UTable
      :data="presets"
      :columns="presetColumns"
    >
      <template #name-cell="{ row }">
        <div class="flex items-center gap-2">
          <div
            class="px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 border"
            :style="{
              backgroundColor: `${row.original.color}15`,
              borderColor: `${row.original.color}40`,
              color: row.original.color
            }"
          >
            <UIcon
              :name="row.original.icon"
              class="size-3.5"
            />
            <span>{{ row.original.name }}</span>
          </div>
        </div>
      </template>

      <template #color-cell="{ row }">
        <div class="flex items-center gap-2 text-sm font-mono">
          <span
            class="size-4 rounded-full border border-neutral-300 dark:border-neutral-700 shrink-0"
            :style="{ backgroundColor: row.original.color }"
          />
          <span>{{ row.original.color }}</span>
        </div>
      </template>

      <template #icon-cell="{ row }">
        <div class="flex items-center gap-2 text-sm">
          <UIcon
            :name="row.original.icon"
            class="size-5 text-primary"
          />
          <span class="text-xs text-muted font-mono">{{ row.original.icon }}</span>
        </div>
      </template>

      <template #actions-cell="{ row }">
        <div class="flex items-center gap-1">
          <UButton
            icon="i-lucide-pencil"
            color="neutral"
            variant="ghost"
            size="xs"
            aria-label="Edit Preset"
            @click="emit('edit', row.original)"
          />
          <UButton
            icon="i-lucide-trash-2"
            color="error"
            variant="ghost"
            size="xs"
            aria-label="Hapus Preset"
            @click="emit('delete', row.original.id, row.original.name)"
          />
        </div>
      </template>
    </UTable>
    <!-- Empty State for presets -->
    <div
      v-if="!presets || presets.length === 0"
      class="text-center py-8 text-muted text-sm"
    >
      Belum ada preset event terdaftar.
    </div>
  </UCard>
</template>
