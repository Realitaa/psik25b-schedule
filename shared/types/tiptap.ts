export interface TipTapMark {
  type: string
  attrs?: Record<string, unknown>
}

export interface TipTapNode {
  type: string
  text?: string
  marks?: TipTapMark[]
  attrs?: {
    level?: number
    href?: string
    src?: string
    alt?: string
    [key: string]: unknown
  }
  content?: TipTapNode[]
}

export interface TipTapDoc extends TipTapNode {
  type: 'doc'
}
