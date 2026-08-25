import type { AcademicYearsResponse } from '#shared/types'
import { academicYearService } from '../../services/academic-year.service'
import { defineApiHandler } from '../../utils/handler'

export default defineApiHandler(async (): Promise<AcademicYearsResponse> => {
  const [years, active] = await Promise.all([
    academicYearService.getAcademicYears(),
    academicYearService.getActiveAcademicYear()
  ])
  return {
    years,
    activeYearId: active?.id ?? null
  }
})
