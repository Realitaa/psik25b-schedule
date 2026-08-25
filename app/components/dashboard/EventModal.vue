<script setup lang="ts">
import { CalendarDate } from '@internationalized/date'
import type { EventSelect, CreateEventDTO, EventPresetSelect, ScheduleWithSubject } from '#shared/types'
import { renderTiptapToHtml } from '~/utils/tiptap'

const props = defineProps<{
  event?: EventSelect | null
  scheduleOptions: Array<{ label: string, value: number, schedule: ScheduleWithSubject }>
  presets: EventPresetSelect[]
  getScheduleNextExpiryIso: (scheduleId?: number | null) => string
  loading?: boolean
}>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  (e: 'submit', form: CreateEventDTO, editingId: number | null): void
}>()

const editingId = computed(() => props.event?.id || null)
const isEditingEventLoading = ref(false)

const form = reactive({
  scheduleId: undefined as number | undefined,
  presetId: undefined as number | null | undefined,
  type: 'Informasi',
  color: '#3b82f6',
  icon: 'i-lucide-info',
  title: '',
  description: '',
  endDate: ''
})

const selectedCalendarDate = shallowRef<CalendarDate | undefined>()
const selectedTime = ref('10:30')

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

function onPresetSelected(presetIdVal?: number | null) {
  if (!presetIdVal) {
    form.presetId = null
    return
  }
  const found = props.presets.find(p => p.id === presetIdVal)
  if (found) {
    form.presetId = found.id
    form.type = found.name
    form.color = found.color
    form.icon = found.icon
  }
}

function setCalendarFromIsoString(isoStr?: string | null) {
  if (!isoStr) {
    selectedCalendarDate.value = undefined
    selectedTime.value = '10:30'
    form.endDate = ''
    return
  }
  try {
    const d = new Date(isoStr)
    const wibStr = d.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })
    const wibDate = new Date(wibStr)
    selectedCalendarDate.value = new CalendarDate(wibDate.getFullYear(), wibDate.getMonth() + 1, wibDate.getDate())
    const h = String(wibDate.getHours()).padStart(2, '0')
    const min = String(wibDate.getMinutes()).padStart(2, '0')
    selectedTime.value = `${h}:${min}`
    const yStr = String(wibDate.getFullYear()).padStart(4, '0')
    const mStr = String(wibDate.getMonth() + 1).padStart(2, '0')
    const dStr = String(wibDate.getDate()).padStart(2, '0')
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
    form.scheduleId = ev.scheduleId
    form.presetId = ev.presetId || null
    form.type = ev.type || 'Informasi'
    form.color = ev.color || '#3b82f6'
    form.icon = ev.icon || 'i-lucide-info'
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
    form.scheduleId = props.scheduleOptions[0]?.value || undefined
    const defaultPreset = props.presets[0]
    if (defaultPreset) {
      form.presetId = defaultPreset.id
      form.type = defaultPreset.name
      form.color = defaultPreset.color
      form.icon = defaultPreset.icon
    } else {
      form.presetId = null
      form.type = 'Informasi'
      form.color = '#3b82f6'
      form.icon = 'i-lucide-info'
    }
    form.title = ''
    form.description = ''
    const targetIso = props.getScheduleNextExpiryIso(form.scheduleId || null)
    setCalendarFromIsoString(targetIso)
  }
})

function handleSubmit() {
  if (!form.scheduleId) return
  emit('submit', {
    scheduleId: form.scheduleId,
    presetId: form.presetId || null,
    type: form.type,
    color: form.color,
    icon: form.icon,
    title: form.title,
    description: form.description || null,
    endDate: form.endDate ? new Date(`${form.endDate}:00+07:00`).toISOString() : null
  }, editingId.value)
}
</script>

<template>
  <FormModal
    v-model:open="open"
    :title="editingId === null ? 'Tambah Event / Pengumuman' : 'Edit Event / Pengumuman'"
    description="Buat pengumuman, kuis, atau tugas khusus yang terhubung ke jadwal kuliah"
    :loading="loading"
    @submit="handleSubmit"
  >
    <div class="space-y-4">
      <UFormField
        label="Jadwal Kuliah Terkait"
        required
      >
        <USelect
          v-model="form.scheduleId"
          :items="scheduleOptions"
          value-attribute="value"
          option-attribute="label"
          placeholder="Pilih jadwal perkuliahan..."
          class="w-full"
          @update:model-value="(val) => {
            if (!editingId) {
              const targetIso = getScheduleNextExpiryIso(val || null)
              setCalendarFromIsoString(targetIso)
            }
          }"
        />
      </UFormField>

      <!-- Preset & Styling Row -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
        <UFormField label="Preset Event (Cepat)">
          <USelect
            v-model="form.presetId"
            :items="[
              { label: 'Kustom / Tanpa Preset', value: null },
              ...presets.map(p => ({ label: p.name, value: p.id }))
            ]"
            value-attribute="value"
            option-attribute="label"
            class="w-full"
            @update:model-value="onPresetSelected"
          />
        </UFormField>

        <UFormField label="Warna Badge">
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

        <UFormField label="Ikon Badge">
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

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <UFormField
          label="Label / Kategori"
          required
        >
          <UInput
            v-model="form.type"
            placeholder="cth. Tugas / Ujian / Informasi"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Judul Event"
          required
        >
          <UInput
            v-model="form.title"
            placeholder="cth. Kuis 1 Materi OOP"
            class="w-full"
          />
        </UFormField>
      </div>

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
                const targetIso = getScheduleNextExpiryIso(form.scheduleId || null)
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
