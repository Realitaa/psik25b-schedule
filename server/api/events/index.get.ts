import type { EventSelect } from '#shared/types'
import { eventService } from '../../services/event.service'
import { defineApiHandler } from '../../utils/handler'

export default defineApiHandler(async (): Promise<EventSelect[]> => {
  return await eventService.getEvents()
})
