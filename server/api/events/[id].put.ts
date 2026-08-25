import { z } from 'zod'
import type { EventSelect } from '#shared/types'
import { eventService } from '../../services/event.service'
import { defineApiHandler } from '../../utils/handler'
import { parseIdParam, validateBody } from '../../utils/request'

const updateEventSchema = z.object({
  subjectId: z.number().int().optional(),
  title: z.string().min(1, 'Judul event wajib diisi').optional(),
  description: z.string().nullable().optional(),
  endDate: z.string().nullable().optional()
})

export default defineApiHandler(async (event): Promise<EventSelect> => {
  const id = parseIdParam(event, 'id', 'ID event tidak valid')
  const body = await validateBody(event, updateEventSchema)
  return await eventService.updateEvent(id, body)
})
