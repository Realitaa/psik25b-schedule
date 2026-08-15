import type { users } from '../db/schema'

// User Entity Types derived from Drizzle Schema
export type UserSelect = typeof users.$inferSelect
export type UserInsert = typeof users.$inferInsert

// DTOs (Data Transfer Objects)
export interface LoginDTO {
  username: string
  password: string
}

// Session Types
export interface UserSessionPayload {
  id: number
  username: string
  name: string | null
}

declare module '#auth-utils' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface User extends UserSessionPayload {}

  interface UserSession {
    user?: User
    loggedInAt?: Date | string
  }
}
