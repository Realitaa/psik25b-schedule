<script setup lang="ts">
import type { EventSelect, ScheduleWithSubject } from '#shared/types'
import { formatEventEndDate } from '#shared/utils/date'
import EventRenderer from '~/components/event/EventRenderer.vue'

const props = defineProps<{
  open: boolean
  event?: (EventSelect & { schedule?: ScheduleWithSubject | null, subject?: { name?: string } | null }) | null
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const isOpen = computed({
  get: () => props.open,
  set: (val: boolean) => emit('update:open', val)
})

const fullEventDetails = ref<EventSelect | null>(null)
const isDetailsLoading = ref(false)

watch(() => props.open, async (newVal) => {
  if (newVal && props.event?.id) {
    isDetailsLoading.value = true
    fullEventDetails.value = null
    try {
      fullEventDetails.value = await $fetch<EventSelect>(`/api/events/${props.event.id}`)
    } catch (err) {
      console.error('Gagal memuat detail event:', err)
    } finally {
      isDetailsLoading.value = false
    }
  } else if (!newVal) {
    fullEventDetails.value = null
  }
})

const authorName = computed(() => {
  const author = fullEventDetails.value?.author || props.event?.author
  if (!author) return ''
  return author.name || author.username
})

const subjectName = computed(() => {
  return fullEventDetails.value?.schedule?.subject?.name
    || props.event?.schedule?.subject?.name
    || props.event?.subject?.name
    || ''
})
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :title="event?.title || 'Detail Event Perkuliahan'"
  >
    <template #body>
      <div
        v-if="event"
        class="space-y-4"
      >
        <!-- Event Header with Custom Color / Icon -->
        <div
          v-if="event.type || event.color || event.icon"
          class="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-semibold"
          :style="{
            backgroundColor: event.color ? `${event.color}15` : undefined,
            borderColor: event.color ? `${event.color}40` : undefined,
            color: event.color || undefined
          }"
        >
          <UIcon
            :name="event.icon || 'i-lucide-bell'"
            class="size-4 shrink-0"
          />
          <span>{{ event.type || 'Event Perkuliahan' }}</span>
        </div>

        <!-- Event Meta Info -->
        <div class="p-3.5 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-2 text-sm">
          <div
            v-if="subjectName"
            class="flex items-center justify-between gap-2 flex-wrap"
          >
            <span class="text-muted">Mata Kuliah:</span>
            <span class="font-semibold text-highlighted">{{ subjectName }}</span>
          </div>

          <div class="flex items-center justify-between gap-2 flex-wrap">
            <span class="text-muted">Batas Waktu Event:</span>
            <UBadge
              color="warning"
              variant="subtle"
              size="sm"
            >
              <UIcon
                name="i-lucide-clock"
                class="size-3.5 mr-1"
              />
              {{ formatEventEndDate(event.endDate) }}
            </UBadge>
          </div>

          <div
            v-if="event.author || fullEventDetails?.author"
            class="flex items-center justify-between gap-2 flex-wrap"
          >
            <span class="text-muted">Dibuat Oleh:</span>
            <span class="font-medium text-highlighted flex items-center gap-1.5">
              <UIcon
                name="i-lucide-user"
                class="size-3.5 text-primary"
              />
              {{ authorName }}
            </span>
          </div>
        </div>

        <!-- Description / HTML Rich Content rendered via EventRenderer -->
        <div class="space-y-2">
          <h4 class="text-xs font-semibold text-muted uppercase tracking-wider">
            Deskripsi & Materi
          </h4>
          <div
            v-if="isDetailsLoading"
            class="flex flex-col gap-2 py-6 items-center justify-center text-muted"
          >
            <UIcon
              name="i-lucide-loader"
              class="size-6 animate-spin text-primary"
            />
            <span class="text-xs">Memuat rincian deskripsi...</span>
          </div>
          <EventRenderer
            v-else
            :content="fullEventDetails?.description"
          />
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end w-full">
        <UButton
          label="Tutup"
          color="neutral"
          variant="outline"
          @click="isOpen = false"
        />
      </div>
    </template>
  </UModal>
</template>
