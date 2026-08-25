<script setup lang="ts">
import type { SubjectWithLecturers, CreateSubjectDTO } from '#shared/types'
import { DAYS_LIST } from '#shared/utils/date'

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
  isOnline: false,
  isReplacement: false,
  building: '',
  floor: '',
  room: '',
  timeStart: '',
  timeEnd: '',
  day: 'Senin',
  lecturerShortnames: [] as string[]
})

const editingId = computed(() => props.subject?.id || null)

watch([open, () => props.subject], ([isOpen, sub]) => {
  if (isOpen && sub) {
    form.name = sub.name
    form.isOnline = Boolean(sub.isOnline)
    form.isReplacement = Boolean(sub.isReplacement)
    form.building = sub.building || ''
    form.floor = sub.floor || ''
    form.room = sub.room || ''
    form.timeStart = sub.timeStart || ''
    form.timeEnd = sub.timeEnd || ''
    form.day = sub.day || 'Senin'
    form.lecturerShortnames = sub.lecturers.map(l => l.shortname)
  } else if (isOpen) {
    form.name = ''
    form.isOnline = false
    form.isReplacement = false
    form.building = ''
    form.floor = ''
    form.room = ''
    form.timeStart = ''
    form.timeEnd = ''
    form.day = 'Senin'
    form.lecturerShortnames = []
  }
})

function handleSubmit() {
  const cleanShortnames = form.lecturerShortnames
    .filter((val): val is string => Boolean(val))
    .map(val => val.split(' - ')[0]?.trim() || val.trim())

  emit('submit', {
    name: form.name,
    isOnline: form.isOnline,
    isReplacement: form.isReplacement,
    building: form.isOnline ? null : (form.building || null),
    floor: form.isOnline ? null : (form.floor || null),
    room: form.isOnline ? null : (form.room || null),
    timeStart: form.timeStart || null,
    timeEnd: form.timeEnd || null,
    day: form.day || null,
    lecturerShortnames: cleanShortnames
  }, editingId.value)
}
</script>

<template>
  <FormModal
    v-model:open="open"
    :title="editingId === null ? 'Tambah Mata Kuliah Baru' : 'Edit Mata Kuliah'"
    description="Isi rincian jadwal, ruangan, dan dosen pengampu"
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

      <div class="grid grid-cols-2 gap-4">
        <UFormField label="Hari">
          <USelect
            v-model="form.day"
            :items="DAYS_LIST"
            class="w-full"
          />
        </UFormField>

        <div class="grid grid-cols-2 gap-2">
          <UFormField label="Jam Mulai">
            <UInput
              v-model="form.timeStart"
              placeholder="08:00"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Jam Selesai">
            <UInput
              v-model="form.timeEnd"
              placeholder="10:30"
              class="w-full"
            />
          </UFormField>
        </div>
      </div>

      <!-- Pilihan Metode / Lokasi Perkuliahan Daring vs Luring -->
      <UFormField
        label="Metode / Lokasi Perkuliahan"
        required
      >
        <USelect
          v-model="form.isOnline"
          :items="[
            { label: 'Luring (Tatap Muka di Ruangan)', value: false },
            { label: 'Daring (Online)', value: true }
          ]"
          value-attribute="value"
          option-attribute="label"
          class="w-full"
        />
      </UFormField>

      <!-- Tampilkan Gedung, Lantai, Ruangan hanya saat LURING -->
      <div
        v-if="!form.isOnline"
        class="grid grid-cols-3 gap-3 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800"
      >
        <UFormField label="Gedung">
          <UInput
            v-model="form.building"
            placeholder="Fasilkom"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Lantai">
          <UInput
            v-model="form.floor"
            placeholder="2"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Ruangan">
          <UInput
            v-model="form.room"
            placeholder="Lab 3"
            class="w-full"
          />
        </UFormField>
      </div>

      <div
        v-else
        class="p-3 bg-info-50/20 text-info rounded-xl border border-info/20 text-xs flex items-center gap-2"
      >
        <UIcon
          name="i-lucide-video"
          class="size-4 shrink-0"
        />
        <span>Perkuliahan diselenggarakan secara Daring (Online). Tidak perlu mengisi nomor ruangan.</span>
      </div>

      <!-- Kolom Dosen InputMenu Multiple -->
      <UFormField
        label="Dosen Pengampu"
        description="Pilih satu atau beberapa dosen pengampu mata kuliah ini"
      >
        <UInputMenu
          v-model="form.lecturerShortnames"
          :items="lecturerShortnamesList"
          multiple
          placeholder="Pilih dosen pengampu..."
          class="w-full"
        />
      </UFormField>

      <!-- Mata Kuliah Pengganti (Hilang setelah selesai sekali) -->
      <UFormField label="Opsi Tambahan">
        <UCheckbox
          v-model="form.isReplacement"
          label="Mata Kuliah Ganti (hilang setelah dilalui sekali)"
          description="Mata kuliah ini hanya berlaku satu kali untuk menggantikan jadwal lain, dan akan otomatis terhapus dari sistem setelah jam perkuliahan selesai."
        />
      </UFormField>
    </div>
  </FormModal>
</template>
