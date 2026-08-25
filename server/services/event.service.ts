import type {
  EventSelect,
  CreateEventDTO,
  UpdateEventDTO
} from '#shared/types'
import {
  eventRepository,
  type EventRepository
} from '../repositories/event.repository'
import {
  scheduleRepository,
  type ScheduleRepository
} from '../repositories/schedule.repository'
import { NotFoundException } from '../utils/exceptions'

export class EventService {
  constructor(
    private readonly eventRepo: EventRepository = eventRepository,
    private readonly scheduleRepo: ScheduleRepository = scheduleRepository
  ) {}

  async getEvents(): Promise<EventSelect[]> {
    return await this.eventRepo.findAll()
  }

  async getEventById(id: number): Promise<EventSelect> {
    const ev = await this.eventRepo.findById(id)
    if (!ev) throw new NotFoundException('Event tidak ditemukan')
    return ev
  }

  async createEvent(dto: CreateEventDTO): Promise<EventSelect> {
    const schedule = await this.scheduleRepo.findById(dto.scheduleId)
    if (!schedule) throw new NotFoundException('Jadwal tidak ditemukan')

    return await this.eventRepo.create({
      scheduleId: dto.scheduleId,
      authorId: dto.authorId || null,
      presetId: dto.presetId || null,
      title: dto.title,
      description: dto.description || null,
      type: dto.type || null,
      color: dto.color || null,
      icon: dto.icon || null,
      endDate: dto.endDate || null
    })
  }

  async updateEvent(id: number, dto: UpdateEventDTO): Promise<EventSelect> {
    const existing = await this.eventRepo.findById(id)
    if (!existing) throw new NotFoundException('Event tidak ditemukan')

    if (dto.scheduleId !== undefined) {
      const schedule = await this.scheduleRepo.findById(dto.scheduleId)
      if (!schedule) throw new NotFoundException('Jadwal tidak ditemukan')
    }

    const updated = await this.eventRepo.update(id, {
      ...(dto.scheduleId !== undefined && { scheduleId: dto.scheduleId }),
      ...(dto.presetId !== undefined && { presetId: dto.presetId }),
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.type !== undefined && { type: dto.type }),
      ...(dto.color !== undefined && { color: dto.color }),
      ...(dto.icon !== undefined && { icon: dto.icon }),
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
