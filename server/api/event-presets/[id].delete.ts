import { eventPresetService } from '../../services/event-preset.service'
import { defineApiHandler } from '../../utils/handler'
import { parseIdParam } from '../../utils/request'

export default defineApiHandler(async (event): Promise<{ success: boolean }> => {
  const id = parseIdParam(event)
  await eventPresetService.deletePreset(id)
  return { success: true }
})
