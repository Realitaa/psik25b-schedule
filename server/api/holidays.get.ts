import type { HolidayAPIResponse, HolidayItem } from '#shared/types'

function getSecondsUntilEndOfMonth(): number {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  // Last second of current month
  const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999)
  const diffInSeconds = Math.floor((endOfMonth.getTime() - now.getTime()) / 1000)
  return Math.max(diffInSeconds, 60) // Fallback minimum 60 seconds
}

export default defineCachedEventHandler(async (event): Promise<HolidayItem[]> => {
  const query = getQuery(event)
  const now = new Date()
  const year = query.year ? String(query.year) : String(now.getFullYear())
  const month = query.month ? String(query.month) : String(now.getMonth() + 1)

  try {
    const res = await $fetch<HolidayAPIResponse>(`https://api-hari-libur.vercel.app/api?year=${year}&month=${month}`)
    if (res && res.data) {
      return res.data
    }
    return []
  } catch (err) {
    console.error('[Holidays API Error]', err)
    return []
  }
}, {
  maxAge: getSecondsUntilEndOfMonth(),
  name: 'holidays-api',
  getKey: (event) => {
    const query = getQuery(event)
    const now = new Date()
    const year = query.year || now.getFullYear()
    const month = query.month || (now.getMonth() + 1)
    return `${year}-${month}`
  }
})
