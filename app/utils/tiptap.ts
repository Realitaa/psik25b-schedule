import { generateHTML } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'

export function renderTiptapToHtml(content: any): string {
  if (!content) return ''
  if (typeof content === 'string') {
    const trimmed = content.trim()
    if (trimmed.startsWith('{') && (trimmed.includes('"type":"doc"') || trimmed.includes('"type": "doc"'))) {
      try {
        const json = JSON.parse(trimmed)
        return generateHTML(json, [
          StarterKit,
          Image,
          Link
        ])
      } catch {
        return content
      }
    }
    return content
  }

  if (typeof content === 'object') {
    try {
      return generateHTML(content, [
        StarterKit,
        Image,
        Link
      ])
    } catch {
      return ''
    }
  }

  return ''
}
