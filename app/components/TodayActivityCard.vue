<script setup lang="ts">
import type { ScheduleWithSubject, EventSelect } from '#shared/types'

defineProps<{
  type: 'current' | 'incoming' | 'holiday'
  schedule?: ScheduleWithSubject
  holidayDescription?: string
  dateStr?: string
}>()

const selectedEvent = ref<EventSelect | null>(null)
const isEventModalOpen = ref(false)

function openEventModal(event: EventSelect) {
  selectedEvent.value = event
  isEventModalOpen.value = true
}
</script>

<template>
  <UCard
    :class="[
      'transition-all duration-300 shadow-sm border rounded-xl overflow-hidden',
      type === 'current' ? 'border-teal-500 dark:border-teal-400 bg-teal-50/20 dark:bg-teal-950/10 ring-2 ring-teal-500/20' : '',
      type === 'incoming' ? 'border-blue-500 dark:border-blue-400 bg-blue-50/20 dark:bg-blue-950/10 ring-2 ring-blue-500/10' : '',
      type === 'holiday' ? 'border-green-500 dark:border-green-400 bg-green-50/20 dark:bg-green-950/10 ring-2 ring-green-500/10' : ''
    ]"
  >
    <!-- Holiday / Weekend -->
    <div
      v-if="type === 'holiday'"
      class="flex items-center gap-4 py-2"
    >
      <div class="p-3 rounded-full bg-green-100 dark:bg-green-950/30 text-green-500 dark:text-green-400">
        <UIcon
          name="i-lucide-calendar-x"
          class="size-8 sm:size-10"
        />
      </div>
      <div>
        <div class="flex items-center gap-2 flex-wrap">
          <UBadge
            color="success"
            variant="subtle"
            size="sm"
          >
            Hari Libur
          </UBadge>
          <span class="text-xs text-muted font-medium">{{ dateStr }}</span>
        </div>
        <h3 class="text-lg font-bold text-highlighted mt-1">
          {{ holidayDescription || 'Libur / Tidak Ada Perkuliahan' }}
        </h3>
        <p class="text-sm text-muted">
          Tidak ada kegiatan perkuliahan terjadwal hari ini.
        </p>
      </div>
    </div>

    <!-- Active Class (Current / Incoming) -->
    <div
      v-else-if="schedule"
      class="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2"
    >
      <div class="flex items-start gap-4 flex-1">
        <div
          :class="[
            'p-3 rounded-full shrink-0',
            type === 'current' ? 'bg-teal-100 dark:bg-teal-950/30 text-teal-500 dark:text-teal-400' : 'bg-blue-100 dark:bg-blue-950/30 text-blue-500 dark:text-blue-400'
          ]"
        >
          <UIcon
            :name="type === 'current' ? 'i-lucide-play' : 'i-lucide-clock'"
            class="size-6 sm:size-8"
          />
        </div>
        <div class="space-y-1.5 flex-1">
          <div class="flex items-center gap-2 flex-wrap">
            <UBadge
              :color="type === 'current' ? 'primary' : 'info'"
              variant="subtle"
              size="sm"
            >
              {{ type === 'current' ? 'Sedang Berlangsung' : 'Mendatang' }}
            </UBadge>
            <UBadge
              v-if="schedule.type === 'temporary_move'"
              color="warning"
              variant="subtle"
              size="sm"
            >
              Jadwal Pindahan
            </UBadge>
            <UBadge
              v-else-if="schedule.type === 'one_off'"
              color="warning"
              variant="subtle"
              size="sm"
            >
              Matkul Pengganti (1x)
            </UBadge>
            <span class="text-xs font-semibold text-highlighted">
              {{ schedule.day }}, {{ schedule.timeStart || '??:??' }} - {{ schedule.timeEnd || '??:??' }}
            </span>
          </div>

          <h3 class="text-lg sm:text-xl font-bold text-highlighted">
            {{ schedule.subject?.name || 'Mata Kuliah' }}
          </h3>

          <!-- Location -->
          <div class="flex items-center gap-2 text-sm text-muted flex-wrap">
            <UBadge
              v-if="schedule.isOnline"
              color="info"
              variant="subtle"
            >
              <UIcon
                name="i-lucide-video"
                class="size-3.5 mr-1"
              />
              Daring (Online)
            </UBadge>
            <template v-else>
              <UIcon
                name="i-lucide-map-pin"
                class="size-6 text-primary shrink-0"
              />
              <UBadge
                v-if="schedule.building"
                class="tabular-nums"
              >
                {{ schedule.building }}
              </UBadge>
              <UBadge
                v-if="schedule.floor"
                class="tabular-nums"
              >
                {{ schedule.floor }}
              </UBadge>
              <UBadge
                v-if="schedule.room"
                class="tabular-nums"
              >
                {{ schedule.room }}
              </UBadge>
              <span
                v-if="!schedule.building && !schedule.floor && !schedule.room"
                class="text-muted"
              >-</span>
            </template>
          </div>

          <!-- Events if any attached to schedule -->
          <div
            v-if="schedule.events && schedule.events.length > 0"
            class="pt-1 flex flex-col gap-1.5"
          >
            <div
              v-for="ev in schedule.events"
              :key="ev.id"
              class="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors max-w-fit border"
              :style="{
                backgroundColor: ev.color ? `${ev.color}15` : undefined,
                borderColor: ev.color ? `${ev.color}40` : undefined,
                color: ev.color || undefined
              }"
              @click="openEventModal(ev)"
            >
              <UIcon
                :name="ev.icon || 'i-lucide-bell'"
                class="size-3.5 shrink-0"
              />
              <span class="font-semibold">{{ ev.title }}</span>
              <UIcon
                name="i-lucide-arrow-right"
                class="size-3 shrink-0 opacity-70"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Lecturers -->
      <div class="md:text-right flex flex-col items-start md:items-end gap-1.5 mt-2 md:mt-0 shrink-0">
        <span class="text-xs text-muted uppercase tracking-wider font-semibold">Dosen Pengampu</span>
        <div class="flex flex-wrap gap-1">
          <UBadge
            v-for="l in schedule.subject?.lecturers || []"
            :key="l.id"
            color="neutral"
            variant="outline"
            size="sm"
          >
            {{ l.name }} ({{ l.shortname }})
          </UBadge>
          <span
            v-if="!schedule.subject?.lecturers || schedule.subject.lecturers.length === 0"
            class="text-sm text-muted italic"
          >
            Belum ditentukan
          </span>
        </div>
      </div>
    </div>

    <!-- Event Detail Modal -->
    <EventDetailModal
      v-model:open="isEventModalOpen"
      :event="selectedEvent ? { ...selectedEvent, schedule } : null"
    />
  </UCard>
</template>
