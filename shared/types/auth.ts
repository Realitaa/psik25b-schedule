export interface UserSessionPayload {
  id: number
  username: string
  name: string | null
}

export interface LoginDTO {
  username: string
  password: string
}
