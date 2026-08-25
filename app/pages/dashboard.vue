<script setup lang="ts">
import { CalendarDate } from '@internationalized/date'
import type {
  AcademicYearsResponse,
  LecturerSelect,
  SubjectWithLecturers,
  EventWithSubject,
  EventSelect
} from '#shared/types'
import {
  DAYS_LIST,
  calculateNextScheduleOccurrence,
  formatEventEndDate
} from '#shared/utils/date'
import { useDayStatus } from '~/composables/useDayStatus'
import { getApiErrorMessage } from '~/utils/error'

definePageMeta({
  middleware: 'auth'
})

const { user } = useUserSession()
const toast = useToast()
const { dayStatus, loading: dayStatusLoading, checkDayStatus } = useDayStatus()

// State Data
const academicYearsData = ref<AcademicYearsResponse>({ years: [], activeYearId: null })
const lecturers = ref<LecturerSelect[]>([])
const subjects = ref<SubjectWithLecturers[]>([])
const events = ref<EventWithSubject[]>([])
const loadingData = ref(false)

// Active Academic Year Selector State
const selectedActiveYear = ref<string>('none')
const savingActiveYear = ref(false)

// Modals State
const showYearModal = ref(false)
const showLecturerModal = ref(false)
const showSubjectModal = ref(false)
const showEventModal = ref(false)
const showPreviewEventModal = ref(false)
const previewingEvent = ref<EventWithSubject | null>(null)

const editingLecturerId = ref<number | null>(null)
const editingSubjectId = ref<number | null>(null)
const editingEventId = ref<number | null>(null)
const submittingForm = ref(false)
const isEditingEventLoading = ref(false)

// Form States
const yearForm = reactive({
  yearStart: new Date().getFullYear(),
  yearEnd: new Date().getFullYear() + 1,
  semester: 'ganjil' as 'ganjil' | 'genap',
  isCurrentActiveYear: false
})

const lecturerForm = reactive({
  name: '',
  shortname: '',
  nip: '',
  phone: ''
})

