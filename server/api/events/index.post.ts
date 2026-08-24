import { z } from 'zod'
import { scheduleService } from '../../services/schedule.service'
import { AppException, ValidationException } from '../../utils/exceptions'

const eventSchema = z.object({
  subjectId: z.number().int({ message: 'Mata kuliah wajib dipilih' }),
  title: z.string().min(1, 'Judul event wajib diisi'),
  description: z.string().nullable().optional(),
  endDate: z.string().nullable().optional()
})

export default defineEventHandler(async (event) => {
  try {
    const session = await getUserSession(event)
    const body = await readBody(event)
    const parseResult = eventSchema.safeParse(body)
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || 'Data event tidak valid'
      throw new ValidationException(firstError)
    }

    const eventData = {
      ...parseResult.data,
      authorId: session.user?.id || null
    }

    return await scheduleService.createEvent(eventData)
  } catch (err: unknown) {
    if (err instanceof AppException) {
      throw createError({ statusCode: err.statusCode, statusMessage: err.message })
    }
    throw err
  }
})
