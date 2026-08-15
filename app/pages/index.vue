<script setup lang="ts">
import type { AcademicYearSelect, LecturerSelect, SubjectWithLecturers } from '#shared/types'

// Fetch public schedule & lecturer data in parallel
const { data } = await useAsyncData('public-schedule-data', async () => {
  const [academicYearsData, lecturers, subjects] = await Promise.all([
    $fetch<{ years: AcademicYearSelect[], activeYearId: number | null }>('/api/academic-years'),
    $fetch<LecturerSelect[]>('/api/lecturers'),
    $fetch<SubjectWithLecturers[]>('/api/subjects')
  ])
  return {
    academicYearsData,
    lecturers,
    subjects
  }
})

// Day Status logic
const { dayStatus } = useDayStatus()

// Date helpers
const formatIndonesianDate = (date: Date) => {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

const todayFormatted = computed(() => formatIndonesianDate(new Date()))

// Time calculations for subjects schedule
const dayMap = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const todayDayName = computed(() => {
  const now = new Date()
  return dayMap[now.getDay()]
})

const timeToMinutes = (timeStr: string | null) => {
  if (!timeStr) return 0
  const [h, m] = timeStr.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

const currentMinutes = ref(new Date().getHours() * 60 + new Date().getMinutes())

// Update current minutes every minute to keep active classes live
let timer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  timer = setInterval(() => {
    const now = new Date()
    currentMinutes.value = now.getHours() * 60 + now.getMinutes()
  }, 60000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

// Filter and classify today's subjects
const todaySubjects = computed(() => {
  if (!data.value?.subjects) return []

  // Filter by today's day name
  const filtered = data.value.subjects.filter(s => s.day === todayDayName.value)

  // Map activity status (current/incoming/passed)
  const processed = filtered.map((s) => {
    const startMin = s.timeStart ? timeToMinutes(s.timeStart) : 0
    const endMin = s.timeEnd ? timeToMinutes(s.timeEnd) : startMin + 90

    let statusType: 'current' | 'incoming' = 'incoming'
    if (currentMinutes.value >= startMin && currentMinutes.value <= endMin) {
      statusType = 'current'
    } else if (currentMinutes.value < startMin) {
      statusType = 'incoming'
    }

    return {
      subject: s,
      startMin,
      endMin,
      statusType,
      isPassed: currentMinutes.value > endMin
    }
  })

  // Filter out passed classes and sort chronologically by start time
  return processed
    .filter(item => !item.isPassed)
    .sort((a, b) => a.startMin - b.startMin)
})

// Active Academic Year Subjects
const activeYear = computed(() => {
  const activeId = data.value?.academicYearsData?.activeYearId
  if (!activeId || !data.value?.academicYearsData?.years) return null
  return data.value.academicYearsData.years.find(y => y.id === activeId) || null
})

const activeSubjects = computed(() => {
  if (!data.value?.subjects || !activeYear.value) return []
  return data.value.subjects.filter(s => s.academicYearId === activeYear.value?.id)
})

// Columns definitions for Tables
const subjectColumns = [
  { accessorKey: 'name', header: 'Mata Kuliah' },
  { accessorKey: 'dayTime', header: 'Jadwal' },
  { accessorKey: 'location', header: 'Lokasi' },
  { accessorKey: 'lecturers', header: 'Dosen Pengampu' }
]

const lecturerColumns = [
  { accessorKey: 'shortname', header: 'Singkatan' },
  { accessorKey: 'name', header: 'Nama Dosen' },
  { accessorKey: 'nip', header: 'NIP' },
  { accessorKey: 'phone', header: 'No HP / WhatsApp' }
]

// WhatsApp formatting
const formatWhatsAppLink = (phone: string) => {
  let cleaned = phone.replace(/[^0-9]/g, '')
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1)
  }
  return `https://wa.me/${cleaned}`
}
</script>

<template>
  <div class="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
    <!-- Hero Header / Greeting Section -->
    <div class="relative overflow-hidden rounded-3xl bg-linear-to-r from-fuchsia-600/10 via-indigo-600/5 to-transparent border border-fuchsia-500/10 p-8 sm:p-12 shadow-sm">
      <div class="relative z-10 space-y-6 max-w-3xl">
        <div class="space-y-2">
          <h1 class="text-3xl sm:text-5xl font-extrabold text-highlighted tracking-tight">
            Selamat Datang di Portal <span class="bg-linear-to-r from-fuchsia-600 to-indigo-600 bg-clip-text text-transparent">PSIK25B</span>
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
      <div class="absolute -right-16 -top-16 size-72 rounded-full bg-fuchsia-500/10 blur-3xl" />
      <div class="absolute -left-16 -bottom-16 size-72 rounded-full bg-indigo-500/5 blur-3xl" />
    </div>

    <!-- Main Content Sections -->
    <div class="grid grid-cols-1 gap-8">
      <!-- Section: Jadwal Hari Ini (Left Side, Span 2 on large screens) -->
      <div class="space-y-6">
        <div class="flex items-center justify-between border-b border-subtle pb-4">
          <h2 class="text-2xl font-bold text-highlighted flex items-center gap-2.5">
            <UIcon
              name="i-lucide-calendar"
              class="text-primary size-6"
            />
            Jadwal Hari Ini
          </h2>
        </div>

        <!-- 1. National Holiday Display -->
        <div
          v-if="dayStatus.status === 'Holiday'"
          class="space-y-4"
        >
          <TodayActivityCard
            type="holiday"
            :holiday-description="dayStatus.description"
            :date-str="dayStatus.dateStr"
          />
        </div>

        <!-- 2. Weekend Display -->
        <div
          v-else-if="dayStatus.status === 'Weekend'"
          class="space-y-4"
        >
          <TodayActivityCard
            type="holiday"
            holiday-description="Akhir Pekan (Hari Libur)"
            :date-str="dayStatus.dateStr || todayFormatted"
          />
        </div>

        <!-- 3. Weekday Classes List -->
        <div
          v-else
          class="space-y-4"
        >
          <div
            v-if="todaySubjects.length > 0"
            class="space-y-4"
          >
            <TodayActivityCard
              v-for="item in todaySubjects"
              :key="item.subject.id"
              :type="item.statusType"
              :subject="item.subject"
            />
          </div>
          <!-- Empty State: No subjects scheduled today or all have finished -->
          <div
            v-else
            class="flex flex-col items-center justify-center py-12 px-6 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl text-center"
          >
            <div class="p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-full text-muted mb-4">
              <UIcon
                name="i-lucide-calendar-clock"
                class="size-10"
              />
            </div>
            <h3 class="text-lg font-bold text-highlighted">
              Tidak Ada Jadwal Tersisa
            </h3>
            <p class="text-sm text-muted max-w-sm mt-1">
              Tidak ada perkuliahan yang terjadwal untuk sisa hari ini. Nikmati waktu istirahat Anda!
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Section: Jadwal Mata Kuliah -->
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
          :data="activeSubjects"
          :columns="subjectColumns"
        >
          <template #name-cell="{ row }">
            <div class="min-w-35 max-w-60 whitespace-normal wrap-break-word text-sm font-semibold text-highlighted">
              {{ row.original.name || '-' }}
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
            <div class="min-w-25 whitespace-normal flex gap-1">
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
          v-if="activeSubjects.length === 0"
          class="text-center py-8 text-muted text-sm"
        >
          Tidak ada mata kuliah aktif di tahun ajaran saat ini.
        </div>
      </UCard>
    </div>

    <!-- Section: Data Dosen -->
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
          :data="data?.lecturers || []"
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
          v-if="!data?.lecturers || data.lecturers.length === 0"
          class="text-center py-8 text-muted text-sm"
        >
          Belum ada data dosen terdaftar.
        </div>
      </UCard>
    </div>
  </div>
</template>
