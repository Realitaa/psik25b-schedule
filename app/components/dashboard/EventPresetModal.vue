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
  'i-lucide-presentation'
]

const colorOptions = [
  { label: 'Biru (Info)', value: '#3b82f6' },
  { label: 'Kuning / Oranye (Tugas)', value: '#f59e0b' },
  { label: 'Merah (Ujian / Deadline)', value: '#ef4444' },
  { label: 'Hijau (Materi)', value: '#10b981' },
  { label: 'Ungu (Khusus)', value: '#8b5cf6' },
  { label: 'Teal', value: '#14b8a6' }
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

      <UFormField
        label="Warna Badge"
        required
      >
        <div class="flex items-center gap-2">
          <input
            v-model="form.color"
            type="color"
            class="size-8 rounded border border-neutral-300 dark:border-neutral-700 cursor-pointer bg-transparent"
          >
          <USelect
            v-model="form.color"
            :items="colorOptions"
            value-attribute="value"
            option-attribute="label"
            class="w-full"
          />
        </div>
      </UFormField>

      <UFormField
        label="Icon Badge"
        required
      >
        <div class="flex items-center gap-2">
          <div
            class="size-8 rounded flex items-center justify-center border border-neutral-300 dark:border-neutral-700 shrink-0"
            :style="{ color: form.color }"
          >
            <UIcon
              :name="form.icon || 'i-lucide-bell'"
              class="size-4"
            />
          </div>
          <USelect
            v-model="form.icon"
            :items="availableIcons"
            class="w-full"
          />
        </div>
      </UFormField>
    </div>
  </FormModal>
</template>
