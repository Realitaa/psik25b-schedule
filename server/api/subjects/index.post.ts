import { z } from 'zod'
import type { SubjectWithLecturers } from '#shared/types'
import { subjectService } from '../../services/subject.service'
import { defineApiHandler } from '../../utils/handler'
import { validateBody } from '../../utils/request'

const createSubjectSchema = z.object({
  academicYearId: z.number().int().nullable().optional(),
  name: z.string().min(1, 'Nama mata kuliah wajib diisi'),
  isOnline: z.boolean().optional(),
  isReplacement: z.boolean().optional(),
  building: z.string().nullable().optional(),
  floor: z.string().nullable().optional(),
  room: z.string().nullable().optional(),
  timeStart: z.string().nullable().optional(),
  timeEnd: z.string().nullable().optional(),
  day: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  lecturerShortnames: z.array(z.string()).optional()
})

export default defineApiHandler(async (event): Promise<SubjectWithLecturers> => {
  const body = await validateBody(event, createSubjectSchema)
  return await subjectService.createSubject(body)
})
