import { z } from 'zod'
import type { ScheduleSelect } from '#shared/types'
import { scheduleService } from '../../services/schedule.service'
import { defineApiHandler } from '../../utils/handler'
import { parseIdParam, validateBody } from '../../utils/request'

const updateScheduleSchema = z.object({
  subjectId: z.number().optional(),
  type: z.enum(['regular', 'temporary_move', 'one_off'] as const).optional(),
  parentScheduleId: z.number().nullable().optional(),
  status: z.enum(['active', 'skipped', 'ended'] as const).optional(),
  isOnline: z.boolean().optional(),
  building: z.string().nullable().optional(),
  floor: z.string().nullable().optional(),
  room: z.string().nullable().optional(),
  day: z.string().min(1).optional(),
  timeStart: z.string().min(1).optional(),
  timeEnd: z.string().min(1).optional(),
  endDate: z.string().nullable().optional()
})

export default defineApiHandler(async (event): Promise<ScheduleSelect> => {
  const id = parseIdParam(event)
  const body = await validateBody(event, updateScheduleSchema)
  return await scheduleService.updateSchedule(id, body)
})
