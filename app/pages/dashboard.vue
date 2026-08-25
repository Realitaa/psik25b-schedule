<script setup lang="ts">
import type {
  AcademicYearsResponse,
  LecturerSelect,
  SubjectWithLecturers,
  EventWithSubject,
  CreateAcademicYearDTO,
  CreateLecturerDTO,
  CreateSubjectDTO,
  CreateEventDTO
} from '#shared/types'
import { calculateNextScheduleOccurrence } from '#shared/utils/date'
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

const editingLecturer = ref<LecturerSelect | null>(null)
const editingSubject = ref<SubjectWithLecturers | null>(null)
const editingEvent = ref<EventWithSubject | null>(null)
const submittingForm = ref(false)

// Delete Confirmation Modal State
const showDeleteConfirmModal = ref(false)
const deleteType = ref<'lecturer' | 'subject' | 'event' | null>(null)
const targetDeleteId = ref<number | null>(null)
const targetDeleteName = ref('')
const deletingItem = ref(false)

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
async function submitYearForm(form: CreateAcademicYearDTO) {
  submittingForm.value = true
  try {
    await $fetch('/api/academic-years', {
      method: 'POST',
      body: form
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
  editingLecturer.value = null
  showLecturerModal.value = true
}

function openEditLecturerModal(l: LecturerSelect) {
  editingLecturer.value = l
  showLecturerModal.value = true
}

async function submitLecturerForm(payload: CreateLecturerDTO, editingId: number | null) {
  submittingForm.value = true
  try {
    if (editingId === null) {
      await $fetch('/api/lecturers', { method: 'POST', body: payload })
      toast.add({ title: 'Dosen Berhasil Ditambahkan', color: 'success' })
    } else {
      await $fetch(`/api/lecturers/${editingId}`, { method: 'PUT', body: payload })
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

// Handlers for Subject Modal
function openAddSubjectModal() {
  editingSubject.value = null
  showSubjectModal.value = true
}

function openEditSubjectModal(s: SubjectWithLecturers) {
  editingSubject.value = s
  showSubjectModal.value = true
}

async function submitSubjectForm(payload: CreateSubjectDTO, editingId: number | null) {
  submittingForm.value = true
  try {
    const activeYearId = academicYearsData.value.activeYearId
    const body = {
      ...payload,
      academicYearId: activeYearId
    }

    if (editingId === null) {
      await $fetch('/api/subjects', { method: 'POST', body })
      toast.add({ title: 'Mata Kuliah Berhasil Ditambahkan', color: 'success' })
    } else {
      await $fetch(`/api/subjects/${editingId}`, { method: 'PUT', body })
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

// Handlers for Event Modal
function openAddEventModal() {
  editingEvent.value = null
  showEventModal.value = true
}

function openEditEventModal(ev: EventWithSubject) {
  editingEvent.value = ev
  showEventModal.value = true
}

function openPreviewEventModal(ev: EventWithSubject) {
  previewingEvent.value = ev
  showPreviewEventModal.value = true
}

async function submitEventForm(payload: CreateEventDTO, editingId: number | null) {
  if (!payload.subjectId) {
    toast.add({ title: 'Pilih Mata Kuliah', description: 'Mata kuliah wajib dipilih', color: 'error' })
    return
  }
  if (!payload.title) {
    toast.add({ title: 'Judul Wajib Diisi', color: 'error' })
    return
  }

  submittingForm.value = true
  try {
    if (editingId === null) {
      await $fetch('/api/events', { method: 'POST', body: payload })
      toast.add({ title: 'Event Berhasil Ditambahkan', color: 'success' })
    } else {
      await $fetch(`/api/events/${editingId}`, { method: 'PUT', body: payload })
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

// Delete Confirmation Handlers
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
</script>

<template>
  <div class="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
    <!-- Header: Sapaan & Selector TA Aktif -->
    <DashboardHeader
      v-model:active-year="selectedActiveYear"
      :user="user"
      :year-options="yearOptions"
      :saving-active-year="savingActiveYear"
      @add-year="showYearModal = true"
      @change-active-year="onActiveYearChange"
    />

    <!-- Status Hari Ini -->
    <DashboardDayStatus
      :day-status="dayStatus"
      :loading="dayStatusLoading"
      @refresh="checkDayStatus()"
    />

    <!-- SECTION: CRUD Event Mata Kuliah -->
    <DashboardEventsTable
      :events="events"
      @add="openAddEventModal"
      @preview="openPreviewEventModal"
      @edit="openEditEventModal"
      @delete="(id, title) => openDeleteConfirm('event', id, title)"
    />

    <!-- SECTION: CRUD Mata Kuliah -->
    <DashboardSubjectsTable
      :subjects="subjects"
      @add="openAddSubjectModal"
      @edit="openEditSubjectModal"
      @delete="(id, name) => openDeleteConfirm('subject', id, name)"
    />

    <!-- SECTION: CRUD Manajemen Dosen -->
    <DashboardLecturersTable
      :lecturers="lecturers"
      @add="openAddLecturerModal"
      @edit="openEditLecturerModal"
      @delete="(id, name) => openDeleteConfirm('lecturer', id, name)"
    />

    <!-- MODAL: Tambah Tahun Ajaran -->
    <DashboardAcademicYearModal
      v-model:open="showYearModal"
      :loading="submittingForm"
      @submit="submitYearForm"
    />

    <!-- MODAL: CRUD Dosen -->
    <DashboardLecturerModal
      v-model:open="showLecturerModal"
      :lecturer="editingLecturer"
      :loading="submittingForm"
      @submit="submitLecturerForm"
    />

    <!-- MODAL: CRUD Mata Kuliah -->
    <DashboardSubjectModal
      v-model:open="showSubjectModal"
      :subject="editingSubject"
      :lecturer-shortnames-list="lecturerShortnamesList"
      :loading="submittingForm"
      @submit="submitSubjectForm"
    />

    <!-- MODAL: CRUD Event Mata Kuliah -->
    <DashboardEventModal
      v-model:open="showEventModal"
      :event="editingEvent"
      :subject-options="subjectOptions"
      :get-subject-next-expiry-iso="getSubjectNextExpiryIso"
      :loading="submittingForm"
      @submit="submitEventForm"
    />

    <!-- MODAL: Konfirmasi Hapus Custom -->
    <DashboardDeleteConfirmModal
      v-model:open="showDeleteConfirmModal"
      :target-name="targetDeleteName"
      :target-type="deleteType"
      :loading="deletingItem"
      @confirm="confirmDelete"
    />

    <!-- MODAL: Preview Detail Event -->
    <EventDetailModal
      v-model:open="showPreviewEventModal"
      :event="previewingEvent"
    />
  </div>
</template>
