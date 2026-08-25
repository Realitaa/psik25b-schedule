import { eq } from 'drizzle-orm'
import { academicYears, type AcademicYearInsert } from '../db/schema'
import type { AcademicYearSelect } from '#shared/types'

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
    return await db.insert(academicYears).values(data).returning().get()
  }

  async setActiveYear(id: number | null): Promise<void> {
    // Reset all to false first
    await db.update(academicYears).set({ isCurrentActiveYear: false }).run()
    if (id !== null) {
      await db.update(academicYears).set({ isCurrentActiveYear: true }).where(eq(academicYears.id, id)).run()
    }
  }
}

export const academicYearRepository = new AcademicYearRepository()
