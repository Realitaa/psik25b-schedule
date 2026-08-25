import { scheduleService } from '../../services/schedule.service'
import { defineApiHandler } from '../../utils/handler'
import { parseIdParam } from '../../utils/request'

export default defineApiHandler(async (event) => {
  const id = parseIdParam(event, 'id', 'ID mata kuliah tidak valid')
  await scheduleService.deleteSubject(id)
  return { success: true }
})
