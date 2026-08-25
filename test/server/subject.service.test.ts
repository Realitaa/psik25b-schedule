import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SubjectService } from '../../server/services/subject.service'
import { subjectRepository } from '../../server/repositories/subject.repository'
import { lecturerRepository } from '../../server/repositories/lecturer.repository'

describe('SubjectService Feature Tests', () => {
  let service: SubjectService

  beforeEach(() => {
    service = new SubjectService()
    vi.clearAllMocks()
  })

  it('should calculate auto-expiry endDate for replacement subject', async () => {
    vi.spyOn(lecturerRepository, 'findByShortnames').mockResolvedValue([])
    const createSpy = vi.spyOn(subjectRepository, 'create').mockResolvedValue({
      id: 10,
      academicYearId: 1,
      name: 'Algoritma Pengganti',
      isOnline: false,
      isReplacement: true,
      building: 'Fasilkom',
      floor: '2',
      room: 'Lab 1',
      timeStart: '08:00',
      timeEnd: '10:30',
      day: 'Kamis',
      endDate: '2026-05-20T10:30:00.000Z',
      createdAt: null,
      lecturers: []
    })

    await service.createSubject({
      academicYearId: 1,
      name: 'Algoritma Pengganti',
      isReplacement: true,
      day: 'Kamis',
      timeStart: '08:00',
      timeEnd: '10:30'
    })

    expect(createSpy).toHaveBeenCalled()
    const callArgs = createSpy.mock.calls[0]?.[0]
    expect(callArgs?.isReplacement).toBe(true)
    expect(callArgs?.endDate).toBeDefined()
  })
})
