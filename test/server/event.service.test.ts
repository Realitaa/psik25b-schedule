import { describe, it, expect, vi, beforeEach } from 'vitest'
import { EventService } from '../../server/services/event.service'
import { eventRepository } from '../../server/repositories/event.repository'
import { scheduleRepository } from '../../server/repositories/schedule.repository'
import { NotFoundException } from '../../server/utils/exceptions'

describe('EventService Feature Tests', () => {
  let service: EventService

  beforeEach(() => {
    service = new EventService()
    vi.clearAllMocks()
  })

  it('should throw NotFoundException on create if schedule does not exist', async () => {
    vi.spyOn(scheduleRepository, 'findById').mockResolvedValue(undefined)

    await expect(service.createEvent({
      scheduleId: 999,
      title: 'Kuis 1'
    })).rejects.toThrow(NotFoundException)
  })

  it('should create event successfully for existing schedule', async () => {
    vi.spyOn(scheduleRepository, 'findById').mockResolvedValue({
      id: 1,
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
      subject: { id: 1, academicYearId: 1, name: 'Struktur Data', createdAt: null, lecturers: [] },
      events: []
    })

    vi.spyOn(eventRepository, 'create').mockResolvedValue({
      id: 5,
      scheduleId: 1,
      authorId: 1,
      presetId: null,
      title: 'Tugas 1',
      description: '<p>Kerjakan</p>',
      type: 'Tugas',
      color: '#f59e0b',
      icon: 'i-lucide-file-text',
      endDate: null,
      createdAt: null
    })

    const ev = await service.createEvent({
      scheduleId: 1,
      authorId: 1,
      title: 'Tugas 1',
      description: '<p>Kerjakan</p>',
      type: 'Tugas',
      color: '#f59e0b',
      icon: 'i-lucide-file-text'
    })

    expect(ev.title).toBe('Tugas 1')
    expect(ev.color).toBe('#f59e0b')
  })
})
