import type { ScheduleWithSubject } from '#shared/types'
import { scheduleService } from '../../services/schedule.service'
import { defineApiHandler } from '../../utils/handler'
import { parseIdParam } from '../../utils/request'

export default defineApiHandler(async (event): Promise<ScheduleWithSubject> => {
  const id = parseIdParam(event)
  return await scheduleService.getScheduleById(id)
})
