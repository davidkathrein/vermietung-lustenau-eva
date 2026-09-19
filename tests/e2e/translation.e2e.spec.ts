import { expect, test } from '@playwright/test'
import { getPayload } from 'payload'

import config from '../../src/payload.config.js'
import { login } from '../helpers/login'

test('switches content tabs and applies a translation to the target form', async ({ page }) => {
  test.setTimeout(75_000)
  const baseURL = process.env.E2E_BASE_URL || 'http://localhost:3000'
  const payload = await getPayload({ config })
  const user = { email: `translation-${Date.now()}@example.invalid`, password: 'local-test-password' }
  const admin = await payload.create({ collection: 'users', data: user })
  let unitId: number | undefined
  try {
    const unit = await payload.create({
      collection: 'accommodations', locale: 'de',
      data: { slug: `translation-${Date.now()}`, name: 'Wohnung Eins', teaser: 'Kurzer deutscher Text', sleeps: 4 },
    })
    unitId = unit.id
    await payload.update({
      collection: 'accommodations', id: unit.id, locale: 'en', data: { slug: `old-english-${unit.id}`, name: 'Old English', teaser: 'Old teaser' },
    })
    await login({ page, user })
    await page.goto(`${baseURL}/admin/collections/accommodations/${unit.id}?locale=en`)
    await expect(page.getByRole('tab', { name: 'English' })).toHaveAttribute('aria-selected', 'true')
    await page.getByRole('tab', { name: 'Deutsch' }).click()
    await expect(page.getByRole('tab', { name: 'Deutsch' })).toHaveAttribute('aria-selected', 'true')
    await expect(page.locator('#field-name')).toHaveValue('Wohnung Eins')
    await page.getByRole('tab', { name: 'English' }).click()
    await expect(page.locator('#field-name')).toHaveValue('Old English')

    const missingRoute = async (route: Parameters<Parameters<typeof page.route>[1]>[0]) => {
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ available: false, missingFields: [
        'slug', 'name', 'teaser', 'seo.metaTitle', 'layout.0.headline',
      ] }) })
    }
    await page.route('**/api/admin-translate?**', missingRoute)
    await page.reload()
    await expect(page.locator('.translation-panel__missing li')).toHaveText(['URL slug', 'Name', 'Teaser'])
    await expect(page.locator('.translation-panel__missing')).toContainText('2 more')
    await expect(page.locator('.translation-panel__missing')).not.toContainText('Meta title')
    await page.unroute('**/api/admin-translate?**', missingRoute)

    await page.route('**/api/admin-translate?**', async (route) => {
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ available: true }) })
    })
    await page.route('**/api/admin-translate', async (route) => {
      expect(route.request().postDataJSON()).toMatchObject({ entity: 'accommodations', id: unit.id, targetLocale: 'en' })
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ fields: [
          { path: 'slug', kind: 'slug', source: unit.slug, candidate: 'apartment-one' },
          { path: 'name', kind: 'text', source: 'Wohnung Eins', candidate: 'Apartment One' },
          { path: 'teaser', kind: 'text', source: 'Kurzer deutscher Text', candidate: 'A short English description' },
        ] }),
      })
    })

    await page.reload()
    await page.getByRole('button', { name: /Translate from Deutsch with AI/ }).click()
    const nameReview = page.locator('.translation-panel__field').filter({ hasText: 'Name · name' })
    await nameReview.locator('.translation-panel__choice').filter({ hasText: 'Before' }).click()
    await expect(nameReview.getByRole('radio', { name: /Before/ })).toBeChecked()
    await nameReview.getByRole('button', { name: 'Apply selection' }).click()
    const teaserReview = page.locator('.translation-panel__field').filter({ hasText: 'teaser · teaser' })
    await teaserReview.getByRole('radio', { name: /AI suggestion/ }).click()
    await teaserReview.getByRole('button', { name: 'Apply selection' }).click()
    await page.getByRole('button', { name: 'Accept remaining' }).click()
    await expect(page.locator('#field-name')).toHaveValue('Old English')
    await expect(page.locator('#field-teaser')).toHaveValue('A short English description')
    await expect(page.locator('#field-slug')).toHaveValue('apartment-one')
    await expect(page.getByRole('tab', { name: 'Deutsch' })).toBeDisabled()
    await expect(page.getByRole('tab', { name: 'Deutsch' })).toBeEnabled({ timeout: 60_000 })

    const english = await payload.findByID({ collection: 'accommodations', id: unit.id, locale: 'en', fallbackLocale: false, draft: true })
    expect(english.name).toBe('Old English')
    expect(english.teaser).toBe('A short English description')
    const german = await payload.findByID({ collection: 'accommodations', id: unit.id, locale: 'de', fallbackLocale: false })
    expect(german.name).toBe('Wohnung Eins')
  } finally {
    if (unitId) await payload.delete({ collection: 'accommodations', id: unitId })
    await payload.delete({ collection: 'users', id: admin.id })
  }
})
