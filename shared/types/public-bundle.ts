import type { AcademicYearsResponse, AcademicYearSelect } from './academic-year'
import type { LecturerSelect } from './lecturer'
import type { ScheduleWithSubject } from './schedule'

export interface PublicScheduleBundle {
  version: string
  activeYear: AcademicYearSelect | null
  academicYearsData: AcademicYearsResponse
  lecturers: LecturerSelect[]
  schedules: ScheduleWithSubject[]
  cachedAt: string
}
