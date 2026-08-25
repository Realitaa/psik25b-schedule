import { eq } from 'drizzle-orm'
import { eventPresets, type EventPresetInsert } from '../db/schema'
import type { EventPresetSelect } from '#shared/types'

export class EventPresetRepository {
  async findAll(): Promise<EventPresetSelect[]> {
    await this.seedDefaults()
    return await db.select().from(eventPresets).all()
  }

  async findById(id: number): Promise<EventPresetSelect | undefined> {
    return await db.select().from(eventPresets).where(eq(eventPresets.id, id)).get()
  }

  async create(data: EventPresetInsert): Promise<EventPresetSelect> {
    return await db.insert(eventPresets).values(data).returning().get()
  }

  async update(id: number, data: Partial<EventPresetInsert>): Promise<EventPresetSelect | undefined> {
    return await db.update(eventPresets).set(data).where(eq(eventPresets.id, id)).returning().get()
  }

  async delete(id: number): Promise<boolean> {
    const res = await db.delete(eventPresets).where(eq(eventPresets.id, id)).run()
    return (res.meta?.changes ?? 1) > 0
  }

  async seedDefaults(): Promise<void> {
    const count = await db.select().from(eventPresets).all()
    if (count.length === 0) {
      const defaults: EventPresetInsert[] = [
        { name: 'Informasi', color: '#3b82f6', icon: 'i-lucide-info' },
        { name: 'Tugas', color: '#f59e0b', icon: 'i-lucide-file-text' },
        { name: 'Ujian', color: '#ef4444', icon: 'i-lucide-clipboard-check' }
      ]
      for (const d of defaults) {
        await db.insert(eventPresets).values(d).run()
      }
    }
  }
}

export const eventPresetRepository = new EventPresetRepository()
