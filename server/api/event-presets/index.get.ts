import type { EventPresetSelect } from '#shared/types'
import { eventPresetService } from '../../services/event-preset.service'
import { defineApiHandler } from '../../utils/handler'

export default defineApiHandler(async (): Promise<EventPresetSelect[]> => {
  return await eventPresetService.getPresets()
})
