import { eq, inArray } from 'drizzle-orm'
import { academicYears, lecturers, subjects, subjectLecturers } from '../db/schema'
import type {
  AcademicYearSelect,
  AcademicYearInsert,
  LecturerSelect,
  LecturerInsert,
  SubjectInsert,
  SubjectWithLecturers
} from '../types'

export class AcademicYearRepository {
  async findAll(): Promise<AcademicYearSelect[]> {
    return await db.select().from(academicYears).all()
  }

  async findById(id: number): Promise<AcademicYearSelect | undefined> {
    return await db.select().from(academicYears).where(eq(academicYears.id, id)).get()
  }

  async findActive(): Promise<AcademicYearSelect | undefined> {
    return await db.select().from(academicYears).where(eq(academicYears.isCurrentActiveYear, true)).get()
  }

  async create(data: AcademicYearInsert): Promise<AcademicYearSelect> {
    const inserted = await db.insert(academicYears).values(data).returning().get()
    return inserted
  }

  async setActiveYear(id: number | null): Promise<void> {
    // Reset all to false first
    await db.update(academicYears).set({ isCurrentActiveYear: false }).run()
    if (id !== null) {
      await db.update(academicYears).set({ isCurrentActiveYear: true }).where(eq(academicYears.id, id)).run()
    }
  }
}

export class LecturerRepository {
  async findAll(): Promise<LecturerSelect[]> {
    return await db.select().from(lecturers).all()
  }

  async findById(id: number): Promise<LecturerSelect | undefined> {
    return await db.select().from(lecturers).where(eq(lecturers.id, id)).get()
  }

  async findByShortname(shortname: string): Promise<LecturerSelect | undefined> {
    return await db.select().from(lecturers).where(eq(lecturers.shortname, shortname)).get()
  }

  async findByShortnames(shortnames: string[]): Promise<LecturerSelect[]> {
    if (!shortnames.length) return []
    return await db.select().from(lecturers).where(inArray(lecturers.shortname, shortnames)).all()
  }

  async create(data: LecturerInsert): Promise<LecturerSelect> {
    return await db.insert(lecturers).values(data).returning().get()
  }

  async update(id: number, data: Partial<LecturerInsert>): Promise<LecturerSelect | undefined> {
    return await db.update(lecturers).set(data).where(eq(lecturers.id, id)).returning().get()
  }

  async delete(id: number): Promise<void> {
    await db.delete(lecturers).where(eq(lecturers.id, id)).run()
  }
}

export class SubjectRepository {
  async findAll(): Promise<SubjectWithLecturers[]> {
    const allSubjects = await db.select().from(subjects).all()
    const result: SubjectWithLecturers[] = []

    for (const sub of allSubjects) {
      const rels = await db.select({ lecturerId: subjectLecturers.lecturerId })
        .from(subjectLecturers)
        .where(eq(subjectLecturers.subjectId, sub.id))
        .all()

      let lecturerList: LecturerSelect[] = []
      if (rels.length > 0) {
        const ids = rels.map(r => r.lecturerId)
        lecturerList = await db.select().from(lecturers).where(inArray(lecturers.id, ids)).all()
      }

      result.push({
        ...sub,
        lecturers: lecturerList
      })
    }

    return result
  }

  async findById(id: number): Promise<SubjectWithLecturers | undefined> {
    const sub = await db.select().from(subjects).where(eq(subjects.id, id)).get()
    if (!sub) return undefined

    const rels = await db.select({ lecturerId: subjectLecturers.lecturerId })
      .from(subjectLecturers)
      .where(eq(subjectLecturers.subjectId, sub.id))
      .all()

    let lecturerList: LecturerSelect[] = []
    if (rels.length > 0) {
      const ids = rels.map(r => r.lecturerId)
      lecturerList = await db.select().from(lecturers).where(inArray(lecturers.id, ids)).all()
    }

    return {
      ...sub,
      lecturers: lecturerList
    }
  }

  async create(data: SubjectInsert, lecturerIds: number[] = []): Promise<SubjectWithLecturers> {
    const createdSubject = await db.insert(subjects).values(data).returning().get()

    if (lecturerIds.length > 0) {
      const pivotValues = lecturerIds.map(lecturerId => ({
        subjectId: createdSubject.id,
        lecturerId
      }))
      await db.insert(subjectLecturers).values(pivotValues).run()
    }

    return (await this.findById(createdSubject.id))!
  }

  async update(id: number, data: Partial<SubjectInsert>, lecturerIds?: number[]): Promise<SubjectWithLecturers | undefined> {
    await db.update(subjects).set(data).where(eq(subjects.id, id)).run()

    if (lecturerIds !== undefined) {
      await db.delete(subjectLecturers).where(eq(subjectLecturers.subjectId, id)).run()
      if (lecturerIds.length > 0) {
        const pivotValues = lecturerIds.map(lecturerId => ({
          subjectId: id,
          lecturerId
        }))
        await db.insert(subjectLecturers).values(pivotValues).run()
      }
    }

    return await this.findById(id)
  }

  async delete(id: number): Promise<void> {
    await db.delete(subjects).where(eq(subjects.id, id)).run()
  }
}

export const academicYearRepository = new AcademicYearRepository()
export const lecturerRepository = new LecturerRepository()
export const subjectRepository = new SubjectRepository()
