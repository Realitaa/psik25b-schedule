export const DAYS_INDONESIAN = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'] as const
export const DAYS_LIST: string[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']

export const DAY_ORDER_MAP: Record<string, number> = {
  Senin: 1,
  Selasa: 2,
  Rabu: 3,
  Kamis: 4,
  Jumat: 5,
  Sabtu: 6,
  Minggu: 7
}

export const DAY_INDEX_MAP: Record<string, number> = {
  Minggu: 0,
  Senin: 1,
  Selasa: 2,
  Rabu: 3,
  Kamis: 4,
  Jumat: 5,
  Sabtu: 6
}

export function formatIndonesianDate(date?: Date | string | number | null, options?: Intl.DateTimeFormatOptions): string {
  if (!date) return ''
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
  if (Number.isNaN(d.getTime())) return ''

  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Jakarta',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }

  return new Intl.DateTimeFormat('id-ID', options || defaultOptions).format(d)
}

export function formatIndonesianDateTime(date?: Date | string | number | null): string {
  if (!date) return ''
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
  if (Number.isNaN(d.getTime())) return ''

  return d.toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).replace(/\./g, ':') + ' WIB'
}

export function formatEventEndDate(dateStr?: string | null, fallback = 'Tanpa batas waktu (Permanen)'): string {
  if (!dateStr) return fallback
  try {
    const d = new Date(dateStr)
    if (Number.isNaN(d.getTime())) return dateStr
    return d.toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).replace(/\./g, ':') + ' WIB'
  } catch {
    return dateStr
  }
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

export function calculateNextScheduleOccurrence(
  day?: string | null,
  timeEnd?: string | null,
  baseDate?: Date
): string | null {
  if (!day || !timeEnd) return null
  const targetDay = DAY_INDEX_MAP[day]
  if (targetDay === undefined) return null

  const now = baseDate || new Date()
  const wibTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }))
  const currentDay = wibTime.getDay()
  const daysUntil = (targetDay - currentDay + 7) % 7

  const [hours = 0, minutes = 0] = timeEnd.split(':').map(Number)
  const targetDate = new Date(wibTime)
  targetDate.setDate(wibTime.getDate() + daysUntil)
  targetDate.setHours(hours, minutes, 0, 0)

  if (daysUntil === 0 && targetDate.getTime() <= wibTime.getTime()) {
    targetDate.setDate(targetDate.getDate() + 7)
  }

  const y = targetDate.getFullYear()
  const m = String(targetDate.getMonth() + 1).padStart(2, '0')
  const d = String(targetDate.getDate()).padStart(2, '0')
  const h = String(hours).padStart(2, '0')
  const min = String(minutes).padStart(2, '0')

  return new Date(`${y}-${m}-${d}T${h}:${min}:00+07:00`).toISOString()
}

export function sortSchedulesByDayAndTime<T extends { day?: string | null, timeStart?: string | null }>(schedulesList: T[]): T[] {
  return [...schedulesList].sort((a, b) => {
    const dayA = DAY_ORDER_MAP[a.day || ''] || 99
    const dayB = DAY_ORDER_MAP[b.day || ''] || 99

    if (dayA !== dayB) {
      return dayA - dayB
    }

    return timeToMinutes(a.timeStart) - timeToMinutes(b.timeStart)
  })
}

export const sortSubjectsBySchedule = sortSchedulesByDayAndTime

export function classifySubjectStatus(
  timeStart?: string | null,
  timeEnd?: string | null,
  currentMinutes?: number
): { statusType: 'current' | 'incoming', isPassed: boolean, startMin: number, endMin: number } {
  const startMin = timeStart ? timeToMinutes(timeStart) : 0
  const endMin = timeEnd ? timeToMinutes(timeEnd) : startMin + 90
  const nowMin = currentMinutes ?? (new Date().getHours() * 60 + new Date().getMinutes())

  let statusType: 'current' | 'incoming' = 'incoming'
  if (nowMin >= startMin && nowMin <= endMin) {
    statusType = 'current'
  } else if (nowMin < startMin) {
    statusType = 'incoming'
  }

  return {
    statusType,
    isPassed: nowMin > endMin,
    startMin,
    endMin
  }
}
