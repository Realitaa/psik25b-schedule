<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
}>(), {
  modelValue: '',
  placeholder: 'Tuliskan rincian event di sini...'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const content = computed({
  get: () => props.modelValue,
  set: (val: string) => emit('update:modelValue', val)
})

const imageInputRef = ref<HTMLInputElement | null>(null)
const activeEditorInstance = ref<any>(null)
const toast = useToast()

// Maximum file size for inline base64 image (500 KB to avoid SQLite D1 query payload limit)
const MAX_IMAGE_SIZE_BYTES = 500 * 1024

function triggerImageUpload(editor: any) {
  activeEditorInstance.value = editor
  imageInputRef.value?.click()
}

function onImageFileSelected(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  // Validate image size
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    const sizeKb = Math.round(file.size / 1024)
    toast.add({
      title: 'Ukuran Gambar Terlalu Besar',
      description: `Gambar yang diunggah berukuran ${sizeKb} KB. Batas maksimal adalah 500 KB untuk mencegah error penyimpanan database. Silakan kompres gambar terlebih dahulu.`,
      color: 'warning',
      icon: 'i-lucide-alert-triangle'
    })
    if (imageInputRef.value) imageInputRef.value.value = ''
    return
  }

  const reader = new FileReader()
  reader.onload = (event) => {
    let base64 = event.target?.result as string
    if (base64 && activeEditorInstance.value) {
      base64 = base64.trim().replace(/^["']+|["']+$/g, '')
      activeEditorInstance.value.chain().focus().setImage({ src: base64 }).run()
      toast.add({ title: 'Gambar Berhasil Disisipkan', color: 'success' })
    }
  }
  reader.readAsDataURL(file)
  if (imageInputRef.value) imageInputRef.value.value = ''
}
</script>

<template>
  <div class="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden bg-white dark:bg-neutral-950">
    <!-- Hidden file input for base64 image upload -->
    <input
      ref="imageInputRef"
      type="file"
      accept="image/*"
      class="hidden"
      @change="onImageFileSelected"
    >

    <UEditor
      v-slot="{ editor }"
      v-model="content"
      content-type="html"
      :image="{ allowBase64: true, inline: true }"
      :placeholder="placeholder"
      class="p-4 min-h-36 max-h-80 overflow-y-auto text-sm [&_.tiptap_img]:max-w-full [&_.tiptap_img]:max-h-60 [&_.tiptap_img]:h-auto [&_.tiptap_img]:rounded-lg [&_.tiptap_img]:my-2 [&_.tiptap_img]:block"
    >
      <div class="border-b border-neutral-200 dark:border-neutral-800 p-2 bg-neutral-50 dark:bg-neutral-900/50 flex flex-wrap items-center justify-between gap-2">
        <UEditorToolbar
          :editor="editor"
          :items="[
            { kind: 'mark', mark: 'bold', icon: 'i-lucide-bold' },
            { kind: 'mark', mark: 'italic', icon: 'i-lucide-italic' },
            { kind: 'heading', level: 2, icon: 'i-lucide-heading-2' },
            { kind: 'heading', level: 3, icon: 'i-lucide-heading-3' },
            { kind: 'bulletList', icon: 'i-lucide-list' },
            { kind: 'orderedList', icon: 'i-lucide-list-ordered' },
            { kind: 'blockquote', icon: 'i-lucide-quote' },
            { kind: 'link', icon: 'i-lucide-link' }
          ]"
        />
        <UButton
          label="Sisipkan Gambar"
          icon="i-lucide-image-plus"
          color="neutral"
          variant="outline"
          size="xs"
          @click="triggerImageUpload(editor)"
        />
      </div>
    </UEditor>
  </div>
</template>
