<script setup lang="ts">
import type {
  AcademicYearsResponse,
  LecturerSelect,
  ScheduleWithSubject,
  EventSelect
} from '#shared/types'
import { sortSchedulesByDayAndTime, classifySubjectStatus } from '#shared/utils/date'

// Fetch public schedule & lecturer data in parallel
const { data } = await useAsyncData('public-schedule-data', async () => {
  const [academicYearsData, lecturers, schedules] = await Promise.all([
    $fetch<AcademicYearsResponse>('/api/academic-years'),
    $fetch<LecturerSelect[]>('/api/lecturers'),
    $fetch<ScheduleWithSubject[]>('/api/schedules')
  ])
  return {
    academicYearsData,
    lecturers,
    schedules
  }
})

// Day Status & Date/Time composables
const { dayStatus } = useDayStatus()
const { todayDayName, currentMinutes, todayFormatted } = useDateTime()

// Event Detail Modal State
const selectedEvent = ref<{ event: EventSelect, schedule: ScheduleWithSubject } | null>(null)
const isEventModalOpen = ref(false)

function openEventModal(event: EventSelect, schedule: ScheduleWithSubject) {
  selectedEvent.value = { event, schedule }
  isEventModalOpen.value = true
}

// Active Academic Year
const activeYear = computed(() => {
  const activeId = data.value?.academicYearsData?.activeYearId
  if (!activeId || !data.value?.academicYearsData?.years) return null
  return data.value.academicYearsData.years.find(y => y.id === activeId) || null
})

// Filter and classify today's schedules
const todaySchedules = computed(() => {
  const activeYearId = data.value?.academicYearsData?.activeYearId
  if (!activeYearId || !data.value?.schedules) return []

  // Filter by active academic year, today's day name, and active status (exclude skipped & ended)
  const filtered = data.value.schedules.filter(
    s => s.subject?.academicYearId === activeYearId
      && s.day === todayDayName.value
      && s.status === 'active'
  )

  // Map activity status (current/incoming/passed)
  const processed = filtered.map((s) => {
    const { statusType, isPassed, startMin, endMin } = classifySubjectStatus(
      s.timeStart,
      s.timeEnd,
      currentMinutes.value
    )

    return {
      schedule: s,
      startMin,
      endMin,
      statusType,
      isPassed
    }
  })

  // Filter out passed classes and sort chronologically by start time
  return processed
    .filter(item => !item.isPassed)
    .sort((a, b) => a.startMin - b.startMin)
})

// Active Academic Year Schedules (all statuses for the table, sorted by schedule)
const activeSchedules = computed(() => {
  if (!data.value?.schedules || !activeYear.value) return []
  const filtered = data.value.schedules.filter(s => s.subject?.academicYearId === activeYear.value?.id)
  return sortSchedulesByDayAndTime(filtered)
})
</script>

<template>
  <div class="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
    <!-- Hero Header / Greeting Section -->
    <ScheduleHero :active-year="activeYear" />

    <!-- Main Content Sections -->
    <div class="grid grid-cols-1 gap-8">
      <!-- Section: Jadwal Hari Ini -->
      <ScheduleTodaySection
        :day-status="dayStatus"
        :today-schedules="todaySchedules"
        :today-formatted="todayFormatted"
      />
    </div>

    <!-- Section: Jadwal Mata Kuliah -->
    <ScheduleSubjectsTable
      :schedules="activeSchedules"
      @open-event="openEventModal"
    />

    <!-- Section: Data Dosen -->
    <ScheduleLecturersTable :lecturers="data?.lecturers || []" />

    <!-- Event Detail Modal -->
    <EventDetailModal
      v-model:open="isEventModalOpen"
      :event="selectedEvent ? { ...selectedEvent.event, schedule: selectedEvent.schedule } : null"
    />
  </div>
</template>
