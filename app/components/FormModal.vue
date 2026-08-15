<script setup lang="ts">
const props = defineProps<{
  open: boolean
  title: string
  description?: string
  loading?: boolean
  submitLabel?: string
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'submit'): void
}>()

const isOpen = computed({
  get: () => props.open,
  set: (val: boolean) => emit('update:open', val)
})
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :title="title"
    :description="description"
  >
    <template #body>
      <form
        id="modal-form"
        @submit.prevent="emit('submit')"
      >
        <slot />
      </form>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton
          label="Batal"
          color="neutral"
          variant="outline"
          :disabled="loading"
          @click="isOpen = false"
        />
        <UButton
          type="submit"
          form="modal-form"
          :label="submitLabel || 'Simpan'"
          color="primary"
          :loading="loading"
        />
      </div>
    </template>
  </UModal>
</template>
