import type {
  EventPresetSelect,
  CreateEventPresetDTO,
  UpdateEventPresetDTO
} from '#shared/types'
import {
  eventPresetRepository,
  type EventPresetRepository
} from '../repositories/event-preset.repository'
import { NotFoundException } from '../utils/exceptions'

export class EventPresetService {
  constructor(private readonly presetRepo: EventPresetRepository = eventPresetRepository) {}

  async getPresets(): Promise<EventPresetSelect[]> {
    return await this.presetRepo.findAll()
  }

  async getPresetById(id: number): Promise<EventPresetSelect> {
    const preset = await this.presetRepo.findById(id)
    if (!preset) throw new NotFoundException('Preset event tidak ditemukan')
    return preset
  }

  async createPreset(dto: CreateEventPresetDTO): Promise<EventPresetSelect> {
    return await this.presetRepo.create({
      name: dto.name,
      color: dto.color,
      icon: dto.icon
    })
  }

  async updatePreset(id: number, dto: UpdateEventPresetDTO): Promise<EventPresetSelect> {
    const updated = await this.presetRepo.update(id, dto)
    if (!updated) throw new NotFoundException('Preset event tidak ditemukan')
    return updated
  }

  async deletePreset(id: number): Promise<void> {
    const deleted = await this.presetRepo.delete(id)
    if (!deleted) throw new NotFoundException('Preset event tidak ditemukan')
  }
}

export const eventPresetService = new EventPresetService()
