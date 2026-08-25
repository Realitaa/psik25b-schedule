import type { AcademicYearsResponse, PublicScheduleBundle } from '#shared/types'
import { academicYearService } from '../../services/academic-year.service'
import { lecturerService } from '../../services/lecturer.service'
import { scheduleService } from '../../services/schedule.service'
import { defineApiHandler } from '../../utils/handler'

export default defineApiHandler(async (): Promise<PublicScheduleBundle> => {
  const [years, activeYear, lecturers, schedules] = await Promise.all([
    academicYearService.getAcademicYears(),
    academicYearService.getActiveAcademicYear(),
    lecturerService.getLecturers(),
    scheduleService.getSchedules()
  ])

  const academicYearsData: AcademicYearsResponse = {
    years,
    activeYearId: activeYear?.id ?? null
  }

  const nowIso = new Date().toISOString()

  return {
    version: nowIso,
    activeYear: activeYear || null,
    academicYearsData,
    lecturers,
    schedules,
    cachedAt: nowIso
  }
})
