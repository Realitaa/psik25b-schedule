export interface EventPresetSelect {
  id: number
  name: string
  color: string
  icon: string
  createdAt: string | null
}

export interface CreateEventPresetDTO {
  name: string
  color: string
  icon: string
}

export interface UpdateEventPresetDTO {
  name?: string
  color?: string
  icon?: string
}
