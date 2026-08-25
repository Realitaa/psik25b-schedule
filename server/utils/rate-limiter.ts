import { TooManyRequestsException } from './exceptions'

export class RateLimiter {
  private attempts = new Map<string, { count: number, resetTime: number }>()

  check(key: string, maxAttempts: number = 5, windowMs: number = 60 * 1000): void {
    const now = Date.now()
    const record = this.attempts.get(key)

    if (!record || now > record.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + windowMs })
      return
    }

    if (record.count >= maxAttempts) {
      throw new TooManyRequestsException()
    }

    record.count++
  }

  reset(key: string): void {
    this.attempts.delete(key)
  }

  clearAll(): void {
    this.attempts.clear()
  }
}

export const loginRateLimiter = new RateLimiter()
