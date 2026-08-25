import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import TodayActivityCard from '~/components/TodayActivityCard.vue'
import type { ScheduleWithSubject } from '#shared/types'

describe('TodayActivityCard Component', () => {
  it('should render Holiday state correctly with badge and description', async () => {
    const wrapper = await mountSuspended(TodayActivityCard, {
      props: {
        type: 'holiday',
        holidayDescription: 'Hari Kemerdekaan',
        dateStr: '2026-08-17'
      }
    })

    expect(wrapper.text()).toContain('Hari Libur')
    expect(wrapper.text()).toContain('Hari Kemerdekaan')
    expect(wrapper.text()).toContain('2026-08-17')
    expect(wrapper.text()).toContain('Tidak ada kegiatan perkuliahan terjadwal hari ini')
  })

  it('should render Active Class (current) state with subject name, room, and lecturers', async () => {
    const mockSchedule: ScheduleWithSubject = {
      id: 1,
      subjectId: 1,
      type: 'regular',
      parentScheduleId: null,
      status: 'active',
      skippedUntil: null,
      isOnline: false,
      building: 'Fasilkom',
      floor: '2',
      room: 'Lab 3',
      timeStart: '08:00',
      timeEnd: '10:30',
      day: 'Senin',
      endDate: null,
      createdAt: null,
      subject: {
        id: 1,
        academicYearId: 1,
        name: 'Pemrograman Web Lanjut',
        createdAt: null,
        lecturers: [
          {
            id: 1,
            name: 'Dr. John Doe',
            shortname: 'JD',
            nip: null,
            phone: null,
            createdAt: null
          }
        ]
      },
      events: []
    }

    const wrapper = await mountSuspended(TodayActivityCard, {
      props: {
        type: 'current',
        schedule: mockSchedule
      }
    })

    expect(wrapper.text()).toContain('Sedang Berlangsung')
    expect(wrapper.text()).toContain('Pemrograman Web Lanjut')
    expect(wrapper.text()).toContain('08:00 - 10:30')
    expect(wrapper.text()).toContain('Fasilkom')
    expect(wrapper.text()).toContain('Lab 3')
    expect(wrapper.text()).toContain('Dr. John Doe')
    expect(wrapper.text()).toContain('JD')
  })

  it('should render Online badge when subject is online', async () => {
    const mockSchedule: ScheduleWithSubject = {
      id: 2,
      subjectId: 2,
      type: 'regular',
      parentScheduleId: null,
      status: 'active',
      skippedUntil: null,
      isOnline: true,
      building: null,
      floor: null,
      room: null,
      timeStart: '13:00',
      timeEnd: '14:40',
      day: 'Senin',
      endDate: null,
      createdAt: null,
      subject: {
        id: 2,
        academicYearId: 1,
        name: 'Etika Profesi Online',
        createdAt: null,
        lecturers: []
      },
      events: []
    }

    const wrapper = await mountSuspended(TodayActivityCard, {
      props: {
        type: 'incoming',
        schedule: mockSchedule
      }
    })

    expect(wrapper.text()).toContain('Mendatang')
    expect(wrapper.text()).toContain('Etika Profesi Online')
    expect(wrapper.text()).toContain('Daring (Online)')
  })
})
