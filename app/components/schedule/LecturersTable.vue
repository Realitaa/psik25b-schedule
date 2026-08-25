<script setup lang="ts">
import type { LecturerSelect } from '#shared/types'

defineProps<{
  lecturers: LecturerSelect[]
}>()

const { formatWhatsAppLink } = useWhatsApp()

const lecturerColumns = [
  { accessorKey: 'shortname', header: 'Singkatan' },
  { accessorKey: 'name', header: 'Nama Dosen' },
  { accessorKey: 'nip', header: 'NIP' },
  { accessorKey: 'phone', header: 'No HP / WhatsApp' }
]
</script>

<template>
  <div class="space-y-6">
    <div class="border-b border-subtle pb-4">
      <h2 class="text-2xl font-bold text-highlighted flex items-center gap-2.5">
        <UIcon
          name="i-lucide-users"
          class="text-primary size-6"
        />
        Data Dosen Pengampu
      </h2>
      <p class="text-sm text-muted mt-1">
        Informasi kontak dosen pengampu perkuliahan PSIK25B.
      </p>
    </div>

    <UCard class="overflow-hidden">
      <UTable
        :data="lecturers"
        :columns="lecturerColumns"
      >
        <template #shortname-cell="{ row }">
          <div class="min-w-15">
            <UBadge
              color="primary"
              variant="subtle"
              class="font-semibold"
            >
              {{ row.original.shortname }}
            </UBadge>
          </div>
        </template>

        <template #name-cell="{ row }">
          <div class="min-w-37.5 whitespace-normal wrap-break-word font-medium text-highlighted text-sm">
            {{ row.original.name }}
          </div>
        </template>

        <template #nip-cell="{ row }">
          <div class="min-w-25 break-all text-sm font-medium text-highlighted">
            {{ row.original.nip || '-' }}
          </div>
        </template>

        <template #phone-cell="{ row }">
          <div class="min-w-30 whitespace-normal break-all">
            <div v-if="row.original.phone">
              <UButton
                :to="formatWhatsAppLink(row.original.phone)"
                target="_blank"
                icon="i-simple-icons-whatsapp"
                color="success"
                variant="ghost"
                size="sm"
                :label="row.original.phone"
                class="-ml-2 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-semibold whitespace-normal break-all text-left"
              />
            </div>
            <span
              v-else
              class="text-muted"
            >-</span>
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
  </div>
</template>
