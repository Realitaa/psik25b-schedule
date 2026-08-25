import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import EventDetailModal from '~/components/EventDetailModal.vue'
import type { EventSelect, ScheduleWithSubject } from '#shared/types'

describe('EventDetailModal Component', () => {
  it('should render event metadata and description when open is true', async () => {
    const mockSchedule: ScheduleWithSubject = {
      id: 1,
      subjectId: 1,
      type: 'regular',
      parentScheduleId: null,
      status: 'active',
      skippedUntil: null,
      isOnline: false,
      building: 'Gedung A',
      floor: '2',
      room: 'Lab 1',
      timeStart: '08:00',
      timeEnd: '10:30',
      day: 'Senin',
      endDate: null,
      createdAt: null,
      subject: {
        id: 1,
        academicYearId: 1,
        name: 'Pemrograman Web',
        createdAt: null,
        lecturers: []
      },
      events: []
    }

    const mockEvent: EventSelect = {
      id: 10,
      scheduleId: 1,
      authorId: 1,
      presetId: null,
      title: 'Tugas Proyek Akhir',
      description: '<p>Kumpulkan di portal</p>',
      type: 'Tugas',
      color: '#f59e0b',
      icon: 'i-lucide-file-text',
      endDate: '2026-05-20T10:30:00.000Z',
      createdAt: '2026-05-01',
      schedule: mockSchedule,
      author: {
        id: 1,
        username: 'admin',
        name: 'Dosen Pembimbing'
      }
    }

    // Mock $fetch for the event details request
    vi.stubGlobal('$fetch', vi.fn().mockResolvedValue(mockEvent))

    await mountSuspended(EventDetailModal, {
      props: {
        open: true,
        event: mockEvent
      }
    })

    // Because UModal teleports to document.body
    const bodyText = document.body.textContent || ''
    expect(bodyText).toContain('Tugas Proyek Akhir')
    expect(bodyText).toContain('Pemrograman Web')
    expect(bodyText).toContain('Dosen Pembimbing')

    vi.unstubAllGlobals()
  })
})
