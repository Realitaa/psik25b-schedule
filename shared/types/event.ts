import type { SubjectSelect } from './subject'

export interface EventAuthor {
  id: number
  username: string
  name: string | null
}

export interface EventSelect {
  id: number
  subjectId: number
  authorId: number | null
  title: string
  description: string | null
  endDate: string | null
  createdAt: string | null
  author?: EventAuthor | null
}

export interface EventWithSubject extends EventSelect {
  subject: SubjectSelect
  author?: EventAuthor | null
}

export interface CreateEventDTO {
  subjectId: number
  authorId?: number | null
  title: string
  description?: string | null
  endDate?: string | null
}

export type UpdateEventDTO = Partial<CreateEventDTO>
