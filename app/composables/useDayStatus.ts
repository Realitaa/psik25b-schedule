import type { HolidayItem, DayStatusResult } from '#shared/types'
import { formatYMDDate } from '#shared/utils/date'

export function useDayStatus() {
  const dayStatus = ref<DayStatusResult>({
    status: 'Weekday',
    description: 'Hari Kerja',
    dateStr: ''
  })
  const loading = ref(false)

  async function checkDayStatus(customDate?: Date) {
    loading.value = true
    const now = customDate || new Date()
    const dayOfWeek = now.getDay() // 0 = Sunday, 6 = Saturday

    const year = now.getFullYear()
    const month = now.getMonth() + 1
    const dateStr = formatYMDDate(now)

    // 1. Weekend Check (Sabtu / Minggu)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      dayStatus.value = {
        status: 'Weekend',
        description: 'Akhir Pekan',
        dateStr
      }
      loading.value = false
      return dayStatus.value
    }

    // 2. Weekday -> Fetch Holidays API
    try {
      const holidays = await $fetch<HolidayItem[]>(`/api/holidays?year=${year}&month=${month}`)
      const foundHoliday = holidays.find(h => h.date === dateStr)

      if (foundHoliday) {
        dayStatus.value = {
          status: 'Holiday',
          description: foundHoliday.description,
          dateStr
        }
      } else {
        dayStatus.value = {
          status: 'Weekday',
          description: 'Hari Kuliah',
          dateStr
        }
      }
    } catch (err) {
      console.error('[useDayStatus error]', err)
      dayStatus.value = {
        status: 'Weekday',
        description: 'Hari Kuliah',
        dateStr
      }
    } finally {
      loading.value = false
    }

    return dayStatus.value
  }

  onMounted(() => {
    checkDayStatus()
  })

  return {
    dayStatus,
    loading,
    checkDayStatus
  }
}
