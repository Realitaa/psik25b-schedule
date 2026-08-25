import {
  DAYS_INDONESIAN,
  DAYS_LIST,
  DAY_ORDER_MAP,
  DAY_INDEX_MAP,
  formatIndonesianDate,
  formatIndonesianDateTime,
  formatEventEndDate,
  formatYMDDate,
  timeToMinutes,
  calculateNextScheduleOccurrence,
  sortSubjectsBySchedule,
  classifySubjectStatus
} from '#shared/utils/date'

export {
  DAYS_INDONESIAN,
  DAYS_LIST,
  DAY_ORDER_MAP,
  DAY_INDEX_MAP,
  formatIndonesianDate,
  formatIndonesianDateTime,
  formatEventEndDate,
  formatYMDDate,
  timeToMinutes,
  calculateNextScheduleOccurrence,
  sortSubjectsBySchedule,
  classifySubjectStatus
}

export function useDateTime() {
  const now = ref(new Date())
  let timer: ReturnType<typeof setInterval> | null = null

  onMounted(() => {
    timer = setInterval(() => {
      now.value = new Date()
    }, 60000)
  })

  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })

  const todayDayName = computed(() => DAYS_INDONESIAN[now.value.getDay()] || 'Senin')
  const currentMinutes = computed(() => now.value.getHours() * 60 + now.value.getMinutes())
  const todayFormatted = computed(() => formatIndonesianDate(now.value))

  return {
    now,
    todayDayName,
    currentMinutes,
    todayFormatted,
    formatIndonesianDate,
    formatIndonesianDateTime,
    formatEventEndDate,
    formatYMDDate,
    timeToMinutes,
    calculateNextScheduleOccurrence,
    sortSubjectsBySchedule,
    classifySubjectStatus,
    DAYS_INDONESIAN,
    DAYS_LIST
  }
}
