<script setup lang="ts">
import { CalendarDate } from '@internationalized/date'
import type { EventWithSubject, EventSelect, CreateEventDTO } from '#shared/types'
import { renderTiptapToHtml } from '~/utils/tiptap'

const props = defineProps<{
  event?: EventWithSubject | null
  subjectOptions: Array<{ label: string, value: number }>
  getSubjectNextExpiryIso: (subjectId?: number | null) => string
  loading?: boolean
}>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  (e: 'submit', form: CreateEventDTO, editingId: number | null): void
}>()

const editingId = computed(() => props.event?.id || null)
const isEditingEventLoading = ref(false)

const form = reactive({
  subjectId: undefined as number | undefined,
  title: '',
  description: '',
  endDate: ''
})

const selectedCalendarDate = shallowRef<CalendarDate | undefined>()
const selectedTime = ref('10:30')

function setCalendarFromIsoString(isoStr?: string | null) {
  if (!isoStr) {
    selectedCalendarDate.value = undefined
    selectedTime.value = '10:30'
    form.endDate = ''
    return
  }
  try {
    const d = new Date(isoStr)
    selectedCalendarDate.value = new CalendarDate(d.getFullYear(), d.getMonth() + 1, d.getDate())
    const h = String(d.getHours()).padStart(2, '0')
    const min = String(d.getMinutes()).padStart(2, '0')
    selectedTime.value = `${h}:${min}`
    const yStr = String(d.getFullYear()).padStart(4, '0')
    const mStr = String(d.getMonth() + 1).padStart(2, '0')
    const dStr = String(d.getDate()).padStart(2, '0')
    form.endDate = `${yStr}-${mStr}-${dStr}T${h}:${min}`
  } catch {
    selectedCalendarDate.value = undefined
    selectedTime.value = '10:30'
    form.endDate = ''
  }
}

function updateCalendarEndDate() {
  if (!selectedCalendarDate.value) {
    form.endDate = ''
    return
  }
  const y = String(selectedCalendarDate.value.year).padStart(4, '0')
  const m = String(selectedCalendarDate.value.month).padStart(2, '0')
  const d = String(selectedCalendarDate.value.day).padStart(2, '0')
  const t = selectedTime.value || '23:59'
  form.endDate = `${y}-${m}-${d}T${t}`
}

const formattedCalendarEndDate = computed(() => {
  if (!selectedCalendarDate.value) return null
  const y = selectedCalendarDate.value.year
  const m = selectedCalendarDate.value.month
  const d = selectedCalendarDate.value.day
  const dateObj = new Date(y, m - 1, d)
  const dateFormatted = dateObj.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
  return `${dateFormatted}, pukul ${selectedTime.value || '23:59'} WIB`
})

watch([open, () => props.event], async ([isOpen, ev]) => {
  if (isOpen && ev) {
    form.subjectId = ev.subjectId
    form.title = ev.title
    form.description = ''
    setCalendarFromIsoString(ev.endDate)
    isEditingEventLoading.value = true

    try {
      const full = await $fetch<EventSelect>(`/api/events/${ev.id}`)
      if (full) {
        form.description = full.description ? renderTiptapToHtml(full.description) : ''
      }
    } catch (err) {
      console.error('Gagal memuat deskripsi event:', err)
    } finally {
      isEditingEventLoading.value = false
    }
  } else if (isOpen) {
    form.subjectId = props.subjectOptions[0]?.value || undefined
    form.title = ''
    form.description = ''
    const targetIso = props.getSubjectNextExpiryIso(form.subjectId || null)
    setCalendarFromIsoString(targetIso)
  }
})

function handleSubmit() {
  if (!form.subjectId) return
  emit('submit', {
    subjectId: form.subjectId,
    title: form.title,
    description: form.description || null,
    endDate: form.endDate ? new Date(form.endDate).toISOString() : null
  }, editingId.value)
}
</script>

<template>
  <FormModal
    v-model:open="open"
    :title="editingId === null ? 'Tambah Event Perkuliahan' : 'Edit Event Perkuliahan'"
    description="Buat pengumuman, kuis, atau tugas khusus yang terhubung ke mata kuliah"
    :loading="loading"
    @submit="handleSubmit"
  >
    <div class="space-y-4">
      <UFormField
        label="Mata Kuliah Terkait"
        required
      >
        <USelect
          v-model="form.subjectId"
          :items="subjectOptions"
          value-attribute="value"
          option-attribute="label"
          placeholder="Pilih mata kuliah..."
          class="w-full"
          @update:model-value="(val) => {
            if (!editingId) {
              const targetIso = getSubjectNextExpiryIso(val || null)
              setCalendarFromIsoString(targetIso)
            }
          }"
        />
      </UFormField>

      <UFormField
        label="Judul Event"
        required
      >
        <UInput
          v-model="form.title"
          placeholder="cth. Kuis 1 Materi OOP / Pengumpulan Tugas Kelompok"
          class="w-full"
        />
      </UFormField>

      <UFormField
        label="Batas Waktu Event (Auto-Expiry)"
        description="Gunakan kalender untuk memilih tanggal dan jam berakhirnya event. Kosongkan jika tanpa batas waktu."
      >
        <div class="space-y-2">
          <UPopover>
            <UButton
              icon="i-lucide-calendar"
              color="neutral"
              variant="subtle"
              class="w-full justify-start text-left font-normal"
              :label="formattedCalendarEndDate || 'Pilih Tanggal & Jam Batas Waktu...'"
            />

            <template #content>
              <div class="p-3 space-y-3">
                <UCalendar
                  v-model="selectedCalendarDate"
                  class="rounded-lg"
                  @update:model-value="updateCalendarEndDate"
                />
                <div class="flex items-center justify-between gap-2 pt-2 border-t border-subtle">
                  <span class="text-xs text-muted font-medium">Jam Batas (WIB):</span>
                  <UInput
                    v-model="selectedTime"
                    type="time"
                    class="w-32"
                    @update:model-value="updateCalendarEndDate"
                  />
                </div>
              </div>
            </template>
          </UPopover>

          <div class="flex items-center gap-2">
            <UButton
              label="Set Sesuai Jadwal Matkul Terdekat"
              icon="i-lucide-wand-sparkles"
              color="neutral"
              variant="subtle"
              size="xs"
              @click="() => {
                const targetIso = getSubjectNextExpiryIso(form.subjectId || null)
                setCalendarFromIsoString(targetIso)
              }"
            />
            <UButton
              v-if="selectedCalendarDate"
              label="Hapus Batas Waktu"
              icon="i-lucide-x"
              color="neutral"
              variant="ghost"
              size="xs"
              @click="setCalendarFromIsoString(null)"
            />
          </div>
        </div>
      </UFormField>

      <UFormField
        label="Deskripsi & Rincian Event"
        description="Gunakan editor untuk menyusun rincian materi, instruksi, dan gambar"
      >
        <div class="relative w-full">
          <EventEditor
            v-model="form.description"
            placeholder="Tuliskan rincian event di sini..."
          />
          <div
            v-if="isEditingEventLoading"
            class="absolute inset-0 bg-neutral-50/75 dark:bg-neutral-900/75 flex flex-col gap-2 items-center justify-center rounded-xl backdrop-blur-xs z-10"
          >
            <UIcon
              name="i-lucide-loader"
              class="size-6 animate-spin text-primary"
            />
            <span class="text-xs text-muted font-medium">Memuat deskripsi event...</span>
          </div>
        </div>
      </UFormField>
    </div>
  </FormModal>
</template>
