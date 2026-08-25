<script setup lang="ts">
import type { AcademicYearSelect } from '#shared/types'

defineProps<{
  activeYear?: AcademicYearSelect | null
}>()
</script>

<template>
  <div class="relative overflow-hidden rounded-3xl bg-linear-to-r from-teal-600/10 via-emerald-600/5 to-transparent border border-teal-500/10 p-8 sm:p-12 shadow-sm">
    <div class="relative z-10 space-y-6 max-w-3xl">
      <div class="space-y-2">
        <h1 class="text-3xl sm:text-5xl font-extrabold text-highlighted tracking-tight">
          Selamat Datang di Portal <span class="bg-linear-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent">PSIK25B</span>
        </h1>
        <p class="text-lg text-muted">
          Sistem Informasi Jadwal Perkuliahan dan Data Dosen Kelas PSIK25B.
        </p>
      </div>

      <div class="flex items-center gap-4 flex-wrap">
        <UBadge
          v-if="activeYear"
          color="neutral"
          variant="solid"
          size="md"
        >
          Tahun Ajaran: {{ activeYear.yearStart }}/{{ activeYear.yearEnd }} ({{ activeYear.semester === 'ganjil' ? 'Ganjil' : 'Genap' }})
        </UBadge>
        <UBadge
          v-else
          color="error"
          variant="subtle"
          size="md"
        >
          Tahun Ajaran Tidak Aktif
        </UBadge>
      </div>
    </div>
    <!-- Background Abstract Glow -->
    <div class="absolute -right-16 -top-16 size-72 rounded-full bg-teal-500/10 blur-3xl" />
    <div class="absolute -left-16 -bottom-16 size-72 rounded-full bg-emerald-500/5 blur-3xl" />
  </div>
</template>
