import type {
  AcademicYearSelect,
  CreateAcademicYearDTO
} from '#shared/types'
import {
  academicYearRepository,
  type AcademicYearRepository
} from '../repositories/academic-year.repository'
import { ConflictException, NotFoundException } from '../utils/exceptions'

export class AcademicYearService {
  constructor(private readonly yearRepo: AcademicYearRepository = academicYearRepository) {}

  async getAcademicYears(): Promise<AcademicYearSelect[]> {
    return await this.yearRepo.findAll()
  }

  async getActiveAcademicYear(): Promise<AcademicYearSelect | undefined> {
    return await this.yearRepo.findActive()
  }

  async createAcademicYear(dto: CreateAcademicYearDTO): Promise<AcademicYearSelect> {
    const existing = await this.yearRepo.findByYearAndSemester(dto.yearStart, dto.yearEnd, dto.semester)
    if (existing) {
      throw new ConflictException(`Tahun ajaran ${dto.yearStart}/${dto.yearEnd} (${dto.semester.toUpperCase()}) sudah ada`)
    }

    const created = await this.yearRepo.create({
      yearStart: dto.yearStart,
      yearEnd: dto.yearEnd,
      semester: dto.semester,
      isCurrentActiveYear: dto.isCurrentActiveYear || false
    })

    if (dto.isCurrentActiveYear) {
      await this.yearRepo.setActiveYear(created.id)
    }

    return created
  }

  async setActiveAcademicYear(id: number | null): Promise<void> {
    if (id !== null) {
      const year = await this.yearRepo.findById(id)
      if (!year) throw new NotFoundException('Tahun ajaran tidak ditemukan')
    }
    await this.yearRepo.setActiveYear(id)
  }
}

export const academicYearService = new AcademicYearService()
