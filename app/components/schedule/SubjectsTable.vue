<script setup lang="ts">
import type { SubjectWithLecturers, EventSelect } from '#shared/types'

defineProps<{
  subjects: SubjectWithLecturers[]
}>()

const emit = defineEmits<{
  (e: 'openEvent', event: EventSelect, subject: SubjectWithLecturers): void
}>()

const subjectColumns = [
  { accessorKey: 'name', header: 'Mata Kuliah' },
  { accessorKey: 'dayTime', header: 'Jadwal' },
  { accessorKey: 'location', header: 'Lokasi' },
  { accessorKey: 'lecturers', header: 'Dosen Pengampu' }
]
</script>

<template>
  <div class="space-y-6">
    <div class="border-b border-subtle pb-4">
      <h2 class="text-2xl font-bold text-highlighted flex items-center gap-2.5">
        <UIcon
          name="i-lucide-book-open"
          class="text-primary size-6"
        />
        Jadwal Mata Kuliah
      </h2>
      <p class="text-sm text-muted mt-1">
        Daftar lengkap seluruh mata kuliah pada tahun ajaran saat ini.
      </p>
    </div>

    <UCard class="overflow-hidden">
      <UTable
        :data="subjects"
        :columns="subjectColumns"
      >
        <template #name-cell="{ row }">
          <div class="min-w-35 max-w-60 whitespace-normal wrap-break-word text-sm space-y-1.5">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="font-semibold text-highlighted">{{ row.original.name || '-' }}</span>
              <UBadge
                v-if="row.original.isReplacement"
                color="warning"
                variant="subtle"
                size="xs"
              >
                Matkul Ganti
              </UBadge>
            </div>
            <!-- Active events attached to this subject -->
            <div
              v-if="row.original.events && row.original.events.length > 0"
              class="flex flex-col gap-1"
            >
              <div
                v-for="ev in row.original.events"
                :key="ev.id"
                class="inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded text-xs font-medium cursor-pointer transition-colors max-w-fit"
                @click="emit('openEvent', ev, row.original)"
              >
                <UIcon
                  name="i-lucide-bell"
                  class="size-3 text-amber-500 shrink-0"
                />
                <span class="truncate max-w-40 font-semibold">{{ ev.title }}</span>
                <UIcon
                  name="i-lucide-arrow-right"
                  class="size-3 text-amber-500 shrink-0"
                />
              </div>
            </div>
          </div>
        </template>

        <template #dayTime-cell="{ row }">
          <div class="min-w-25 whitespace-normal text-sm">
            <span class="font-semibold text-highlighted">{{ row.original.day || '-' }}</span>
            <span
              v-if="row.original.timeStart"
              class="text-muted block text-xs mt-0.5"
            >
              {{ row.original.timeStart }} - {{ row.original.timeEnd || 'Selesai' }}
            </span>
          </div>
        </template>

        <template #location-cell="{ row }">
          <div class="min-w-25 whitespace-normal flex gap-1 items-center flex-wrap">
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
          <div class="min-w-40 max-w-70 whitespace-normal flex flex-wrap gap-1">
            <UBadge
              v-for="l in row.original.lecturers"
              :key="l.id"
              color="neutral"
              variant="subtle"
              size="sm"
              class="whitespace-normal wrap-break-word text-md"
            >
              {{ l.shortname }}
            </UBadge>
            <span
              v-if="!row.original.lecturers || row.original.lecturers.length === 0"
              class="text-sm text-muted italic"
            >
              -
            </span>
          </div>
        </template>
      </UTable>
      <!-- Empty State for activeSubjects -->
      <div
        v-if="subjects.length === 0"
        class="text-center py-8 text-muted text-sm"
      >
        Tidak ada mata kuliah aktif di tahun ajaran saat ini.
      </div>
    </UCard>
  </div>
</template>
