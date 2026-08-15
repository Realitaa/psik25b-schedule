export const DAYS_INDONESIAN = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'] as const
export const DAYS_LIST: string[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']

export function formatIndonesianDate(date?: Date | string | null): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(d)
}

export function formatYMDDate(date?: Date | null): string {
  const d = date || new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const dayNum = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${dayNum}`
}

export function timeToMinutes(timeStr?: string | null): number {
  if (!timeStr) return 0
  const [h, m] = timeStr.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
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
    formatYMDDate,
    timeToMinutes,
    DAYS_INDONESIAN,
    DAYS_LIST
  }
}
