import type {
  EventSelect,
  EventWithSubject,
  CreateEventDTO,
  UpdateEventDTO
} from '#shared/types'
import {
  eventRepository,
  type EventRepository
} from '../repositories/event.repository'
import {
  subjectRepository,
  type SubjectRepository
} from '../repositories/subject.repository'
import { NotFoundException } from '../utils/exceptions'

export class EventService {
  constructor(
    private readonly eventRepo: EventRepository = eventRepository,
    private readonly subjectRepo: SubjectRepository = subjectRepository
  ) {}

  async getEvents(): Promise<EventWithSubject[]> {
    return await this.eventRepo.findAll()
  }

  async getEventById(id: number): Promise<EventSelect> {
    const ev = await this.eventRepo.findById(id)
    if (!ev) throw new NotFoundException('Event tidak ditemukan')
    return ev
  }

  async createEvent(dto: CreateEventDTO): Promise<EventSelect> {
    const subject = await this.subjectRepo.findById(dto.subjectId)
    if (!subject) throw new NotFoundException('Mata kuliah tidak ditemukan')

    return await this.eventRepo.create({
      subjectId: dto.subjectId,
      authorId: dto.authorId || null,
      title: dto.title,
      description: dto.description || null,
      endDate: dto.endDate || null
    })
  }

  async updateEvent(id: number, dto: UpdateEventDTO): Promise<EventSelect> {
    const existing = await this.eventRepo.findById(id)
    if (!existing) throw new NotFoundException('Event tidak ditemukan')

    if (dto.subjectId !== undefined) {
      const subject = await this.subjectRepo.findById(dto.subjectId)
      if (!subject) throw new NotFoundException('Mata kuliah tidak ditemukan')
    }

    const updated = await this.eventRepo.update(id, {
      ...(dto.subjectId !== undefined && { subjectId: dto.subjectId }),
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.endDate !== undefined && { endDate: dto.endDate })
    })

    return updated!
  }

  async deleteEvent(id: number): Promise<void> {
    const existing = await this.eventRepo.findById(id)
    if (!existing) throw new NotFoundException('Event tidak ditemukan')
    await this.eventRepo.delete(id)
  }
}

export const eventService = new EventService()
