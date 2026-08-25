import type {
  AcademicYearSelect,
  CreateAcademicYearDTO,
  LecturerSelect,
  CreateLecturerDTO,
  UpdateLecturerDTO,
  SubjectWithLecturers,
  CreateSubjectDTO,
  UpdateSubjectDTO,
  EventSelect,
  EventWithSubject,
  CreateEventDTO,
  UpdateEventDTO
} from '#shared/types'
import { calculateNextScheduleOccurrence } from '#shared/utils/date'
import {
  academicYearRepository,
  lecturerRepository,
  subjectRepository,
  eventRepository
} from '../repositories/schedule.repository'
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

  async updateLecturer(id: number, dto: UpdateLecturerDTO): Promise<LecturerSelect> {
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

    const isOnline = Boolean(dto.isOnline)
    const isReplacement = Boolean(dto.isReplacement)
    let endDate = dto.endDate || null
    if (isReplacement && !endDate) {
      endDate = calculateNextScheduleOccurrence(dto.day, dto.timeEnd)
    }

    return await subjectRepository.create({
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

    const updated = await subjectRepository.update(id, {
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
    const subject = await subjectRepository.findById(id)
    if (!subject) throw new NotFoundException('Mata kuliah tidak ditemukan')
    await subjectRepository.delete(id)
  }

  async getEvents(): Promise<EventWithSubject[]> {
    return await eventRepository.findAll()
  }

  async getEventById(id: number): Promise<EventSelect> {
    const ev = await eventRepository.findById(id)
    if (!ev) throw new NotFoundException('Event tidak ditemukan')
    return ev
  }

  async createEvent(dto: CreateEventDTO): Promise<EventSelect> {
    const subject = await subjectRepository.findById(dto.subjectId)
    if (!subject) throw new NotFoundException('Mata kuliah tidak ditemukan')

    return await eventRepository.create({
      subjectId: dto.subjectId,
      authorId: dto.authorId || null,
      title: dto.title,
      description: dto.description || null,
      endDate: dto.endDate || null
    })
  }

  async updateEvent(id: number, dto: UpdateEventDTO): Promise<EventSelect> {
    const existing = await eventRepository.findById(id)
    if (!existing) throw new NotFoundException('Event tidak ditemukan')

    if (dto.subjectId !== undefined) {
      const subject = await subjectRepository.findById(dto.subjectId)
      if (!subject) throw new NotFoundException('Mata kuliah tidak ditemukan')
    }

    const updated = await eventRepository.update(id, {
      ...(dto.subjectId !== undefined && { subjectId: dto.subjectId }),
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.endDate !== undefined && { endDate: dto.endDate })
    })

    return updated!
  }

  async deleteEvent(id: number): Promise<void> {
    const existing = await eventRepository.findById(id)
    if (!existing) throw new NotFoundException('Event tidak ditemukan')
    await eventRepository.delete(id)
  }
}

export const scheduleService = new ScheduleService()
