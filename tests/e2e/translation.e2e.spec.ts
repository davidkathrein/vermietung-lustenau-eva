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

    await page.route('**/api/admin-translate?**', async (route) => {
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ available: true }) })
    })
    await page.route('**/api/admin-translate', async (route) => {
      expect(route.request().postDataJSON()).toMatchObject({ entity: 'accommodations', id: unit.id, targetLocale: 'en' })
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ fields: [
          { path: 'name', kind: 'text', source: 'Wohnung Eins', candidate: 'Apartment One' },
          { path: 'teaser', kind: 'text', source: 'Kurzer deutscher Text', candidate: 'A short English description' },
        ] }),
      })
    })

    await page.getByRole('button', { name: /Translate from Deutsch with AI/ }).click()
    await page.getByRole('button', { name: 'Accept all' }).click()
    await expect(page.locator('#field-name')).toHaveValue('Apartment One')
    await expect(page.locator('#field-teaser')).toHaveValue('A short English description')
    await expect(page.getByRole('tab', { name: 'Deutsch' })).toBeDisabled()
    await expect(page.getByRole('tab', { name: 'Deutsch' })).toBeEnabled({ timeout: 60_000 })

    const english = await payload.findByID({ collection: 'accommodations', id: unit.id, locale: 'en', fallbackLocale: false, draft: true })
    expect(english.name).toBe('Apartment One')
    expect(english.teaser).toBe('A short English description')
    const german = await payload.findByID({ collection: 'accommodations', id: unit.id, locale: 'de', fallbackLocale: false })
    expect(german.name).toBe('Wohnung Eins')
  } finally {
    if (unitId) await payload.delete({ collection: 'accommodations', id: unitId })
    await payload.delete({ collection: 'users', id: admin.id })
  }
})
