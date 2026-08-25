import bcrypt from 'bcryptjs'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthService } from '../../server/services/auth.service'
import type { UserRepository } from '../../server/repositories/user.repository'
import { RateLimiter } from '../../server/utils/rate-limiter'
import { UnauthorizedException, TooManyRequestsException } from '../../server/utils/exceptions'

describe('AuthService Feature Tests', () => {
  let mockUserRepo: UserRepository
  let rateLimiter: RateLimiter
  let authService: AuthService

  beforeEach(() => {
    mockUserRepo = {
      findByUsername: vi.fn(),
      findById: vi.fn()
    } as unknown as UserRepository
    rateLimiter = new RateLimiter()
    authService = new AuthService(mockUserRepo, rateLimiter)
  })

  it('should successfully authenticate user with valid credentials', async () => {
    const rawPassword = 'secretpassword'
    const hashedPassword = await bcrypt.hash(rawPassword, 10)

    vi.spyOn(mockUserRepo, 'findByUsername').mockResolvedValue({
      id: 1,
      username: 'admin',
      password: hashedPassword,
      name: 'Administrator',
      createdAt: '2026-01-01'
    })

    const result = await authService.authenticate({
      username: 'admin',
      password: rawPassword
    })

    expect(result).toEqual({
      id: 1,
      username: 'admin',
      name: 'Administrator'
    })
  })

  it('should throw UnauthorizedException if user is not found', async () => {
    vi.spyOn(mockUserRepo, 'findByUsername').mockResolvedValue(undefined)

    await expect(authService.authenticate({
      username: 'unknown_user',
      password: 'password'
    })).rejects.toThrow(UnauthorizedException)
  })

  it('should throw UnauthorizedException if password does not match', async () => {
    const hashedPassword = await bcrypt.hash('correct_password', 10)

    vi.spyOn(mockUserRepo, 'findByUsername').mockResolvedValue({
      id: 1,
      username: 'admin',
      password: hashedPassword,
      name: 'Administrator',
      createdAt: '2026-01-01'
    })

    await expect(authService.authenticate({
      username: 'admin',
      password: 'wrong_password'
    })).rejects.toThrow(UnauthorizedException)
  })

  it('should throw TooManyRequestsException after 5 failed login attempts (rate limiting)', async () => {
    vi.spyOn(mockUserRepo, 'findByUsername').mockResolvedValue(undefined)

    // Fail 5 times
    for (let i = 0; i < 5; i++) {
      await expect(authService.authenticate({
        username: 'attacker',
        password: 'wrong'
      })).rejects.toThrow(UnauthorizedException)
    }

    // 6th attempt should be blocked by rate limiter
    await expect(authService.authenticate({
      username: 'attacker',
      password: 'wrong'
    })).rejects.toThrow(TooManyRequestsException)
  })
})
