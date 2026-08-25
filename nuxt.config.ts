// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    'nuxt-auth-utils',
    '@vite-pwa/nuxt'
  ],
  ssr: false,

  devtools: {
    enabled: true
  },

  app: {
    head: {
      title: 'Jadwal Perkuliahan PSIK25B',
      meta: [
        { name: 'description', content: 'Portal Informasi dan Jadwal Perkuliahan Mahasiswa PSIK 2025 B' },
        { name: 'theme-color', content: '#09090b' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }
      ]
    }
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/': { prerender: true }
  },

  compatibilityDate: '2026-06-30',

  nitro: {
    preset: import.meta.env.CF_PAGES !== '1' ? 'cloudflare-module' : undefined,
    experimental: {
      asyncContext: true
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  icon: {
    serverBundle: 'local',
    clientBundle: {
      scan: true,
      sizeLimitKb: 512
    },
    provider: 'iconify'
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Jadwal Perkuliahan PSIK25B',
      short_name: 'PSIK25B',
      description: 'Portal Informasi dan Jadwal Perkuliahan Mahasiswa PSIK 2025 B',
      theme_color: '#09090b',
      background_color: '#09090b',
      display: 'standalone',
      orientation: 'portrait-primary',
      start_url: '/',
      scope: '/',
      icons: [
        {
          src: '/pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        },
        {
          src: '/maskable-icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable'
        }
      ]
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2}'],
      runtimeCaching: [
        {
          urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
          handler: 'NetworkFirst',
          options: {
            cacheName: 'psik25b-api-cache',
            networkTimeoutSeconds: 3,
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        }
      ]
    },
    client: {
      installPrompt: true
    },
    devOptions: {
      enabled: false,
      suppressWarnings: true,
      type: 'module'
    }
  }
})
