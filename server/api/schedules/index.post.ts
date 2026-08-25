import { z } from 'zod'
import type { ScheduleSelect } from '#shared/types'
import { scheduleService } from '../../services/schedule.service'
import { defineApiHandler } from '../../utils/handler'
import { validateBody } from '../../utils/request'

const createScheduleSchema = z.object({
  subjectId: z.number({ error: 'Mata kuliah wajib dipilih' }),
  type: z.enum(['regular', 'temporary_move', 'one_off'] as const).optional(),
  parentScheduleId: z.number().nullable().optional(),
  status: z.enum(['active', 'skipped', 'ended'] as const).optional(),
  isOnline: z.boolean().optional(),
  building: z.string().nullable().optional(),
  floor: z.string().nullable().optional(),
  room: z.string().nullable().optional(),
  day: z.string().min(1, 'Hari wajib diisi'),
  timeStart: z.string().min(1, 'Jam mulai wajib diisi'),
  timeEnd: z.string().min(1, 'Jam selesai wajib diisi'),
  endDate: z.string().nullable().optional()
})

export default defineApiHandler(async (event): Promise<ScheduleSelect> => {
  const body = await validateBody(event, createScheduleSchema)
  return await scheduleService.createSchedule(body)
})
