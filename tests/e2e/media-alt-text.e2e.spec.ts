import path from 'path'
import { expect, test } from '@playwright/test'
import { getPayload } from 'payload'

import config from '../../src/payload.config.js'
import { login } from '../helpers/login'

test('reviews an AI alt-text suggestion and can mark the image decorative', async ({ page }) => {
  const payload = await getPayload({ config })
  await payload.delete({ collection: 'users', where: { email: { contains: 'media-alt-' } } })
  const user = { email: `media-alt-${Date.now()}@example.invalid`, password: 'local-test-password' }
  const admin = await payload.create({ collection: 'users', data: user })
  let mediaId: number | undefined

  try {
    const media = await payload.create({
      collection: 'media', locale: 'de',
      filePath: path.resolve(process.cwd(), 'public/seed-media/apartment-1-concept.jpg'),
      data: { alt: 'Bisheriger Alternativtext' },
    })
    mediaId = media.id
    await login({ page, user })
    await page.route('**/api/admin-alt-text', async (route) => {
      expect(route.request().postDataJSON()).toEqual({ id: media.id, targetLocale: 'de' })
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ alt: 'Heller Wohnraum mit Sofa und Esstisch' }) })
    })
    await page.goto(`/admin/collections/media/${media.id}?locale=de`)
    await page.getByRole('button', { name: /Vorschlag erstellen|Generate suggestion/ }).click()
    await expect(page.getByText('Heller Wohnraum mit Sofa und Esstisch')).toBeVisible()
    await page.getByRole('button', { name: /Vorschlag übernehmen|Apply suggestion/ }).click()
    await expect(page.locator('#field-alt')).toHaveValue('Heller Wohnraum mit Sofa und Esstisch')
    await page.getByLabel(/Dekoratives Bild|Decorative image/).check()
    await expect(page.getByLabel(/Dekoratives Bild|Decorative image/)).toBeChecked()
  } finally {
    if (mediaId) await payload.delete({ collection: 'media', id: mediaId })
    await payload.delete({ collection: 'users', id: admin.id })
  }
})
