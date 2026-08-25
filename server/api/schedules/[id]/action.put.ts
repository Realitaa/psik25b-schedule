import { z } from 'zod'
import type { ScheduleSelect } from '#shared/types'
import { scheduleService } from '../../../services/schedule.service'
import { defineApiHandler } from '../../../utils/handler'
import { parseIdParam, validateBody } from '../../../utils/request'

const scheduleActionSchema = z.object({
  action: z.enum(['skip', 'move', 'end', 'reset'] as const),
  movedDate: z.string().optional(),
  day: z.string().optional(),
  timeStart: z.string().optional(),
  timeEnd: z.string().optional(),
  isOnline: z.boolean().optional(),
  building: z.string().nullable().optional(),
  floor: z.string().nullable().optional(),
  room: z.string().nullable().optional()
})

export default defineApiHandler(async (event): Promise<ScheduleSelect> => {
  const id = parseIdParam(event)
  const body = await validateBody(event, scheduleActionSchema)
  return await scheduleService.handleScheduleAction(id, body)
})
