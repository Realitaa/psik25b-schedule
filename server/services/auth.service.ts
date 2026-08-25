import bcrypt from 'bcryptjs'
import type { LoginDTO, UserSessionPayload } from '#shared/types'
import { userRepository, type UserRepository } from '../repositories/user.repository'
import { UnauthorizedException } from '../utils/exceptions'
import { loginRateLimiter, type RateLimiter } from '../utils/rate-limiter'

export class AuthService {
  constructor(
    private userRepo: UserRepository = userRepository,
    private rateLimiter: RateLimiter = loginRateLimiter
  ) {}

  async authenticate(data: LoginDTO): Promise<UserSessionPayload> {
    // Check rate limit per username to prevent brute-force attacks
    this.rateLimiter.check(data.username, 5, 60 * 1000)

    const user = await this.userRepo.findByUsername(data.username)
    if (!user) {
      throw new UnauthorizedException()
    }

    const isValidPassword = await bcrypt.compare(data.password, user.password)
    if (!isValidPassword) {
      throw new UnauthorizedException()
    }

    // Successful login resets rate limit counter for this username
    this.rateLimiter.reset(data.username)

    return {
      id: user.id,
      username: user.username,
      name: user.name
    }
  }
}

export const authService = new AuthService()
