import { eq, inArray, lt, and, isNotNull } from 'drizzle-orm'
import {
  events,
  schedules,
  subjects,
  users,
  eventPresets,
  type EventInsert
} from '../db/schema'
import type {
  EventSelect,
  ScheduleWithSubject
} from '#shared/types'

export class EventRepository {
  async cleanupExpired(nowISO: string = new Date().toISOString()): Promise<void> {
    await db.delete(events).where(and(isNotNull(events.endDate), lt(events.endDate, nowISO))).run()
  }

  async findAll(): Promise<EventSelect[]> {
    await this.cleanupExpired()
    const allEvents = await db.select().from(events).all()
    if (allEvents.length === 0) return []

    const scheduleIds = [...new Set(allEvents.map(e => e.scheduleId))]
    const scheduleRows = await db
      .select({ schedule: schedules, subject: subjects })
      .from(schedules)
      .innerJoin(subjects, eq(schedules.subjectId, subjects.id))
      .where(inArray(schedules.id, scheduleIds))
      .all()

    const schedulesMap = new Map<number, ScheduleWithSubject>()
    for (const r of scheduleRows) {
      schedulesMap.set(r.schedule.id, {
        ...r.schedule,
        type: r.schedule.type as ScheduleWithSubject['type'],
        status: r.schedule.status as ScheduleWithSubject['status'],
        subject: {
          ...r.subject,
          lecturers: []
        }
      })
    }

    const allUsers = await db.select({ id: users.id, name: users.name, username: users.username }).from(users).all()
    const usersMap = new Map(allUsers.map(u => [u.id, u]))

    const allPresets = await db.select().from(eventPresets).all()
    const presetsMap = new Map(allPresets.map(p => [p.id, p]))

    return allEvents.map((ev) => {
      const schedule = schedulesMap.get(ev.scheduleId) || null
      const author = ev.authorId ? (usersMap.get(ev.authorId) || null) : null
      const preset = ev.presetId ? (presetsMap.get(ev.presetId) || null) : null

      return {
        ...ev,
        author,
        preset,
        schedule
      }
    })
  }

  async findById(id: number): Promise<EventSelect | undefined> {
    const ev = await db.select().from(events).where(eq(events.id, id)).get()
    if (!ev) return undefined

    let author = null
    if (ev.authorId) {
      const u = await db.select({ id: users.id, name: users.name, username: users.username }).from(users).where(eq(users.id, ev.authorId)).get()
      if (u) author = u
    }

    let preset = null
    if (ev.presetId) {
      const p = await db.select().from(eventPresets).where(eq(eventPresets.id, ev.presetId)).get()
      if (p) preset = p
    }

    let schedule = null
    const schedRow = await db
      .select({ schedule: schedules, subject: subjects })
      .from(schedules)
      .innerJoin(subjects, eq(schedules.subjectId, subjects.id))
      .where(eq(schedules.id, ev.scheduleId))
      .get()

    if (schedRow) {
      schedule = {
        ...schedRow.schedule,
        type: schedRow.schedule.type as ScheduleWithSubject['type'],
        status: schedRow.schedule.status as ScheduleWithSubject['status'],
        subject: {
          ...schedRow.subject,
          lecturers: []
        }
      }
    }

    return {
      ...ev,
      author,
      preset,
      schedule
    }
  }

  async findByScheduleId(scheduleId: number): Promise<EventSelect[]> {
    await this.cleanupExpired()
    const allEvs = await db.select().from(events).where(eq(events.scheduleId, scheduleId)).all()
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
