import type { EventHandlerRequest, H3Event } from 'h3'
import type { z } from 'zod'
import { ValidationException } from './exceptions'

export function parseIdParam(
  event: H3Event<EventHandlerRequest>,
  paramName = 'id',
  errorMessage = 'ID tidak valid'
): number {
  const idParam = getRouterParam(event, paramName)
  const id = Number(idParam)
  if (!id || Number.isNaN(id)) {
    throw new ValidationException(errorMessage)
  }
  return id
}

export async function validateBody<T>(
  event: H3Event<EventHandlerRequest>,
  schema: z.ZodType<T>
): Promise<T> {
  const body = await readBody(event)
  const parseResult = schema.safeParse(body)
  if (!parseResult.success) {
    const firstError = parseResult.error.issues[0]?.message || 'Data input tidak valid'
    throw new ValidationException(firstError)
  }
  return parseResult.data
}
