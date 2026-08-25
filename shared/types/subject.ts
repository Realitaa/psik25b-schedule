import type { LecturerSelect } from './lecturer'
import type { EventSelect } from './event'

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

export interface SubjectWithLecturers extends SubjectSelect {
  lecturers: LecturerSelect[]
  events?: EventSelect[]
}

export interface CreateSubjectDTO {
  academicYearId?: number | null
  name: string
  isOnline?: boolean
  isReplacement?: boolean
  building?: string | null
  floor?: string | null
  room?: string | null
  timeStart?: string | null
  timeEnd?: string | null
  day?: string | null
  endDate?: string | null
  lecturerShortnames?: string[]
}

export type UpdateSubjectDTO = Partial<CreateSubjectDTO>
