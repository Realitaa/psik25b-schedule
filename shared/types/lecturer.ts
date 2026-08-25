export interface LecturerSelect {
  id: number
  name: string
  shortname: string
  nip: string | null
  phone: string | null
  createdAt: string | null
}

export interface CreateLecturerDTO {
  name: string
  shortname: string
  nip?: string | null
  phone?: string | null
}

export type UpdateLecturerDTO = Partial<CreateLecturerDTO>
