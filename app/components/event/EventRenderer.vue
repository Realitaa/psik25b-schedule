<script setup lang="ts">
import editorTheme from '#build/ui/editor'
import type { TipTapDoc } from '#shared/types'
import { renderTiptapToHtml } from '~/utils/tiptap'

const props = defineProps<{
  content?: string | TipTapDoc | Record<string, unknown> | null
}>()

function cleanHtmlImages(html: string): string {
  if (!html) return ''
  let cleaned = html

  // Fix malformed image src with escaped quotes or URL-encoded %22
  cleaned = cleaned.replace(/src=["'](?:\\?["']|%22)*(data:image\/[^"'\s>]+)(?:\\?["']|%22)*["']/gi, 'src="$1"')
  cleaned = cleaned.replace(/src=["'](?:\\+["'])+(data:image\/[^"'\s>]+)["']/gi, 'src="$1"')

  // Fix malformed links href
  cleaned = cleaned.replace(/href=["'](?:\\?["']|%22)*([^"'\s>]+)(?:\\?["']|%22)*["']/gi, 'href="$1"')

  return cleaned
}

const renderedHtml = computed(() => {
  if (!props.content) return ''
  const html = renderTiptapToHtml(props.content)
  return cleanHtmlImages(html)
})

const viewerOptions = {
  inline: false,
  button: true,
  navbar: false,
  title: false,
  toolbar: true,
  tooltip: true,
  movable: true,
  zoomable: true,
  rotatable: true,
  scalable: true,
  transition: true,
  fullscreen: true,
  keyboard: true,
  zoomOnWheel: true,
  zoomOnTouch: true,
  toggleOnDblclick: true,
  backdrop: true
}
</script>

<template>
  <div class="w-full">
    <!-- eslint-disable vue/no-v-html -->
    <div
      v-if="renderedHtml"
      v-viewer="viewerOptions"
      :class="[
        editorTheme.slots.base,
        'text-sm wrap-break-word [&_img]:cursor-zoom-in [&_img]:rounded-lg [&_img]:max-h-96 [&_img]:w-auto [&_img]:object-contain [&_img]:shadow-sm hover:[&_img]:opacity-90 transition-opacity'
      ]"
      v-html="renderedHtml"
    />
    <!-- eslint-enable vue/no-v-html -->
    <div
      v-else
      class="text-sm text-muted italic py-1"
    >
      Tidak ada rincian deskripsi tambahan.
    </div>
  </div>
</template>
