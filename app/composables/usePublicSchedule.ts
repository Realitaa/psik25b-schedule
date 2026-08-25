import type { PublicScheduleBundle } from '#shared/types'

const LOCAL_STORAGE_KEY = 'psik25b_public_schedule_bundle_v1'

function getInitialLocalCachedBundle(): PublicScheduleBundle | null {
  if (import.meta.client) {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (cached) {
        return JSON.parse(cached) as PublicScheduleBundle
      }
    } catch {
      // ignore
    }
  }
  return null
}

export async function usePublicSchedule() {
  const initialCache = getInitialLocalCachedBundle()

  const { data: bundle, status, error, refresh } = await useAsyncData<PublicScheduleBundle | null>(
    'public-schedule-bundle',
    async (): Promise<PublicScheduleBundle | null> => {
      try {
        const res = await $fetch<PublicScheduleBundle>('/api/public/schedule-bundle')
        if (import.meta.client && res) {
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(res))
          } catch {
            // ignore localStorage quota errors
          }
        }
        return res
      } catch (err) {
        // When offline or network disconnected, fallback to cached bundle in localStorage
        if (import.meta.client) {
          try {
            const cached = localStorage.getItem(LOCAL_STORAGE_KEY)
            if (cached) {
              return JSON.parse(cached) as PublicScheduleBundle
            }
          } catch {
            // ignore
          }
        }
        throw err
      }
    },
    {
      default: () => initialCache
    }
  )

  return {
    bundle,
    status,
    error,
    refresh
  }
}
