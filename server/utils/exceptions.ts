export class AppException extends Error {
  public statusCode: number

  constructor(message: string, statusCode: number = 400) {
    super(message)
    this.name = 'AppException'
    this.statusCode = statusCode
  }
}

export class ValidationException extends AppException {
  constructor(message: string = 'Data input tidak valid') {
    super(message, 400)
    this.name = 'ValidationException'
  }
}

export class UnauthorizedException extends AppException {
  constructor(message: string = 'Username atau password salah') {
    super(message, 401)
    this.name = 'UnauthorizedException'
  }
}

export class NotFoundException extends AppException {
  constructor(message: string = 'Data tidak ditemukan') {
    super(message, 404)
    this.name = 'NotFoundException'
  }
}

export class ConflictException extends AppException {
  constructor(message: string = 'Data sudah ada') {
    super(message, 409)
    this.name = 'ConflictException'
  }
}

export class TooManyRequestsException extends AppException {
  constructor(message: string = 'Terlalu banyak percobaan login. Silakan coba lagi beberapa saat lagi.') {
    super(message, 429)
    this.name = 'TooManyRequestsException'
  }
}
