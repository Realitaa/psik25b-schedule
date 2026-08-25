import { lecturerService } from '../../services/lecturer.service'
import { defineApiHandler } from '../../utils/handler'
import { parseIdParam } from '../../utils/request'

export default defineApiHandler(async (event): Promise<{ success: boolean }> => {
  const id = parseIdParam(event, 'id', 'ID dosen tidak valid')
  await lecturerService.deleteLecturer(id)
  return { success: true }
})
