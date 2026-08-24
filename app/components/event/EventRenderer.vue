<script setup lang="ts">
import { renderTiptapToHtml } from '~/utils/tiptap'

const props = defineProps<{
  content?: any
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
</script>

<template>
  <div class="w-full">
    <div
      v-if="renderedHtml"
      v-viewer
      class="prose dark:prose-invert max-w-none text-sm break-words [&_img]:cursor-zoom-in [&_img]:rounded-lg [&_img]:max-h-96 [&_img]:w-auto [&_img]:object-contain [&_img]:shadow-sm hover:[&_img]:opacity-90 transition-opacity"
      v-html="renderedHtml"
    />
    <div
      v-else
      class="text-sm text-muted italic py-1"
    >
      Tidak ada rincian deskripsi tambahan.
    </div>
  </div>
</template>
