import { describe, it, expect } from 'vitest'
import { renderTiptapToHtml } from '../../app/utils/tiptap'

describe('TipTap to HTML Renderer Utility', () => {
  it('should return empty string on null or undefined content', () => {
    expect(renderTiptapToHtml(null)).toBe('')
    expect(renderTiptapToHtml(undefined)).toBe('')
    expect(renderTiptapToHtml('')).toBe('')
  })

  it('should return HTML string directly if input is already HTML string', () => {
    const html = '<p>Halo perkuliahan</p>'
    expect(renderTiptapToHtml(html)).toBe(html)
  })

  it('should unwrap JSON stringified strings', () => {
    const stringified = '"<p>Tugas kelompok</p>"'
    expect(renderTiptapToHtml(stringified)).toBe('<p>Tugas kelompok</p>')
  })

  it('should render TipTap JSON object AST into proper HTML', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Pengumuman Kuis' }]
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Kuis akan diadakan secara online di ' },
            {
              type: 'text',
              text: 'Google Classroom',
              marks: [{ type: 'bold' }]
            }
          ]
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Bawa KTM' }] }]
            }
          ]
        }
      ]
    }

    const rendered = renderTiptapToHtml(doc)
    expect(rendered).toContain('<h2>Pengumuman Kuis</h2>')
    expect(rendered).toContain('<strong>Google Classroom</strong>')
    expect(rendered).toContain('<ul><li><p>Bawa KTM</p></li></ul>')
  })

  it('should sanitize HTML characters in text nodes', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: '<script>alert("hack")</script>' }]
        }
      ]
    }

    const rendered = renderTiptapToHtml(doc)
    expect(rendered).not.toContain('<script>')
    expect(rendered).toContain('&lt;script&gt;')
  })

  it('should render image node with proper attributes', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'image',
          attrs: {
            src: 'data:image/png;base64,iVBORw0KGgo...',
            alt: 'Screenshot Jadwal'
          }
        }
      ]
    }

    const rendered = renderTiptapToHtml(doc)
    expect(rendered).toContain('<img src="data:image/png;base64,iVBORw0KGgo..." alt="Screenshot Jadwal" />')
  })
})
