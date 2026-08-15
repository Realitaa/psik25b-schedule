import { z } from 'zod'
import { scheduleService } from '../../services/schedule.service'
import { AppException, ValidationException } from '../../utils/exceptions'

const updateLecturerSchema = z.object({
  name: z.string().min(1).optional(),
  shortname: z.string().min(1).optional(),
  nip: z.string().nullable().optional(),
  phone: z.string().nullable().optional()
})

export default defineEventHandler(async (event) => {
  try {
    const idParam = getRouterParam(event, 'id')
    const id = Number(idParam)
    if (!id || isNaN(id)) throw new ValidationException('ID dosen tidak valid')

    const body = await readBody(event)
    const parseResult = updateLecturerSchema.safeParse(body)
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || 'Data dosen tidak valid'
      throw new ValidationException(firstError)
    }

    return await scheduleService.updateLecturer(id, parseResult.data)
  } catch (err: unknown) {
    if (err instanceof AppException) {
      throw createError({ statusCode: err.statusCode, statusMessage: err.message })
    }
    throw err
  }
})
