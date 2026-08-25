import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import type { H3Event } from 'h3'
import type { PublicScheduleBundle } from '#shared/types'

describe('Public Schedule Bundle Endpoint (/api/public/schedule-bundle)', () => {
  beforeAll(() => {
    vi.stubGlobal('defineEventHandler', (fn: (event: H3Event) => Promise<unknown>) => fn)
  })

  afterAll(() => {
    vi.unstubAllGlobals()
  })

  it('should return consolidated bundle with activeYear, lecturers, and schedules', async () => {
    const { academicYearService } = await import('../../server/services/academic-year.service')
    const { lecturerService } = await import('../../server/services/lecturer.service')
    const { scheduleService } = await import('../../server/services/schedule.service')
    const { default: handler } = await import('../../server/api/public/schedule-bundle.get')

    vi.spyOn(academicYearService, 'getAcademicYears').mockResolvedValue([
      {
        id: 1,
        yearStart: 2026,
        yearEnd: 2027,
        semester: 'ganjil',
        isCurrentActiveYear: true,
        createdAt: '2026-01-01'
      }
    ])

    vi.spyOn(academicYearService, 'getActiveAcademicYear').mockResolvedValue({
      id: 1,
      yearStart: 2026,
      yearEnd: 2027,
      semester: 'ganjil',
      isCurrentActiveYear: true,
      createdAt: '2026-01-01'
    })

    vi.spyOn(lecturerService, 'getLecturers').mockResolvedValue([
      {
        id: 1,
        name: 'Dr. Budi',
        shortname: 'DB',
        nip: null,
        phone: null,
        createdAt: null
      }
    ])

    vi.spyOn(scheduleService, 'getSchedules').mockResolvedValue([
      {
        id: 10,
        subjectId: 1,
        type: 'regular',
        parentScheduleId: null,
        status: 'active',
        skippedUntil: null,
        isOnline: false,
        building: 'Fasilkom',
        floor: '2',
        room: 'Lab 1',
        day: 'Senin',
        timeStart: '08:00',
        timeEnd: '10:30',
        endDate: null,
        createdAt: null,
        subject: {
          id: 1,
          academicYearId: 1,
          name: 'Pemrograman Web Lanjut',
          createdAt: null,
          lecturers: []
        },
        events: []
      }
    ])

    const mockEvent = {} as H3Event
    const result = await (handler as unknown as (event: H3Event) => Promise<PublicScheduleBundle>)(mockEvent)

    expect(result.activeYear).toBeDefined()
    expect(result.activeYear?.id).toBe(1)
    expect(result.lecturers.length).toBe(1)
    expect(result.schedules.length).toBe(1)
    expect(result.version).toBeDefined()
    expect(result.cachedAt).toBeDefined()
  })
})
