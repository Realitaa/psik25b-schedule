<script setup lang="ts">
import type { LecturerSelect, CreateLecturerDTO } from '#shared/types'

const props = defineProps<{
  lecturer?: LecturerSelect | null
  loading?: boolean
}>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  (e: 'submit', form: CreateLecturerDTO, editingId: number | null): void
}>()

const form = reactive({
  name: '',
  shortname: '',
  nip: '',
  phone: ''
})

const editingId = computed(() => props.lecturer?.id || null)

watch([open, () => props.lecturer], ([isOpen, lect]) => {
  if (isOpen && lect) {
    form.name = lect.name
    form.shortname = lect.shortname
    form.nip = lect.nip || ''
    form.phone = lect.phone || ''
  } else if (isOpen) {
    form.name = ''
    form.shortname = ''
    form.nip = ''
    form.phone = ''
  }
})

function handleSubmit() {
  emit('submit', {
    name: form.name,
    shortname: form.shortname,
    nip: form.nip || null,
    phone: form.phone || null
  }, editingId.value)
}
</script>

<template>
  <FormModal
    v-model:open="open"
    :title="editingId === null ? 'Tambah Dosen Baru' : 'Edit Data Dosen'"
    description="Kelola informasi dosen dan kode singkatannya"
    :loading="loading"
    @submit="handleSubmit"
  >
    <div class="space-y-4">
      <UFormField
        label="Nama Lengkap & Gelar"
        required
      >
        <UInput
          v-model="form.name"
          placeholder="Dr. John Doe, M.Kom."
          class="w-full"
        />
      </UFormField>

      <UFormField
        label="Kode / Shortname"
        description="Kode unik singkat untuk pengenal dosen"
        required
      >
        <UInput
          v-model="form.shortname"
          placeholder="JD"
          class="w-full"
        />
      </UFormField>

      <UFormField label="NIP (Opsional)">
        <UInput
          v-model="form.nip"
          placeholder="199001012020121001"
          class="w-full"
        />
      </UFormField>

      <UFormField label="No HP / WhatsApp (Opsional)">
        <UInput
          v-model="form.phone"
          placeholder="081234567890"
          class="w-full"
        />
      </UFormField>
    </div>
  </FormModal>
</template>
