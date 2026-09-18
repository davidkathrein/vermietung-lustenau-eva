export type TranslationEntity = 'accommodations' | 'media' | 'site-settings'
export type ContentLocale = 'de' | 'en'
export type TranslationField = { path: string; text: string }

const localizedPaths: Record<TranslationEntity, string[]> = {
  accommodations: ['name', 'teaser', 'description', 'bedSetup'],
  media: ['alt'],
  'site-settings': ['siteName', 'heroTitle', 'heroText', 'country'],
}

export function translationFields(entity: TranslationEntity, document: Record<string, unknown>): TranslationField[] {
  const fields: TranslationField[] = []
  for (const path of localizedPaths[entity]) {
    const text = document[path]
    if (typeof text === 'string' && text.trim()) fields.push({ path, text: text.trim() })
  }

  if (entity === 'accommodations' && Array.isArray(document.gallery)) {
    document.gallery.forEach((row, index) => {
      if (row && typeof row === 'object' && 'caption' in row && typeof row.caption === 'string' && row.caption.trim()) {
        fields.push({ path: `gallery.${index}.caption`, text: row.caption.trim() })
      }
    })
  }

  return fields
}
