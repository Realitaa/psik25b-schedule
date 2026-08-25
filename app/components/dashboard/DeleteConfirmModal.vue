<script setup lang="ts">
defineProps<{
  targetName: string
  targetType: 'lecturer' | 'subject' | 'event' | null
  loading?: boolean
}>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  (e: 'confirm'): void
}>()
</script>

<template>
  <UModal
    v-model:open="open"
    title="Konfirmasi Hapus"
  >
    <template #body>
      <p class="text-sm text-muted">
        Apakah Anda yakin ingin menghapus {{ targetType === 'lecturer' ? 'dosen' : targetType === 'subject' ? 'mata kuliah' : 'event' }}
        <span class="font-semibold text-highlighted">"{{ targetName }}"</span>? Tindakan ini tidak dapat dibatalkan.
      </p>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton
          label="Batal"
          color="neutral"
          variant="outline"
          :disabled="loading"
          @click="open = false"
        />
        <UButton
          label="Hapus"
          color="error"
          :loading="loading"
          @click="emit('confirm')"
        />
      </div>
    </template>
  </UModal>
</template>
