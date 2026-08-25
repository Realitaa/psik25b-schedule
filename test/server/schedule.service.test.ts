import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ScheduleService } from '../../server/services/schedule.service'
import {
  academicYearRepository,
  lecturerRepository,
  subjectRepository,
  eventRepository
} from '../../server/repositories/schedule.repository'
import { ConflictException, NotFoundException } from '../../server/utils/exceptions'

describe('ScheduleService Feature Tests', () => {
  let service: ScheduleService

  beforeEach(() => {
    service = new ScheduleService()
    vi.clearAllMocks()
  })

  describe('Academic Years', () => {
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

  describe('Lecturers', () => {
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

  describe('Subjects', () => {
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

  describe('Events', () => {
    it('should throw NotFoundException on create if subject does not exist', async () => {
      vi.spyOn(subjectRepository, 'findById').mockResolvedValue(undefined)

      await expect(service.createEvent({
        subjectId: 999,
        title: 'Kuis 1'
      })).rejects.toThrow(NotFoundException)
    })

    it('should create event successfully for existing subject', async () => {
      vi.spyOn(subjectRepository, 'findById').mockResolvedValue({
        id: 1,
        academicYearId: 1,
        name: 'Struktur Data',
        isOnline: false,
        isReplacement: false,
        building: null,
        floor: null,
        room: null,
        timeStart: null,
        timeEnd: null,
        day: null,
        endDate: null,
        createdAt: null,
        lecturers: []
      })

      vi.spyOn(eventRepository, 'create').mockResolvedValue({
        id: 5,
        subjectId: 1,
        authorId: 1,
        title: 'Tugas 1',
        description: '<p>Kerjakan</p>',
        endDate: null,
        createdAt: null
      })

      const ev = await service.createEvent({
        subjectId: 1,
        authorId: 1,
        title: 'Tugas 1',
        description: '<p>Kerjakan</p>'
      })

      expect(ev.title).toBe('Tugas 1')
    })
  })
})
