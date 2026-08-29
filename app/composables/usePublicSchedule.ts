import { useLocalStorage } from '@vueuse/core'
import type { PublicScheduleBundle } from '#shared/types'

const LOCAL_STORAGE_KEY = 'psik25b_public_schedule_bundle_v1'

export async function usePublicSchedule() {
  const localCachedBundle = useLocalStorage<PublicScheduleBundle | null>(
    LOCAL_STORAGE_KEY,
    null,
    {
      listenToStorageChanges: true,
      writeDefaults: false
    }
  )

  const { data: bundle, status, error, refresh } = await useAsyncData<PublicScheduleBundle | null>(
    'public-schedule-bundle',
    async (): Promise<PublicScheduleBundle | null> => {
      try {
        const res = await $fetch<PublicScheduleBundle>('/api/public/schedule-bundle')
        if (res) {
          localCachedBundle.value = res
        }
        return res
      } catch (err) {
        // When offline or network disconnected, fallback to cached bundle from useLocalStorage
        if (localCachedBundle.value) {
          return localCachedBundle.value
        }
        throw err
      }
    },
    {
      default: () => localCachedBundle.value
    }
  )

  return {
    bundle,
    status,
    error,
    refresh
  }
}
