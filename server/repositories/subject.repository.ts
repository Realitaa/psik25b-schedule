import { eq, inArray } from 'drizzle-orm'
import {
  subjects,
  subjectLecturers,
  lecturers,
  type SubjectInsert
} from '../db/schema'
import type {
  SubjectWithLecturers,
  LecturerSelect
} from '#shared/types'

export class SubjectRepository {
  async findAll(academicYearId?: number): Promise<SubjectWithLecturers[]> {
    const query = academicYearId
      ? db.select().from(subjects).where(eq(subjects.academicYearId, academicYearId))
      : db.select().from(subjects)

    const allSubjects = await query.all()
    if (allSubjects.length === 0) return []

    const allLecturers = await db.select().from(lecturers).all()
    const lecturersMap = new Map(allLecturers.map(l => [l.id, l]))

    const allRels = await db.select().from(subjectLecturers).all()
    const relsMap = new Map<number, number[]>()
    for (const r of allRels) {
      if (!relsMap.has(r.subjectId)) {
        relsMap.set(r.subjectId, [])
      }
      relsMap.get(r.subjectId)!.push(r.lecturerId)
    }

    return allSubjects.map((sub) => {
      const lecturerIds = relsMap.get(sub.id) || []
      const lecturerList = lecturerIds
        .map(id => lecturersMap.get(id))
        .filter((l): l is LecturerSelect => Boolean(l))

      return {
        ...sub,
        lecturers: lecturerList
      }
    })
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

export const subjectRepository = new SubjectRepository()
