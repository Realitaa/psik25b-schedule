import { z } from 'zod'
import { scheduleService } from '../../services/schedule.service'
import { AppException, ValidationException } from '../../utils/exceptions'

const updateEventSchema = z.object({
  subjectId: z.number().int().optional(),
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  endDate: z.string().nullable().optional()
})

export default defineEventHandler(async (event) => {
  try {
    const idParam = getRouterParam(event, 'id')
    const id = Number(idParam)
    if (!id || isNaN(id)) throw new ValidationException('ID event tidak valid')

    const body = await readBody(event)
    const parseResult = updateEventSchema.safeParse(body)
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || 'Data event tidak valid'
      throw new ValidationException(firstError)
    }

    return await scheduleService.updateEvent(id, parseResult.data)
  } catch (err: unknown) {
    if (err instanceof AppException) {
      throw createError({ statusCode: err.statusCode, statusMessage: err.message })
    }
    throw err
  }
})
