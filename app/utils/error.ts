export function getApiErrorMessage(err: unknown, fallback = 'Terjadi kesalahan pada server'): string {
  if (!err) return fallback
  const errorObj = err as {
    data?: { statusMessage?: string, message?: string }
    statusMessage?: string
    message?: string
  }
  return errorObj?.data?.statusMessage || errorObj?.data?.message || errorObj?.statusMessage || errorObj?.message || fallback
}
