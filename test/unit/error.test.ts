import { describe, it, expect } from 'vitest'
import { getApiErrorMessage } from '../../app/utils/error'

describe('API Error Message Extractor', () => {
  it('should extract statusMessage from error data object', () => {
    const error = {
      data: {
        statusMessage: 'Username atau password salah'
      }
    }
    expect(getApiErrorMessage(error)).toBe('Username atau password salah')
  })

  it('should extract statusMessage directly from root error', () => {
    const error = {
      statusMessage: 'Data tidak ditemukan'
    }
    expect(getApiErrorMessage(error)).toBe('Data tidak ditemukan')
  })

  it('should fallback to default error message if none found', () => {
    expect(getApiErrorMessage({})).toBe('Terjadi kesalahan pada server')
    expect(getApiErrorMessage(null, 'Custom fallback')).toBe('Custom fallback')
    expect(getApiErrorMessage(undefined, 'Custom fallback')).toBe('Custom fallback')
  })
})
