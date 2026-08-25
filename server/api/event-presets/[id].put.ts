import { z } from 'zod'
import type { EventPresetSelect } from '#shared/types'
import { eventPresetService } from '../../services/event-preset.service'
import { defineApiHandler } from '../../utils/handler'
import { parseIdParam, validateBody } from '../../utils/request'

const updatePresetSchema = z.object({
  name: z.string().min(1).optional(),
  color: z.string().min(1).optional(),
  icon: z.string().min(1).optional()
})

export default defineApiHandler(async (event): Promise<EventPresetSelect> => {
  const id = parseIdParam(event)
  const body = await validateBody(event, updatePresetSchema)
  return await eventPresetService.updatePreset(id, body)
})
