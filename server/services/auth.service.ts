import bcrypt from 'bcryptjs'
import type { LoginDTO, UserSessionPayload } from '#shared/types'
import { userRepository, type UserRepository } from '../repositories/user.repository'
import { UnauthorizedException } from '../utils/exceptions'

export class AuthService {
  constructor(private userRepo: UserRepository = userRepository) {}

  async authenticate(data: LoginDTO): Promise<UserSessionPayload> {
    const user = await this.userRepo.findByUsername(data.username)
    if (!user) {
      throw new UnauthorizedException()
    }

    const isValidPassword = await bcrypt.compare(data.password, user.password)
    if (!isValidPassword) {
      throw new UnauthorizedException()
    }

    return {
      id: user.id,
      username: user.username,
      name: user.name
    }
  }
}

export const authService = new AuthService()
