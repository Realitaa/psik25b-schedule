<script setup lang="ts">
import { CalendarDate } from '@internationalized/date'
import type { ScheduleWithSubject, ScheduleActionDTO } from '#shared/types'
import { DAYS_INDONESIAN } from '#shared/utils/date'

const props = defineProps<{
  schedule?: ScheduleWithSubject | null
  loading?: boolean
}>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  (e: 'submit', actionPayload: ScheduleActionDTO, scheduleId: number): void
}>()

const selectedMode = ref<'skip' | 'move' | 'end' | 'reset'>('skip')

// Move fields
const moveForm = reactive({
  timeStart: '08:00',
  timeEnd: '10:30',
  isOnline: false,
  building: '',
  floor: '',
  room: ''
})

const selectedCalendarDate = shallowRef<CalendarDate | undefined>()

watch([open, () => props.schedule], ([isOpen, sched]) => {
  if (isOpen && sched) {
    if (sched.status === 'skipped' || sched.status === 'ended') {
      selectedMode.value = 'reset'
    } else {
      selectedMode.value = 'skip'
    }

    moveForm.timeStart = sched.timeStart
    moveForm.timeEnd = sched.timeEnd
    moveForm.isOnline = sched.isOnline
    moveForm.building = sched.building || ''
    moveForm.floor = sched.floor || ''
    moveForm.room = sched.room || ''

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    selectedCalendarDate.value = new CalendarDate(tomorrow.getFullYear(), tomorrow.getMonth() + 1, tomorrow.getDate())
  }
})

const targetDayName = computed(() => {
  if (!selectedCalendarDate.value) return 'Senin'
  const y = selectedCalendarDate.value.year
  const m = selectedCalendarDate.value.month
  const d = selectedCalendarDate.value.day
  const dateObj = new Date(y, m - 1, d)
  return DAYS_INDONESIAN[dateObj.getDay()] || 'Senin'
})

const formattedCalendarTarget = computed(() => {
  if (!selectedCalendarDate.value) return null
  const y = selectedCalendarDate.value.year
  const m = selectedCalendarDate.value.month
  const d = selectedCalendarDate.value.day
  const dateObj = new Date(y, m - 1, d)
  return dateObj.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
})

function handleSubmit() {
  if (!props.schedule) return

  if (selectedMode.value === 'move') {
    let movedDate: string | undefined = undefined
    if (selectedCalendarDate.value) {
      const y = String(selectedCalendarDate.value.year).padStart(4, '0')
      const m = String(selectedCalendarDate.value.month).padStart(2, '0')
      const d = String(selectedCalendarDate.value.day).padStart(2, '0')
      const t = moveForm.timeEnd || '10:30'
      // Construct date explicitly in WIB (+07:00)
      movedDate = new Date(`${y}-${m}-${d}T${t}:00+07:00`).toISOString()
    }

    emit('submit', {
      action: 'move',
      movedDate,
      day: targetDayName.value,
      timeStart: moveForm.timeStart,
      timeEnd: moveForm.timeEnd,
      isOnline: moveForm.isOnline,
      building: moveForm.isOnline ? null : (moveForm.building || null),
      floor: moveForm.isOnline ? null : (moveForm.floor || null),
      room: moveForm.isOnline ? null : (moveForm.room || null)
    }, props.schedule.id)
  } else {
    emit('submit', {
      action: selectedMode.value
    }, props.schedule.id)
  }
}
</script>

