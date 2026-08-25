import { scheduleService } from '../../services/schedule.service'
import { defineApiHandler } from '../../utils/handler'

export default defineApiHandler(async () => {
  return await scheduleService.getEvents()
})
