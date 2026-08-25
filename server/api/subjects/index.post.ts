import { z } from 'zod'
import { scheduleService } from '../../services/schedule.service'
import { defineApiHandler } from '../../utils/handler'
import { validateBody } from '../../utils/request'

const subjectSchema = z.object({
  academicYearId: z.number().nullable().optional(),
  name: z.string().min(1, 'Nama mata kuliah wajib diisi'),
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
  const body = await validateBody(event, subjectSchema)
  return await scheduleService.createSubject(body)
})
