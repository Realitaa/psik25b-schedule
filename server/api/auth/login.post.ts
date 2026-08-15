import { z } from 'zod'
import { authService } from '../../services/auth.service'
import { AppException, ValidationException } from '../../utils/exceptions'

const loginSchema = z.object({
  username: z.string().min(1, 'Username tidak boleh kosong'),
  password: z.string().min(1, 'Password tidak boleh kosong')
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const parseResult = loginSchema.safeParse(body)

    if (!parseResult.success) {
      const firstErrorMessage = parseResult.error.issues[0]?.message || 'Data input tidak valid'
      throw new ValidationException(firstErrorMessage)
    }

    const userSessionData = await authService.authenticate(parseResult.data)

    await setUserSession(event, {
      user: userSessionData,
      loggedInAt: new Date()
    })

    return {
      user: userSessionData
    }
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
