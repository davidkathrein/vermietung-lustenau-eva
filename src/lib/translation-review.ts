import type { TranslationEntity } from './translation-fields'

export type ReviewField = { path: string; kind: 'text' | 'slug' | 'richText'; value: string | Record<string, unknown> }
export type ReviewCandidate = { path: string; kind: ReviewField['kind']; source: ReviewField['value']; candidate: ReviewField['value'] }
export type TranslationUnit = { path: string; text: string }

function at(value: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((current, key) => current && typeof current === 'object' ? (current as Record<string, unknown>)[key] : undefined, value)
}

function nonempty(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function richTextStrings(value: unknown): string[] {
  if (!value || typeof value !== 'object') return []
  const node = value as Record<string, unknown>
  const own = typeof node.text === 'string' && node.text.trim() ? [node.text] : []
  const children = Array.isArray(node.children) ? node.children.flatMap(richTextStrings) : []
  const root = node.root ? richTextStrings(node.root) : []
  return [...own, ...children, ...root]
}

function addText(fields: ReviewField[], path: string, value: unknown, kind: 'text' | 'slug' = 'text') {
  if (nonempty(value)) fields.push({ path, kind, value: value.trim() })
}

function addRichText(fields: ReviewField[], path: string, value: unknown) {
  if (value && typeof value === 'object' && !Array.isArray(value) && richTextStrings(value).length > 0) {
    fields.push({ path, kind: 'richText', value: value as Record<string, unknown> })
  }
}

export function sourceIsComplete(entity: TranslationEntity, document: Record<string, unknown>): boolean {
  if (entity === 'pages') {
    if (!nonempty(document.slug) || !nonempty(document.title) || !nonempty(at(document, 'seo.metaTitle')) || !nonempty(at(document, 'seo.metaDescription'))) return false
    if (!Array.isArray(document.layout) || document.layout.length === 0) return false
    return document.layout.every((item) => {
      if (!item || typeof item !== 'object') return false
      const block = item as Record<string, unknown>
      if (block.blockType === 'richText') return richTextStrings(block.content).length > 0
      if (!nonempty(block.headline)) return false
      if (block.blockType === 'faq') return Array.isArray(block.items) && block.items.length > 0 && block.items.every((row) => row && typeof row === 'object' && nonempty((row as Record<string, unknown>).question) && richTextStrings((row as Record<string, unknown>).answer).length > 0)
      if (block.blockType === 'cta') return nonempty(at(block, 'action.label'))
      return true
    })
  }
  if (entity === 'accommodations') return nonempty(document.slug) && nonempty(document.name) && nonempty(document.teaser)
  if (entity === 'media') return nonempty(document.alt)
  return nonempty(document.siteName)
}

export function reviewFields(entity: TranslationEntity, document: Record<string, unknown>): ReviewField[] {
  const fields: ReviewField[] = []
  if (entity === 'accommodations') {
    addText(fields, 'slug', document.slug, 'slug')
    for (const path of ['name', 'teaser', 'description', 'bedSetup']) addText(fields, path, document[path])
  } else if (entity === 'media') {
    for (const path of ['alt', 'caption']) addText(fields, path, document[path])
  } else if (entity === 'site-settings') {
    for (const path of ['siteName', 'country']) addText(fields, path, document[path])
    if (Array.isArray(document.navigation)) document.navigation.forEach((_, index) => addText(fields, `navigation.${index}.link.label`, at(document, `navigation.${index}.link.label`)))
  } else if (entity === 'pages') {
    addText(fields, 'slug', document.slug, 'slug')
    addText(fields, 'title', document.title)
    addText(fields, 'seo.metaTitle', at(document, 'seo.metaTitle'))
    addText(fields, 'seo.metaDescription', at(document, 'seo.metaDescription'))
    if (Array.isArray(document.layout)) document.layout.forEach((item, index) => {
      if (!item || typeof item !== 'object') return
      const block = item as Record<string, unknown>
      for (const key of ['eyebrow', 'headline', 'intro']) addText(fields, `layout.${index}.${key}`, block[key])
      if (block.blockType === 'richText') addRichText(fields, `layout.${index}.content`, block.content)
      if (block.blockType === 'content') addRichText(fields, `layout.${index}.body`, block.body)
      if (block.blockType === 'faq' && Array.isArray(block.items)) block.items.forEach((row, rowIndex) => {
        addText(fields, `layout.${index}.items.${rowIndex}.question`, at(block, `items.${rowIndex}.question`))
        addRichText(fields, `layout.${index}.items.${rowIndex}.answer`, at(block, `items.${rowIndex}.answer`))
      })
      addText(fields, `layout.${index}.action.label`, at(block, 'action.label'))
      if (Array.isArray(block.actions)) block.actions.forEach((_, actionIndex) => addText(fields, `layout.${index}.actions.${actionIndex}.link.label`, at(block, `actions.${actionIndex}.link.label`)))
    })
  }
  return fields
}

export function translationUnits(fields: ReviewField[]): TranslationUnit[] {
  return fields.map((field) => ({ path: field.path, text: field.kind === 'richText' ? JSON.stringify(field.value) : field.value as string }))
}

function sameRichTextStructure(source: unknown, candidate: unknown, key = ''): boolean {
  if (key === 'text') return typeof source === 'string' && (nonempty(source) ? nonempty(candidate) : candidate === source)
  if (Array.isArray(source)) return Array.isArray(candidate) && source.length === candidate.length && source.every((item, index) => sameRichTextStructure(item, candidate[index]))
  if (source && typeof source === 'object') {
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) return false
    const original = source as Record<string, unknown>
    const proposed = candidate as Record<string, unknown>
    return Object.keys(original).length === Object.keys(proposed).length && Object.keys(original).every((childKey) => childKey in proposed && sameRichTextStructure(original[childKey], proposed[childKey], childKey))
  }
  return source === candidate
}

export function buildReviewCandidates(fields: ReviewField[], translated: TranslationUnit[]): ReviewCandidate[] {
  const byPath = new Map(translated.map((unit) => [unit.path, unit.text]))
  return fields.map((field) => {
    if (field.kind !== 'richText') return { path: field.path, kind: field.kind, source: field.value, candidate: byPath.get(field.path) || field.value }
    const translatedText = byPath.get(field.path)
    if (!translatedText) throw new Error(`Missing rich text translation for ${field.path}`)
    const candidate = JSON.parse(translatedText) as Record<string, unknown>
    if (!sameRichTextStructure(field.value, candidate)) throw new Error(`Rich text formatting changed for ${field.path}`)
    return { path: field.path, kind: field.kind, source: field.value, candidate }
  })
}
