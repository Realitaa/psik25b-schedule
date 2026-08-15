import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core'
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
})

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
  building: text('building'),
  floor: text('floor'),
  room: text('room'),
  timeStart: text('time_start'),
  timeEnd: text('time_end'),
  day: text('day'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
})

export const subjectLecturers = sqliteTable('subject_lecturers', {
  subjectId: integer('subject_id').notNull().references(() => subjects.id, { onDelete: 'cascade' }),
  lecturerId: integer('lecturer_id').notNull().references(() => lecturers.id, { onDelete: 'cascade' })
}, table => [
  primaryKey({ columns: [table.subjectId, table.lecturerId] })
])
