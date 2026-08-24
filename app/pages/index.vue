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

// Day Status & Date/Time & WhatsApp composables
const { dayStatus } = useDayStatus()
const { todayDayName, currentMinutes, todayFormatted, timeToMinutes } = useDateTime()
const { formatWhatsAppLink } = useWhatsApp()

// Event Detail Modal State
const selectedEvent = ref<{ event: any, subject: SubjectWithLecturers } | null>(null)
const isEventModalOpen = ref(false)

function openEventModal(event: any, subject: SubjectWithLecturers) {
  selectedEvent.value = { event, subject }
  isEventModalOpen.value = true
}

// Filter and classify today's subjects
const todaySubjects = computed(() => {
  const activeYearId = data.value?.academicYearsData?.activeYearId
  if (!activeYearId || !data.value?.subjects) return []

  // Filter by active academic year and today's day name
  const filtered = data.value.subjects.filter(
    s => s.academicYearId === activeYearId && s.day === todayDayName.value
  )

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

const dayOrderMap: Record<string, number> = {
  Senin: 1,
  Selasa: 2,
  Rabu: 3,
  Kamis: 4,
  Jumat: 5,
  Sabtu: 6,
  Minggu: 7
}

const activeSubjects = computed(() => {
  if (!data.value?.subjects || !activeYear.value) return []
  const filtered = data.value.subjects.filter(s => s.academicYearId === activeYear.value?.id)

  return filtered.sort((a, b) => {
    const dayA = dayOrderMap[a.day || ''] || 99
    const dayB = dayOrderMap[b.day || ''] || 99

    if (dayA !== dayB) {
      return dayA - dayB
    }

    return timeToMinutes(a.timeStart) - timeToMinutes(b.timeStart)
  })
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
</script>

<template>
  <div class="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
    <!-- Hero Header / Greeting Section -->
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
                  @click="openEventModal(ev, row.original)"
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

    <!-- Event Detail Modal -->
    <EventDetailModal
      v-model:open="isEventModalOpen"
      :event="selectedEvent ? { ...selectedEvent.event, subject: selectedEvent.subject } : null"
    />
  </div>
</template>
