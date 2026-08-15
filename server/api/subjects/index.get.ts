import { scheduleService } from '../../services/schedule.service'

export default defineEventHandler(async () => {
  return await scheduleService.getSubjects()
})
