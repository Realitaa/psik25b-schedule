import { describe, it, expect } from 'vitest'
import { formatWhatsAppLink } from '../../app/composables/useWhatsApp'

describe('WhatsApp Link Formatter', () => {
  it('should format indonesian local phone number starting with 08 to 628', () => {
    expect(formatWhatsAppLink('081234567890')).toBe('https://wa.me/6281234567890')
  })

  it('should format phone number with +62 prefix', () => {
    expect(formatWhatsAppLink('+6281234567890')).toBe('https://wa.me/6281234567890')
  })

  it('should remove non-digit characters like spaces and dashes', () => {
    expect(formatWhatsAppLink('0812-3456-7890')).toBe('https://wa.me/6281234567890')
    expect(formatWhatsAppLink('+62 812 3456 7890')).toBe('https://wa.me/6281234567890')
  })

  it('should return empty string for null, undefined, or empty phone', () => {
    expect(formatWhatsAppLink('')).toBe('')
    expect(formatWhatsAppLink(null)).toBe('')
    expect(formatWhatsAppLink(undefined)).toBe('')
  })
})
