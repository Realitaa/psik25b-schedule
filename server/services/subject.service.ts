import type {
  SubjectWithLecturers,
  CreateSubjectDTO,
  UpdateSubjectDTO
} from '#shared/types'
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

  async getSubjects(academicYearId?: number): Promise<SubjectWithLecturers[]> {
    return await this.subjectRepo.findAll(academicYearId)
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

    return await this.subjectRepo.create({
      academicYearId: dto.academicYearId || null,
      name: dto.name
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

    const updated = await this.subjectRepo.update(id, {
      ...(dto.academicYearId !== undefined && { academicYearId: dto.academicYearId }),
      ...(dto.name !== undefined && { name: dto.name })
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
