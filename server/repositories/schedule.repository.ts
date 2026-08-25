import { eq, and, or, lt, inArray } from 'drizzle-orm'
import { schedules, subjects, lecturers, subjectLecturers, events, type ScheduleInsert } from '../db/schema'
import type { ScheduleSelect, ScheduleWithSubject } from '#shared/types'

export class ScheduleRepository {
  async cleanupExpired(nowIso: string = new Date().toISOString()): Promise<void> {
    // 1. Delete temporary_move and one_off schedules whose endDate has passed
    await db.delete(schedules).where(
      and(
        or(
          eq(schedules.type, 'temporary_move'),
          eq(schedules.type, 'one_off')
        ),
        lt(schedules.endDate, nowIso)
      )
    ).run()

    // 2. Reset skipped schedules back to active when skippedUntil has passed
    await db.update(schedules)
      .set({ status: 'active', skippedUntil: null })
      .where(
        and(
          eq(schedules.status, 'skipped'),
          lt(schedules.skippedUntil, nowIso)
        )
      ).run()
  }

  async findAll(academicYearId?: number): Promise<ScheduleWithSubject[]> {
    await this.cleanupExpired()

    const scheduleQuery = academicYearId
      ? db.select({
          schedule: schedules,
          subject: subjects
        })
          .from(schedules)
          .innerJoin(subjects, eq(schedules.subjectId, subjects.id))
          .where(eq(subjects.academicYearId, academicYearId))
      : db.select({
          schedule: schedules,
          subject: subjects
        })
          .from(schedules)
          .innerJoin(subjects, eq(schedules.subjectId, subjects.id))

    const rows = await scheduleQuery.all()
    if (rows.length === 0) return []

    const subjectIds = [...new Set(rows.map(r => r.subject.id))]
    const scheduleIds = rows.map(r => r.schedule.id)

    // Query lecturers for subjects
    const lecturerRows = await db
      .select({
        subjectId: subjectLecturers.subjectId,
        lecturer: lecturers
      })
      .from(subjectLecturers)
      .innerJoin(lecturers, eq(subjectLecturers.lecturerId, lecturers.id))
      .where(inArray(subjectLecturers.subjectId, subjectIds))
      .all()

    const lecturersBySubject = new Map<number, typeof lecturers.$inferSelect[]>()
    for (const row of lecturerRows) {
      if (!lecturersBySubject.has(row.subjectId)) {
        lecturersBySubject.set(row.subjectId, [])
      }
      lecturersBySubject.get(row.subjectId)!.push(row.lecturer)
    }

    // Query events for schedules
    const eventRows = await db
      .select()
      .from(events)
      .where(inArray(events.scheduleId, scheduleIds))
      .all()

    const eventsBySchedule = new Map<number, typeof events.$inferSelect[]>()
    for (const ev of eventRows) {
      if (!eventsBySchedule.has(ev.scheduleId)) {
        eventsBySchedule.set(ev.scheduleId, [])
      }
      eventsBySchedule.get(ev.scheduleId)!.push(ev)
    }

    return rows.map((r) => {
      const subjLecturers = lecturersBySubject.get(r.subject.id) || []
      const schedEvents = eventsBySchedule.get(r.schedule.id) || []

      return {
        ...r.schedule,
        type: r.schedule.type as ScheduleSelect['type'],
        status: r.schedule.status as ScheduleSelect['status'],
        subject: {
          ...r.subject,
          lecturers: subjLecturers
        },
        events: schedEvents
      }
    })
  }

  async findById(id: number): Promise<ScheduleWithSubject | undefined> {
    await this.cleanupExpired()

    const row = await db
      .select({
        schedule: schedules,
        subject: subjects
      })
      .from(schedules)
      .innerJoin(subjects, eq(schedules.subjectId, subjects.id))
      .where(eq(schedules.id, id))
      .get()

    if (!row) return undefined

    const subjLecturers = await db
      .select({ lecturer: lecturers })
      .from(subjectLecturers)
      .innerJoin(lecturers, eq(subjectLecturers.lecturerId, lecturers.id))
      .where(eq(subjectLecturers.subjectId, row.subject.id))
      .all()

    const schedEvents = await db
      .select()
      .from(events)
      .where(eq(events.scheduleId, id))
      .all()

    return {
      ...row.schedule,
      type: row.schedule.type as ScheduleSelect['type'],
      status: row.schedule.status as ScheduleSelect['status'],
      subject: {
        ...row.subject,
        lecturers: subjLecturers.map(l => l.lecturer)
      },
      events: schedEvents
    }
  }

  async findBySubjectId(subjectId: number): Promise<ScheduleSelect[]> {
    const rows = await db.select().from(schedules).where(eq(schedules.subjectId, subjectId)).all()
    return rows.map(r => ({
      ...r,
      type: r.type as ScheduleSelect['type'],
      status: r.status as ScheduleSelect['status']
    }))
  }

  async create(data: ScheduleInsert): Promise<ScheduleSelect> {
    const created = await db.insert(schedules).values(data).returning().get()
    return {
      ...created,
      type: created.type as ScheduleSelect['type'],
      status: created.status as ScheduleSelect['status']
    }
  }

  async update(id: number, data: Partial<ScheduleInsert>): Promise<ScheduleSelect | undefined> {
    const updated = await db.update(schedules).set(data).where(eq(schedules.id, id)).returning().get()
    if (!updated) return undefined
    return {
      ...updated,
      type: updated.type as ScheduleSelect['type'],
      status: updated.status as ScheduleSelect['status']
    }
  }

  async delete(id: number): Promise<boolean> {
    const res = await db.delete(schedules).where(eq(schedules.id, id)).run()
    return (res.meta?.changes ?? 1) > 0
  }
}

export const scheduleRepository = new ScheduleRepository()
