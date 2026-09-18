import config from '@/payload.config'
import { getPayload } from 'payload'
import { expect, it } from 'vitest'

it('offers German and English for the admin interface', async () => {
  const payload = await getPayload({ config })
  expect(Object.keys(payload.config.i18n.supportedLanguages)).toEqual(expect.arrayContaining(['de', 'en']))
  expect(payload.config.i18n.fallbackLanguage).toBe('de')
  const accommodations = payload.config.collections.find((collection) => collection.slug === 'accommodations')
  expect(accommodations?.labels?.plural).toMatchObject({ de: 'Wohnungen', en: 'Apartments' })
})
