import { z } from 'zod'
import type { AcademicYearSelect } from '#shared/types'
import { academicYearService } from '../../services/academic-year.service'
import { defineApiHandler } from '../../utils/handler'
import { validateBody } from '../../utils/request'

const createAcademicYearSchema = z.object({
  yearStart: z.number().int().min(2000, 'Tahun mulai minimal 2000'),
  yearEnd: z.number().int().min(2000, 'Tahun selesai minimal 2000'),
  semester: z.enum(['ganjil', 'genap'] as const, {
    message: 'Semester harus bernilai "ganjil" atau "genap"'
  }),
  isCurrentActiveYear: z.boolean().optional()
})

export default defineApiHandler(async (event): Promise<AcademicYearSelect> => {
  const body = await validateBody(event, createAcademicYearSchema)
  return await academicYearService.createAcademicYear(body)
})
