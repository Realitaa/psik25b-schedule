import { describe, it, expect, vi } from 'vitest'
import { z } from 'zod'
import type { H3Event } from 'h3'
import { defineApiHandler } from '../../server/utils/handler'
import { parseIdParam, validateBody } from '../../server/utils/request'
import {
  ValidationException,
  NotFoundException,
  UnauthorizedException
} from '../../server/utils/exceptions'

describe('Server Request & Handler Utilities', () => {
  describe('parseIdParam', () => {
    it('should parse valid numeric ID from router param', () => {
      // Mock getRouterParam global
      vi.stubGlobal('getRouterParam', (_event: unknown, _paramName: string) => '42')

      const mockEvent = {} as H3Event
      const id = parseIdParam(mockEvent, 'id')
      expect(id).toBe(42)

      vi.unstubAllGlobals()
    })

    it('should throw ValidationException if ID is missing or not a number', () => {
      vi.stubGlobal('getRouterParam', (_event: unknown, _paramName: string) => 'abc')

      const mockEvent = {} as H3Event
      expect(() => parseIdParam(mockEvent, 'id', 'ID dosen tidak valid')).toThrow(ValidationException)

      vi.unstubAllGlobals()
    })
  })

  describe('validateBody', () => {
    const testSchema = z.object({
      name: z.string().min(1, 'Nama wajib diisi'),
      age: z.number().min(18, 'Usia minimal 18 tahun')
    })

    it('should return parsed data when valid', async () => {
      vi.stubGlobal('readBody', async () => ({ name: 'Budi', age: 20 }))

      const mockEvent = {} as H3Event
      const data = await validateBody(mockEvent, testSchema)
      expect(data).toEqual({ name: 'Budi', age: 20 })

      vi.unstubAllGlobals()
    })

    it('should throw ValidationException with first issue message on validation failure', async () => {
      vi.stubGlobal('readBody', async () => ({ name: '', age: 10 }))

      const mockEvent = {} as H3Event
      await expect(validateBody(mockEvent, testSchema)).rejects.toThrow('Nama wajib diisi')

      vi.unstubAllGlobals()
    })
  })

  describe('defineApiHandler', () => {
    it('should map thrown AppException to createError with matching status and message', async () => {
      let createdErrorPayload: { statusCode?: number, statusMessage?: string } | null = null

      vi.stubGlobal('createError', (payload: { statusCode?: number, statusMessage?: string }) => {
        createdErrorPayload = payload
        const err = new Error(payload.statusMessage)
        Object.assign(err, payload)
        return err
      })
      vi.stubGlobal('defineEventHandler', (fn: (event: H3Event) => Promise<unknown>) => fn)

      const handler = defineApiHandler(async () => {
        throw new NotFoundException('Data jadwal tidak ditemukan')
      })

      const mockEvent = {} as H3Event
      await expect(handler(mockEvent)).rejects.toThrow('Data jadwal tidak ditemukan')
      expect(createdErrorPayload).toEqual({
        statusCode: 404,
        statusMessage: 'Data jadwal tidak ditemukan'
      })

      vi.unstubAllGlobals()
    })

    it('should map UnauthorizedException correctly to 401', async () => {
      let createdErrorPayload: { statusCode?: number, statusMessage?: string } | null = null

      vi.stubGlobal('createError', (payload: { statusCode?: number, statusMessage?: string }) => {
        createdErrorPayload = payload
        const err = new Error(payload.statusMessage)
        Object.assign(err, payload)
        return err
      })
      vi.stubGlobal('defineEventHandler', (fn: (event: H3Event) => Promise<unknown>) => fn)

      const handler = defineApiHandler(async () => {
        throw new UnauthorizedException('Username atau password salah')
      })

      const mockEvent = {} as H3Event
      await expect(handler(mockEvent)).rejects.toThrow('Username atau password salah')
      expect(createdErrorPayload).toEqual({
        statusCode: 401,
        statusMessage: 'Username atau password salah'
      })

      vi.unstubAllGlobals()
    })
  })
})
