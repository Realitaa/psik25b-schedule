<script setup lang="ts">
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  middleware: 'guest'
})

const { fetch: refreshSession } = useUserSession()
const router = useRouter()
const toast = useToast()

const fields: AuthFormField[] = [
  {
    name: 'username',
    type: 'text',
    label: 'Username',
    placeholder: 'Masukkan username',
    required: true,
    icon: 'i-lucide-user'
  },
  {
    name: 'password',
    type: 'password',
    label: 'Password',
    placeholder: 'Masukkan password',
    required: true,
    icon: 'i-lucide-lock'
  }
]

const loading = ref(false)

async function onSubmit(event: FormSubmitEvent<{ username?: string, password?: string }>) {
  loading.value = true
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: event.data
    })

    await refreshSession()
    toast.add({
      title: 'Berhasil Login',
      description: 'Selamat datang kembali!',
      color: 'success'
    })
    await router.push('/dashboard')
  } catch (err: unknown) {
    const errorObj = err as { data?: { statusMessage?: string }, statusMessage?: string }
    toast.add({
      title: 'Gagal Login',
      description: errorObj?.data?.statusMessage || errorObj?.statusMessage || 'Username atau password salah',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-[calc(100vh-12rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <UCard class="w-full max-w-md">
      <UAuthForm
        title="Masuk ke Akun"
        description="Masukkan kredensial Anda untuk mengakses sistem"
        icon="i-lucide-shield-check"
        :fields="fields"
        :loading="loading"
        :submit="{
          label: 'Masuk',
          color: 'primary',
          block: true
        }"
        @submit="onSubmit"
      />
    </UCard>
  </div>
</template>
