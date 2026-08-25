import { z } from 'zod'
import { scheduleService } from '../../services/schedule.service'
import { defineApiHandler } from '../../utils/handler'
import { parseIdParam, validateBody } from '../../utils/request'

const updateLecturerSchema = z.object({
  name: z.string().min(1).optional(),
  shortname: z.string().min(1).optional(),
  nip: z.string().nullable().optional(),
  phone: z.string().nullable().optional()
})

export default defineApiHandler(async (event) => {
  const id = parseIdParam(event, 'id', 'ID dosen tidak valid')
  const body = await validateBody(event, updateLecturerSchema)
  return await scheduleService.updateLecturer(id, body)
})
