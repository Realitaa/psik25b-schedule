<script setup lang="ts">
import type { SubjectWithLecturers, CreateSubjectDTO } from '#shared/types'

const props = defineProps<{
  subject?: SubjectWithLecturers | null
  lecturerShortnamesList: string[]
  loading?: boolean
}>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  (e: 'submit', form: CreateSubjectDTO, editingId: number | null): void
}>()

const form = reactive({
  name: '',
  lecturerShortnames: [] as string[]
})

const editingId = computed(() => props.subject?.id || null)

watch([open, () => props.subject], ([isOpen, sub]) => {
  if (isOpen && sub) {
    form.name = sub.name
    form.lecturerShortnames = sub.lecturers.map(l => l.shortname)
  } else if (isOpen) {
    form.name = ''
    form.lecturerShortnames = []
  }
})

function handleSubmit() {
  const cleanShortnames = form.lecturerShortnames
    .filter((val): val is string => Boolean(val))
    .map(val => val.split(' - ')[0]?.trim() || val.trim())

  emit('submit', {
    name: form.name,
    lecturerShortnames: cleanShortnames
  }, editingId.value)
}
</script>

<template>
  <FormModal
    v-model:open="open"
    :title="editingId === null ? 'Tambah Mata Kuliah Baru' : 'Edit Mata Kuliah'"
    description="Kelola nama mata kuliah dan penugasan dosen pengampu"
    :loading="loading"
    @submit="handleSubmit"
  >
    <div class="space-y-4">
      <UFormField
        label="Nama Mata Kuliah"
        required
      >
        <UInput
          v-model="form.name"
          placeholder="Pemrograman Web Lanjut"
          class="w-full"
        />
      </UFormField>

      <!-- Kolom Dosen InputMenu Multiple -->
      <UFormField
        label="Dosen Pengampu"
      >
        <UInputMenu
          v-model="form.lecturerShortnames"
          :items="lecturerShortnamesList"
          multiple
          placeholder="Pilih dosen pengampu..."
          class="w-full"
        />
      </UFormField>
    </div>
  </FormModal>
</template>
