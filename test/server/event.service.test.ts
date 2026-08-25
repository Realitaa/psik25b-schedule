import { describe, it, expect, vi, beforeEach } from 'vitest'
import { EventService } from '../../server/services/event.service'
import { eventRepository } from '../../server/repositories/event.repository'
import { subjectRepository } from '../../server/repositories/subject.repository'
import { NotFoundException } from '../../server/utils/exceptions'

describe('EventService Feature Tests', () => {
  let service: EventService

  beforeEach(() => {
    service = new EventService()
    vi.clearAllMocks()
  })

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
