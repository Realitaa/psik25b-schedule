import { z } from 'zod'
import { scheduleService } from '../../services/schedule.service'
import { AppException, ValidationException } from '../../utils/exceptions'

const academicYearSchema = z.object({
  yearStart: z.number().int().min(2000),
  yearEnd: z.number().int().min(2000),
  semester: z.enum(['ganjil', 'genap']),
  isCurrentActiveYear: z.boolean().optional()
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const parseResult = academicYearSchema.safeParse(body)
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || 'Data tahun ajaran tidak valid'
      throw new ValidationException(firstError)
    }

    return await scheduleService.createAcademicYear(parseResult.data)
  } catch (err: unknown) {
    if (err instanceof AppException) {
      throw createError({ statusCode: err.statusCode, statusMessage: err.message })
    }
    throw err
  }
})
