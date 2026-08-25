import type {
  SubjectWithLecturers,
  CreateSubjectDTO,
  UpdateSubjectDTO
} from '#shared/types'
import { calculateNextScheduleOccurrence } from '#shared/utils/date'
import {
  subjectRepository,
  type SubjectRepository
} from '../repositories/subject.repository'
import {
  lecturerRepository,
  type LecturerRepository
} from '../repositories/lecturer.repository'
import { NotFoundException } from '../utils/exceptions'

export class SubjectService {
  constructor(
    private readonly subjectRepo: SubjectRepository = subjectRepository,
    private readonly lecturerRepo: LecturerRepository = lecturerRepository
  ) {}

  async getSubjects(): Promise<SubjectWithLecturers[]> {
    return await this.subjectRepo.findAll()
  }

  async getSubjectById(id: number): Promise<SubjectWithLecturers> {
    const subject = await this.subjectRepo.findById(id)
    if (!subject) throw new NotFoundException('Mata kuliah tidak ditemukan')
    return subject
  }

  async createSubject(dto: CreateSubjectDTO): Promise<SubjectWithLecturers> {
    let lecturerIds: number[] = []
    if (dto.lecturerShortnames && dto.lecturerShortnames.length > 0) {
      const lecturersFound = await this.lecturerRepo.findByShortnames(dto.lecturerShortnames)
      lecturerIds = lecturersFound.map(l => l.id)
    }

    const isOnline = Boolean(dto.isOnline)
    const isReplacement = Boolean(dto.isReplacement)
    let endDate = dto.endDate || null
    if (isReplacement && !endDate) {
      endDate = calculateNextScheduleOccurrence(dto.day, dto.timeEnd)
    }

    return await this.subjectRepo.create({
      academicYearId: dto.academicYearId || null,
      name: dto.name,
      isOnline,
      isReplacement,
      building: isOnline ? null : (dto.building || null),
      floor: isOnline ? null : (dto.floor || null),
      room: isOnline ? null : (dto.room || null),
      timeStart: dto.timeStart || null,
      timeEnd: dto.timeEnd || null,
      day: dto.day || null,
      endDate
    }, lecturerIds)
  }

  async updateSubject(id: number, dto: UpdateSubjectDTO): Promise<SubjectWithLecturers> {
    const subject = await this.subjectRepo.findById(id)
    if (!subject) throw new NotFoundException('Mata kuliah tidak ditemukan')

    let lecturerIds: number[] | undefined = undefined
    if (dto.lecturerShortnames !== undefined) {
      if (dto.lecturerShortnames.length > 0) {
        const lecturersFound = await this.lecturerRepo.findByShortnames(dto.lecturerShortnames)
        lecturerIds = lecturersFound.map(l => l.id)
      } else {
        lecturerIds = []
      }
    }

    const isOnline = dto.isOnline !== undefined ? Boolean(dto.isOnline) : subject.isOnline
    const isReplacement = dto.isReplacement !== undefined ? Boolean(dto.isReplacement) : subject.isReplacement
    const day = dto.day !== undefined ? dto.day : subject.day
    const timeEnd = dto.timeEnd !== undefined ? dto.timeEnd : subject.timeEnd
    let endDate = dto.endDate !== undefined ? dto.endDate : subject.endDate

    if (isReplacement && !endDate) {
      endDate = calculateNextScheduleOccurrence(day, timeEnd)
    } else if (!isReplacement) {
      endDate = null
    }

    const updated = await this.subjectRepo.update(id, {
      ...(dto.academicYearId !== undefined && { academicYearId: dto.academicYearId }),
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.isOnline !== undefined && { isOnline }),
      ...(dto.isReplacement !== undefined && { isReplacement }),
      building: isOnline ? null : (dto.building !== undefined ? dto.building : subject.building),
      floor: isOnline ? null : (dto.floor !== undefined ? dto.floor : subject.floor),
      room: isOnline ? null : (dto.room !== undefined ? dto.room : subject.room),
      ...(dto.timeStart !== undefined && { timeStart: dto.timeStart }),
      ...(dto.timeEnd !== undefined && { timeEnd: dto.timeEnd }),
      ...(dto.day !== undefined && { day: dto.day }),
      endDate
    }, lecturerIds)

    return updated!
  }

  async deleteSubject(id: number): Promise<void> {
    const subject = await this.subjectRepo.findById(id)
    if (!subject) throw new NotFoundException('Mata kuliah tidak ditemukan')
    await this.subjectRepo.delete(id)
  }
}

export const subjectService = new SubjectService()
