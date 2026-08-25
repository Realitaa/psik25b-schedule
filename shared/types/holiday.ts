export interface HolidayItem {
  date: string
  description: string
}

export interface HolidayAPIResponse {
  status: string
  code: number
  data: HolidayItem[]
  message: string
}

export type DayStatusType = 'Weekend' | 'Holiday' | 'Weekday'

export interface DayStatusResult {
  status: DayStatusType
  description: string
  dateStr: string
}
