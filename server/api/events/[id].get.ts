import { scheduleService } from '../../services/schedule.service'
import { AppException } from '../../utils/exceptions'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    if (!id) {
      throw createError({ statusCode: 400, statusMessage: 'ID event tidak valid' })
    }
    return await scheduleService.getEventById(Number(id))
  } catch (err: unknown) {
    if (err instanceof AppException) {
      throw createError({ statusCode: err.statusCode, statusMessage: err.message })
    }
    throw err
  }
})
