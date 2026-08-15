import {
  academicYearRepository,
  lecturerRepository,
  subjectRepository
} from '../repositories/schedule.repository'
import type {
  AcademicYearSelect,
  CreateAcademicYearDTO,
  LecturerSelect,
  CreateLecturerDTO,
  SubjectWithLecturers,
  CreateSubjectDTO
} from '../types'
import { ConflictException, NotFoundException } from '../utils/exceptions'

export class ScheduleService {
  // Academic Years
  async getAcademicYears(): Promise<AcademicYearSelect[]> {
    return await academicYearRepository.findAll()
  }

  async getActiveAcademicYear(): Promise<AcademicYearSelect | undefined> {
    return await academicYearRepository.findActive()
  }

  async createAcademicYear(dto: CreateAcademicYearDTO): Promise<AcademicYearSelect> {
    const created = await academicYearRepository.create({
      yearStart: dto.yearStart,
      yearEnd: dto.yearEnd,
      semester: dto.semester,
      isCurrentActiveYear: dto.isCurrentActiveYear || false
    })

    if (dto.isCurrentActiveYear) {
      await academicYearRepository.setActiveYear(created.id)
    }

    return created
  }

  async setActiveAcademicYear(id: number | null): Promise<void> {
    if (id !== null) {
      const year = await academicYearRepository.findById(id)
      if (!year) throw new NotFoundException('Tahun ajaran tidak ditemukan')
    }
    await academicYearRepository.setActiveYear(id)
  }

  // Lecturers
  async getLecturers(): Promise<LecturerSelect[]> {
    return await lecturerRepository.findAll()
  }

  async createLecturer(dto: CreateLecturerDTO): Promise<LecturerSelect> {
    const existing = await lecturerRepository.findByShortname(dto.shortname)
    if (existing) {
      throw new ConflictException(`Singkatan dosen '${dto.shortname}' sudah digunakan`)
    }
    return await lecturerRepository.create(dto)
  }

  async updateLecturer(id: number, dto: Partial<CreateLecturerDTO>): Promise<LecturerSelect> {
    const lecturer = await lecturerRepository.findById(id)
    if (!lecturer) throw new NotFoundException('Dosen tidak ditemukan')

    if (dto.shortname && dto.shortname !== lecturer.shortname) {
      const existing = await lecturerRepository.findByShortname(dto.shortname)
      if (existing) {
        throw new ConflictException(`Singkatan dosen '${dto.shortname}' sudah digunakan`)
      }
    }

    const updated = await lecturerRepository.update(id, dto)
    return updated!
  }

  async deleteLecturer(id: number): Promise<void> {
    const lecturer = await lecturerRepository.findById(id)
    if (!lecturer) throw new NotFoundException('Dosen tidak ditemukan')
    await lecturerRepository.delete(id)
  }

  // Subjects
  async getSubjects(): Promise<SubjectWithLecturers[]> {
    return await subjectRepository.findAll()
  }

  async createSubject(dto: CreateSubjectDTO): Promise<SubjectWithLecturers> {
    let lecturerIds: number[] = []
    if (dto.lecturerShortnames && dto.lecturerShortnames.length > 0) {
      const lecturersFound = await lecturerRepository.findByShortnames(dto.lecturerShortnames)
      lecturerIds = lecturersFound.map(l => l.id)
    }

    return await subjectRepository.create({
      academicYearId: dto.academicYearId || null,
      name: dto.name,
      building: dto.building || null,
      floor: dto.floor || null,
      room: dto.room || null,
      timeStart: dto.timeStart || null,
      timeEnd: dto.timeEnd || null,
      day: dto.day || null
    }, lecturerIds)
  }

  async updateSubject(id: number, dto: Partial<CreateSubjectDTO>): Promise<SubjectWithLecturers> {
    const subject = await subjectRepository.findById(id)
    if (!subject) throw new NotFoundException('Mata kuliah tidak ditemukan')

    let lecturerIds: number[] | undefined = undefined
    if (dto.lecturerShortnames !== undefined) {
      if (dto.lecturerShortnames.length > 0) {
        const lecturersFound = await lecturerRepository.findByShortnames(dto.lecturerShortnames)
        lecturerIds = lecturersFound.map(l => l.id)
      } else {
        lecturerIds = []
      }
    }

    const updated = await subjectRepository.update(id, {
      ...(dto.academicYearId !== undefined && { academicYearId: dto.academicYearId }),
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.building !== undefined && { building: dto.building }),
      ...(dto.floor !== undefined && { floor: dto.floor }),
      ...(dto.room !== undefined && { room: dto.room }),
      ...(dto.timeStart !== undefined && { timeStart: dto.timeStart }),
      ...(dto.timeEnd !== undefined && { timeEnd: dto.timeEnd }),
      ...(dto.day !== undefined && { day: dto.day })
    }, lecturerIds)

    return updated!
  }

  async deleteSubject(id: number): Promise<void> {
    const subject = await subjectRepository.findById(id)
    if (!subject) throw new NotFoundException('Mata kuliah tidak ditemukan')
    await subjectRepository.delete(id)
  }
}

export const scheduleService = new ScheduleService()
