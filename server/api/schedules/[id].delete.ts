import { scheduleService } from '../../services/schedule.service'
import { defineApiHandler } from '../../utils/handler'
import { parseIdParam } from '../../utils/request'

export default defineApiHandler(async (event): Promise<{ success: boolean }> => {
  const id = parseIdParam(event)
  await scheduleService.deleteSchedule(id)
  return { success: true }
})
