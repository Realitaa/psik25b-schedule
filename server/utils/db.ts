import type { DrizzleD1Database } from 'drizzle-orm/d1'
import { drizzle } from 'drizzle-orm/d1'
import * as schema from '../db/schema'

export const db = new Proxy({} as unknown as DrizzleD1Database<typeof schema>, {
  get(target, prop, receiver) {
    const event = useEvent()
    if (!event) {
      throw new Error('H3Event context not found. Accessing db outside of request handler?')
    }
    if (!event.context._db) {
      const d1 = event.context.cloudflare?.env?.DB
      if (!d1) {
        throw new Error('Cloudflare D1 DB binding "DB" not found in event context.')
      }
      event.context._db = drizzle(d1, { schema })
    }
    return Reflect.get(event.context._db, prop, receiver)
  }
}) as DrizzleD1Database<typeof schema>