const subjectForm = reactive({
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

const eventForm = reactive({
  subjectId: undefined as number | undefined,
  title: '',
  description: '',
  endDate: ''
})

const selectedCalendarDate = shallowRef<CalendarDate | undefined>()
const selectedTime = ref('10:30')

// Fetch All Data
async function fetchData() {
  loadingData.value = true
  try {
    const [yearsRes, lecturersRes, subjectsRes, eventsRes] = await Promise.all([
      $fetch<AcademicYearsResponse>('/api/academic-years'),
      $fetch<LecturerSelect[]>('/api/lecturers'),
      $fetch<SubjectWithLecturers[]>('/api/subjects'),
      $fetch<EventWithSubject[]>('/api/events')
    ])
    academicYearsData.value = yearsRes
    selectedActiveYear.value = yearsRes.activeYearId !== null ? String(yearsRes.activeYearId) : 'none'
    lecturers.value = lecturersRes
    subjects.value = subjectsRes
    events.value = eventsRes
  } catch (err: unknown) {
    toast.add({
      title: 'Gagal Memuat Data',
      description: getApiErrorMessage(err),
      color: 'error'
    })
  } finally {
    loadingData.value = false
  }
}

onMounted(() => {
  fetchData()
})

// Options for Active Year Dropdown
const yearOptions = computed(() => {
  const opts = [
    { label: 'Tidak ada (Libur Semester)', value: 'none' }
  ]
  for (const y of academicYearsData.value.years) {
    opts.push({
      label: `TA ${y.yearStart}/${y.yearEnd} (${y.semester.toUpperCase()})`,
      value: String(y.id)
    })
  }
  return opts
})

// Subject Options for Event Modal
const subjectOptions = computed(() => {
  return subjects.value.map(s => ({
    label: `${s.name} (${s.day || '-'} ${s.timeStart || ''})`,
    value: s.id
  }))
})

// Shortnames List for UInputMenu
const lecturerShortnamesList = computed(() => {
  return lecturers.value.map(l => `${l.shortname} - ${l.name}`)
})

// Change Active Academic Year
async function onActiveYearChange(val: string) {
  savingActiveYear.value = true
  try {
    const targetId = val === 'none' ? null : Number(val)
    await $fetch('/api/academic-years/active', {
      method: 'PUT',
      body: { id: targetId }
    })
    toast.add({ title: 'Tahun Ajaran Aktif Diperbarui', color: 'success' })
    await fetchData()
  } catch (err: unknown) {
    toast.add({
      title: 'Gagal Mengubah Tahun Ajaran',
      description: getApiErrorMessage(err),
      color: 'error'
    })
  } finally {
    savingActiveYear.value = false
  }
}

// Handlers for Academic Year Modal
function openAddYearModal() {
  yearForm.yearStart = new Date().getFullYear()
  yearForm.yearEnd = new Date().getFullYear() + 1
  yearForm.semester = 'ganjil'
  yearForm.isCurrentActiveYear = false
  showYearModal.value = true
}

async function submitYearForm() {
  submittingForm.value = true
  try {
    await $fetch('/api/academic-years', {
      method: 'POST',
      body: yearForm
    })
    toast.add({ title: 'Tahun Ajaran Berhasil Ditambahkan', color: 'success' })
    showYearModal.value = false
    await fetchData()
  } catch (err: unknown) {
    toast.add({
      title: 'Gagal Menyimpan',
      description: getApiErrorMessage(err),
      color: 'error'
    })
  } finally {
    submittingForm.value = false
  }
}

// Handlers for Lecturer Modal
function openAddLecturerModal() {
  editingLecturerId.value = null
  lecturerForm.name = ''
  lecturerForm.shortname = ''
  lecturerForm.nip = ''
  lecturerForm.phone = ''
  showLecturerModal.value = true
}

function openEditLecturerModal(l: LecturerSelect) {
  editingLecturerId.value = l.id
  lecturerForm.name = l.name
  lecturerForm.shortname = l.shortname
  lecturerForm.nip = l.nip || ''
  lecturerForm.phone = l.phone || ''
  showLecturerModal.value = true
}

async function submitLecturerForm() {
  submittingForm.value = true
  try {
    const payload = {
      name: lecturerForm.name,
      shortname: lecturerForm.shortname,
      nip: lecturerForm.nip || null,
      phone: lecturerForm.phone || null
    }

    if (editingLecturerId.value === null) {
      await $fetch('/api/lecturers', { method: 'POST', body: payload })
      toast.add({ title: 'Dosen Berhasil Ditambahkan', color: 'success' })
    } else {
      await $fetch(`/api/lecturers/${editingLecturerId.value}`, { method: 'PUT', body: payload })
      toast.add({ title: 'Data Dosen Berhasil Diperbarui', color: 'success' })
    }
    showLecturerModal.value = false
    await fetchData()
  } catch (err: unknown) {
    toast.add({
      title: 'Gagal Menyimpan Dosen',
      description: getApiErrorMessage(err),
      color: 'error'
    })
  } finally {
    submittingForm.value = false
  }
}

// Confirmation Modal State
const showDeleteConfirmModal = ref(false)
const deleteType = ref<'lecturer' | 'subject' | 'event' | null>(null)
const targetDeleteId = ref<number | null>(null)
const targetDeleteName = ref('')
const deletingItem = ref(false)

function openDeleteConfirm(type: 'lecturer' | 'subject' | 'event', id: number, name: string) {
  deleteType.value = type
  targetDeleteId.value = id
  targetDeleteName.value = name
  showDeleteConfirmModal.value = true
}

async function confirmDelete() {
  if (targetDeleteId.value === null || !deleteType.value) return
  deletingItem.value = true
  try {
    if (deleteType.value === 'lecturer') {
      await $fetch(`/api/lecturers/${targetDeleteId.value}`, { method: 'DELETE' })
      toast.add({ title: 'Dosen Berhasil Dihapus', color: 'success' })
    } else if (deleteType.value === 'subject') {
      await $fetch(`/api/subjects/${targetDeleteId.value}`, { method: 'DELETE' })
      toast.add({ title: 'Mata Kuliah Berhasil Dihapus', color: 'success' })
    } else if (deleteType.value === 'event') {
      await $fetch(`/api/events/${targetDeleteId.value}`, { method: 'DELETE' })
      toast.add({ title: 'Event Berhasil Dihapus', color: 'success' })
    }
    showDeleteConfirmModal.value = false
    await fetchData()
  } catch (err: unknown) {
    toast.add({
      title: `Gagal Menghapus ${deleteType.value === 'lecturer' ? 'Dosen' : deleteType.value === 'subject' ? 'Mata Kuliah' : 'Event'}`,
      description: getApiErrorMessage(err),
      color: 'error'
    })
  } finally {
    deletingItem.value = false
    targetDeleteId.value = null
    deleteType.value = null
  }
}

// Handlers for Subject Modal
function openAddSubjectModal() {
  editingSubjectId.value = null
  subjectForm.name = ''
  subjectForm.isOnline = false
  subjectForm.isReplacement = false
  subjectForm.building = ''
  subjectForm.floor = ''
  subjectForm.room = ''
  subjectForm.timeStart = ''
  subjectForm.timeEnd = ''
  subjectForm.day = 'Senin'
  subjectForm.lecturerShortnames = []
  showSubjectModal.value = true
}

function openEditSubjectModal(s: SubjectWithLecturers) {
  editingSubjectId.value = s.id
  subjectForm.name = s.name
  subjectForm.isOnline = Boolean(s.isOnline)
  subjectForm.isReplacement = Boolean(s.isReplacement)
  subjectForm.building = s.building || ''
  subjectForm.floor = s.floor || ''
  subjectForm.room = s.room || ''
  subjectForm.timeStart = s.timeStart || ''
  subjectForm.timeEnd = s.timeEnd || ''
  subjectForm.day = s.day || 'Senin'
  subjectForm.lecturerShortnames = s.lecturers.map(l => l.shortname)
  showSubjectModal.value = true
}

async function submitSubjectForm() {
  submittingForm.value = true
  try {
    const activeYearId = academicYearsData.value.activeYearId
    const cleanShortnames = subjectForm.lecturerShortnames
      .filter((val): val is string => Boolean(val))
      .map(val => val.split(' - ')[0]?.trim() || val.trim())

    const payload = {
      academicYearId: activeYearId,
      name: subjectForm.name,
      isOnline: subjectForm.isOnline,
      isReplacement: subjectForm.isReplacement,
      building: subjectForm.isOnline ? null : (subjectForm.building || null),
      floor: subjectForm.isOnline ? null : (subjectForm.floor || null),
      room: subjectForm.isOnline ? null : (subjectForm.room || null),
      timeStart: subjectForm.timeStart || null,
      timeEnd: subjectForm.timeEnd || null,
      day: subjectForm.day || null,
      lecturerShortnames: cleanShortnames
    }

    if (editingSubjectId.value === null) {
      await $fetch('/api/subjects', { method: 'POST', body: payload })
      toast.add({ title: 'Mata Kuliah Berhasil Ditambahkan', color: 'success' })
    } else {
      await $fetch(`/api/subjects/${editingSubjectId.value}`, { method: 'PUT', body: payload })
      toast.add({ title: 'Mata Kuliah Berhasil Diperbarui', color: 'success' })
    }
    showSubjectModal.value = false
    await fetchData()
  } catch (err: unknown) {
    toast.add({
      title: 'Gagal Menyimpan Mata Kuliah',
      description: getApiErrorMessage(err),
      color: 'error'
    })
  } finally {
    submittingForm.value = false
  }
}

// Handlers for Event Modal & Tiptap Editor
function getSubjectNextExpiryIso(subjectId?: number | null): string {
  if (!subjectId) return ''
  const sub = subjects.value.find(s => s.id === subjectId)
  if (!sub || !sub.day || !sub.timeEnd) return ''
  const iso = calculateNextScheduleOccurrence(sub.day, sub.timeEnd)
  if (!iso) return ''
  const d = new Date(iso)
  const y = String(d.getFullYear()).padStart(4, '0')
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day}T${h}:${min}`
}

function setCalendarFromIsoString(isoStr?: string | null) {
  if (!isoStr) {
    selectedCalendarDate.value = undefined
    selectedTime.value = '10:30'
    eventForm.endDate = ''
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
    eventForm.endDate = `${yStr}-${mStr}-${dStr}T${h}:${min}`
  } catch {
    selectedCalendarDate.value = undefined
    selectedTime.value = '10:30'
    eventForm.endDate = ''
  }
}

function updateCalendarEndDate() {
  if (!selectedCalendarDate.value) {
    eventForm.endDate = ''
    return
  }
  const y = String(selectedCalendarDate.value.year).padStart(4, '0')
  const m = String(selectedCalendarDate.value.month).padStart(2, '0')
  const d = String(selectedCalendarDate.value.day).padStart(2, '0')
  const t = selectedTime.value || '23:59'
  eventForm.endDate = `${y}-${m}-${d}T${t}`
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

function openAddEventModal() {
  editingEventId.value = null
  eventForm.subjectId = subjects.value[0]?.id || undefined
  eventForm.title = ''
  eventForm.description = ''
  const nextIso = getSubjectNextExpiryIso(eventForm.subjectId || null)
  setCalendarFromIsoString(nextIso)
  showEventModal.value = true
}

async function openEditEventModal(ev: EventWithSubject) {
  editingEventId.value = ev.id
  eventForm.subjectId = ev.subjectId
  eventForm.title = ev.title
  eventForm.description = ''
  setCalendarFromIsoString(ev.endDate)
  isEditingEventLoading.value = true
  showEventModal.value = true

  try {
    const full = await $fetch<EventSelect>(`/api/events/${ev.id}`)
    if (full) {
      eventForm.description = full.description ? renderTiptapToHtml(full.description) : ''
    }
  } catch (err) {
    console.error('Gagal memuat deskripsi event:', err)
  } finally {
    isEditingEventLoading.value = false
  }
}

function openPreviewEventModal(ev: EventWithSubject) {
  previewingEvent.value = ev
  showPreviewEventModal.value = true
}

async function submitEventForm() {
  if (!eventForm.subjectId) {
    toast.add({ title: 'Pilih Mata Kuliah', description: 'Mata kuliah wajib dipilih', color: 'error' })
    return
  }
  if (!eventForm.title) {
    toast.add({ title: 'Judul Wajib Diisi', color: 'error' })
    return
  }

  submittingForm.value = true
  try {
    const payload = {
      subjectId: eventForm.subjectId,
      title: eventForm.title,
      description: eventForm.description || null,
      endDate: eventForm.endDate ? new Date(eventForm.endDate).toISOString() : null
    }

    if (editingEventId.value === null) {
      await $fetch('/api/events', { method: 'POST', body: payload })
      toast.add({ title: 'Event Berhasil Ditambahkan', color: 'success' })
    } else {
      await $fetch(`/api/events/${editingEventId.value}`, { method: 'PUT', body: payload })
      toast.add({ title: 'Event Berhasil Diperbarui', color: 'success' })
    }

    showEventModal.value = false
    await fetchData()
  } catch (err: unknown) {
    toast.add({
      title: 'Gagal Menyimpan Event',
      description: getApiErrorMessage(err),
      color: 'error'
    })
  } finally {
    submittingForm.value = false
  }
}

// Columns for Lecturers Table
const lecturerColumns = [
  { accessorKey: 'shortname', header: 'Singkatan' },
  { accessorKey: 'name', header: 'Nama Dosen' },
  { accessorKey: 'nip', header: 'NIP' },
  { accessorKey: 'phone', header: 'No HP' },
  { id: 'actions', header: 'Aksi' }
]

// Columns for Subjects Table
const subjectColumns = [
  { accessorKey: 'name', header: 'Mata Kuliah' },
  { accessorKey: 'dayTime', header: 'Jadwal' },
  { accessorKey: 'location', header: 'Lokasi' },
  { accessorKey: 'lecturers', header: 'Dosen Pengampu' },
  { id: 'actions', header: 'Aksi' }
]

// Columns for Events Table
const eventColumns = [
  { accessorKey: 'subject', header: 'Mata Kuliah' },
  { accessorKey: 'title', header: 'Judul Event' },
  { accessorKey: 'endDate', header: 'Batas Waktu (Auto-Expiry)' },
  { id: 'actions', header: 'Aksi' }
]
</script>

<template>
  <div class="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
    <!-- 7.1 Sapaan Sederhana & 7.2 Deskripsi -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-subtle pb-6">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-highlighted flex items-center gap-2">
          👋 Halo, {{ user?.name || user?.username }}!
        </h1>
        <p class="mt-1 text-muted text-sm sm:text-base">
          Selamat datang di Panel Kontrol Manajemen Jadwal & Perkuliahan PSIK25B.
        </p>
      </div>

      <!-- 7.4 Tombol Tambah Tahun Ajaran & Selector Active Year -->
      <div class="flex flex-wrap items-center gap-3">
        <UButton
          label="Tambah Tahun Ajaran"
          icon="i-lucide-plus"
          color="primary"
          variant="subtle"
          @click="openAddYearModal"
        />

        <div class="flex items-center gap-2">
          <span class="text-xs sm:text-sm text-muted font-medium">TA Aktif:</span>
          <USelect
            v-model="selectedActiveYear"
            :items="yearOptions"
            value-attribute="value"
            option-attribute="label"
            class="w-56"
            :loading="savingActiveYear"
            @update:model-value="onActiveYearChange"
          />
        </div>
      </div>
    </div>

    <!-- 7.3 Status Hari Ini dari Composable -->
    <UCard class="bg-primary-50/20 dark:bg-primary-950/20 border-primary/30">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="p-3 rounded-xl bg-primary/10 text-primary">
            <UIcon
              v-if="dayStatus.status === 'Holiday'"
              name="i-lucide-party-popper"
              class="size-8"
            />
            <UIcon
              v-else-if="dayStatus.status === 'Weekend'"
              name="i-lucide-sun"
              class="size-8"
            />
            <UIcon
              v-else
              name="i-lucide-briefcase"
              class="size-8"
            />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="font-semibold text-lg text-highlighted">
                Status Hari Ini
              </h2>
              <UBadge
                :color="dayStatus.status === 'Holiday' ? 'error' : dayStatus.status === 'Weekend' ? 'warning' : 'success'"
                variant="subtle"
              >
                {{ dayStatus.status }}
              </UBadge>
            </div>
            <p class="text-sm text-muted mt-0.5">
              {{ dayStatus.description }} ({{ dayStatus.dateStr }})
            </p>
          </div>
        </div>

        <UButton
          label="Cek Ulang Status"
          icon="i-lucide-refresh-cw"
          color="neutral"
          variant="ghost"
          size="sm"
          :loading="dayStatusLoading"
          @click="checkDayStatus()"
        />
      </div>
    </UCard>

    <!-- SECTION: CRUD Event Mata Kuliah -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-semibold text-highlighted flex items-center gap-2">
              <UIcon
                name="i-lucide-ticket"
                class="text-amber-500 size-5"
              />
              Tabel Manajemen Event / Pengumuman Matkul
            </h2>
            <p class="text-sm text-muted">
              Kelola tugas, kuis, atau pengumuman khusus yang melekat pada mata kuliah (otomatis kedaluwarsa)
            </p>
          </div>
          <UButton
            label="Tambah Event"
            icon="i-lucide-plus"
            color="primary"
            @click="openAddEventModal"
          />
        </div>
      </template>

      <UTable
        :data="events"
        :columns="eventColumns"
      >
        <template #subject-cell="{ row }">
          <div class="text-sm font-semibold text-highlighted">
            {{ row.original.subject?.name || '-' }}
          </div>
        </template>

        <template #title-cell="{ row }">
          <div class="flex items-center gap-2">
            <span class="font-medium text-highlighted">{{ row.original.title }}</span>
            <UButton
              icon="i-lucide-eye"
              color="neutral"
              variant="ghost"
              size="xs"
              label="Lihat"
              @click="openPreviewEventModal(row.original)"
            />
          </div>
        </template>

        <template #endDate-cell="{ row }">
          <div class="text-xs">
            <UBadge
              v-if="row.original.endDate"
              color="warning"
              variant="subtle"
              size="sm"
            >
              <UIcon
                name="i-lucide-clock"
                class="size-3 mr-1"
              />
              {{ formatEventEndDate(row.original.endDate, 'Tanpa batas waktu') }}
            </UBadge>
            <span
              v-else
              class="text-muted italic"
            >
              Tanpa batas waktu
            </span>
          </div>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex items-center gap-1">
            <UButton
              icon="i-lucide-pencil"
              color="neutral"
              variant="ghost"
              size="xs"
              aria-label="Edit Event"
              @click="openEditEventModal(row.original)"
            />
            <UButton
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              size="xs"
              aria-label="Hapus Event"
              @click="openDeleteConfirm('event', row.original.id, row.original.title)"
            />
          </div>
        </template>
      </UTable>
    </UCard>

    <!-- SECTION: CRUD Mata Kuliah -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-semibold text-highlighted flex items-center gap-2">
              <UIcon
                name="i-lucide-book-open"
                class="text-primary size-5"
              />
              Tabel Mata Kuliah
            </h2>
            <p class="text-sm text-muted">
              Daftar mata kuliah yang diajarkan pada semester ini
            </p>
          </div>
          <UButton
            label="Tambah Mata Kuliah"
            icon="i-lucide-plus"
            color="primary"
            @click="openAddSubjectModal"
          />
        </div>
      </template>

      <UTable
        :data="subjects"
        :columns="subjectColumns"
      >
        <template #name-cell="{ row }">
          <div class="space-y-1">
            <div class="text-sm font-semibold text-highlighted">
              {{ row.original.name }}
            </div>
            <UBadge
              v-if="row.original.isReplacement"
              color="warning"
              variant="subtle"
              size="xs"
            >
              Matkul Ganti
            </UBadge>
          </div>
        </template>

        <template #dayTime-cell="{ row }">
          <div class="text-sm">
            <span class="font-medium text-highlighted">{{ row.original.day || '-' }}</span>
            <span
              v-if="row.original.timeStart"
              class="text-muted block text-xs"
            >
              {{ row.original.timeStart }} - {{ row.original.timeEnd || 'Selesai' }}
            </span>
          </div>
        </template>

        <template #location-cell="{ row }">
          <div class="text-sm">
            <UBadge
              v-if="row.original.isOnline"
              color="info"
              variant="subtle"
              size="sm"
            >
              <UIcon
                name="i-lucide-video"
                class="size-3.5 mr-1"
              />
              Daring
            </UBadge>
            <template v-else>
              <span
                v-if="row.original.room"
                class="font-medium text-highlighted"
              >R. {{ row.original.room }}</span>
              <span
                v-else
                class="text-muted"
              >-</span>
              <span
                v-if="row.original.building"
                class="text-muted block text-xs"
              >
                Gedung {{ row.original.building }} <template v-if="row.original.floor">, Lt. {{ row.original.floor }}</template>
              </span>
            </template>
          </div>
        </template>

        <template #lecturers-cell="{ row }">
          <div class="flex flex-wrap gap-1">
            <UBadge
              v-for="l in row.original.lecturers"
              :key="l.id"
              color="neutral"
              variant="subtle"
              size="sm"
            >
              {{ l.shortname }}
            </UBadge>
            <span
              v-if="!row.original.lecturers || row.original.lecturers.length === 0"
              class="text-xs text-muted"
            >
              Belum ada dosen
            </span>
          </div>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex items-center gap-1">
            <UButton
              icon="i-lucide-pencil"
              color="neutral"
              variant="ghost"
              size="xs"
              aria-label="Edit Mata Kuliah"
              @click="openEditSubjectModal(row.original)"
            />
            <UButton
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              size="xs"
              aria-label="Hapus Mata Kuliah"
              @click="openDeleteConfirm('subject', row.original.id, row.original.name)"
            />
          </div>
        </template>
      </UTable>
    </UCard>

    <!-- SECTION: CRUD Manajemen Dosen -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-semibold text-highlighted flex items-center gap-2">
              <UIcon
                name="i-lucide-users"
                class="text-primary size-5"
              />
              Tabel Manajemen Dosen
            </h2>
            <p class="text-sm text-muted">
              Daftar dosen beserta singkatan pengenal (shortname)
            </p>
          </div>
          <UButton
            label="Tambah Dosen"
            icon="i-lucide-plus"
            color="primary"
            @click="openAddLecturerModal"
          />
        </div>
      </template>

      <UTable
        :data="lecturers"
        :columns="lecturerColumns"
      >
        <template #shortname-cell="{ row }">
          <UBadge
            color="primary"
            variant="subtle"
          >
            {{ row.original.shortname }}
          </UBadge>
        </template>

        <template #nip-cell="{ row }">
          <span>{{ row.original.nip || '-' }}</span>
        </template>

        <template #phone-cell="{ row }">
          <span>{{ row.original.phone || '-' }}</span>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex items-center gap-1">
            <UButton
              icon="i-lucide-pencil"
              color="neutral"
              variant="ghost"
              size="xs"
              aria-label="Edit Dosen"
              @click="openEditLecturerModal(row.original)"
            />
            <UButton
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              size="xs"
              aria-label="Hapus Dosen"
              @click="openDeleteConfirm('lecturer', row.original.id, row.original.name)"
            />
          </div>
        </template>
      </UTable>
    </UCard>

    <!-- MODAL: Tambah Tahun Ajaran -->
    <FormModal
      v-model:open="showYearModal"
      title="Tambah Tahun Ajaran Baru"
      description="Buat rentang tahun ajaran dan semester perkuliahan"
      :loading="submittingForm"
      @submit="submitYearForm"
    >
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <UFormField
            label="Tahun Mulai"
            required
          >
            <UInput
              v-model.number="yearForm.yearStart"
              type="number"
              class="w-full"
            />
          </UFormField>

          <UFormField
            label="Tahun Selesai"
            required
          >
            <UInput
              v-model.number="yearForm.yearEnd"
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
            v-model="yearForm.semester"
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
            v-model="yearForm.isCurrentActiveYear"
            label="Jadikan sebagai Tahun Ajaran Aktif saat ini"
          />
        </UFormField>
      </div>
    </FormModal>

    <!-- MODAL: CRUD Dosen -->
    <FormModal
      v-model:open="showLecturerModal"
      :title="editingLecturerId === null ? 'Tambah Dosen Baru' : 'Edit Data Dosen'"
      description="Kelola informasi dosen dan kode singkatannya"
      :loading="submittingForm"
      @submit="submitLecturerForm"
    >
      <div class="space-y-4">
        <UFormField
          label="Nama Lengkap & Gelar"
          required
        >
          <UInput
            v-model="lecturerForm.name"
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
            v-model="lecturerForm.shortname"
            placeholder="JD"
            class="w-full"
          />
        </UFormField>

        <UFormField label="NIP (Opsional)">
          <UInput
            v-model="lecturerForm.nip"
            placeholder="199001012020121001"
            class="w-full"
          />
        </UFormField>

        <UFormField label="No HP / WhatsApp (Opsional)">
          <UInput
            v-model="lecturerForm.phone"
            placeholder="081234567890"
            class="w-full"
          />
        </UFormField>
      </div>
    </FormModal>

    <!-- MODAL: CRUD Mata Kuliah -->
    <FormModal
      v-model:open="showSubjectModal"
      :title="editingSubjectId === null ? 'Tambah Mata Kuliah Baru' : 'Edit Mata Kuliah'"
      description="Isi rincian jadwal, ruangan, dan dosen pengampu"
      :loading="submittingForm"
      @submit="submitSubjectForm"
    >
      <div class="space-y-4">
        <UFormField
          label="Nama Mata Kuliah"
          required
        >
          <UInput
            v-model="subjectForm.name"
            placeholder="Pemrograman Web Lanjut"
            class="w-full"
          />
        </UFormField>

        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Hari">
            <USelect
              v-model="subjectForm.day"
              :items="DAYS_LIST"
              class="w-full"
            />
          </UFormField>

          <div class="grid grid-cols-2 gap-2">
            <UFormField label="Jam Mulai">
              <UInput
                v-model="subjectForm.timeStart"
                placeholder="08:00"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Jam Selesai">
              <UInput
                v-model="subjectForm.timeEnd"
                placeholder="10:30"
                class="w-full"
              />
            </UFormField>
          </div>
        </div>

        <!-- 1. Pilihan Metode / Lokasi Perkuliahan Daring vs Luring -->
        <UFormField
          label="Metode / Lokasi Perkuliahan"
          required
        >
          <USelect
            v-model="subjectForm.isOnline"
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
          v-if="!subjectForm.isOnline"
          class="grid grid-cols-3 gap-3 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800"
        >
          <UFormField label="Gedung">
            <UInput
              v-model="subjectForm.building"
              placeholder="Fasilkom"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Lantai">
            <UInput
              v-model="subjectForm.floor"
              placeholder="2"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Ruangan">
            <UInput
              v-model="subjectForm.room"
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

        <!-- 7.5 Kolom Dosen InputMenu Multiple -->
        <UFormField
          label="Dosen Pengampu"
          description="Pilih satu atau beberapa dosen pengampu mata kuliah ini"
        >
          <UInputMenu
            v-model="subjectForm.lecturerShortnames"
            :items="lecturerShortnamesList"
            multiple
            placeholder="Pilih dosen pengampu..."
            class="w-full"
          />
        </UFormField>

        <!-- 2. Mata Kuliah Pengganti (Hilang setelah selesai sekali) -->
        <UFormField label="Opsi Tambahan">
          <UCheckbox
            v-model="subjectForm.isReplacement"
            label="Mata Kuliah Ganti (hilang setelah dilalui sekali)"
            description="Mata kuliah ini hanya berlaku satu kali untuk menggantikan jadwal lain, dan akan otomatis terhapus dari sistem setelah jam perkuliahan selesai."
          />
        </UFormField>
      </div>
    </FormModal>

    <!-- MODAL: CRUD Event Mata Kuliah dengan Tiptap UEditor -->
    <FormModal
      v-model:open="showEventModal"
      :title="editingEventId === null ? 'Tambah Event Perkuliahan' : 'Edit Event Perkuliahan'"
      description="Buat pengumuman, kuis, atau tugas khusus yang terhubung ke mata kuliah"
      :loading="submittingForm"
      @submit="submitEventForm"
    >
      <div class="space-y-4">
        <UFormField
          label="Mata Kuliah Terkait"
          required
        >
          <USelect
            v-model="eventForm.subjectId"
            :items="subjectOptions"
            value-attribute="value"
            option-attribute="label"
            placeholder="Pilih mata kuliah..."
            class="w-full"
            @update:model-value="(val) => {
              if (!editingEventId) {
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
            v-model="eventForm.title"
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
                  const targetIso = getSubjectNextExpiryIso(eventForm.subjectId || null)
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
              v-model="eventForm.description"
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

    <!-- MODAL: Konfirmasi Hapus Custom -->
    <UModal
      v-model:open="showDeleteConfirmModal"
      title="Konfirmasi Hapus"
    >
      <template #body>
        <p class="text-sm text-muted">
          Apakah Anda yakin ingin menghapus {{ deleteType === 'lecturer' ? 'dosen' : deleteType === 'subject' ? 'mata kuliah' : 'event' }}
          <span class="font-semibold text-highlighted">"{{ targetDeleteName }}"</span>? Tindakan ini tidak dapat dibatalkan.
        </p>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2 w-full">
          <UButton
            label="Batal"
            color="neutral"
            variant="outline"
            :disabled="deletingItem"
            @click="showDeleteConfirmModal = false"
          />
          <UButton
            label="Hapus"
            color="error"
            :loading="deletingItem"
            @click="confirmDelete"
          />
        </div>
      </template>
    </UModal>

    <!-- MODAL: Preview Detail Event -->
    <EventDetailModal
      v-model:open="showPreviewEventModal"
      :event="previewingEvent"
    />
  </div>
</template>
