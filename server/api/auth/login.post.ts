import { z } from 'zod'
import { authService } from '../../services/auth.service'
import { defineApiHandler } from '../../utils/handler'
import { validateBody } from '../../utils/request'

const loginSchema = z.object({
  username: z.string().min(1, 'Username tidak boleh kosong'),
  password: z.string().min(1, 'Password tidak boleh kosong')
})

export default defineApiHandler(async (event) => {
  const credentials = await validateBody(event, loginSchema)
  const userSessionData = await authService.authenticate(credentials)

  await setUserSession(event, {
    user: userSessionData,
    loggedInAt: new Date()
  })

  return {
    user: userSessionData
  }
})
