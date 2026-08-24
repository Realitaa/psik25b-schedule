<script setup lang="ts">
import type { EventSelect, SubjectSelect } from '#shared/types'
import EventRenderer from '~/components/event/EventRenderer.vue'

const props = defineProps<{
  open: boolean
  event?: (EventSelect & { subject?: SubjectSelect }) | null
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const isOpen = computed({
  get: () => props.open,
  set: (val: boolean) => emit('update:open', val)
})

function formatEndDate(dateStr?: string | null) {
  if (!dateStr) return 'Tanpa batas waktu (Permanen)'
  try {
    const d = new Date(dateStr)
    return d.toLocaleString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' WIB'
  } catch {
    return dateStr
  }
}
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
        <!-- Event Meta Info -->
        <div class="p-3.5 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-2 text-sm">
          <div
            v-if="event.subject"
            class="flex items-center justify-between gap-2 flex-wrap"
          >
            <span class="text-muted">Mata Kuliah:</span>
            <span class="font-semibold text-highlighted">{{ event.subject.name }}</span>
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
              {{ formatEndDate(event.endDate) }}
            </UBadge>
          </div>

          <div
            v-if="event.author"
            class="flex items-center justify-between gap-2 flex-wrap"
          >
            <span class="text-muted">Dibuat Oleh:</span>
            <span class="font-medium text-highlighted flex items-center gap-1.5">
              <UIcon
                name="i-lucide-user"
                class="size-3.5 text-primary"
              />
              {{ event.author.name || event.author.username }}
            </span>
          </div>
        </div>

        <!-- Description / HTML Rich Content rendered via EventRenderer -->
        <div class="space-y-2">
          <h4 class="text-xs font-semibold text-muted uppercase tracking-wider">
            Deskripsi & Materi
          </h4>
          <EventRenderer :content="event.description" />
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
