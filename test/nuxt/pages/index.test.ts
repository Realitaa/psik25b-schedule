import { describe, it, expect } from 'vitest'
import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import IndexPage from '~/pages/index.vue'

describe('IndexPage (Public Portal)', () => {
  it('should fetch data from API and render schedule and lecturers correctly', async () => {
    // 1. Mock the API endpoints called by useAsyncData in index.vue
    registerEndpoint('/api/academic-years', () => ({
      years: [
        {
          id: 1,
          yearStart: 2026,
          yearEnd: 2027,
          semester: 'ganjil' as const,
          isCurrentActiveYear: true,
          createdAt: '2026-01-01'
        }
      ],
      activeYearId: 1
    }))

    registerEndpoint('/api/lecturers', () => [
      {
        id: 1,
        name: 'Dr. Budi Santoso',
        shortname: 'BS',
        nip: '198501012010121001',
        phone: '081234567890',
        createdAt: null
      }
    ])

    registerEndpoint('/api/schedules', () => [
      {
        id: 1,
        subjectId: 1,
        type: 'regular' as const,
        parentScheduleId: null,
        status: 'active' as const,
        skippedUntil: null,
        isOnline: false,
        building: 'Gedung A',
        floor: '3',
        room: 'Lab 1',
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
              name: 'Dr. Budi Santoso',
              shortname: 'BS',
              nip: '198501012010121001',
              phone: '081234567890',
              createdAt: null
            }
          ]
        },
        events: []
      }
    ])

    registerEndpoint('/api/holidays', () => [])

    // 2. Mount the index page suspended inside Nuxt runtime
    const wrapper = await mountSuspended(IndexPage)

    // 3. Assertions
    expect(wrapper.text()).toContain('Selamat Datang di Portal')
    expect(wrapper.text()).toContain('PSIK25B')
    expect(wrapper.text()).toContain('Tahun Ajaran: 2026/2027 (Ganjil)')
    expect(wrapper.text()).toContain('Jadwal Mata Kuliah')
    expect(wrapper.text()).toContain('Pemrograman Web Lanjut')
    expect(wrapper.text()).toContain('Data Dosen Pengampu')
    expect(wrapper.text()).toContain('Dr. Budi Santoso')
    expect(wrapper.text()).toContain('BS')
    expect(wrapper.text()).toContain('081234567890')
  })
})
