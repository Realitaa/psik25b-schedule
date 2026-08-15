import { z } from 'zod'
import { scheduleService } from '../../services/schedule.service'
import { AppException, ValidationException } from '../../utils/exceptions'

const lecturerSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  shortname: z.string().min(1, 'Singkatan nama wajib diisi'),
  nip: z.string().nullable().optional(),
  phone: z.string().nullable().optional()
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const parseResult = lecturerSchema.safeParse(body)
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || 'Data dosen tidak valid'
      throw new ValidationException(firstError)
    }

    return await scheduleService.createLecturer(parseResult.data)
  } catch (err: unknown) {
    if (err instanceof AppException) {
      throw createError({ statusCode: err.statusCode, statusMessage: err.message })
    }
    throw err
  }
})
