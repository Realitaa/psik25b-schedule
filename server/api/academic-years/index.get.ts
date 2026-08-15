import { scheduleService } from '../../services/schedule.service'

export default defineEventHandler(async () => {
  const years = await scheduleService.getAcademicYears()
  const activeYear = await scheduleService.getActiveAcademicYear()
  return {
    years,
    activeYearId: activeYear ? activeYear.id : null
  }
})
