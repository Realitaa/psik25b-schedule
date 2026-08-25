import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SubjectService } from '../../server/services/subject.service'
import { subjectRepository } from '../../server/repositories/subject.repository'
import { lecturerRepository } from '../../server/repositories/lecturer.repository'
import { NotFoundException } from '../../server/utils/exceptions'

describe('SubjectService Feature Tests', () => {
  let service: SubjectService

  beforeEach(() => {
    service = new SubjectService()
    vi.clearAllMocks()
  })

  it('should create subject with assigned lecturers', async () => {
    vi.spyOn(lecturerRepository, 'findByShortnames').mockResolvedValue([
      { id: 2, name: 'Dr. John', shortname: 'JD', nip: null, phone: null, createdAt: null }
    ])
    const createSpy = vi.spyOn(subjectRepository, 'create').mockResolvedValue({
      id: 10,
      academicYearId: 1,
      name: 'Pemrograman Web Lanjut',
      createdAt: null,
      lecturers: [{ id: 2, name: 'Dr. John', shortname: 'JD', nip: null, phone: null, createdAt: null }]
    })

    const result = await service.createSubject({
      academicYearId: 1,
      name: 'Pemrograman Web Lanjut',
      lecturerShortnames: ['JD']
    })

    expect(createSpy).toHaveBeenCalledWith({
      academicYearId: 1,
      name: 'Pemrograman Web Lanjut'
    }, [2])
    expect(result.name).toBe('Pemrograman Web Lanjut')
  })

  it('should throw NotFoundException if updating non-existing subject', async () => {
    vi.spyOn(subjectRepository, 'findById').mockResolvedValue(undefined)

    await expect(service.updateSubject(999, { name: 'New Name' })).rejects.toThrow(NotFoundException)
  })
})
