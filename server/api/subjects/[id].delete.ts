import { subjectService } from '../../services/subject.service'
import { defineApiHandler } from '../../utils/handler'
import { parseIdParam } from '../../utils/request'

export default defineApiHandler(async (event): Promise<{ success: boolean }> => {
  const id = parseIdParam(event, 'id', 'ID mata kuliah tidak valid')
  await subjectService.deleteSubject(id)
  return { success: true }
})
