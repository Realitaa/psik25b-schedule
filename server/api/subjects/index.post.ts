import { z } from 'zod'
import { scheduleService } from '../../services/schedule.service'
import { AppException, ValidationException } from '../../utils/exceptions'

const subjectSchema = z.object({
  academicYearId: z.number().nullable().optional(),
  name: z.string().min(1, 'Nama mata kuliah wajib diisi'),
  building: z.string().nullable().optional(),
  floor: z.string().nullable().optional(),
  room: z.string().nullable().optional(),
  timeStart: z.string().nullable().optional(),
  timeEnd: z.string().nullable().optional(),
  day: z.string().nullable().optional(),
  lecturerShortnames: z.array(z.string()).optional()
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const parseResult = subjectSchema.safeParse(body)
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || 'Data mata kuliah tidak valid'
      throw new ValidationException(firstError)
    }

    return await scheduleService.createSubject(parseResult.data)
  } catch (err: unknown) {
    if (err instanceof AppException) {
      throw createError({ statusCode: err.statusCode, statusMessage: err.message })
    }
    throw err
  }
})
