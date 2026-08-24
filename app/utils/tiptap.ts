export function renderTiptapToHtml(content: any): string {
  if (!content) return ''
  let str = typeof content === 'string' ? content.trim() : JSON.stringify(content)

  // Recursively unwrap stringified JSON strings (e.g. "\"<p>...</p>\"")
  let iterations = 0
  while (iterations < 5) {
    if (
      (str.startsWith('"') && str.endsWith('"')) ||
      (str.startsWith('\'') && str.endsWith('\''))
    ) {
      try {
        const parsed = JSON.parse(str)
        if (typeof parsed === 'string') {
          str = parsed.trim()
          iterations++
          continue
        }
      } catch {
        str = str.slice(1, -1).trim()
      }
    }
    break
  }

  // Handle TipTap JSON docs (object or string) safely without external dependencies
  if (str.startsWith('{') && (str.includes('"type":"doc"') || str.includes('"type": "doc"'))) {
    try {
      const json = JSON.parse(str)
      return parseTipTapNodeToHtml(json)
    } catch {
      // fallback to treating as HTML string
    }
  }

  return str
}

function parseTipTapNodeToHtml(node: any): string {
  if (!node) return ''
  if (node.type === 'text') {
    let text = escapeHtml(node.text || '')
    if (node.marks) {
      for (const mark of node.marks) {
        if (mark.type === 'bold') text = `<strong>${text}</strong>`
        if (mark.type === 'italic') text = `<em>${text}</em>`
        if (mark.type === 'strike') text = `<s>${text}</s>`
        if (mark.type === 'link') {
          const href = (mark.attrs?.href || '#').replace(/^["']+|["']+$/g, '')
          text = `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`
        }
      }
    }
    return text
  }
  if (node.type === 'image') {
    let src = (node.attrs?.src || '').trim().replace(/^["'\\]+|["'\\]+$/g, '').replace(/^%22|%22$/gi, '')
    const alt = escapeHtml(node.attrs?.alt || '')
    return `<img src="${src}" alt="${alt}" />`
  }

  const childrenHtml = (node.content || []).map(parseTipTapNodeToHtml).join('')
  if (node.type === 'doc') return childrenHtml
  if (node.type === 'paragraph') return `<p>${childrenHtml || '<br>'}</p>`
  if (node.type === 'heading') return `<h${node.attrs?.level || 2}>${childrenHtml}</h${node.attrs?.level || 2}>`
  if (node.type === 'bulletList') return `<ul>${childrenHtml}</ul>`
  if (node.type === 'orderedList') return `<ol>${childrenHtml}</ol>`
  if (node.type === 'listItem') return `<li>${childrenHtml}</li>`
  if (node.type === 'blockquote') return `<blockquote>${childrenHtml}</blockquote>`
  return childrenHtml
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
