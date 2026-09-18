import { expect, test } from '@playwright/test'

test('serves the bilingual homepage and redirects the language-less root permanently', async ({ page, request }) => {
  const root = await request.get('/', { maxRedirects: 0 })
  expect(root.status()).toBe(308)
  expect(root.headers().location).toBe('/de')
  await page.goto('/de')
  await expect(page.locator('html')).toHaveAttribute('lang', 'de')
  await expect(page.getByRole('heading', { name: 'Ankommen. Durchatmen. Bleiben.' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Wohnung 1 / Seminarraum' })).toBeVisible()
  await page.goto('/en')
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.getByRole('heading', { name: 'Arrive. Unwind. Stay.' })).toBeVisible()
})

test('shows the shared seminar usage and does not claim availability without feeds', async ({ page }) => {
  await page.goto('/de/wohnungen/wohnung-1')
  await expect(page.getByRole('heading', { name: 'Wohnung 1 / Seminarraum' })).toBeVisible()
  await expect(page.getByRole('tab', { name: 'Seminar' })).toBeVisible()
  await expect(page.getByText('Bitte einen Termin wählen.')).toBeVisible()
})
