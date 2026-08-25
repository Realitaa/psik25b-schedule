import type { LecturerSelect } from './lecturer'
import type { ScheduleSelect } from './schedule'

export interface SubjectSelect {
  id: number
  academicYearId: number | null
  name: string
  createdAt: string | null
}

export interface SubjectWithLecturers extends SubjectSelect {
  lecturers: LecturerSelect[]
  schedules?: ScheduleSelect[]
}

export interface CreateSubjectDTO {
  academicYearId?: number | null
  name: string
  lecturerShortnames?: string[]
}

export interface UpdateSubjectDTO {
  academicYearId?: number | null
  name?: string
  lecturerShortnames?: string[]
}
