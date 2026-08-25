import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import EventDetailModal from '~/components/EventDetailModal.vue'
import type { EventSelect, SubjectSelect } from '#shared/types'

describe('EventDetailModal Component', () => {
  it('should render event metadata and description when open is true', async () => {
    const mockSubject: SubjectSelect = {
      id: 1,
      academicYearId: 1,
      name: 'Pemrograman Web',
      isOnline: false,
      isReplacement: false,
      building: null,
      floor: null,
      room: null,
      timeStart: null,
      timeEnd: null,
      day: null,
      endDate: null,
      createdAt: null
    }

    const mockEvent: EventSelect & { subject: SubjectSelect } = {
      id: 10,
      subjectId: 1,
      authorId: 1,
      title: 'Tugas Proyek Akhir',
      description: '<p>Kumpulkan di portal</p>',
      endDate: '2026-05-20T10:30:00.000Z',
      createdAt: '2026-05-01',
      subject: mockSubject,
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
