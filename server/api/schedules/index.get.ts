import type { ScheduleWithSubject } from '#shared/types'
import { scheduleService } from '../../services/schedule.service'
import { defineApiHandler } from '../../utils/handler'

export default defineApiHandler(async (event): Promise<ScheduleWithSubject[]> => {
  const query = getQuery(event)
  const academicYearId = query.academicYearId ? Number(query.academicYearId) : undefined
  return await scheduleService.getSchedules(academicYearId)
})
