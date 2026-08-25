import { z } from 'zod'
import type { LecturerSelect } from '#shared/types'
import { lecturerService } from '../../services/lecturer.service'
import { defineApiHandler } from '../../utils/handler'
import { validateBody } from '../../utils/request'

const createLecturerSchema = z.object({
  name: z.string().min(1, 'Nama dosen wajib diisi'),
  shortname: z.string().min(1, 'Kode singkatan dosen wajib diisi').max(20, 'Kode singkatan maksimal 20 karakter'),
  nip: z.string().nullable().optional(),
  phone: z.string().nullable().optional()
})

export default defineApiHandler(async (event): Promise<LecturerSelect> => {
  const body = await validateBody(event, createLecturerSchema)
  return await lecturerService.createLecturer(body)
})
