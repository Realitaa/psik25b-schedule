import { scheduleService } from '../../services/schedule.service'
import { defineApiHandler } from '../../utils/handler'
import { parseIdParam } from '../../utils/request'

export default defineApiHandler(async (event) => {
  const id = parseIdParam(event, 'id', 'ID event tidak valid')
  return await scheduleService.getEventById(id)
})
