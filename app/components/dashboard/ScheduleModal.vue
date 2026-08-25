<script setup lang="ts">
import type { ScheduleWithSubject, CreateScheduleDTO } from '#shared/types'
import { DAYS_LIST } from '#shared/utils/date'

const props = defineProps<{
  schedule?: ScheduleWithSubject | null
  subjectOptions: Array<{ label: string, value: number }>
  loading?: boolean
}>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  (e: 'submit', form: CreateScheduleDTO, editingId: number | null): void
}>()

const form = reactive({
  subjectId: undefined as number | undefined,
  type: 'regular' as 'regular' | 'one_off',
  isOnline: false,
  building: '',
  floor: '',
  room: '',
  timeStart: '08:00',
  timeEnd: '10:30',
  day: 'Senin'
})

const editingId = computed(() => props.schedule?.id || null)

watch([open, () => props.schedule], ([isOpen, sched]) => {
  if (isOpen && sched) {
    form.subjectId = sched.subjectId
    form.type = sched.type === 'one_off' ? 'one_off' : 'regular'
    form.isOnline = Boolean(sched.isOnline)
    form.building = sched.building || ''
    form.floor = sched.floor || ''
    form.room = sched.room || ''
    form.timeStart = sched.timeStart || '08:00'
    form.timeEnd = sched.timeEnd || '10:30'
    form.day = sched.day || 'Senin'
  } else if (isOpen) {
    form.subjectId = props.subjectOptions[0]?.value || undefined
    form.type = 'regular'
    form.isOnline = false
    form.building = ''
    form.floor = ''
    form.room = ''
    form.timeStart = '08:00'
    form.timeEnd = '10:30'
    form.day = 'Senin'
  }
})

function handleSubmit() {
  if (!form.subjectId) return

  emit('submit', {
    subjectId: form.subjectId,
    type: form.type,
    isOnline: form.isOnline,
    building: form.isOnline ? null : (form.building || null),
    floor: form.isOnline ? null : (form.floor || null),
    room: form.isOnline ? null : (form.room || null),
    timeStart: form.timeStart,
    timeEnd: form.timeEnd,
    day: form.day
  }, editingId.value)
}
</script>

<template>
  <FormModal
    v-model:open="open"
    :title="editingId === null ? 'Tambah Jadwal Kuliah' : 'Edit Jadwal Kuliah'"
    description="Isi mata kuliah, hari, jam pelaksanaan, dan lokasi/metode perkuliahan"
    :loading="loading"
    @submit="handleSubmit"
  >
    <div class="space-y-4">
      <UFormField
        label="Mata Kuliah"
        required
      >
        <USelect
          v-model="form.subjectId"
          :items="subjectOptions"
          value-attribute="value"
          option-attribute="label"
          placeholder="Pilih mata kuliah..."
          class="w-full"
        />
      </UFormField>

      <UFormField
        label="Kategori Jadwal"
        required
      >
        <USelect
          v-model="form.type"
          :items="[
            { label: 'Jadwal Tetap (Mingguan)', value: 'regular' },
            { label: 'Jadwal Satu Kali / Pengganti (1x)', value: 'one_off' }
          ]"
          value-attribute="value"
          option-attribute="label"
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

      <!-- Metode Perkuliahan Daring vs Luring -->
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

      <!-- Gedung, Lantai, Ruangan saat LURING -->
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
        <span>Perkuliahan Daring (Online). Tidak perlu mengisi ruangan.</span>
      </div>
    </div>
  </FormModal>
</template>
