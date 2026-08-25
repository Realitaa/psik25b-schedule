import { describe, it, expect } from 'vitest'
import {
  calculateNextScheduleOccurrence,
  classifySubjectStatus,
  sortSubjectsBySchedule,
  formatIndonesianDate,
  formatIndonesianDateTime,
  formatEventEndDate,
  formatYMDDate,
  timeToMinutes
} from '../../shared/utils/date'

describe('Date & Schedule Utilities', () => {
  describe('timeToMinutes', () => {
    it('should convert time string HH:mm to total minutes', () => {
      expect(timeToMinutes('08:00')).toBe(480)
      expect(timeToMinutes('10:30')).toBe(630)
      expect(timeToMinutes('00:00')).toBe(0)
    })

    it('should return 0 for empty or invalid input', () => {
      expect(timeToMinutes('')).toBe(0)
      expect(timeToMinutes(null)).toBe(0)
      expect(timeToMinutes(undefined)).toBe(0)
    })
  })

  describe('formatYMDDate', () => {
    it('should format date to YYYY-MM-DD', () => {
      const d = new Date(2026, 4, 15) // May 15, 2026
      expect(formatYMDDate(d)).toBe('2026-05-15')
    })
  })

  describe('formatIndonesianDate', () => {
    it('should format date with Indonesian locale', () => {
      const d = new Date(2026, 4, 15)
      const formatted = formatIndonesianDate(d)
      expect(formatted).toContain('Mei')
      expect(formatted).toContain('2026')
    })

    it('should return empty string on invalid/empty input', () => {
      expect(formatIndonesianDate(null)).toBe('')
      expect(formatIndonesianDate('invalid-date')).toBe('')
    })
  })

  describe('formatIndonesianDateTime', () => {
    it('should format date and time with WIB suffix', () => {
      const d = new Date(2026, 4, 15, 8, 30)
      const formatted = formatIndonesianDateTime(d)
      expect(formatted).toContain('WIB')
      expect(formatted).toContain('Mei')
    })

    it('should return empty string on invalid date', () => {
      expect(formatIndonesianDateTime(null)).toBe('')
      expect(formatIndonesianDateTime('invalid-date')).toBe('')
    })
  })

  describe('formatEventEndDate', () => {
    it('should return fallback if dateStr is empty', () => {
      expect(formatEventEndDate(null)).toBe('Tanpa batas waktu (Permanen)')
      expect(formatEventEndDate('', 'Tidak ada')).toBe('Tidak ada')
    })

    it('should format ISO date correctly with WIB', () => {
      const iso = '2026-05-15T10:30:00.000Z'
      const formatted = formatEventEndDate(iso)
      expect(formatted).toContain('WIB')
    })
  })

  describe('calculateNextScheduleOccurrence', () => {
    it('should calculate next occurrence for a given day and timeEnd', () => {
      // Base date: Wednesday (index 3), 2026-05-13 08:00:00
      const baseWednesday = new Date(2026, 4, 13, 8, 0, 0)

      // Target: Thursday (index 4) at 10:30 -> Next day (May 14)
      const nextThursday = calculateNextScheduleOccurrence('Kamis', '10:30', baseWednesday)
      expect(nextThursday).toBeDefined()
      const d = new Date(nextThursday!)
      expect(d.getDate()).toBe(14)
      expect(d.getHours()).toBe(10)
      expect(d.getMinutes()).toBe(30)
    })

    it('should roll over to next week if target day is today but time has already passed', () => {
      // Base date: Wednesday 12:00
      const baseWednesdayAfternoon = new Date(2026, 4, 13, 12, 0, 0)

      // Target: Wednesday at 10:00 (already passed today) -> Next Wednesday (May 20)
      const nextWednesday = calculateNextScheduleOccurrence('Rabu', '10:00', baseWednesdayAfternoon)
      expect(nextWednesday).toBeDefined()
      const d = new Date(nextWednesday!)
      expect(d.getDate()).toBe(20)
    })

    it('should return null for invalid day or timeEnd', () => {
      expect(calculateNextScheduleOccurrence('', '10:00')).toBeNull()
      expect(calculateNextScheduleOccurrence('Senin', '')).toBeNull()
      expect(calculateNextScheduleOccurrence('InvalidDay', '10:00')).toBeNull()
    })
  })

  describe('sortSubjectsBySchedule', () => {
    it('should sort subjects by day of the week first, then by timeStart', () => {
      const list = [
        { name: 'Matkul Rabu', day: 'Rabu', timeStart: '08:00' },
        { name: 'Matkul Senin Siang', day: 'Senin', timeStart: '13:00' },
        { name: 'Matkul Senin Pagi', day: 'Senin', timeStart: '08:00' },
        { name: 'Matkul Jumat', day: 'Jumat', timeStart: '09:00' }
      ]

      const sorted = sortSubjectsBySchedule(list)
      expect(sorted[0]?.name).toBe('Matkul Senin Pagi')
      expect(sorted[1]?.name).toBe('Matkul Senin Siang')
      expect(sorted[2]?.name).toBe('Matkul Rabu')
      expect(sorted[3]?.name).toBe('Matkul Jumat')
    })
  })

  describe('classifySubjectStatus', () => {
    it('should classify as current if current time is within timeStart and timeEnd', () => {
      // Current minutes = 500 (08:20)
      const result = classifySubjectStatus('08:00', '10:00', 500)
      expect(result.statusType).toBe('current')
      expect(result.isPassed).toBe(false)
    })

    it('should classify as incoming if current time is before timeStart', () => {
      // Current minutes = 400 (06:40)
      const result = classifySubjectStatus('08:00', '10:00', 400)
      expect(result.statusType).toBe('incoming')
      expect(result.isPassed).toBe(false)
    })

    it('should classify as passed if current time is after timeEnd', () => {
      // Current minutes = 650 (10:50)
      const result = classifySubjectStatus('08:00', '10:00', 650)
      expect(result.isPassed).toBe(true)
    })
  })
})
