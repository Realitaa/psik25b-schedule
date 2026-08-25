<script setup lang="ts">
import type {
  AcademicYearsResponse,
  LecturerSelect,
  SubjectWithLecturers,
  EventSelect
} from '#shared/types'
import { sortSubjectsBySchedule, classifySubjectStatus } from '#shared/utils/date'

// Fetch public schedule & lecturer data in parallel
const { data } = await useAsyncData('public-schedule-data', async () => {
  const [academicYearsData, lecturers, subjects] = await Promise.all([
    $fetch<AcademicYearsResponse>('/api/academic-years'),
    $fetch<LecturerSelect[]>('/api/lecturers'),
    $fetch<SubjectWithLecturers[]>('/api/subjects')
  ])
  return {
    academicYearsData,
    lecturers,
    subjects
  }
})

// Day Status & Date/Time composables
const { dayStatus } = useDayStatus()
const { todayDayName, currentMinutes, todayFormatted } = useDateTime()

// Event Detail Modal State
const selectedEvent = ref<{ event: EventSelect, subject: SubjectWithLecturers } | null>(null)
const isEventModalOpen = ref(false)

function openEventModal(event: EventSelect, subject: SubjectWithLecturers) {
  selectedEvent.value = { event, subject }
  isEventModalOpen.value = true
}

// Active Academic Year
const activeYear = computed(() => {
  const activeId = data.value?.academicYearsData?.activeYearId
  if (!activeId || !data.value?.academicYearsData?.years) return null
  return data.value.academicYearsData.years.find(y => y.id === activeId) || null
})

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
    const { statusType, isPassed, startMin, endMin } = classifySubjectStatus(
      s.timeStart,
      s.timeEnd,
      currentMinutes.value
    )

    return {
      subject: s,
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

// Active Academic Year Subjects
const activeSubjects = computed(() => {
  if (!data.value?.subjects || !activeYear.value) return []
  const filtered = data.value.subjects.filter(s => s.academicYearId === activeYear.value?.id)
  return sortSubjectsBySchedule(filtered)
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
        :today-subjects="todaySubjects"
        :today-formatted="todayFormatted"
      />
    </div>

    <!-- Section: Jadwal Mata Kuliah -->
    <ScheduleSubjectsTable
      :subjects="activeSubjects"
      @open-event="openEventModal"
    />

    <!-- Section: Data Dosen -->
    <ScheduleLecturersTable :lecturers="data?.lecturers || []" />

    <!-- Event Detail Modal -->
    <EventDetailModal
      v-model:open="isEventModalOpen"
      :event="selectedEvent ? { ...selectedEvent.event, subject: selectedEvent.subject } : null"
    />
  </div>
</template>
