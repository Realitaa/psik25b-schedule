<script setup>
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

const title = 'PSIK25B Schedule'
const description = 'Sistem Jadwal Perkuliahan & Manajamen Kelas PSIK25B.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterCard: 'summary_large_image'
})

const { user, loggedIn, clear } = useUserSession()
const router = useRouter()
const toast = useToast()

async function handleLogout() {
  await clear()
  toast.add({
    title: 'Berhasil Logout',
    description: 'Anda telah keluar dari akun.',
    color: 'neutral'
  })
  await router.push('/login')
}
</script>

<template>
  <UApp>
    <NuxtLoadingIndicator color="fuchsia" />
    <UHeader>
      <template #left>
        <NuxtLink
          to="/"
          class="font-bold text-lg text-highlighted flex items-center gap-2"
        >
          <UIcon
            name="i-lucide-calendar"
            class="size-6 text-primary"
          />
          <span>PSIK25B</span>
        </NuxtLink>
      </template>

      <template #right>
        <UColorModeButton />

        <template
          v-if="loggedIn"
        >
          <UBadge
            color="primary"
            variant="subtle"
            class="mr-2"
          >
            <UIcon
              name="i-lucide-user"
              class="mr-1 size-3.5"
            />
            {{ user?.name || user?.username }}
          </UBadge>
          <UButton
            label="Logout"
            icon="i-lucide-log-out"
            color="neutral"
            variant="ghost"
            @click="handleLogout"
          />
        </template>
        <template v-else>
          <UButton
            to="/login"
            label="Login"
            icon="i-lucide-log-in"
            color="primary"
            variant="solid"
          />
        </template>
      </template>
    </UHeader>

    <UMain>
      <NuxtPage />
    </UMain>

    <UFooter>
      <template #left>
        <p class="text-sm text-muted">
          Made with &hearts; by Realitaa
        </p>
      </template>

      <template #right>
        <UButton
          to="https://github.com/Realitaa/psik25b-schedule"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
          color="neutral"
          variant="ghost"
        />
      </template>
    </UFooter>
  </UApp>
</template>
