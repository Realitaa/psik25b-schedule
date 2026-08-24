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

export interface AcademicYearSelect {
  id: number
  yearStart: number
  yearEnd: number
  semester: 'ganjil' | 'genap'
  isCurrentActiveYear: boolean
  createdAt: string | null
}

export interface LecturerSelect {
  id: number
  name: string
  shortname: string
  nip: string | null
  phone: string | null
  createdAt: string | null
}

export interface SubjectSelect {
  id: number
  academicYearId: number | null
  name: string
  isOnline: boolean
  isReplacement: boolean
  building: string | null
  floor: string | null
  room: string | null
  timeStart: string | null
  timeEnd: string | null
  day: string | null
  endDate: string | null
  createdAt: string | null
}

export interface EventSelect {
  id: number
  subjectId: number
  title: string
  description: string | null
  endDate: string | null
  createdAt: string | null
}

export interface EventWithSubject extends EventSelect {
  subject: SubjectSelect
}

export interface SubjectWithLecturers extends SubjectSelect {
  lecturers: LecturerSelect[]
  events?: EventSelect[]
}

export interface UserSessionPayload {
  id: number
  username: string
  name: string | null
}
