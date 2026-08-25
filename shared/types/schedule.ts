import type { SubjectWithLecturers } from './subject'
import type { EventSelect } from './event'

export type ScheduleType = 'regular' | 'temporary_move' | 'one_off'
export type ScheduleStatus = 'active' | 'skipped' | 'ended'

export interface ScheduleSelect {
  id: number
  subjectId: number
  type: ScheduleType
  parentScheduleId: number | null
  status: ScheduleStatus
  skippedUntil: string | null
  isOnline: boolean
  building: string | null
  floor: string | null
  room: string | null
  day: string
  timeStart: string
  timeEnd: string
  endDate: string | null
  createdAt: string | null
}

export interface ScheduleWithSubject extends ScheduleSelect {
  subject?: SubjectWithLecturers
  events?: EventSelect[]
}

export interface CreateScheduleDTO {
  subjectId: number
  type?: ScheduleType
  parentScheduleId?: number | null
  status?: ScheduleStatus
  isOnline?: boolean
  building?: string | null
  floor?: string | null
  room?: string | null
  day: string
  timeStart: string
  timeEnd: string
  endDate?: string | null
}

export interface UpdateScheduleDTO {
  subjectId?: number
  type?: ScheduleType
  parentScheduleId?: number | null
  status?: ScheduleStatus
  isOnline?: boolean
  building?: string | null
  floor?: string | null
  room?: string | null
  day?: string
  timeStart?: string
  timeEnd?: string
  endDate?: string | null
}

export interface ScheduleActionDTO {
  action: 'skip' | 'move' | 'end' | 'reset'
  // When action is 'move'
  movedDate?: string // ISO timestamp of the new date
  day?: string
  timeStart?: string
  timeEnd?: string
  isOnline?: boolean
  building?: string | null
  floor?: string | null
  room?: string | null
}
