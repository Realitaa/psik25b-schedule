import { z } from 'zod'
import { academicYearService } from '../../services/academic-year.service'
import { defineApiHandler } from '../../utils/handler'
import { validateBody } from '../../utils/request'

const setActiveYearSchema = z.object({
  id: z.number().int().nullable()
})

export default defineApiHandler(async (event): Promise<{ success: boolean }> => {
  const body = await validateBody(event, setActiveYearSchema)
  await academicYearService.setActiveAcademicYear(body.id)
  return { success: true }
})
