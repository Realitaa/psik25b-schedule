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

    // Only run initialization once per instance
    if (globalThis.__db_initialized) return
    globalThis.__db_initialized = true

    try {
      const cfEnv = event.context.cloudflare?.env as Record<string, string | undefined> | undefined

      let userIndex = 0
      while (true) {
        const usernameKey = `USER${userIndex}_USERNAME`
        const passwordKey = `USER${userIndex}_PASSWORD`
        const nameKey = `USER${userIndex}_NAME`

        const username = cfEnv?.[usernameKey] || process.env[usernameKey]
        const password = cfEnv?.[passwordKey] || process.env[passwordKey]
        const name = cfEnv?.[nameKey] || process.env[nameKey] || username

        if (!username || !password) {
          break
        }

        const existingUser = await db.select().from(users).where(eq(users.username, username)).get()
        if (!existingUser) {
          const hashedPassword = await bcrypt.hash(password, 12)
          await db.insert(users).values({
            username,
            password: hashedPassword,
            name: name || username
          }).run()
          console.log(`[Seeder] Seeded user: ${username} (${name})`)
        }

        userIndex++
      }
    } catch (err) {
      console.error('[Seeder Error]', err)
    }
  })
})
