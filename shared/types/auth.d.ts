import type { UserSessionPayload } from './auth'

declare module '#auth-utils' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface User extends UserSessionPayload {}

  interface UserSession {
    user?: User
    loggedInAt?: Date | string
  }
}

export {}
