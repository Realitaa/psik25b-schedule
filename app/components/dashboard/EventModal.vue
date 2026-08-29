<script setup lang="ts">
import { CalendarDate } from '@internationalized/date'
import sizeof from 'object-sizeof'
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

const toast = useToast()
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

function clearDeadline() {
  selectedCalendarDate.value = undefined
  form.endDate = ''
}

const formattedCalendarEndDate = computed(() => {
  if (!selectedCalendarDate.value || !form.endDate) return 'Tanpa Batas Waktu (Permanen)'
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

const MAX_DESCRIPTION_BYTES = 1.9 * 1024 * 1024 // 1.9 MB limit
const descriptionSizeBytes = computed(() => {
  if (!form.description) return 0
  return sizeof(form.description)
})

const isContentOverLimit = computed(() => descriptionSizeBytes.value > MAX_DESCRIPTION_BYTES)
const descriptionSizeMb = computed(() => (descriptionSizeBytes.value / (1024 * 1024)).toFixed(2))

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
  if (isContentOverLimit.value) {
    toast.add({
      title: 'Ukuran Konten Terlalu Besar',
      description: `Total ukuran konten (${descriptionSizeMb.value} MB) melebihi batas maksimal 1.9 MB. Silakan kurangi teks atau gambar.`,
      color: 'error'
    })
    return
  }

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
            if (!editingId && form.endDate) {
              const targetIso = getScheduleNextExpiryIso(val || null)
              setCalendarFromIsoString(targetIso)
            }
          }"
        />
      </UFormField>

      <!-- Preset Event Row (Full Width with Combined Style Popover Trigger) -->
      <div class="flex items-end gap-2.5">
        <UFormField
          label="Preset Event (Cepat)"
          class="flex-1 min-w-0"
        >
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

        <!-- Combined Color & Icon Popover Trigger Button -->
        <UPopover>
          <UButton
            color="neutral"
            variant="outline"
            class="h-9 px-3 gap-2 shrink-0 flex items-center"
            title="Atur Warna & Ikon Badge"
          >
            <div
              class="size-5 rounded flex items-center justify-center shrink-0 border border-neutral-300 dark:border-neutral-700"
              :style="{ backgroundColor: `${form.color}20`, color: form.color }"
            >
              <UIcon
                :name="form.icon || 'i-lucide-bell'"
                class="size-3.5"
              />
            </div>
            <span class="text-xs font-medium hidden sm:inline">Warna & Ikon</span>
            <UIcon
              name="i-lucide-chevron-down"
              class="size-3 text-muted"
            />
          </UButton>

          <template #content>
            <div class="p-3.5 w-72 space-y-3.5">
              <!-- Color Selector -->
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-semibold text-highlighted">Warna Badge</span>
                  <div class="flex items-center gap-1.5">
                    <span class="text-[11px] font-mono uppercase text-muted">{{ form.color }}</span>
                    <input
                      v-model="form.color"
                      type="color"
                      class="size-5 rounded cursor-pointer border border-neutral-300 dark:border-neutral-700 bg-transparent p-0"
                      title="Pilih warna kustom"
                    >
                  </div>
                </div>
                <div class="flex items-center gap-1.5 flex-wrap">
                  <button
                    v-for="c in colorPalette"
                    :key="c"
                    type="button"
                    class="size-6 rounded-full border transition-transform hover:scale-110 flex items-center justify-center"
                    :style="{ backgroundColor: c, borderColor: form.color === c ? '#ffffff' : 'transparent' }"
                    :class="form.color === c ? 'ring-2 ring-primary ring-offset-1 dark:ring-offset-neutral-900' : ''"
                    @click="form.color = c"
                  >
                    <UIcon
                      v-if="form.color === c"
                      name="i-lucide-check"
                      class="size-3 text-white drop-shadow-xs"
                    />
                  </button>
                </div>
              </div>

              <!-- Icon Grid Selector -->
              <div class="space-y-2 pt-2 border-t border-subtle">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-semibold text-highlighted">Ikon Badge</span>
                  <span class="text-[10px] text-muted">Pilih ikon visual</span>
                </div>
                <div class="grid grid-cols-5 gap-1.5 max-h-36 overflow-y-auto p-1 rounded-lg bg-neutral-100 dark:bg-neutral-900/50">
                  <button
                    v-for="ic in availableIcons"
                    :key="ic"
                    type="button"
                    :class="[
                      'size-8 rounded-lg flex items-center justify-center transition-all',
                      form.icon === ic
                        ? 'bg-white dark:bg-neutral-800 shadow-xs ring-1 ring-primary'
                        : 'hover:bg-neutral-200 dark:hover:bg-neutral-800/60 opacity-80 hover:opacity-100'
                    ]"
                    :style="form.icon === ic ? { color: form.color } : {}"
                    @click="form.icon = ic"
                  >
                    <UIcon
                      :name="ic"
                      class="size-4"
                    />
                  </button>
                </div>
              </div>
            </div>
          </template>
        </UPopover>
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
      >
        <div class="space-y-2">
          <UPopover>
            <UButton
              :icon="form.endDate ? 'i-lucide-calendar' : 'i-lucide-infinity'"
              :color="form.endDate ? 'neutral' : 'primary'"
              :variant="form.endDate ? 'subtle' : 'soft'"
              class="w-full justify-start text-left font-normal"
              :label="formattedCalendarEndDate"
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
                <div class="pt-2 border-t border-subtle flex justify-end">
                  <UButton
                    label="Hapus Batas (Tanpa Batas Waktu)"
                    icon="i-lucide-infinity"
                    color="neutral"
                    variant="ghost"
                    size="xs"
                    @click="clearDeadline"
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
              v-if="form.endDate"
              label="Hapus Batas Waktu (Permanen)"
              icon="i-lucide-infinity"
              color="warning"
              variant="subtle"
              size="xs"
              @click="clearDeadline"
            />
          </div>
        </div>
      </UFormField>

      <UFormField
        label="Deskripsi & Rincian Event"
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
        <p :class="['mt-2 text-xs font-medium', isContentOverLimit ? 'text-red-500' : 'text-muted']">
          Ukuran konten saat ini: {{ descriptionSizeMb }}/1.9 MB
        </p>
      </UFormField>
    </div>
  </FormModal>
</template>
