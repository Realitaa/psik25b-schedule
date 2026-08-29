<script setup lang="ts">
import type { EventPresetSelect, CreateEventPresetDTO } from '#shared/types'

const props = defineProps<{
  preset?: EventPresetSelect | null
  loading?: boolean
}>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  (e: 'submit', form: CreateEventPresetDTO, editingId: number | null): void
}>()

const form = reactive({
  name: '',
  color: '#3b82f6',
  icon: 'i-lucide-info'
})

const availableIcons = [
  'i-lucide-info',
  'i-lucide-file-text',
  'i-lucide-clipboard-check',
  'i-lucide-bell',
  'i-lucide-calendar',
  'i-lucide-megaphone',
  'i-lucide-bookmark',
  'i-lucide-book-open',
  'i-lucide-code-2',
  'i-lucide-presentation',
  'i-lucide-alert-circle',
  'i-lucide-check-circle-2',
  'i-lucide-clock',
  'i-lucide-video',
  'i-lucide-link',
  'i-lucide-award',
  'i-lucide-sparkles',
  'i-lucide-pin',
  'i-lucide-flag',
  'i-lucide-layers'
]

const colorPalette = [
  '#3b82f6', // Blue
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#ec4899', // Pink
  '#8b5cf6', // Purple
  '#6366f1', // Indigo
  '#14b8a6', // Teal
  '#64748b' // Slate
]

const editingId = computed(() => props.preset?.id || null)

watch([open, () => props.preset], ([isOpen, p]) => {
  if (isOpen && p) {
    form.name = p.name
    form.color = p.color
    form.icon = p.icon
  } else if (isOpen) {
    form.name = ''
    form.color = '#3b82f6'
    form.icon = 'i-lucide-info'
  }
})

function handleSubmit() {
  emit('submit', {
    name: form.name,
    color: form.color,
    icon: form.icon
  }, editingId.value)
}
</script>

<template>
  <FormModal
    v-model:open="open"
    :title="editingId === null ? 'Tambah Preset Event' : 'Edit Preset Event'"
    description="Kelola template preset event untuk penggunaan berulang"
    :loading="loading"
    @submit="handleSubmit"
  >
    <div class="space-y-4">
      <UFormField
        label="Nama Preset"
        required
      >
        <UInput
          v-model="form.name"
          placeholder="cth. Tugas / Kuis / Materi Tambahan"
          class="w-full"
        />
      </UFormField>

      <!-- Color Swatches & Picker -->
      <UFormField
        label="Warna Badge"
        required
      >
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-mono uppercase text-muted">{{ form.color }}</span>
            <div class="flex items-center gap-1.5">
              <span class="text-xs text-muted">Kustom:</span>
              <input
                v-model="form.color"
                type="color"
                class="size-6 rounded cursor-pointer border border-neutral-300 dark:border-neutral-700 bg-transparent p-0"
              >
            </div>
          </div>
          <div class="flex items-center gap-2 flex-wrap">
            <button
              v-for="c in colorPalette"
              :key="c"
              type="button"
              class="size-7 rounded-full border transition-transform hover:scale-110 flex items-center justify-center"
              :style="{ backgroundColor: c, borderColor: form.color === c ? '#ffffff' : 'transparent' }"
              :class="form.color === c ? 'ring-2 ring-primary ring-offset-1 dark:ring-offset-neutral-900' : ''"
              @click="form.color = c"
            >
              <UIcon
                v-if="form.color === c"
                name="i-lucide-check"
                class="size-3.5 text-white drop-shadow-xs"
              />
            </button>
          </div>
        </div>
      </UFormField>

      <!-- Visual Icon Grid -->
      <UFormField
        label="Ikon Badge"
        required
      >
        <div class="grid grid-cols-5 sm:grid-cols-10 gap-1.5 p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
          <button
            v-for="ic in availableIcons"
            :key="ic"
            type="button"
            :class="[
              'size-9 rounded-lg flex items-center justify-center transition-all',
              form.icon === ic
                ? 'bg-white dark:bg-neutral-800 shadow-xs ring-2 ring-primary'
                : 'hover:bg-neutral-200 dark:hover:bg-neutral-800/60 opacity-80 hover:opacity-100'
            ]"
            :style="form.icon === ic ? { color: form.color } : {}"
            @click="form.icon = ic"
          >
            <UIcon
              :name="ic"
              class="size-4.5"
            />
          </button>
        </div>
      </UFormField>
    </div>
  </FormModal>
</template>
