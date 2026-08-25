import { z } from 'zod'
import type { LecturerSelect } from '#shared/types'
import { lecturerService } from '../../services/lecturer.service'
import { defineApiHandler } from '../../utils/handler'
import { parseIdParam, validateBody } from '../../utils/request'

const updateLecturerSchema = z.object({
  name: z.string().min(1, 'Nama dosen wajib diisi').optional(),
  shortname: z.string().min(1, 'Kode singkatan dosen wajib diisi').max(20, 'Kode singkatan maksimal 20 karakter').optional(),
  nip: z.string().nullable().optional(),
  phone: z.string().nullable().optional()
})

export default defineApiHandler(async (event): Promise<LecturerSelect> => {
  const id = parseIdParam(event, 'id', 'ID dosen tidak valid')
  const body = await validateBody(event, updateLecturerSchema)
  return await lecturerService.updateLecturer(id, body)
})
