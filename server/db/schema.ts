import { sqliteTable, text, integer, primaryKey, uniqueIndex, type AnySQLiteColumn } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  name: text('name'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
})

export const academicYears = sqliteTable('academic_years', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  yearStart: integer('year_start').notNull(),
  yearEnd: integer('year_end').notNull(),
  semester: text('semester', { enum: ['ganjil', 'genap'] }).notNull(),
  isCurrentActiveYear: integer('is_current_active_year', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
}, table => [
  uniqueIndex('academic_years_unique_idx').on(table.yearStart, table.yearEnd, table.semester)
])

export const lecturers = sqliteTable('lecturers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  shortname: text('shortname').notNull().unique(),
  nip: text('nip'),
  phone: text('phone'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
})

export const subjects = sqliteTable('subjects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  academicYearId: integer('academic_year_id').references(() => academicYears.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
})

export const subjectLecturers = sqliteTable('subject_lecturers', {
  subjectId: integer('subject_id').notNull().references(() => subjects.id, { onDelete: 'cascade' }),
  lecturerId: integer('lecturer_id').notNull().references(() => lecturers.id, { onDelete: 'cascade' })
}, table => [
  primaryKey({ columns: [table.subjectId, table.lecturerId] })
])

export const schedules = sqliteTable('schedules', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  subjectId: integer('subject_id').notNull().references(() => subjects.id, { onDelete: 'cascade' }),
  type: text('type', { enum: ['regular', 'temporary_move', 'one_off'] }).notNull().default('regular'),
  parentScheduleId: integer('parent_schedule_id').references((): AnySQLiteColumn => schedules.id, { onDelete: 'set null' }),
  status: text('status', { enum: ['active', 'skipped', 'ended'] }).notNull().default('active'),
  skippedUntil: text('skipped_until'), // ISO timestamp
  isOnline: integer('is_online', { mode: 'boolean' }).notNull().default(false),
  building: text('building'),
  floor: text('floor'),
  room: text('room'),
  day: text('day').notNull(),
  timeStart: text('time_start').notNull(),
  timeEnd: text('time_end').notNull(),
  endDate: text('end_date'), // ISO timestamp for auto-expiry (temporary_move & one_off)
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
})

export const eventPresets = sqliteTable('event_presets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  color: text('color').notNull(),
  icon: text('icon').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
})

export const events = sqliteTable('events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  scheduleId: integer('schedule_id').notNull().references(() => schedules.id, { onDelete: 'cascade' }),
  authorId: integer('author_id').references(() => users.id, { onDelete: 'set null' }),
  presetId: integer('preset_id').references(() => eventPresets.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  description: text('description'), // TipTap JSON or HTML string
  type: text('type'), // e.g. "Tugas", "Informasi", "Ujian"
  color: text('color'), // e.g. "#3b82f6"
  icon: text('icon'), // e.g. "i-lucide-info"
  endDate: text('end_date'), // ISO timestamp string or null
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
})

// Database Inferred Types
export type UserSelect = typeof users.$inferSelect
export type UserInsert = typeof users.$inferInsert

export type AcademicYearInsert = typeof academicYears.$inferInsert

export type LecturerInsert = typeof lecturers.$inferInsert

export type SubjectInsert = typeof subjects.$inferInsert
export type SubjectLecturerSelect = typeof subjectLecturers.$inferSelect

export type ScheduleInsert = typeof schedules.$inferInsert

export type EventPresetInsert = typeof eventPresets.$inferInsert

export type EventInsert = typeof events.$inferInsert
