import type { EventSelect } from '#shared/types'
import { eventService } from '../../services/event.service'
import { defineApiHandler } from '../../utils/handler'
import { parseIdParam } from '../../utils/request'

export default defineApiHandler(async (event): Promise<EventSelect> => {
  const id = parseIdParam(event, 'id', 'ID event tidak valid')
  return await eventService.getEventById(id)
})
