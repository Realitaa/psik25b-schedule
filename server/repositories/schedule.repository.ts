import { eq, inArray, lt, and, isNotNull } from 'drizzle-orm'
import { academicYears, lecturers, subjects, subjectLecturers, events, users } from '../db/schema'
import type {
  AcademicYearSelect,
  AcademicYearInsert,
  LecturerSelect,
  LecturerInsert,
  SubjectInsert,
  SubjectWithLecturers,
  EventSelect,
  EventInsert,
  EventWithSubject
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

export class EventRepository {
  async cleanupExpired(): Promise<void> {
    const nowISO = new Date().toISOString()
    // Delete events where endDate is not null and endDate < nowISO
    await db.delete(events).where(and(isNotNull(events.endDate), lt(events.endDate, nowISO))).run()
  }

  async findAll(): Promise<EventWithSubject[]> {
    await this.cleanupExpired()
    const allEvents = await db.select().from(events).all()
    const result: EventWithSubject[] = []

    for (const ev of allEvents) {
      const subject = await db.select().from(subjects).where(eq(subjects.id, ev.subjectId)).get()
      let author = null
      if (ev.authorId) {
        const u = await db.select({ id: users.id, name: users.name, username: users.username }).from(users).where(eq(users.id, ev.authorId)).get()
        if (u) author = u
      }
      if (subject) {
        result.push({
          ...ev,
          subject,
          author
        })
      }
    }

    return result
  }

  async findById(id: number): Promise<EventSelect | undefined> {
    const ev = await db.select().from(events).where(eq(events.id, id)).get()
    if (!ev) return undefined
    let author = null
    if (ev.authorId) {
      const u = await db.select({ id: users.id, name: users.name, username: users.username }).from(users).where(eq(users.id, ev.authorId)).get()
      if (u) author = u
    }
    return {
      ...ev,
      author
    }
  }

  async findBySubjectId(subjectId: number): Promise<EventSelect[]> {
    await this.cleanupExpired()
    const allEvs = await db.select().from(events).where(eq(events.subjectId, subjectId)).all()
    const result: EventSelect[] = []
    for (const ev of allEvs) {
      let author = null
      if (ev.authorId) {
        const u = await db.select({ id: users.id, name: users.name, username: users.username }).from(users).where(eq(users.id, ev.authorId)).get()
        if (u) author = u
      }
      result.push({
        ...ev,
        author
      })
    }
    return result
  }

  async create(data: EventInsert): Promise<EventSelect> {
    const created = await db.insert(events).values(data).returning().get()
    return (await this.findById(created.id))!
  }

  async update(id: number, data: Partial<EventInsert>): Promise<EventSelect | undefined> {
    await db.update(events).set(data).where(eq(events.id, id)).run()
    return await this.findById(id)
  }

  async delete(id: number): Promise<void> {
    await db.delete(events).where(eq(events.id, id)).run()
  }
}

export class SubjectRepository {
  async cleanupExpired(): Promise<void> {
    const nowISO = new Date().toISOString()
    await db.delete(subjects).where(and(eq(subjects.isReplacement, true), isNotNull(subjects.endDate), lt(subjects.endDate, nowISO))).run()
  }

  async findAll(): Promise<SubjectWithLecturers[]> {
    await this.cleanupExpired()
    const allSubjects = await db.select().from(subjects).all()
    const result: SubjectWithLecturers[] = []
    const nowISO = new Date().toISOString()

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

      // Fetch active events for this subject with author
      const subjectEvents = await db.select().from(events).where(eq(events.subjectId, sub.id)).all()
      const activeEvents: EventSelect[] = []
      for (const ev of subjectEvents) {
        if (!ev.endDate || ev.endDate >= nowISO) {
          let author = null
          if (ev.authorId) {
            const u = await db.select({ id: users.id, name: users.name, username: users.username }).from(users).where(eq(users.id, ev.authorId)).get()
            if (u) author = u
          }
          activeEvents.push({
            ...ev,
            author
          })
        }
      }

      result.push({
        ...sub,
        lecturers: lecturerList,
        events: activeEvents
      })
    }

    return result
  }

  async findById(id: number): Promise<SubjectWithLecturers | undefined> {
    await this.cleanupExpired()
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

    const nowISO = new Date().toISOString()
    const subjectEvents = await db.select().from(events).where(eq(events.subjectId, sub.id)).all()
    const activeEvents: EventSelect[] = []
    for (const ev of subjectEvents) {
      if (!ev.endDate || ev.endDate >= nowISO) {
        let author = null
        if (ev.authorId) {
          const u = await db.select({ id: users.id, name: users.name, username: users.username }).from(users).where(eq(users.id, ev.authorId)).get()
          if (u) author = u
        }
        activeEvents.push({
          ...ev,
          author
        })
      }
    }

    return {
      ...sub,
      lecturers: lecturerList,
      events: activeEvents
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
export const eventRepository = new EventRepository()
