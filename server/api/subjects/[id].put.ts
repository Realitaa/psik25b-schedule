import { z } from 'zod'
import { scheduleService } from '../../services/schedule.service'
import { AppException, ValidationException } from '../../utils/exceptions'

const updateSubjectSchema = z.object({
  academicYearId: z.number().nullable().optional(),
  name: z.string().min(1).optional(),
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
    const idParam = getRouterParam(event, 'id')
    const id = Number(idParam)
    if (!id || isNaN(id)) throw new ValidationException('ID mata kuliah tidak valid')

    const body = await readBody(event)
    const parseResult = updateSubjectSchema.safeParse(body)
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || 'Data mata kuliah tidak valid'
      throw new ValidationException(firstError)
    }

    return await scheduleService.updateSubject(id, parseResult.data)
  } catch (err: unknown) {
    if (err instanceof AppException) {
      throw createError({ statusCode: err.statusCode, statusMessage: err.message })
    }
    throw err
  }
})
