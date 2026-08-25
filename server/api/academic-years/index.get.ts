import type { AcademicYearsResponse } from '#shared/types'
import { scheduleService } from '../../services/schedule.service'
import { defineApiHandler } from '../../utils/handler'

export default defineApiHandler(async (): Promise<AcademicYearsResponse> => {
  const years = await scheduleService.getAcademicYears()
  const activeYear = await scheduleService.getActiveAcademicYear()
  return {
    years,
    activeYearId: activeYear ? activeYear.id : null
  }
})
