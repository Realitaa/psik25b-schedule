import { eventService } from '../../services/event.service'
import { defineApiHandler } from '../../utils/handler'
import { parseIdParam } from '../../utils/request'

export default defineApiHandler(async (event): Promise<{ success: boolean }> => {
  const id = parseIdParam(event, 'id', 'ID event tidak valid')
  await eventService.deleteEvent(id)
  return { success: true }
})
