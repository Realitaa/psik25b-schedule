import type {
  LecturerSelect,
  CreateLecturerDTO,
  UpdateLecturerDTO
} from '#shared/types'
import {
  lecturerRepository,
  type LecturerRepository
} from '../repositories/lecturer.repository'
import { ConflictException, NotFoundException } from '../utils/exceptions'

export class LecturerService {
  constructor(private readonly lecturerRepo: LecturerRepository = lecturerRepository) {}

  async getLecturers(): Promise<LecturerSelect[]> {
    return await this.lecturerRepo.findAll()
  }

  async getLecturerById(id: number): Promise<LecturerSelect> {
    const lecturer = await this.lecturerRepo.findById(id)
    if (!lecturer) throw new NotFoundException('Dosen tidak ditemukan')
    return lecturer
  }

  async createLecturer(dto: CreateLecturerDTO): Promise<LecturerSelect> {
    const existing = await this.lecturerRepo.findByShortname(dto.shortname)
    if (existing) {
      throw new ConflictException(`Singkatan dosen '${dto.shortname}' sudah digunakan`)
    }
    return await this.lecturerRepo.create(dto)
  }

  async updateLecturer(id: number, dto: UpdateLecturerDTO): Promise<LecturerSelect> {
    const lecturer = await this.lecturerRepo.findById(id)
    if (!lecturer) throw new NotFoundException('Dosen tidak ditemukan')

    if (dto.shortname && dto.shortname !== lecturer.shortname) {
      const existing = await this.lecturerRepo.findByShortname(dto.shortname)
      if (existing) {
        throw new ConflictException(`Singkatan dosen '${dto.shortname}' sudah digunakan`)
      }
    }

    const updated = await this.lecturerRepo.update(id, dto)
    return updated!
  }

  async deleteLecturer(id: number): Promise<void> {
    const lecturer = await this.lecturerRepo.findById(id)
    if (!lecturer) throw new NotFoundException('Dosen tidak ditemukan')
    await this.lecturerRepo.delete(id)
  }
}

export const lecturerService = new LecturerService()
