import { expect, test } from '@playwright/test'

test('public pages switch language and open the availability dialog', async ({ page }) => {
  await page.goto('http://localhost:3000/')
  await expect(page.getByRole('navigation', { name: 'Hauptnavigation' })).toBeVisible()

  await page.getByRole('button', { name: 'Verfügbarkeit ansehen' }).click()
  await expect(page.getByRole('dialog', { name: 'Verfügbarkeit' })).toBeVisible()
  await page.getByRole('button', { name: 'Schließen' }).click()

  await page.getByRole('link', { name: 'EN', exact: true }).click()
  await expect(page).toHaveURL('http://localhost:3000/en')
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible()

  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Apartments' }).click()
  await expect(page).toHaveURL('http://localhost:3000/en/apartments')
  await expect(page.getByRole('heading', { name: 'The three apartments' })).toBeVisible()
})
