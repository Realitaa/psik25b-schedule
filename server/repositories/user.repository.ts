import { eq } from 'drizzle-orm'
import { users } from '../db/schema'
import type { UserSelect } from '../types'

export class UserRepository {
  async findByUsername(username: string): Promise<UserSelect | undefined> {
    return await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .get()
  }

  async findById(id: number): Promise<UserSelect | undefined> {
    return await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .get()
  }
}

export const userRepository = new UserRepository()
