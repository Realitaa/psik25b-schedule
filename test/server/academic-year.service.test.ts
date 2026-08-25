import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AcademicYearService } from '../../server/services/academic-year.service'
import { academicYearRepository } from '../../server/repositories/academic-year.repository'
import { NotFoundException } from '../../server/utils/exceptions'

describe('AcademicYearService Feature Tests', () => {
  let service: AcademicYearService

  beforeEach(() => {
    service = new AcademicYearService()
    vi.clearAllMocks()
  })

  it('should create academic year and set active if isCurrentActiveYear is true', async () => {
    const mockCreated = {
      id: 1,
      yearStart: 2026,
      yearEnd: 2027,
      semester: 'ganjil' as const,
      isCurrentActiveYear: true,
      createdAt: '2026-01-01'
    }

    vi.spyOn(academicYearRepository, 'create').mockResolvedValue(mockCreated)
    const setActiveSpy = vi.spyOn(academicYearRepository, 'setActiveYear').mockResolvedValue()

    const result = await service.createAcademicYear({
      yearStart: 2026,
      yearEnd: 2027,
      semester: 'ganjil',
      isCurrentActiveYear: true
    })

    expect(result).toEqual(mockCreated)
    expect(setActiveSpy).toHaveBeenCalledWith(1)
  })

  it('should throw NotFoundException if setting active on non-existing year', async () => {
    vi.spyOn(academicYearRepository, 'findById').mockResolvedValue(undefined)

    await expect(service.setActiveAcademicYear(999)).rejects.toThrow(NotFoundException)
  })
})
