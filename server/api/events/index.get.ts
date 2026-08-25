import type { EventWithSubject } from '#shared/types'
import { eventService } from '../../services/event.service'
import { defineApiHandler } from '../../utils/handler'

export default defineApiHandler(async (): Promise<EventWithSubject[]> => {
  return await eventService.getEvents()
})
