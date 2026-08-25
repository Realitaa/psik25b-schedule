import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: [
            'test/unit/**/*.{test,spec}.ts',
            'test/server/**/*.{test,spec}.ts'
          ],
          environment: 'node'
        },
        resolve: {
          alias: {
            '#shared/types': fileURLToPath(new URL('./shared/types/index.ts', import.meta.url)),
            '#shared/utils/date': fileURLToPath(new URL('./shared/utils/date.ts', import.meta.url)),
            '#shared': fileURLToPath(new URL('./shared', import.meta.url)),
            '~': fileURLToPath(new URL('./app', import.meta.url)),
            '@': fileURLToPath(new URL('./app', import.meta.url))
          }
        }
      },
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['test/nuxt/**/*.{test,spec}.ts'],
          environment: 'nuxt',
          environmentOptions: {
            nuxt: {
              domEnvironment: 'happy-dom'
            }
          }
        }
      })
    ]
  }
})
