import { z } from 'zod'
import type { SubjectWithLecturers } from '#shared/types'
import { subjectService } from '../../services/subject.service'
import { defineApiHandler } from '../../utils/handler'
import { parseIdParam, validateBody } from '../../utils/request'

const updateSubjectSchema = z.object({
  academicYearId: z.number().int().nullable().optional(),
  name: z.string().min(1, 'Nama mata kuliah wajib diisi').optional(),
  lecturerShortnames: z.array(z.string()).optional()
})

export default defineApiHandler(async (event): Promise<SubjectWithLecturers> => {
  const id = parseIdParam(event)
  const body = await validateBody(event, updateSubjectSchema)
  return await subjectService.updateSubject(id, body)
})
