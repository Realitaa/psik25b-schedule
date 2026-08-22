import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { users } from '../db/schema'

declare global {
  var __db_initialized: boolean | undefined
}

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('request', async (event) => {
    // Skip database seeding if D1 binding is not present (e.g. during prerendering)
    if (!event.context.cloudflare?.env?.DB) return

    // Only run initialization once
    if (globalThis.__db_initialized) return
    globalThis.__db_initialized = true

    try {
      // Check if admin exists, if not seed default user
      const existingUser = await db.select().from(users).where(eq(users.username, 'admin')).get()
      if (!existingUser) {
        // Generate password hash with bcrypt 12 rounds
        const hashedPassword = await bcrypt.hash('password123', 12)
        await db.insert(users).values({
          username: 'admin',
          password: hashedPassword,
          name: 'Administrator'
        }).run()
        console.log('[NuxtHub DB] Default admin user seeded (admin / password123)')
      }
    } catch (err) {
      console.error('[NuxtHub DB Error]', err)
    }
  })
})
