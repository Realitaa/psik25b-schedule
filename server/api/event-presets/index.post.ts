import { z } from 'zod'
import type { EventPresetSelect } from '#shared/types'
import { eventPresetService } from '../../services/event-preset.service'
import { defineApiHandler } from '../../utils/handler'
import { validateBody } from '../../utils/request'

const createPresetSchema = z.object({
  name: z.string().min(1, 'Nama preset wajib diisi'),
  color: z.string().min(1, 'Warna preset wajib diisi'),
  icon: z.string().min(1, 'Icon preset wajib diisi')
})

export default defineApiHandler(async (event): Promise<EventPresetSelect> => {
  const body = await validateBody(event, createPresetSchema)
  return await eventPresetService.createPreset(body)
})
