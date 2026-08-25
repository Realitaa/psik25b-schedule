import type { EventHandlerRequest, H3Event } from 'h3'
import { AppException } from './exceptions'

export function defineApiHandler<T>(
  handler: (event: H3Event<EventHandlerRequest>) => Promise<T> | T
) {
  return defineEventHandler(async (event) => {
    try {
      return await handler(event)
    } catch (err: unknown) {
      if (err instanceof AppException) {
        throw createError({
          statusCode: err.statusCode,
          statusMessage: err.message
        })
      }
      throw err
    }
  })
}
