import { z } from 'zod'
import { scheduleService } from '../../services/schedule.service'
import { defineApiHandler } from '../../utils/handler'
import { validateBody } from '../../utils/request'

const academicYearSchema = z.object({
  yearStart: z.number().int().min(2000),
  yearEnd: z.number().int().min(2000),
  semester: z.enum(['ganjil', 'genap']),
  isCurrentActiveYear: z.boolean().optional()
})

export default defineApiHandler(async (event) => {
  const body = await validateBody(event, academicYearSchema)
  return await scheduleService.createAcademicYear(body)
})
