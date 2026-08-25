import { z } from 'zod'
import { scheduleService } from '../../services/schedule.service'
import { defineApiHandler } from '../../utils/handler'
import { parseIdParam, validateBody } from '../../utils/request'

const updateEventSchema = z.object({
  subjectId: z.number().int().optional(),
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  endDate: z.string().nullable().optional()
})

export default defineApiHandler(async (event) => {
  const id = parseIdParam(event, 'id', 'ID event tidak valid')
  const body = await validateBody(event, updateEventSchema)
  return await scheduleService.updateEvent(id, body)
})
