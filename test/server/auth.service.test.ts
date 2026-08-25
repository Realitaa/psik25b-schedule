import bcrypt from 'bcryptjs'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthService } from '../../server/services/auth.service'
import type { UserRepository } from '../../server/repositories/user.repository'
import { UnauthorizedException } from '../../server/utils/exceptions'

describe('AuthService Feature Tests', () => {
  let mockUserRepo: UserRepository
  let authService: AuthService

  beforeEach(() => {
    mockUserRepo = {
      findByUsername: vi.fn(),
      findById: vi.fn()
    } as unknown as UserRepository
    authService = new AuthService(mockUserRepo)
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
})
