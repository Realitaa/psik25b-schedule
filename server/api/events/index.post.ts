import { z } from 'zod'
import { scheduleService } from '../../services/schedule.service'
import { defineApiHandler } from '../../utils/handler'
import { validateBody } from '../../utils/request'

const eventSchema = z.object({
  subjectId: z.number().int({ message: 'Mata kuliah wajib dipilih' }),
  title: z.string().min(1, 'Judul event wajib diisi'),
  description: z.string().nullable().optional(),
  endDate: z.string().nullable().optional()
})

export default defineApiHandler(async (event) => {
  const session = await getUserSession(event)
  const body = await validateBody(event, eventSchema)

  const eventData = {
    ...body,
    authorId: session.user?.id || null
  }

  return await scheduleService.createEvent(eventData)
})
