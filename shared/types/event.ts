import type { ScheduleWithSubject } from './schedule'
import type { EventPresetSelect } from './event-preset'

export interface EventAuthor {
  id: number
  username: string
  name: string | null
}

export interface EventSelect {
  id: number
  scheduleId: number
  authorId: number | null
  presetId: number | null
  title: string
  description: string | null
  type: string | null
  color: string | null
  icon: string | null
  endDate: string | null
  createdAt: string | null
  author?: EventAuthor | null
  preset?: EventPresetSelect | null
  schedule?: ScheduleWithSubject | null
}

export interface CreateEventDTO {
  scheduleId: number
  presetId?: number | null
  title: string
  description?: string | null
  type?: string | null
  color?: string | null
  icon?: string | null
  endDate?: string | null
  authorId?: number | null
}

export interface UpdateEventDTO {
  scheduleId?: number
  presetId?: number | null
  title?: string
  description?: string | null
  type?: string | null
  color?: string | null
  icon?: string | null
  endDate?: string | null
}
