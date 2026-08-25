import { z } from 'zod'
import { scheduleService } from '../../services/schedule.service'
import { defineApiHandler } from '../../utils/handler'
import { validateBody } from '../../utils/request'

const activeSchema = z.object({
  id: z.number().nullable()
})

export default defineApiHandler(async (event) => {
  const body = await validateBody(event, activeSchema)
  await scheduleService.setActiveAcademicYear(body.id)
  return { success: true }
})
