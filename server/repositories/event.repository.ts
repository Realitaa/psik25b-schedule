import { eq, inArray, lt, and, isNotNull } from 'drizzle-orm'
import {
  events,
  subjects,
  users,
  type EventInsert
} from '../db/schema'
import type {
  EventSelect,
  EventWithSubject
} from '#shared/types'

export class EventRepository {
  async cleanupExpired(): Promise<void> {
    const nowISO = new Date().toISOString()
    // Delete events where endDate is not null and endDate < nowISO
    await db.delete(events).where(and(isNotNull(events.endDate), lt(events.endDate, nowISO))).run()
  }

  async findAll(): Promise<EventWithSubject[]> {
    await this.cleanupExpired()
    const allEvents = await db.select({
      id: events.id,
      subjectId: events.subjectId,
      authorId: events.authorId,
      title: events.title,
      endDate: events.endDate,
      createdAt: events.createdAt
    }).from(events).all()
    if (allEvents.length === 0) return []

    const allSubjects = await db.select().from(subjects).all()
    const subjectsMap = new Map(allSubjects.map(s => [s.id, s]))

    const allUsers = await db.select({ id: users.id, name: users.name, username: users.username }).from(users).all()
    const usersMap = new Map(allUsers.map(u => [u.id, u]))

    const result: EventWithSubject[] = []
    for (const ev of allEvents) {
      const subject = subjectsMap.get(ev.subjectId)
      if (subject) {
        const author = ev.authorId ? (usersMap.get(ev.authorId) || null) : null
        result.push({
          ...ev,
          description: null,
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
    const allEvs = await db.select({
      id: events.id,
      subjectId: events.subjectId,
      authorId: events.authorId,
      title: events.title,
      endDate: events.endDate,
      createdAt: events.createdAt
    }).from(events).where(eq(events.subjectId, subjectId)).all()
    if (allEvs.length === 0) return []

    const authorIds = [...new Set(allEvs.map(ev => ev.authorId).filter((authorId): authorId is number => authorId !== null))]
    let usersMap = new Map<number, { id: number, name: string | null, username: string }>()
    if (authorIds.length > 0) {
      const matchedUsers = await db.select({ id: users.id, name: users.name, username: users.username })
        .from(users)
        .where(inArray(users.id, authorIds))
        .all()
      usersMap = new Map(matchedUsers.map(u => [u.id, u]))
    }

    return allEvs.map((ev) => {
      const author = ev.authorId ? (usersMap.get(ev.authorId) || null) : null
      return {
        ...ev,
        description: null,
        author
      }
    })
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

export const eventRepository = new EventRepository()
