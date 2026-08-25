import { z } from 'zod'
import { scheduleService } from '../../services/schedule.service'
import { defineApiHandler } from '../../utils/handler'
import { parseIdParam, validateBody } from '../../utils/request'

const updateSubjectSchema = z.object({
  academicYearId: z.number().nullable().optional(),
  name: z.string().min(1).optional(),
  isOnline: z.boolean().optional(),
  isReplacement: z.boolean().optional(),
  building: z.string().nullable().optional(),
  floor: z.string().nullable().optional(),
  room: z.string().nullable().optional(),
  timeStart: z.string().nullable().optional(),
  timeEnd: z.string().nullable().optional(),
  day: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  lecturerShortnames: z.array(z.string()).optional()
})

export default defineApiHandler(async (event) => {
  const id = parseIdParam(event, 'id', 'ID mata kuliah tidak valid')
  const body = await validateBody(event, updateSubjectSchema)
  return await scheduleService.updateSubject(id, body)
})
