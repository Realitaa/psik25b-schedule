export function formatWhatsAppLink(phone?: string | null): string {
  if (!phone) return ''
  let cleaned = phone.trim()
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1)
  }
  cleaned = cleaned.replace(/[^0-9]/g, '')
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1)
  }
  return `https://wa.me/${cleaned}`
}

export function useWhatsApp() {
  return {
    formatWhatsAppLink
  }
}
