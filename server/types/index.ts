import type { users, academicYears, lecturers, subjects, subjectLecturers } from '../db/schema'
import type {
  HolidayItem as SharedHolidayItem,
  HolidayAPIResponse as SharedHolidayAPIResponse,
  AcademicYearSelect as SharedAcademicYearSelect,
  LecturerSelect as SharedLecturerSelect,
  SubjectSelect as SharedSubjectSelect,
  SubjectWithLecturers as SharedSubjectWithLecturers,
  UserSessionPayload as SharedUserSessionPayload
} from '#shared/types'

// Re-export shared types for server files
export type HolidayItem = SharedHolidayItem
export type HolidayAPIResponse = SharedHolidayAPIResponse
export type AcademicYearSelect = SharedAcademicYearSelect
export type LecturerSelect = SharedLecturerSelect
export type SubjectSelect = SharedSubjectSelect
export type SubjectWithLecturers = SharedSubjectWithLecturers
export type UserSessionPayload = SharedUserSessionPayload

// User Entity Types
export type UserSelect = typeof users.$inferSelect
export type UserInsert = typeof users.$inferInsert

// AcademicYear Entity Types
export type AcademicYearInsert = typeof academicYears.$inferInsert

// Lecturer Entity Types
export type LecturerInsert = typeof lecturers.$inferInsert

// Subject Entity Types
export type SubjectInsert = typeof subjects.$inferInsert
export type SubjectLecturerSelect = typeof subjectLecturers.$inferSelect

// DTOs
export interface LoginDTO {
  username: string
  password: string
}

export interface CreateAcademicYearDTO {
  yearStart: number
  yearEnd: number
  semester: 'ganjil' | 'genap'
  isCurrentActiveYear?: boolean
}

export interface CreateLecturerDTO {
  name: string
  shortname: string
  nip?: string | null
  phone?: string | null
}

export interface CreateSubjectDTO {
  academicYearId?: number | null
  name: string
  building?: string | null
  floor?: string | null
  room?: string | null
  timeStart?: string | null
  timeEnd?: string | null
  day?: string | null
  lecturerShortnames?: string[]
}

declare module '#auth-utils' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface User extends UserSessionPayload {}

  interface UserSession {
    user?: User
    loggedInAt?: Date | string
  }
}
