import { z } from 'zod'
import type { SubjectWithLecturers } from '#shared/types'
import { subjectService } from '../../services/subject.service'
import { defineApiHandler } from '../../utils/handler'
import { validateBody } from '../../utils/request'

const createSubjectSchema = z.object({
  academicYearId: z.number().int().nullable().optional(),
  name: z.string().min(1, 'Nama mata kuliah wajib diisi'),
  lecturerShortnames: z.array(z.string()).optional()
})

export default defineApiHandler(async (event): Promise<SubjectWithLecturers> => {
  const body = await validateBody(event, createSubjectSchema)
  return await subjectService.createSubject(body)
})
