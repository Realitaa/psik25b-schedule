<script setup lang="ts">
import type { EventSelect, SubjectSelect } from '#shared/types'

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

const htmlContent = computed(() => {
  return renderTiptapToHtml(props.event?.description)
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
        </div>

        <!-- Description / HTML Rich Content with v-viewer -->
        <div class="space-y-2">
          <h4 class="text-xs font-semibold text-muted uppercase tracking-wider">
            Deskripsi & Materi
          </h4>
          <div
            v-if="htmlContent"
            v-viewer
            class="prose dark:prose-invert max-w-none text-sm break-words [&_img]:cursor-zoom-in [&_img]:rounded-lg [&_img]:max-h-96 [&_img]:w-auto [&_img]:object-contain [&_img]:shadow-sm hover:[&_img]:opacity-90 transition-opacity"
            v-html="htmlContent"
          />
          <div
            v-else
            class="text-sm text-muted italic py-2"
          >
            Tidak ada rincian deskripsi tambahan.
          </div>
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
