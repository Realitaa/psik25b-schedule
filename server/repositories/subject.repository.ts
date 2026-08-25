import { eq, inArray, lt, and, isNotNull } from 'drizzle-orm'
import {
  subjects,
  subjectLecturers,
  lecturers,
  events,
  users,
  type SubjectInsert
} from '../db/schema'
import type {
  SubjectWithLecturers,
  LecturerSelect,
  EventSelect
} from '#shared/types'

export class SubjectRepository {
  async cleanupExpired(): Promise<void> {
    const nowISO = new Date().toISOString()
    await db.delete(subjects).where(and(eq(subjects.isReplacement, true), isNotNull(subjects.endDate), lt(subjects.endDate, nowISO))).run()
  }

  async findAll(): Promise<SubjectWithLecturers[]> {
    await this.cleanupExpired()
    const allSubjects = await db.select().from(subjects).all()
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

    const allEvents = await db.select({
      id: events.id,
      subjectId: events.subjectId,
      authorId: events.authorId,
      title: events.title,
      endDate: events.endDate,
      createdAt: events.createdAt
    }).from(events).all()
    const nowISO = new Date().toISOString()
    const activeEvents = allEvents.filter(ev => !ev.endDate || ev.endDate >= nowISO)

    const allUsers = await db.select({ id: users.id, name: users.name, username: users.username }).from(users).all()
    const usersMap = new Map(allUsers.map(u => [u.id, u]))

    const eventsWithAuthors = activeEvents.map((ev) => {
      const author = ev.authorId ? (usersMap.get(ev.authorId) || null) : null
      return {
        ...ev,
        description: null,
        author
      }
    })

    const eventsBySubjectMap = new Map<number, typeof eventsWithAuthors>()
    for (const ev of eventsWithAuthors) {
      if (!eventsBySubjectMap.has(ev.subjectId)) {
        eventsBySubjectMap.set(ev.subjectId, [])
      }
      eventsBySubjectMap.get(ev.subjectId)!.push(ev)
    }

    return allSubjects.map((sub) => {
      const lecturerIds = relsMap.get(sub.id) || []
      const lecturerList = lecturerIds
        .map(id => lecturersMap.get(id))
        .filter((l): l is LecturerSelect => Boolean(l))

      const subjectEventsList = eventsBySubjectMap.get(sub.id) || []

      return {
        ...sub,
        lecturers: lecturerList,
        events: subjectEventsList
      }
    })
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
    const subjectEvents = await db.select({
      id: events.id,
      subjectId: events.subjectId,
      authorId: events.authorId,
      title: events.title,
      endDate: events.endDate,
      createdAt: events.createdAt
    }).from(events).where(eq(events.subjectId, sub.id)).all()

    const authorIds = [...new Set(subjectEvents.map(ev => ev.authorId).filter((authorId): authorId is number => authorId !== null))]
    let usersMap = new Map<number, { id: number, name: string | null, username: string }>()
    if (authorIds.length > 0) {
      const matchedUsers = await db.select({ id: users.id, name: users.name, username: users.username })
        .from(users)
        .where(inArray(users.id, authorIds))
        .all()
      usersMap = new Map(matchedUsers.map(u => [u.id, u]))
    }

    const activeEvents: EventSelect[] = []
    for (const ev of subjectEvents) {
      if (!ev.endDate || ev.endDate >= nowISO) {
        const author = ev.authorId ? (usersMap.get(ev.authorId) || null) : null
        activeEvents.push({
          ...ev,
          description: null,
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

export const subjectRepository = new SubjectRepository()