<template>
  <FormModal
    v-model:open="open"
    :title="`Tindakan Jadwal: ${schedule?.subject?.name || ''}`"
    description="Pilih tindakan untuk jadwal kuliah ini (lewati minggu ini, pindah jadwal sementara, atau tandai selesai)"
    :loading="loading"
    submit-label="Terapkan Tindakan"
    @submit="handleSubmit"
  >
    <div class="space-y-5">
      <!-- Action Selector Tabs/Radio -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <UButton
          :label="schedule?.status === 'skipped' ? 'Sedang Dilewati' : 'Lewati Minggu Ini'"
          icon="i-lucide-skip-forward"
          :color="selectedMode === 'skip' ? 'error' : 'neutral'"
          :variant="selectedMode === 'skip' ? 'solid' : 'outline'"
          size="sm"
          class="justify-center"
          @click="selectedMode = 'skip'"
        />
        <UButton
          label="Pindah Sementara"
          icon="i-lucide-calendar-arrow-up"
          :color="selectedMode === 'move' ? 'warning' : 'neutral'"
          :variant="selectedMode === 'move' ? 'solid' : 'outline'"
          size="sm"
          class="justify-center"
          @click="selectedMode = 'move'"
        />
        <UButton
          :label="schedule?.status === 'ended' ? 'Sudah Selesai' : 'Tandai Selesai'"
          icon="i-lucide-check-check"
          :color="selectedMode === 'end' ? 'primary' : 'neutral'"
          :variant="selectedMode === 'end' ? 'solid' : 'outline'"
          size="sm"
          class="justify-center"
          @click="selectedMode = 'end'"
        />
        <UButton
          label="Reset ke Aktif"
          icon="i-lucide-rotate-ccw"
          :color="selectedMode === 'reset' ? 'success' : 'neutral'"
          :variant="selectedMode === 'reset' ? 'solid' : 'outline'"
          size="sm"
          class="justify-center"
          @click="selectedMode = 'reset'"
        />
      </div>

      <!-- Mode 1: Skip Explanation -->
      <div
        v-if="selectedMode === 'skip'"
        class="p-4 bg-rose-50/20 dark:bg-rose-950/20 border border-rose-500/30 rounded-xl space-y-2 text-sm text-rose-800 dark:text-rose-300"
      >
        <div class="font-semibold flex items-center gap-2">
          <UIcon
            name="i-lucide-alert-circle"
            class="size-5 shrink-0"
          />
          Konfirmasi Lewati Perkuliahan Minggu Ini
        </div>
        <p class="text-xs leading-relaxed text-muted">
          Perkuliahan <span class="font-semibold text-highlighted">{{ schedule?.subject?.name }}</span> pada hari
          <span class="font-semibold text-highlighted">{{ schedule?.day }} ({{ schedule?.timeStart }} - {{ schedule?.timeEnd }})</span>
          akan ditandai <strong>"Ditiadakan Minggu Ini"</strong> dan disembunyikan dari Jadwal Hari Ini sampai jam perkuliahan selesai, kemudian otomatis aktif kembali untuk minggu depan.
        </p>
      </div>

      <!-- Mode 2: Move Form -->
      <div
        v-else-if="selectedMode === 'move'"
        class="space-y-4 p-4 bg-amber-50/20 dark:bg-amber-950/20 border border-amber-500/30 rounded-xl"
      >
        <div class="text-sm font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-2">
          <UIcon
            name="i-lucide-calendar-plus"
            class="size-5 shrink-0"
          />
          Jadwal Pengganti Sementara
        </div>

        <UFormField
          label="Tanggal Pelaksanaan Kuliah Pengganti"
          required
        >
          <UPopover>
            <UButton
              icon="i-lucide-calendar"
              color="neutral"
              variant="subtle"
              class="w-full justify-start text-left font-normal"
              :label="formattedCalendarTarget || 'Pilih Tanggal Pelaksanaan...'"
            />
            <template #content>
              <div class="p-3">
                <UCalendar
                  v-model="selectedCalendarDate"
                  class="rounded-lg"
                />
              </div>
            </template>
          </UPopover>
        </UFormField>

        <div class="grid grid-cols-2 gap-3">
          <UFormField
            label="Jam Mulai"
            required
          >
            <UInput
              v-model="moveForm.timeStart"
              placeholder="08:00"
              class="w-full"
            />
          </UFormField>
          <UFormField
            label="Jam Selesai"
            required
          >
            <UInput
              v-model="moveForm.timeEnd"
              placeholder="10:30"
              class="w-full"
            />
          </UFormField>
        </div>

        <UFormField label="Metode Kuliah Pengganti">
          <USelect
            v-model="moveForm.isOnline"
            :items="[
              { label: 'Luring (Ruangan)', value: false },
              { label: 'Daring (Online)', value: true }
            ]"
            value-attribute="value"
            option-attribute="label"
            class="w-full"
          />
        </UFormField>

        <div
          v-if="!moveForm.isOnline"
          class="grid grid-cols-3 gap-2"
        >
          <UFormField label="Gedung">
            <UInput
              v-model="moveForm.building"
              placeholder="Fasilkom"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Lantai">
            <UInput
              v-model="moveForm.floor"
              placeholder="2"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Ruang">
            <UInput
              v-model="moveForm.room"
              placeholder="Lab 1"
              class="w-full"
            />
          </UFormField>
        </div>
      </div>

      <!-- Mode 3: End Explanation -->
      <div
        v-else-if="selectedMode === 'end'"
        class="p-4 bg-neutral-100 dark:bg-neutral-900 border border-subtle rounded-xl space-y-2 text-sm"
      >
        <div class="font-semibold text-highlighted flex items-center gap-2">
          <UIcon
            name="i-lucide-check-circle-2"
            class="size-5 text-primary shrink-0"
          />
          Tandai Mata Kuliah Telah Selesai
        </div>
        <p class="text-xs text-muted leading-relaxed">
          Mata kuliah ini akan ditandai berstatus <strong>"Selesai / Ended"</strong> untuk sisa semester ini. Jadwal tidak akan muncul di Jadwal Hari Ini dan akan ditampilkan dengan visual selesai pada tabel publik.
        </p>
      </div>

      <!-- Mode 4: Reset Explanation -->
      <div
        v-else-if="selectedMode === 'reset'"
        class="p-4 bg-emerald-50/20 dark:bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-2 text-sm text-emerald-800 dark:text-emerald-300"
      >
        <div class="font-semibold flex items-center gap-2">
          <UIcon
            name="i-lucide-check"
            class="size-5 shrink-0"
          />
          Kembalikan ke Jadwal Aktif Normal
        </div>
        <p class="text-xs text-muted leading-relaxed">
          Mereset status jadwal kembali menjadi <strong>"Aktif"</strong> mingguan secara normal.
        </p>
      </div>
    </div>
  </FormModal>
</template>
