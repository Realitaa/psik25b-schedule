import type { LecturerSelect } from '#shared/types'
import { lecturerService } from '../../services/lecturer.service'
import { defineApiHandler } from '../../utils/handler'

export default defineApiHandler(async (): Promise<LecturerSelect[]> => {
  return await lecturerService.getLecturers()
})
