import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ScheduleService } from '../../server/services/schedule.service'
import { scheduleRepository } from '../../server/repositories/schedule.repository'
import { subjectRepository } from '../../server/repositories/subject.repository'
import { NotFoundException } from '../../server/utils/exceptions'

describe('ScheduleService Feature Tests', () => {
  let service: ScheduleService

  beforeEach(() => {
    service = new ScheduleService()
    vi.clearAllMocks()
  })

  it('should create regular schedule for subject', async () => {
    vi.spyOn(subjectRepository, 'findById').mockResolvedValue({
      id: 1,
      academicYearId: 1,
      name: 'Pemrograman Web Lanjut',
      createdAt: '2026-01-01',
      lecturers: []
    })

    const createSpy = vi.spyOn(scheduleRepository, 'create').mockResolvedValue({
      id: 10,
      subjectId: 1,
      type: 'regular',
      parentScheduleId: null,
      status: 'active',
      skippedUntil: null,
      isOnline: false,
      building: 'Fasilkom',
      floor: '2',
      room: 'Lab 1',
      day: 'Senin',
      timeStart: '08:00',
      timeEnd: '10:30',
      endDate: null,
      createdAt: '2026-01-01'
    })

    const result = await service.createSchedule({
      subjectId: 1,
      type: 'regular',
      day: 'Senin',
      timeStart: '08:00',
      timeEnd: '10:30',
      building: 'Fasilkom',
      floor: '2',
      room: 'Lab 1'
    })

    expect(createSpy).toHaveBeenCalled()
    expect(result.type).toBe('regular')
    expect(result.status).toBe('active')
  })

  it('should auto-compute endDate for one_off / temporary_move schedule', async () => {
    vi.spyOn(subjectRepository, 'findById').mockResolvedValue({
      id: 1,
      academicYearId: 1,
      name: 'Pemrograman Web Lanjut',
      createdAt: '2026-01-01',
      lecturers: []
    })

    const createSpy = vi.spyOn(scheduleRepository, 'create').mockResolvedValue({
      id: 11,
      subjectId: 1,
      type: 'one_off',
      parentScheduleId: null,
      status: 'active',
      skippedUntil: null,
      isOnline: true,
      building: null,
      floor: null,
      room: null,
      day: 'Kamis',
      timeStart: '08:00',
      timeEnd: '10:30',
      endDate: '2026-05-20T10:30:00.000Z',
      createdAt: '2026-01-01'
    })

    await service.createSchedule({
      subjectId: 1,
      type: 'one_off',
      day: 'Kamis',
      timeStart: '08:00',
      timeEnd: '10:30',
      isOnline: true
    })

    expect(createSpy).toHaveBeenCalled()
    const callArgs = createSpy.mock.calls[0]?.[0]
    expect(callArgs?.type).toBe('one_off')
    expect(callArgs?.endDate).toBeDefined()
  })

  it('should handle skip action and set skippedUntil', async () => {
    vi.spyOn(scheduleRepository, 'findById').mockResolvedValue({
      id: 10,
      subjectId: 1,
      type: 'regular',
      parentScheduleId: null,
      status: 'active',
      skippedUntil: null,
      isOnline: false,
      building: null,
      floor: null,
      room: null,
      day: 'Senin',
      timeStart: '08:00',
      timeEnd: '10:30',
      endDate: null,
      createdAt: null,
      subject: { id: 1, academicYearId: 1, name: 'Web', createdAt: null, lecturers: [] },
      events: []
    })

    const updateSpy = vi.spyOn(scheduleRepository, 'update').mockResolvedValue({
      id: 10,
      subjectId: 1,
      type: 'regular',
      parentScheduleId: null,
      status: 'skipped',
      skippedUntil: '2026-05-20T10:30:00.000Z',
      isOnline: false,
      building: null,
      floor: null,
      room: null,
      day: 'Senin',
      timeStart: '08:00',
      timeEnd: '10:30',
      endDate: null,
      createdAt: null
    })

    const res = await service.handleScheduleAction(10, { action: 'skip' })

    expect(updateSpy).toHaveBeenCalled()
    expect(res.status).toBe('skipped')
  })

  it('should handle end action and set status to ended', async () => {
    vi.spyOn(scheduleRepository, 'findById').mockResolvedValue({
      id: 10,
      subjectId: 1,
      type: 'regular',
      parentScheduleId: null,
      status: 'active',
      skippedUntil: null,
      isOnline: false,
      building: null,
      floor: null,
      room: null,
      day: 'Senin',
      timeStart: '08:00',
      timeEnd: '10:30',
      endDate: null,
      createdAt: null,
      subject: { id: 1, academicYearId: 1, name: 'Web', createdAt: null, lecturers: [] },
      events: []
    })

    const updateSpy = vi.spyOn(scheduleRepository, 'update').mockResolvedValue({
      id: 10,
      subjectId: 1,
      type: 'regular',
      parentScheduleId: null,
      status: 'ended',
      skippedUntil: null,
      isOnline: false,
      building: null,
      floor: null,
      room: null,
      day: 'Senin',
      timeStart: '08:00',
      timeEnd: '10:30',
      endDate: null,
      createdAt: null
    })

    const res = await service.handleScheduleAction(10, { action: 'end' })

    expect(updateSpy).toHaveBeenCalled()
    expect(res.status).toBe('ended')
  })

  it('should throw NotFoundException if schedule does not exist on action', async () => {
    vi.spyOn(scheduleRepository, 'findById').mockResolvedValue(undefined)

    await expect(service.handleScheduleAction(999, { action: 'skip' })).rejects.toThrow(NotFoundException)
  })
})
