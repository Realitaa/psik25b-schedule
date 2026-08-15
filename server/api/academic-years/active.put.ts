import { z } from 'zod'
import { scheduleService } from '../../services/schedule.service'
import { AppException, ValidationException } from '../../utils/exceptions'

const activeSchema = z.object({
  id: z.number().nullable()
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const parseResult = activeSchema.safeParse(body)
    if (!parseResult.success) {
      throw new ValidationException('ID tahun ajaran tidak valid')
    }

    await scheduleService.setActiveAcademicYear(parseResult.data.id)
    return { success: true }
  } catch (err: unknown) {
    if (err instanceof AppException) {
      throw createError({ statusCode: err.statusCode, statusMessage: err.message })
    }
    throw err
  }
})
