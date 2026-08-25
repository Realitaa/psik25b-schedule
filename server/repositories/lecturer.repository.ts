import { eq, inArray } from 'drizzle-orm'
import { lecturers, type LecturerInsert } from '../db/schema'
import type { LecturerSelect } from '#shared/types'

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

export const lecturerRepository = new LecturerRepository()
