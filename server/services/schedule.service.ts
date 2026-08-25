import type {
  ScheduleSelect,
  ScheduleWithSubject,
  CreateScheduleDTO,
  UpdateScheduleDTO,
  ScheduleActionDTO
} from '#shared/types'
import { calculateNextScheduleOccurrence, DAYS_INDONESIAN } from '#shared/utils/date'
import {
  scheduleRepository,
  type ScheduleRepository
} from '../repositories/schedule.repository'
import {
  subjectRepository,
  type SubjectRepository
} from '../repositories/subject.repository'
import { NotFoundException, ValidationException } from '../utils/exceptions'

export class ScheduleService {
  constructor(
    private readonly scheduleRepo: ScheduleRepository = scheduleRepository,
    private readonly subjectRepo: SubjectRepository = subjectRepository
  ) {}

  async getSchedules(academicYearId?: number): Promise<ScheduleWithSubject[]> {
    return await this.scheduleRepo.findAll(academicYearId)
  }

  async getScheduleById(id: number): Promise<ScheduleWithSubject> {
    const schedule = await this.scheduleRepo.findById(id)
    if (!schedule) throw new NotFoundException('Jadwal tidak ditemukan')
    return schedule
  }

  async createSchedule(dto: CreateScheduleDTO): Promise<ScheduleSelect> {
    const subject = await this.subjectRepo.findById(dto.subjectId)
    if (!subject) throw new NotFoundException('Mata kuliah tidak ditemukan')

    let computedEndDate = dto.endDate || null
    if ((dto.type === 'temporary_move' || dto.type === 'one_off') && !computedEndDate) {
      computedEndDate = calculateNextScheduleOccurrence(dto.day, dto.timeEnd)
    }

    return await this.scheduleRepo.create({
      subjectId: dto.subjectId,
      type: dto.type || 'regular',
      parentScheduleId: dto.parentScheduleId || null,
      status: dto.status || 'active',
      isOnline: dto.isOnline || false,
      building: dto.isOnline ? null : (dto.building || null),
      floor: dto.isOnline ? null : (dto.floor || null),
      room: dto.isOnline ? null : (dto.room || null),
      day: dto.day,
      timeStart: dto.timeStart,
      timeEnd: dto.timeEnd,
      endDate: computedEndDate
    })
  }

  async updateSchedule(id: number, dto: UpdateScheduleDTO): Promise<ScheduleSelect> {
    const existing = await this.scheduleRepo.findById(id)
    if (!existing) throw new NotFoundException('Jadwal tidak ditemukan')

    let computedEndDate = dto.endDate !== undefined ? dto.endDate : existing.endDate
    const newType = dto.type || existing.type
    const newDay = dto.day || existing.day
    const newTimeEnd = dto.timeEnd || existing.timeEnd

    if ((newType === 'temporary_move' || newType === 'one_off') && !computedEndDate) {
      computedEndDate = calculateNextScheduleOccurrence(newDay, newTimeEnd)
    }

    const updated = await this.scheduleRepo.update(id, {
      ...dto,
      building: dto.isOnline ? null : (dto.building !== undefined ? dto.building : existing.building),
      floor: dto.isOnline ? null : (dto.floor !== undefined ? dto.floor : existing.floor),
      room: dto.isOnline ? null : (dto.room !== undefined ? dto.room : existing.room),
      endDate: computedEndDate
    })

    if (!updated) throw new NotFoundException('Jadwal tidak ditemukan')
    return updated
  }

  async handleScheduleAction(id: number, dto: ScheduleActionDTO): Promise<ScheduleSelect> {
    const existing = await this.scheduleRepo.findById(id)
    if (!existing) throw new NotFoundException('Jadwal tidak ditemukan')

    if (dto.action === 'skip') {
      const nextOccurrenceIso = calculateNextScheduleOccurrence(existing.day, existing.timeEnd)
      const updated = await this.scheduleRepo.update(id, {
        status: 'skipped',
        skippedUntil: nextOccurrenceIso
      })
      return updated!
    }

    if (dto.action === 'end') {
      const updated = await this.scheduleRepo.update(id, {
        status: 'ended',
        skippedUntil: null
      })
      return updated!
    }

    if (dto.action === 'reset') {
      const updated = await this.scheduleRepo.update(id, {
        status: 'active',
        skippedUntil: null
      })
      return updated!
    }

    if (dto.action === 'move') {
      if (!dto.timeStart || !dto.timeEnd) {
        throw new ValidationException('Jam mulai dan jam selesai wajib diisi untuk jadwal pindah sementara')
      }

      let day = dto.day
      const endDate = dto.movedDate || null

      if (dto.movedDate && !day) {
        const d = new Date(dto.movedDate)
        day = DAYS_INDONESIAN[d.getDay()]
      }

      if (!day) {
        throw new ValidationException('Hari atau tanggal pelaksanaan wajib diisi untuk jadwal pindah sementara')
      }

      const computedEndDate = endDate || calculateNextScheduleOccurrence(day, dto.timeEnd)

      // Create new temporary moved schedule
      return await this.scheduleRepo.create({
        subjectId: existing.subjectId,
        type: 'temporary_move',
        parentScheduleId: id,
        status: 'active',
        isOnline: dto.isOnline || false,
        building: dto.isOnline ? null : (dto.building || null),
        floor: dto.isOnline ? null : (dto.floor || null),
        room: dto.isOnline ? null : (dto.room || null),
        day,
        timeStart: dto.timeStart,
        timeEnd: dto.timeEnd,
        endDate: computedEndDate
      })
    }

    throw new ValidationException('Aksi jadwal tidak valid')
  }

  async deleteSchedule(id: number): Promise<void> {
    const deleted = await this.scheduleRepo.delete(id)
    if (!deleted) throw new NotFoundException('Jadwal tidak ditemukan')
  }
}

export const scheduleService = new ScheduleService()
