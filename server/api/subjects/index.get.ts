import type { SubjectWithLecturers } from '#shared/types'
import { subjectService } from '../../services/subject.service'
import { defineApiHandler } from '../../utils/handler'

export default defineApiHandler(async (): Promise<SubjectWithLecturers[]> => {
  return await subjectService.getSubjects()
})
