<script setup lang="ts">
import type { CreateAcademicYearDTO } from '#shared/types'

defineProps<{
  loading?: boolean
}>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  (e: 'submit', form: CreateAcademicYearDTO): void
}>()

const form = reactive<CreateAcademicYearDTO>({
  yearStart: new Date().getFullYear(),
  yearEnd: new Date().getFullYear() + 1,
  semester: 'ganjil',
  isCurrentActiveYear: false
})

watch(open, (isOpen) => {
  if (isOpen) {
    form.yearStart = new Date().getFullYear()
    form.yearEnd = new Date().getFullYear() + 1
    form.semester = 'ganjil'
    form.isCurrentActiveYear = false
  }
})

function handleSubmit() {
  emit('submit', { ...form })
}
</script>

<template>
  <FormModal
    v-model:open="open"
    title="Tambah Tahun Ajaran Baru"
    description="Buat rentang tahun ajaran dan semester perkuliahan"
    :loading="loading"
    @submit="handleSubmit"
  >
    <div class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <UFormField
          label="Tahun Mulai"
          required
        >
          <UInput
            v-model.number="form.yearStart"
            type="number"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Tahun Selesai"
          required
        >
          <UInput
            v-model.number="form.yearEnd"
            type="number"
            class="w-full"
          />
        </UFormField>
      </div>

      <UFormField
        label="Semester"
        required
      >
        <USelect
          v-model="form.semester"
          :items="[
            { label: 'Ganjil', value: 'ganjil' },
            { label: 'Genap', value: 'genap' }
          ]"
          value-attribute="value"
          option-attribute="label"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Aktifkan Langsung">
        <UCheckbox
          v-model="form.isCurrentActiveYear"
          label="Jadikan sebagai Tahun Ajaran Aktif saat ini"
        />
      </UFormField>
    </div>
  </FormModal>
</template>
