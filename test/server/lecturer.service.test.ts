import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LecturerService } from '../../server/services/lecturer.service'
import { lecturerRepository } from '../../server/repositories/lecturer.repository'
import { ConflictException } from '../../server/utils/exceptions'

describe('LecturerService Feature Tests', () => {
  let service: LecturerService

  beforeEach(() => {
    service = new LecturerService()
    vi.clearAllMocks()
  })

  it('should throw ConflictException if lecturer shortname already exists on create', async () => {
    vi.spyOn(lecturerRepository, 'findByShortname').mockResolvedValue({
      id: 1,
      name: 'Dr. Jane',
      shortname: 'JD',
      nip: null,
      phone: null,
      createdAt: null
    })

    await expect(service.createLecturer({
      name: 'John Doe',
      shortname: 'JD'
    })).rejects.toThrow(ConflictException)
  })

  it('should create lecturer if shortname is unique', async () => {
    vi.spyOn(lecturerRepository, 'findByShortname').mockResolvedValue(undefined)
    vi.spyOn(lecturerRepository, 'create').mockResolvedValue({
      id: 2,
      name: 'Dr. Ahmad',
      shortname: 'AH',
      nip: null,
      phone: null,
      createdAt: null
    })

    const created = await service.createLecturer({
      name: 'Dr. Ahmad',
      shortname: 'AH'
    })

    expect(created.shortname).toBe('AH')
  })
})
