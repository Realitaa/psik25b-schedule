import { z } from 'zod'
import { scheduleService } from '../../services/schedule.service'
import { defineApiHandler } from '../../utils/handler'
import { validateBody } from '../../utils/request'

const lecturerSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  shortname: z.string().min(1, 'Singkatan nama wajib diisi'),
  nip: z.string().nullable().optional(),
  phone: z.string().nullable().optional()
})

export default defineApiHandler(async (event) => {
  const body = await validateBody(event, lecturerSchema)
  return await scheduleService.createLecturer(body)
})
