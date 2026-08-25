import { z } from 'zod'
import type { EventSelect } from '#shared/types'
import { eventService } from '../../services/event.service'
import { defineApiHandler } from '../../utils/handler'
import { validateBody } from '../../utils/request'

const createEventSchema = z.object({
  subjectId: z.number().int({ message: 'ID mata kuliah wajib valid' }),
  title: z.string().min(1, 'Judul event wajib diisi'),
  description: z.string().nullable().optional(),
  endDate: z.string().nullable().optional()
})

export default defineApiHandler(async (event): Promise<EventSelect> => {
  const session = await getUserSession(event)
  const body = await validateBody(event, createEventSchema)

  return await eventService.createEvent({
    ...body,
    authorId: session?.user?.id
  })
})
